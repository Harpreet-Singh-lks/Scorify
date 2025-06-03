"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  UserTier, 
  TIER_CONFIG, 
  calculateCollateral, 
  LOAN_CONTRACT_ADDRESS, 
  LOAN_CONTRACT_ABI,
  getSigner,
  getTierFromReputation,
  getReputation
} from '../../utils/web3';

interface LoanCreatorProps {
  address: string;
  isConnected: boolean;
}

interface LoanForm {
  loanAmount: number;
  userTier: UserTier;
  duration: number;
  collateralType: 'ETH' | 'TOKEN';
  collateralTokenAddress?: string;
}

export const LoanCreator = ({ address, isConnected }: LoanCreatorProps) => {
  const [form, setForm] = useState<LoanForm>({
    loanAmount: 1000,
    userTier: UserTier.Bronze, // Start with Bronze, will be updated
    duration: 30,
    collateralType: 'ETH'
  });
  
  const [collateralAmount, setCollateralAmount] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(3000); // Mock ETH price
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [userActualTier, setUserActualTier] = useState<UserTier>(UserTier.Bronze);
  const [loadingTier, setLoadingTier] = useState(true);

  // Helper function to safely parse ether (works with both v5 and v6)
  const parseEther = (value: string) => {
    try {
      // Try ethers v6 syntax first
      if (ethers.parseEther) {
        return ethers.parseEther(value);
      }
      // Fallback to ethers v5 syntax
      
      throw new Error('parseEther not found');
    } catch (error) {
      console.error('Error parsing ether:', error);
      throw error;
    }
  };

  // Helper function to get zero address (works with both v5 and v6)
  const getZeroAddress = () => {
    // Try ethers v6 syntax first
    if (ethers.ZeroAddress) {
      return ethers.ZeroAddress;
    }
    // Fallback to ethers v5 syntax
    
    // Manual fallback
    return '0x0000000000000000000000000000000000000000';
  };

  // Fetch user's actual tier from reputation
  useEffect(() => {
    const fetchUserTier = async () => {
      if (isConnected && address) {
        setLoadingTier(true);
        try {
          const reputation = await getReputation(address);
          const actualTier = getTierFromReputation(reputation);
          setUserActualTier(actualTier);
          setForm(prev => ({ ...prev, userTier: actualTier }));
        } catch (error) {
          console.error('Error fetching user tier:', error);
          // Keep default Bronze tier on error
        } finally {
          setLoadingTier(false);
        }
      }
    };

    fetchUserTier();
  }, [address, isConnected]);

  // Calculate required collateral whenever form changes
  useEffect(() => {
    const required = calculateCollateral(form.loanAmount, form.userTier, ethPrice);
    setCollateralAmount(required);
  }, [form.loanAmount, form.userTier, ethPrice]);

  const handleCreateLoan = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Use actual tier, not form tier
    if (form.userTier !== userActualTier) {
      alert(`You can only create loans with your actual tier: ${TIER_CONFIG[userActualTier].name}`);
      return;
    }

    setIsCreating(true);
    try {
      const signer = await getSigner();
      const loanContract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);

      // Use helper functions for compatibility
      const loanAmountWei = parseEther(form.loanAmount.toString());
      const durationSeconds = form.duration * 24 * 60 * 60; // Convert days to seconds
      
      let tx;
      
      if (form.collateralType === 'ETH') {
        // ETH collateral
        const collateralAmountWei = parseEther(collateralAmount.toString());
        
        tx = await loanContract.buyLoan(
          loanAmountWei,
          getZeroAddress(), // ETH address
          collateralAmountWei,
          durationSeconds,
          userActualTier, // Use actual tier
          {
            value: collateralAmountWei // Send ETH as collateral
          }
        );
      } else {
        // Token collateral
        const collateralAmountWei = parseEther(collateralAmount.toString());
        
        tx = await loanContract.buyLoan(
          loanAmountWei,
          form.collateralTokenAddress || getZeroAddress(),
          collateralAmountWei,
          durationSeconds,
          userActualTier // Use actual tier
        );
      }

      setTxHash(tx.hash);
      await tx.wait();
      
      alert('Loan created successfully!');
      
    } catch (error: any) {
      console.error('Error creating loan:', error);
      alert(`Error creating loan: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const tierConfig = TIER_CONFIG[userActualTier];

  if (loadingTier) {
    return (
      <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-500/30">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Loading your tier information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-500/30">
      <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
        Create New Loan
      </h2>

      {/* User's Actual Tier Display */}
      <div className="mb-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-200 mb-1">Your Current Tier</h3>
              <div className={`text-2xl font-bold ${tierConfig.color}`}>
                {tierConfig.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Interest Rate</div>
              <div className={`text-xl font-bold ${tierConfig.color}`}>
                {tierConfig.interestRate}% APR
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            Max Loan-to-Value: {(tierConfig.maxLTV * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Tier Selection - Now Disabled */}
      <div className="mb-6">
        <label className="block text-gray-200 text-sm font-medium mb-3 drop-shadow-md">
          Available Tiers (Your tier is automatically selected)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {Object.values(UserTier).filter(tier => typeof tier === 'number').map((tier) => {
            const config = TIER_CONFIG[tier as UserTier];
            const isUserTier = tier === userActualTier;
            const isAvailable = tier <= userActualTier; // User can only use their tier or lower
            
            return (
              <button
                key={tier}
                disabled={!isAvailable}
                onClick={() => isAvailable && setForm({...form, userTier: tier as UserTier})}
                className={`p-3 rounded-lg border transition duration-200 ${
                  isUserTier
                    ? 'bg-blue-600/50 border-blue-500'
                    : isAvailable
                    ? 'bg-black/20 border-gray-500/30 hover:border-gray-400'
                    : 'bg-gray-800/50 border-gray-700/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`font-bold ${isAvailable ? config.color : 'text-gray-600'} text-sm`}>
                  {config.name}
                  {isUserTier && <span className="ml-1">✓</span>}
                </div>
                <div className={`text-xs ${isAvailable ? 'text-gray-300' : 'text-gray-600'}`}>
                  {config.interestRate}% APR
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          💡 Your tier is determined by your reputation score. Higher tiers offer better rates!
        </div>
      </div>

      {/* Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
            Loan Amount (gUSD)
          </label>
          <input
            type="number"
            value={form.loanAmount || ''}
            onChange={(e) => setForm({...form, loanAmount: parseFloat(e.target.value) || 0})}
            className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1000"
            min="1"
          />
        </div>

        <div>
          <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
            Duration (Days)
          </label>
          <select
            value={form.duration}
            onChange={(e) => setForm({...form, duration: parseInt(e.target.value)})}
            className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>365 days</option>
          </select>
        </div>
      </div>

      {/* Collateral Type */}
      <div className="mb-6">
        <label className="block text-gray-200 text-sm font-medium mb-3 drop-shadow-md">
          Collateral Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setForm({...form, collateralType: 'ETH'})}
            className={`p-4 rounded-lg border transition duration-200 ${
              form.collateralType === 'ETH'
                ? 'bg-blue-600/50 border-blue-500'
                : 'bg-black/20 border-gray-500/30 hover:border-gray-400'
            }`}
          >
            <div className="text-white font-bold">Ethereum (ETH)</div>
            <div className="text-gray-300 text-sm">Native ETH as collateral</div>
          </button>
          
          <button
            onClick={() => setForm({...form, collateralType: 'TOKEN'})}
            className={`p-4 rounded-lg border transition duration-200 ${
              form.collateralType === 'TOKEN'
                ? 'bg-blue-600/50 border-blue-500'
                : 'bg-black/20 border-gray-500/30 hover:border-gray-400'
            }`}
          >
            <div className="text-white font-bold">ERC20 Token</div>
            <div className="text-gray-300 text-sm">Custom token collateral</div>
          </button>
        </div>
      </div>

      {/* Token Address Input */}
      {form.collateralType === 'TOKEN' && (
        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
            Collateral Token Address
          </label>
          <input
            type="text"
            value={form.collateralTokenAddress || ''}
            onChange={(e) => setForm({...form, collateralTokenAddress: e.target.value})}
            className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
          />
        </div>
      )}

      {/* Loan Summary */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-500/30">
        <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Loan Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm">Loan Amount</div>
            <div className="text-white font-bold">{form.loanAmount.toLocaleString()} gUSD</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Interest Rate</div>
            <div className={`font-bold ${tierConfig.color}`}>{tierConfig.interestRate}% APR</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Required Collateral</div>
            <div className="text-white font-bold">
              {collateralAmount.toFixed(4)} {form.collateralType}
            </div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Loan-to-Value Ratio</div>
            <div className="text-white font-bold">{(tierConfig.maxLTV * 100).toFixed(0)}%</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Duration</div>
            <div className="text-white font-bold">{form.duration} days</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Your Tier</div>
            <div className={`font-bold ${tierConfig.color}`}>{tierConfig.name}</div>
          </div>
        </div>
      </div>

      {/* Create Loan Button */}
      <button
        onClick={handleCreateLoan}
        disabled={!isConnected || isCreating || form.loanAmount <= 0 || loadingTier}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition duration-200 shadow-lg"
      >
        {isCreating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Loan...</span>
          </div>
        ) : (
          `Create Loan for ${form.loanAmount} gUSD (${tierConfig.name} Tier)`
        )}
      </button>

      {/* Transaction Hash */}
      {txHash && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            Transaction submitted: <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};