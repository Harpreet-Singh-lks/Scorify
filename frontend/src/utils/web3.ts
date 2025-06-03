import { ethers } from 'ethers';

// Contract addresses
export const LOAN_CONTRACT_ADDRESS = "0x6B7edBA5E609f22043f49bf6914748c6f9Be9458";
export const LENDING_TOKEN_ADDRESS = "0x48946439c930845eab91585fb1d4521bc269c50b";

// User tiers
export enum UserTier {
  Bronze = 0,
  Silver = 1,
  Gold = 2,
  Platinum = 3,
  Diamond = 4
}

// Loan Status enum
export enum LoanStatus {
  Active = 0,
  Repaid = 1,
  Defaulted = 2,
  Liquidated = 3
}

// Loan interface
export interface LoanDetails {
  loanId: number;
  tier: UserTier;
  borrower: string;
  collateralToken: string;
  collateralAmount: string;
  loanToken: string;
  loanAmount: string;
  interestRate: number;
  duration: number;
  startTime: number;
  repaidAmount: string;
  status: LoanStatus;
  isRepaid: boolean;
  totalOwed?: string;
}

// Tier configurations
export const TIER_CONFIG = {
  [UserTier.Bronze]: {
    name: 'Bronze',
    interestRate: 10,
    maxLTV: 0.5,
    color: 'text-orange-400'
  },
  [UserTier.Silver]: {
    name: 'Silver',
    interestRate: 8,
    maxLTV: 0.6,
    color: 'text-gray-400'
  },
  [UserTier.Gold]: {
    name: 'Gold',
    interestRate: 5,
    maxLTV: 0.7,
    color: 'text-yellow-400'
  },
  [UserTier.Platinum]: {
    name: 'Platinum',
    interestRate: 3,
    maxLTV: 0.8,
    color: 'text-purple-400'
  },
  [UserTier.Diamond]: {
    name: 'Diamond',
    interestRate: 2,
    maxLTV: 0.9,
    color: 'text-cyan-400'
  }
};

// Enhanced helper function to safely convert BigInt/BigNumber to number
export const safeToNumber = (value: any): number => {
  try {
    // Handle null/undefined
    if (value === null || value === undefined) return 0;
    
    // Already a number
    if (typeof value === 'number') return value;
    
    // Handle BigInt (ethers v6)
    if (typeof value === 'bigint') {
      const num = Number(value);
      if (num > Number.MAX_SAFE_INTEGER) {
        console.warn('Number too large, potential precision loss');
      }
      return num;
    }
    
    // Handle ethers v5 BigNumber
    if (value && typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    
    // Handle objects with toString method
    if (value && typeof value.toString === 'function') {
      const str = value.toString();
      const num = parseInt(str, 10);
      return isNaN(num) ? 0 : num;
    }
    
    // Handle string
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? 0 : num;
    }
    
    // Fallback
    console.warn('Unexpected value type in safeToNumber:', typeof value, value);
    return 0;
    
  } catch (error) {
    console.error('Error in safeToNumber:', error, 'value:', value);
    return 0;
  }
};

// Function to get tier from reputation score
export const getTierFromReputation = (reputation: number): UserTier => {
  if (reputation >= 900) return UserTier.Diamond;
  if (reputation >= 750) return UserTier.Platinum;
  if (reputation >= 600) return UserTier.Gold;
  if (reputation >= 400) return UserTier.Silver;
  return UserTier.Bronze;
};

// Function to get reputation score
export const getReputation = async (address: string): Promise<number> => {
  try {
    if (typeof window !== 'undefined' && window.graphite) {
      const accountInfo = await window.graphite.getAccountInfo();
      return accountInfo?.reputation || accountInfo?.reputationScore || 0;
    }
    return Math.floor(Math.random() * 1000);
  } catch (error) {
    console.error("Error fetching reputation:", error);
    return 0;
  }
};

// ABI for loan contract
export const LOAN_CONTRACT_ABI = [
  "function buyLoan(uint256 amountForLoan, address _collateralToken, uint256 collateralAmount, uint256 _duration, uint8 _userTier) external payable",
  "function getUserLoans(address _user) external view returns (uint256[] memory)",
  "function getLoan(uint256 _loanId) external view returns (tuple(uint256 loanId, uint8 tier, address borrower, address collateralToken, uint256 collateralAmount, address loanToken, uint256 loanAmount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 repaidAmount, uint8 status, bool isRepaid))",
  "function calculateTotalOwed(uint256 _loanId) external view returns (uint256)",
  "function repayLoan(uint256 loanId) external payable",
  "function getAvailableLendingTokens() external view returns (uint256)",
  "function loanCounter() external view returns (uint256)",
  "function getTotalActiveLoans() external view returns (uint256)"
];

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

// Calculate required collateral
export const calculateCollateral = (loanAmount: number, tier: UserTier, collateralPrice: number = 3000): number => {
  const ltvRatio = TIER_CONFIG[tier].maxLTV;
  const requiredCollateralValue = loanAmount / ltvRatio;
  return requiredCollateralValue / collateralPrice;
};

// Global declarations
declare global {
  interface Window {
    ethereum?: any;
    graphite?: any;
  }
}

// Provider function
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      return new ethers.BrowserProvider(window.ethereum);
    } catch {
      try {
        return new ethers.providers.Web3Provider(window.ethereum);
      } catch {
        throw new Error('Unable to create provider');
      }
    }
  }
  throw new Error('No Web3 provider found');
};

// Signer function
export const getSigner = async () => {
  const provider = getProvider();
  
  try {
    const signer = provider.getSigner();
    return typeof signer.then === 'function' ? await signer : signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    throw error;
  }
};

// Connect wallet
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = getProvider();
    const signer = await getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Parse loan data safely
const parseLoanData = (loanData: any, totalOwed: any): LoanDetails => {
  console.log('Raw loan data:', loanData); // Debug log
  
  return {
    loanId: safeToNumber(loanData[0] || loanData.loanId),
    tier: safeToNumber(loanData[1] || loanData.tier),
    borrower: loanData[2] || loanData.borrower || '',
    collateralToken: loanData[3] || loanData.collateralToken || '',
    collateralAmount: (loanData[4] || loanData.collateralAmount || '0').toString(),
    loanToken: loanData[5] || loanData.loanToken || '',
    loanAmount: (loanData[6] || loanData.loanAmount || '0').toString(),
    interestRate: safeToNumber(loanData[7] || loanData.interestRate),
    duration: safeToNumber(loanData[8] || loanData.duration),
    startTime: safeToNumber(loanData[9] || loanData.startTime),
    repaidAmount: (loanData[10] || loanData.repaidAmount || '0').toString(),
    status: safeToNumber(loanData[11] || loanData.status),
    isRepaid: Boolean(loanData[12] || loanData.isRepaid),
    totalOwed: totalOwed ? totalOwed.toString() : '0'
  };
};

// Fetch user's loans
export const getUserLoans = async (userAddress: string): Promise<LoanDetails[]> => {
  try {
    const provider = getProvider();
    const loanContract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, provider);
    
    console.log('Fetching loans for user:', userAddress);
    
    const loanIds = await loanContract.getUserLoans(userAddress);
    console.log('User loan IDs:', loanIds);
    
    const loans: LoanDetails[] = [];
    
    for (const loanId of loanIds) {
      try {
        console.log('Fetching loan:', safeToNumber(loanId));
        
        const [loanData, totalOwed] = await Promise.all([
          loanContract.getLoan(loanId),
          loanContract.calculateTotalOwed(loanId)
        ]);
        
        const loan = parseLoanData(loanData, totalOwed);
        loans.push(loan);
        
      } catch (error) {
        console.error(`Error fetching loan ${loanId}:`, error);
      }
    }
    
    console.log('Fetched loans:', loans);
    return loans;
    
  } catch (error) {
    console.error('Error fetching user loans:', error);
    return [];
  }
};

// Get all loans
export const getAllLoans = async (): Promise<LoanDetails[]> => {
  try {
    const provider = getProvider();
    const loanContract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, provider);
    
    const loanCounter = await loanContract.loanCounter();
    const totalLoans = safeToNumber(loanCounter);
    
    console.log('Total loans in contract:', totalLoans);
    
    const loans: LoanDetails[] = [];
    
    for (let i = 1; i <= totalLoans; i++) {
      try {
        const [loanData, totalOwed] = await Promise.all([
          loanContract.getLoan(i),
          loanContract.calculateTotalOwed(i)
        ]);
        
        const loan = parseLoanData(loanData, totalOwed);
        loans.push(loan);
        
      } catch (error) {
        console.error(`Error fetching loan ${i}:`, error);
      }
    }
    
    return loans;
    
  } catch (error) {
    console.error('Error fetching all loans:', error);
    return [];
  }
};

// Repay loan
export const repayLoan = async (loanId: number): Promise<string> => {
  try {
    const signer = await getSigner();
    const loanContract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);
    
    const totalOwed = await loanContract.calculateTotalOwed(loanId);
    
    const tx = await loanContract.repayLoan(loanId, {
      value: totalOwed
    });
    
    return tx.hash;
  } catch (error) {
    console.error('Error repaying loan:', error);
    throw error;
  }
};

// Helper functions
export const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatEther = (wei: string): string => {
  try {
    if (ethers.formatEther) {
      return ethers.formatEther(wei);
    } else if (ethers.utils && ethers.utils.formatEther) {
      return ethers.utils.formatEther(wei);
    }
    return '0';
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

export const getStatusColor = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.Active:
      return 'text-green-400';
    case LoanStatus.Repaid:
      return 'text-blue-400';
    case LoanStatus.Defaulted:
      return 'text-red-400';
    case LoanStatus.Liquidated:
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
};

export const getStatusText = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.Active:
      return 'Active';
    case LoanStatus.Repaid:
      return 'Repaid';
    case LoanStatus.Defaulted:
      return 'Defaulted';
    case LoanStatus.Liquidated:
      return 'Liquidated';
    default:
      return 'Unknown';
  }
};