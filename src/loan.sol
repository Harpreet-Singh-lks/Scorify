// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILendingToken {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Loan is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public loanCounter;
    address public lendingToken;

    struct LoanDetails {
        uint256 loanId;
        UserTier tier;
        address borrower;
        address collateralToken;
        uint256 collateralAmount;
        address loanToken;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 repaidAmount;
        LoanStatus status;
        bool isRepaid;
    }

    enum UserTier {
        Bronze,
        Silver,
        Gold,
        Platinum,
        Diamond
    }

    enum LoanStatus {
        ACTIVE,
        REPAID,
        LIQUIDATED,
        DEFAULTED
    }

    // Tier-based interest rates (in basis points)
    mapping(UserTier => uint256) public tierInterestRates;

    mapping(uint256 => LoanDetails) public loans;
    mapping(address => uint256[]) public userLoans;
    uint256[] public activeLoans;

    // Simplified event to avoid stack too deep
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 loanAmount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 totalRepaid
    );

    event InterestRateUpdated(UserTier tier, uint256 newRate);

    constructor(address _lendingToken) Ownable(msg.sender) {
        lendingToken = _lendingToken;
        
        // Initialize default tier-based interest rates (in basis points)
        tierInterestRates[UserTier.Bronze] = 1000;   // 10%
        tierInterestRates[UserTier.Silver] = 800;    // 8%
        tierInterestRates[UserTier.Gold] = 500;      // 5%
        tierInterestRates[UserTier.Platinum] = 300;  // 3%
        tierInterestRates[UserTier.Diamond] = 200;   // 2%
    }

    function buyLoan(
        uint256 amountForLoan,
        address _collateralToken,
        uint256 collateralAmount,
        uint256 _duration,
        UserTier _userTier
    ) external payable nonReentrant {
        require(amountForLoan > 0, "loan must be greater than zero");
        require(collateralAmount > 0, "collateral amount should be greater than zero");
        require(_userTier <= UserTier.Diamond, "Invalid user tier");

        _transferCollateral(_collateralToken, collateralAmount);
        
        uint256 loanId = _createLoan(
            amountForLoan,
            _collateralToken,
            collateralAmount,
            _duration,
            _userTier
        );
        
        _addToLoans(loanId, amountForLoan);
    }

    function _createLoan(
        uint256 amountForLoan,
        address _collateralToken,
        uint256 collateralAmount,
        uint256 _duration,
        UserTier _userTier
    ) internal returns (uint256) {
        loanCounter++;
        uint256 loanId = loanCounter;
        uint256 interestRate = tierInterestRates[_userTier];

        loans[loanId] = LoanDetails({
            loanId: loanId,
            tier: _userTier,
            borrower: msg.sender,
            collateralToken: _collateralToken,
            collateralAmount: collateralAmount,
            loanToken: lendingToken,
            loanAmount: amountForLoan,
            interestRate: interestRate,
            duration: _duration,
            startTime: block.timestamp,
            repaidAmount: 0,
            status: LoanStatus.ACTIVE,
            isRepaid: false
        });

        _transferLoanTokens(msg.sender, amountForLoan);

        return loanId;
    }

    function _transferLoanTokens(address borrower, uint256 amount) internal {
        try ILendingToken(lendingToken).transfer(borrower, amount) {
            // Successfully minted tokens to borrower
        } catch {
            require(
                IERC20(lendingToken).balanceOf(address(this)) >= amount,
                "Insufficient lending token balance"
            );
            IERC20(lendingToken).safeTransfer(borrower, amount);
        }
    }

    function _addToLoans(uint256 loanId, uint256 loanAmount) internal {
        activeLoans.push(loanId);
        userLoans[msg.sender].push(loanId);
        
        // Simplified event emission
        emit LoanCreated(loanId, msg.sender, loanAmount);
    }

    function setTierInterestRate(UserTier _tier, uint256 _rate) external onlyOwner {
        require(_rate <= 5000, "Interest rate cannot exceed 50%");
        tierInterestRates[_tier] = _rate;
        emit InterestRateUpdated(_tier, _rate);
    }

    function getTierInterestRate(UserTier _tier) external view returns (uint256) {
        return tierInterestRates[_tier];
    }

    function getLoan(uint256 _loanId) external view returns (LoanDetails memory) {
        return loans[_loanId];
    }

    function repayLoan(uint256 loanId) external payable nonReentrant {
        LoanDetails storage loan = loans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");
        
        uint256 totalOwed = calculateTotalOwed(loanId);
        require(msg.value >= totalOwed, "Insufficient repayment amount");
        
        loan.repaidAmount = totalOwed;
        loan.status = LoanStatus.REPAID;
        loan.isRepaid = true;
        
        _returnCollateral(loan.collateralToken, loan.collateralAmount, loan.borrower);
        
        if (msg.value > totalOwed) {
            payable(msg.sender).transfer(msg.value - totalOwed);
        }
        
        _removeFromActiveLoans(loanId);
        emit LoanRepaid(loanId, msg.sender, totalOwed);
    }

    function calculateTotalOwed(uint256 _loanId) public view returns (uint256) {
        LoanDetails memory loan = loans[_loanId];
        if (loan.status != LoanStatus.ACTIVE) return 0;

        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.loanAmount * loan.interestRate * timeElapsed) / (365 days * 10000);
        
        return loan.loanAmount + interest - loan.repaidAmount;
    }

    function isLoanOverdue(uint256 _loanId) public view returns (bool) {
        LoanDetails memory loan = loans[_loanId];
        if (loan.status != LoanStatus.ACTIVE) return false;
        
        return block.timestamp > loan.startTime + loan.duration;
    }

    function liquidateLoan(uint256 _loanId) external nonReentrant {
        LoanDetails storage loan = loans[_loanId];
        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");
        require(isLoanOverdue(_loanId), "Loan is not overdue");
        
        loan.status = LoanStatus.LIQUIDATED;
        _returnCollateral(loan.collateralToken, loan.collateralAmount, msg.sender);
        _removeFromActiveLoans(_loanId);
    }

    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }

    function getActiveLoans() external view returns (uint256[] memory) {
        return activeLoans;
    }

    function getTotalActiveLoans() external view returns (uint256) {
        return activeLoans.length;
    }

    // Add function for owner to deposit lending tokens
    function depositLendingTokens(uint256 amount) external onlyOwner {
        IERC20(lendingToken).safeTransferFrom(msg.sender, address(this), amount);
    }

    // Check available lending token balance
    function getAvailableLendingTokens() external view returns (uint256) {
        return IERC20(lendingToken).balanceOf(address(this));
    }

    function _transferCollateral(address _token, uint256 _amount) internal {
        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "Do not send ETH for token collateral");
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        }
    }

    function _returnCollateral(address _token, uint256 _amount, address _to) internal {
        if (_token == address(0)) {
            payable(_to).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(_to, _amount);
        }
    }

    function _removeFromActiveLoans(uint256 _loanId) internal {
        for (uint256 i = 0; i < activeLoans.length; i++) {
            if (activeLoans[i] == _loanId) {
                activeLoans[i] = activeLoans[activeLoans.length - 1];
                activeLoans.pop();
                break;
            }
        }
    }
}