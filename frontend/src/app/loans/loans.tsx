"use client";
import { useState, useEffect } from "react";
import { PageLayout } from "../components/PageLayout";
import { LoanActivity } from "../components/loanactivity";

interface LoansPageProps {
    address: string;
    isConnected: boolean;
    onConnectWallet?: () => void;
}

interface MarketLoan {
    id: string;
    lender: string;
    lenderTier: string;
    collateralAsset: string;
    collateralAmount: number;
    loanAmount: number;
    interestRate: number;
    duration: number;
    maxLTV: number;
    minReputation: number;
    status: 'available' | 'funded' | 'completed';
    lenderReputation: number;
}

interface CreateLoanForm {
    collateralAsset: string;
    collateralAmount: number;
    requestedAmount: number;
    interestRate: number;
    duration: number;
    description: string;
}

const StatCard = ({ title, value, subtitle, color = "blue" }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    color?: string; 
}) => {
    const getColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'text-green-400';
            case 'red': return 'text-red-400';
            case 'yellow': return 'text-yellow-400';
            case 'purple': return 'text-purple-400';
            case 'cyan': return 'text-cyan-400';
            default: return 'text-blue-400';
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-500/30">
            <h3 className="text-gray-200 text-sm font-medium mb-2 drop-shadow-md">{title}</h3>
            <div className={`text-3xl font-bold ${getColorClass(color)} drop-shadow-lg`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtitle && (
                <p className="text-gray-300 text-sm mt-1 drop-shadow-md">{subtitle}</p>
            )}
        </div>
    );
};

const MarketLoanCard = ({ loan, onSelect }: { loan: MarketLoan; onSelect: (loan: MarketLoan) => void }) => {
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Diamond': return 'text-cyan-400';
            case 'Platinum': return 'text-purple-400';
            case 'Gold': return 'text-yellow-400';
            case 'Silver': return 'text-gray-400';
            default: return 'text-orange-400';
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-500/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white drop-shadow-lg">
                            {loan.collateralAmount.toFixed(4)} {loan.collateralAsset}
                        </h3>
                        <span className={`text-sm font-medium ${getTierColor(loan.lenderTier)} drop-shadow-md`}>
                            {loan.lenderTier}
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm drop-shadow-md">
                        Max loan: ${loan.loanAmount.toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 drop-shadow-lg">
                        {loan.interestRate}%
                    </div>
                    <div className="text-gray-300 text-sm drop-shadow-md">APR</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="text-sm text-gray-400 drop-shadow-md">Max LTV</div>
                    <div className="text-white font-medium drop-shadow-md">{(loan.maxLTV * 100).toFixed(0)}%</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400 drop-shadow-md">Duration</div>
                    <div className="text-white font-medium drop-shadow-md">{loan.duration} days</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400 drop-shadow-md">Min Reputation</div>
                    <div className="text-white font-medium drop-shadow-md">{loan.minReputation}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400 drop-shadow-md">Lender Score</div>
                    <div className="text-white font-medium drop-shadow-md">{loan.lenderReputation}</div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-300 drop-shadow-md">
                    Lender: {loan.lender.substring(0, 8)}...{loan.lender.substring(loan.lender.length - 6)}
                </div>
                <button
                    onClick={() => onSelect(loan)}
                    className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition duration-200 border border-blue-500/30"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

const CreateLoanModal = ({ 
    isOpen, 
    onClose, 
    onSubmit 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (loan: CreateLoanForm) => void; 
}) => {
    const [form, setForm] = useState<CreateLoanForm>({
        collateralAsset: 'ETH',
        collateralAmount: 0,
        requestedAmount: 0,
        interestRate: 5.0,
        duration: 30,
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/80 backdrop-blur-lg rounded-lg p-6 w-full max-w-2xl border border-gray-500/30">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Create Loan Request</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Collateral Asset
                            </label>
                            <select
                                value={form.collateralAsset}
                                onChange={(e) => setForm({...form, collateralAsset: e.target.value})}
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="WBTC">Wrapped Bitcoin (WBTC)</option>
                                <option value="USDC">USD Coin (USDC)</option>
                                <option value="USDT">Tether (USDT)</option>
                                <option value="DAI">Dai (DAI)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Collateral Amount
                            </label>
                            <input
                                type="number"
                                value={form.collateralAmount || ''}
                                onChange={(e) => setForm({...form, collateralAmount: parseFloat(e.target.value) || 0})}
                                placeholder="0.0"
                                step="0.0001"
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Requested Amount (USD)
                            </label>
                            <input
                                type="number"
                                value={form.requestedAmount || ''}
                                onChange={(e) => setForm({...form, requestedAmount: parseFloat(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Interest Rate (% APR)
                            </label>
                            <input
                                type="number"
                                value={form.interestRate || ''}
                                onChange={(e) => setForm({...form, interestRate: parseFloat(e.target.value) || 0})}
                                placeholder="5.0"
                                step="0.1"
                                min="0.1"
                                max="50"
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Duration (days)
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

                    <div>
                        <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                            Description (Optional)
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            placeholder="Additional details about your loan request..."
                            rows={3}
                            className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 border border-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600/80 hover:bg-gray-700/80 backdrop-blur-sm text-white px-6 py-2 rounded-lg transition duration-200 border border-gray-500/30"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white px-6 py-2 rounded-lg transition duration-200 border border-blue-500/30"
                        >
                            Create Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const LoansPage = ({ address, isConnected, onConnectWallet }: LoansPageProps) => {
    const [activeTab, setActiveTab] = useState<'market' | 'my-loans' | 'my-requests'>('market');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [marketLoans, setMarketLoans] = useState<MarketLoan[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock data for market loans
    const mockMarketLoans: MarketLoan[] = [
        {
            id: '1',
            lender: '0x1234567890123456789012345678901234567890',
            lenderTier: 'Gold',
            collateralAsset: 'ETH',
            collateralAmount: 2.5,
            loanAmount: 8000,
            interestRate: 6.5,
            duration: 90,
            maxLTV: 0.75,
            minReputation: 600,
            status: 'available',
            lenderReputation: 750
        },
        {
            id: '2',
            lender: '0x2345678901234567890123456789012345678901',
            lenderTier: 'Platinum',
            collateralAsset: 'WBTC',
            collateralAmount: 0.1,
            loanAmount: 9500,
            interestRate: 4.5,
            duration: 120,
            maxLTV: 0.70,
            minReputation: 750,
            status: 'available',
            lenderReputation: 850
        },
        {
            id: '3',
            lender: '0x3456789012345678901234567890123456789012',
            lenderTier: 'Diamond',
            collateralAsset: 'USDC',
            collateralAmount: 15000,
            loanAmount: 14000,
            interestRate: 3.5,
            duration: 60,
            maxLTV: 0.95,
            minReputation: 900,
            status: 'available',
            lenderReputation: 950
        }
    ];

    useEffect(() => {
        setMarketLoans(mockMarketLoans);
    }, []);

    const handleCreateLoan = (loan: CreateLoanForm) => {
        console.log('Creating loan request:', loan);
        // TODO: Implement actual loan creation logic
    };

    const handleApplyForLoan = (loan: MarketLoan) => {
        console.log('Applying for loan:', loan);
        // TODO: Implement loan application logic
    };

    if (!isConnected) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-screen p-6">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 text-center border border-gray-500/30 max-w-md">
                        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Connect Wallet</h2>
                        <p className="text-gray-200 mb-6 drop-shadow-md">
                            Please connect your wallet to access the loans marketplace
                        </p>
                        <button
                            onClick={onConnectWallet}
                            className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition duration-200 border border-blue-500/30"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                            Loans Marketplace
                        </h1>
                        <p className="text-xl text-gray-200 drop-shadow-lg">
                            Borrow, lend, and manage your DeFi loans
                        </p>
                    </div>

                    {/* Market Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Volume" value="$2.5M" subtitle="Last 30 days" color="blue" />
                        <StatCard title="Active Loans" value="142" subtitle="Currently funded" color="green" />
                        <StatCard title="Avg APR" value="5.8%" subtitle="Across all tiers" color="yellow" />
                        <StatCard title="Total Lenders" value="89" subtitle="Verified users" color="purple" />
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-gray-500/30">
                            <button
                                onClick={() => setActiveTab('market')}
                                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                    activeTab === 'market'
                                        ? "bg-blue-600/80 text-white border border-blue-500/30"
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                Market
                            </button>
                            <button
                                onClick={() => setActiveTab('my-loans')}
                                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                    activeTab === 'my-loans'
                                        ? "bg-blue-600/80 text-white border border-blue-500/30"
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                My Loans
                            </button>
                            <button
                                onClick={() => setActiveTab('my-requests')}
                                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                    activeTab === 'my-requests'
                                        ? "bg-blue-600/80 text-white border border-blue-500/30"
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                My Requests
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'market' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Available Loans</h2>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-green-600/80 hover:bg-green-700/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition duration-200 border border-green-500/30"
                                >
                                    Create Loan Request
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marketLoans.map((loan) => (
                                    <MarketLoanCard
                                        key={loan.id}
                                        loan={loan}
                                        onSelect={handleApplyForLoan}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'my-loans' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">My Active Loans</h2>
                            <LoanActivity address={address} isConnected={isConnected} />
                        </div>
                    )}

                    {activeTab === 'my-requests' && (
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 text-center border border-gray-500/30">
                            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">My Loan Requests</h2>
                            <p className="text-gray-200 mb-6 drop-shadow-md">
                                You haven't created any loan requests yet
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition duration-200 border border-blue-500/30"
                            >
                                Create Your First Request
                            </button>
                        </div>
                    )}

                    {/* Create Loan Modal */}
                    <CreateLoanModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={handleCreateLoan}
                    />
                </div>
            </div>
        </PageLayout>
    );
};