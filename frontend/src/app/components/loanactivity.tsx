"use client";
import { useState, useEffect } from "react";

interface Loan {
    loanId: string;
    borrower: string;
    collateralAsset: string;
    collateralAmount: number;
    loanAmount: number;
    interestRate: number;
    duration: number; // in days
    startDate: Date;
    dueDate: Date;
    status: 'active' | 'repaid' | 'defaulted' | 'liquidated';
    amountRepaid: number;
    remainingAmount: number;
    daysLeft: number;
    repaymentPercentage: number;
    liquidationThreshold: number;
    currentCollateralValue: number;
    healthFactor: number;
}

interface LoanActivityProps {
    address: string;
    isConnected: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500 text-white';
            case 'repaid': return 'bg-blue-500 text-white';
            case 'defaulted': return 'bg-red-500 text-white';
            case 'liquidated': return 'bg-orange-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.toUpperCase()}
        </span>
    );
};

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number; color?: string }) => {
    const getColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'bg-green-500';
            case 'yellow': return 'bg-yellow-500';
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
                className={`h-2 rounded-full transition-all duration-300 ${getColorClass(color)}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const HealthFactorMeter = ({ healthFactor }: { healthFactor: number }) => {
    const getHealthColor = (factor: number) => {
        if (factor >= 2) return { color: 'green', label: 'Safe' };
        if (factor >= 1.5) return { color: 'yellow', label: 'Moderate' };
        if (factor >= 1.2) return { color: 'orange', label: 'Risky' };
        return { color: 'red', label: 'Critical' };
    };

    const { color, label } = getHealthColor(healthFactor);
    const percentage = Math.min((healthFactor / 3) * 100, 100);

    return (
        <div className="flex items-center space-x-2">
            <div className="flex-1">
                <ProgressBar percentage={percentage} color={color} />
            </div>
            <div className={`text-sm font-medium ${
                color === 'green' ? 'text-green-400' :
                color === 'yellow' ? 'text-yellow-400' :
                color === 'orange' ? 'text-orange-400' :
                'text-red-400'
            }`}>
                {healthFactor.toFixed(2)} ({label})
            </div>
        </div>
    );
};

const LoanCard = ({ loan }: { loan: Loan }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysLeftColor = (days: number) => {
        if (days > 30) return 'text-green-400';
        if (days > 7) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors duration-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Loan #{loan.loanId}</h3>
                    <p className="text-gray-400">
                        {loan.collateralAmount.toFixed(4)} {loan.collateralAsset} → ${loan.loanAmount.toLocaleString()}
                    </p>
                </div>
                <StatusBadge status={loan.status} />
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {loan.repaymentPercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Repaid</div>
                </div>
                <div className="text-center">
                    <div className={`text-2xl font-bold ${getDaysLeftColor(loan.daysLeft)}`}>
                        {loan.daysLeft}
                    </div>
                    <div className="text-xs text-gray-400">Days Left</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {loan.interestRate}%
                    </div>
                    <div className="text-xs text-gray-400">APR</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        ${loan.remainingAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Remaining</div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 mb-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Repayment Progress</span>
                        <span className="text-blue-400">{loan.repaymentPercentage.toFixed(1)}%</span>
                    </div>
                    <ProgressBar percentage={loan.repaymentPercentage} color="blue" />
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Time Remaining</span>
                        <span className={getDaysLeftColor(loan.daysLeft)}>
                            {((loan.daysLeft / loan.duration) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <ProgressBar 
                        percentage={((loan.duration - loan.daysLeft) / loan.duration) * 100} 
                        color={loan.daysLeft > 30 ? "green" : loan.daysLeft > 7 ? "yellow" : "red"} 
                    />
                </div>

                {loan.status === 'active' && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">Health Factor</span>
                        </div>
                        <HealthFactorMeter healthFactor={loan.healthFactor} />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                >
                    {expanded ? 'Hide Details' : 'Show Details'}
                </button>
                
                {loan.status === 'active' && (
                    <div className="space-x-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200">
                            Repay
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200">
                            Add Collateral
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white mb-3">Loan Details</h4>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Start Date:</span>
                                <span className="text-white">{formatDate(loan.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Due Date:</span>
                                <span className="text-white">{formatDate(loan.dueDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Duration:</span>
                                <span className="text-white">{loan.duration} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount Repaid:</span>
                                <span className="text-green-400">${loan.amountRepaid.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white mb-3">Collateral Info</h4>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Collateral Amount:</span>
                                <span className="text-white">{loan.collateralAmount.toFixed(4)} {loan.collateralAsset}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Current Value:</span>
                                <span className="text-white">${loan.currentCollateralValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Liquidation Threshold:</span>
                                <span className="text-red-400">${loan.liquidationThreshold.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Health Factor:</span>
                                <span className={
                                    loan.healthFactor >= 2 ? 'text-green-400' :
                                    loan.healthFactor >= 1.5 ? 'text-yellow-400' :
                                    loan.healthFactor >= 1.2 ? 'text-orange-400' :
                                    'text-red-400'
                                }>
                                    {loan.healthFactor.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const LoanActivity = ({ address, isConnected }: LoanActivityProps) => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'repaid' | 'defaulted'>('all');

    // Mock data - Replace with actual contract calls
    const mockLoans: Loan[] = [
        {
            loanId: "0x1234...5678",
            borrower: address,
            collateralAsset: "ETH",
            collateralAmount: 2.5,
            loanAmount: 5000,
            interestRate: 8.5,
            duration: 90,
            startDate: new Date('2024-01-15'),
            dueDate: new Date('2024-04-15'),
            status: 'active',
            amountRepaid: 1500,
            remainingAmount: 3500,
            daysLeft: 45,
            repaymentPercentage: 30,
            liquidationThreshold: 7500,
            currentCollateralValue: 8750,
            healthFactor: 1.75
        },
        {
            loanId: "0xabcd...efgh",
            borrower: address,
            collateralAsset: "WBTC",
            collateralAmount: 0.1,
            loanAmount: 8000,
            interestRate: 9.0,
            duration: 120,
            startDate: new Date('2023-12-01'),
            dueDate: new Date('2024-04-01'),
            status: 'repaid',
            amountRepaid: 8720,
            remainingAmount: 0,
            daysLeft: 0,
            repaymentPercentage: 100,
            liquidationThreshold: 0,
            currentCollateralValue: 9500,
            healthFactor: 0
        },
        {
            loanId: "0x9876...5432",
            borrower: address,
            collateralAsset: "USDC",
            collateralAmount: 12000,
            loanAmount: 10000,
            interestRate: 6.5,
            duration: 60,
            startDate: new Date('2024-02-01'),
            dueDate: new Date('2024-04-02'),
            status: 'active',
            amountRepaid: 8500,
            remainingAmount: 1500,
            daysLeft: 7,
            repaymentPercentage: 85,
            liquidationThreshold: 11000,
            currentCollateralValue: 12000,
            healthFactor: 1.09
        }
    ];

    const fetchLoans = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual contract interaction
            // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            // const userLoans = await contract.getUserLoans(address);
            
            // For now, using mock data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
            setLoans(mockLoans);
        } catch (error) {
            console.error("Error fetching loans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            fetchLoans();
        }
    }, [isConnected, address]);

    const filteredLoans = loans.filter(loan => 
        filter === 'all' || loan.status === filter
    );

    const stats = {
        total: loans.length,
        active: loans.filter(l => l.status === 'active').length,
        repaid: loans.filter(l => l.status === 'repaid').length,
        defaulted: loans.filter(l => l.status === 'defaulted').length,
        totalBorrowed: loans.reduce((sum, loan) => sum + loan.loanAmount, 0),
        totalRepaid: loans.reduce((sum, loan) => sum + loan.amountRepaid, 0),
        totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + loan.remainingAmount, 0)
    };

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
                <p className="text-gray-400">Please connect your wallet to view loan activity</p>
            </div>
        );
    }

    return (
        <div className="text-white">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-center mb-2 text-blue-400">Loan Activity</h1>
                <p className="text-center text-gray-400">Track your borrowing history and manage active loans</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                    <div className="text-xs text-gray-400">Total Loans</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                    <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.repaid}</div>
                    <div className="text-xs text-gray-400">Repaid</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.defaulted}</div>
                    <div className="text-xs text-gray-400">Defaulted</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-purple-400">${stats.totalBorrowed.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total Borrowed</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-green-400">${stats.totalRepaid.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total Repaid</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-orange-400">${stats.totalOutstanding.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Outstanding</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-800 rounded-lg p-1">
                    {(['all', 'active', 'repaid', 'defaulted'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 capitalize ${
                                filter === status 
                                ? "bg-blue-600 text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                        >
                            {status} ({status === 'all' ? stats.total : 
                                status === 'active' ? stats.active :
                                status === 'repaid' ? stats.repaid : stats.defaulted})
                        </button>
                    ))}
                </div>
            </div>

            {/* Loans List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading loans...</p>
                </div>
            ) : filteredLoans.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-xl font-bold text-white mb-2">No loans found</h3>
                    <p className="text-gray-400">
                        {filter === 'all' ? 'You haven\'t taken any loans yet' : `No ${filter} loans found`}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredLoans.map((loan) => (
                        <LoanCard key={loan.loanId} loan={loan} />
                    ))}
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center mt-8">
                <button
                    onClick={fetchLoans}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-200"
                >
                    {loading ? "Refreshing..." : "Refresh Loans"}
                </button>
            </div>
        </div>
    );
};