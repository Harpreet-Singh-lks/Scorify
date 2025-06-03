"use client";
import { useState, useEffect } from 'react';
import { 
  getUserLoans, 
  repayLoan,
  LoanDetails, 
  LoanStatus,
  TIER_CONFIG,
  formatAddress,
  formatEther,
  formatNumber,
  getStatusColor,
  getStatusText
} from '../../utils/web3';

interface LoanActivityProps {
  address: string;
  isConnected: boolean;
}

export const LoanActivity = ({ address, isConnected }: LoanActivityProps) => {
  const [loans, setLoans] = useState<LoanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayingLoanId, setRepayingLoanId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'repaid'>('all');

  const fetchLoans = async () => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    try {
      const userLoans = await getUserLoans(address);
      setLoans(userLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchLoans, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [address, isConnected]);

  const handleRepayLoan = async (loanId: number) => {
    setRepayingLoanId(loanId);
    try {
      const txHash = await repayLoan(loanId);
      alert(`Loan repayment submitted! Transaction: ${txHash}`);
      
      // Refresh loans after repayment
      setTimeout(fetchLoans, 2000);
    } catch (error: any) {
      console.error('Error repaying loan:', error);
      alert(`Error repaying loan: ${error.message}`);
    } finally {
      setRepayingLoanId(null);
    }
  };

  const getTimeRemaining = (startTime: number, duration: number) => {
    const endTime = startTime + duration;
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const filteredLoans = loans.filter(loan => {
    switch (filter) {
      case 'active':
        return loan.status === LoanStatus.Active;
      case 'repaid':
        return loan.status === LoanStatus.Repaid;
      default:
        return true;
    }
  });

  const activeLoans = loans.filter(loan => loan.status === LoanStatus.Active);
  const repaidLoans = loans.filter(loan => loan.status === LoanStatus.Repaid);
  const totalBorrowed = loans.reduce((sum, loan) => sum + parseFloat(formatEther(loan.loanAmount)), 0);
  const totalCollateral = loans.reduce((sum, loan) => sum + parseFloat(formatEther(loan.collateralAmount)), 0);

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-500/30">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Loading your loans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
          <div className="text-gray-400 text-sm">Total Loans</div>
          <div className="text-2xl font-bold text-white">{loans.length}</div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
          <div className="text-gray-400 text-sm">Active Loans</div>
          <div className="text-2xl font-bold text-green-400">{activeLoans.length}</div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
          <div className="text-gray-400 text-sm">Total Borrowed</div>
          <div className="text-2xl font-bold text-blue-400">{formatNumber(totalBorrowed)} gUSD</div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
          <div className="text-gray-400 text-sm">Total Collateral</div>
          <div className="text-2xl font-bold text-yellow-400">{formatNumber(totalCollateral)} ETH</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition duration-200 ${
            filter === 'all'
              ? 'bg-blue-600/50 text-white border border-blue-500'
              : 'bg-black/20 text-gray-300 border border-gray-500/30 hover:border-gray-400'
          }`}
        >
          All ({loans.length})
        </button>
        
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition duration-200 ${
            filter === 'active'
              ? 'bg-green-600/50 text-white border border-green-500'
              : 'bg-black/20 text-gray-300 border border-gray-500/30 hover:border-gray-400'
          }`}
        >
          Active ({activeLoans.length})
        </button>
        
        <button
          onClick={() => setFilter('repaid')}
          className={`px-4 py-2 rounded-lg transition duration-200 ${
            filter === 'repaid'
              ? 'bg-blue-600/50 text-white border border-blue-500'
              : 'bg-black/20 text-gray-300 border border-gray-500/30 hover:border-gray-400'
          }`}
        >
          Repaid ({repaidLoans.length})
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchLoans}
          disabled={loading}
          className="bg-gray-600/50 hover:bg-gray-600/70 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-500/30 text-center">
          <div className="text-gray-400 text-lg">
            {filter === 'all' ? 'No loans found' : `No ${filter} loans found`}
          </div>
          <div className="text-gray-500 text-sm mt-2">
            {filter === 'all' ? 'Create your first loan to get started!' : `Switch filters to see other loans.`}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const tierConfig = TIER_CONFIG[loan.tier];
            const loanAmountEth = formatEther(loan.loanAmount);
            const collateralAmountEth = formatEther(loan.collateralAmount);
            const totalOwedEth = loan.totalOwed ? formatEther(loan.totalOwed) : '0';
            const isActive = loan.status === LoanStatus.Active;
            
            return (
              <div
                key={loan.loanId}
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        Loan #{loan.loanId}
                      </h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(loan.status)} bg-black/40`}>
                        {getStatusText(loan.status)}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${tierConfig.color} bg-black/40`}>
                        {tierConfig.name}
                      </span>
                    </div>
                    
                    <div className="text-gray-300 text-sm">
                      Started: {new Date(loan.startTime * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">Time Remaining</div>
                      <div className="text-yellow-400 font-bold">
                        {getTimeRemaining(loan.startTime, loan.duration)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-gray-400 text-sm">Loan Amount</div>
                    <div className="text-white font-bold">{formatNumber(parseFloat(loanAmountEth))} gUSD</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">Collateral</div>
                    <div className="text-white font-bold">{formatNumber(parseFloat(collateralAmountEth))} ETH</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">Interest Rate</div>
                    <div className={`font-bold ${tierConfig.color}`}>{loan.interestRate / 100}% APR</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">
                      {isActive ? 'Total Owed' : 'Repaid Amount'}
                    </div>
                    <div className="text-white font-bold">
                      {formatNumber(parseFloat(isActive ? totalOwedEth : formatEther(loan.repaidAmount)))} gUSD
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRepayLoan(loan.loanId)}
                      disabled={repayingLoanId === loan.loanId}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition duration-200"
                    >
                      {repayingLoanId === loan.loanId ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Repaying...</span>
                        </div>
                      ) : (
                        `Repay ${formatNumber(parseFloat(totalOwedEth))} gUSD`
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};