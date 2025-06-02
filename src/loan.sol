// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
 import "@ppenzeppelin/contracts/security/ReentrancyGuard.sol";
 import "@openzeppelin/contracts/security/";
contract loan is RetrancyGuard{
    // function to buy loan - depend on market rate 
    /**  assset as colleteral 
     * reputation score 
     * in which token he want loan 
     * 
     *   
     */
    //mapping(address=> uint256) public Users

     uint256 public loanCounter;

    struct loanDetails{
        uint256 loanId;
        address user;
        address colleteraltoken;
        uint256 amountForLoan;
        address loanToken;
        uint256 interest;
        uint256 duration;
        uint256 startTime;
        uint256 repaidAmount;
        LoanStatus status;
        bool isRepaid;

    }

    enum LoanStatus{
        PENDING,
        ACTIVE,
        REPAID,
        LIQUIDATED,
        DEFAULTED
    }   

    mapping()// why created a mapping why not with address
    // for tracking active loan and pending loans
    uint256[] public pendingLoans;
    uint256[] public activeLoans;

    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        address collateralToken,
        uint256 collateralAmount,
        address loanToken,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration

    )

    function buyloan( uint256 amount_for_loan, address _colleteralToken, address token_as_loan, uint256 colleteralAmount, uint256 interestRate, uint256 _duration)external payable nonReentrant {  

        require(amount_for_loan >0, "loan must be greater than zero");
        require(colleteralAmount> 0, "collerteral amount should be greater than zero");

        //transfer colleteral 
        _transferColleteral();
        //loan id
        loancounter++;
        uint256 loanId = loancounter;
        //create Loan
        loans[loanId]= loanDetails({
            loanId: loanId,
            user: msg.sender,
            colleteralToken: _colleteralToken,
            amountForLoan: amount_for_loan,
            loanToken: token_as_loan,
            interest: interestRate,
            duration: _duration,
            startTime: 0,
            repaidAmount: 0,
            status: LoanStatus.PENDING,
            isRepaid: false,
        })
        pendingLoans.push(loanId);

        emit LoanRequested(
            loanId,
            msg.sender,
            _colleteralToken,
            colleteralAmount,
            token_as_loan,
            amount_for_loan,
            interestRate,
            _duration
        );


    }

    function repayLoan(uint256 loanId)external payable nonReentrant{
        LoanDetails storage loan = loans[_loanId];
        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");
    }

    function _transferColleteral(address _token, uint256 amount)internal{
        if(_token== address(0)){
            require(msg.value == _amount, "Incorrect ETH amount");
        }else {
            require(msg.value == 0, "Do not send ETH for token collateral");
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        }
    }
}