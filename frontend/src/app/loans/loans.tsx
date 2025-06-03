"use client";
import { useState, useEffect } from "react";
import { PageLayout } from "../components/PageLayout";
import { LoanActivity } from "../components/loanactivity";
import { MetaMaskConnect } from "../components/MetaMaskConnect";
import { LoanCreator } from "../components/LoanCreator";

interface LoansPageProps {
    address?: string;
    isConnected: boolean;
    onConnectWallet?: () => void;
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

export const LoansPage = ({ address, isConnected, onConnectWallet }: LoansPageProps) => {
    const [activeTab, setActiveTab] = useState<'create' | 'my-loans'>('create');
    const [walletAddress, setWalletAddress] = useState<string>(address || '');
    const [connected, setConnected] = useState<boolean>(isConnected);

    const handleWalletConnect = (addr: string) => {
        setWalletAddress(addr);
        setConnected(true);
        if (onConnectWallet) {
            onConnectWallet();
        }
    };

    return (
        <PageLayout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                            Graphite Loans
                        </h1>
                        <p className="text-xl text-gray-200 drop-shadow-lg">
                            Collateralized lending with tier-based interest rates
                        </p>
                    </div>

                    {/* MetaMask Connection */}
                    <div className="flex justify-center mb-8">
                        <MetaMaskConnect 
                            onConnect={handleWalletConnect}
                            isConnected={connected}
                            address={walletAddress}
                        />
                    </div>

                    {connected && (
                        <>
                            {/* Market Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <StatCard title="Available gUSD" value="500K" subtitle="Ready to lend" color="blue" />
                                <StatCard title="Active Loans" value="12" subtitle="Currently funded" color="green" />
                                <StatCard title="Total Collateral" value="$2.1M" subtitle="Locked in loans" color="yellow" />
                                <StatCard title="Avg Interest" value="5.2%" subtitle="Across all tiers" color="purple" />
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex justify-center mb-8">
                                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-gray-500/30">
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                            activeTab === 'create'
                                                ? "bg-blue-600/80 text-white border border-blue-500/30"
                                                : "text-gray-300 hover:text-white"
                                        }`}
                                    >
                                        Create Loan
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
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'create' && (
                                <LoanCreator 
                                    address={walletAddress}
                                    isConnected={connected}
                                />
                            )}

                            {activeTab === 'my-loans' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg text-center">
                                        My Loan Portfolio
                                    </h2>
                                    <LoanActivity address={walletAddress} isConnected={connected} />
                                </div>
                            )}
                        </>
                    )}

                    {!connected && (
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-12 text-center border border-gray-500/30 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                                Connect Your Wallet
                            </h2>
                            <p className="text-gray-200 mb-8 drop-shadow-md text-lg">
                                Connect MetaMask to create loans, manage collateral, and access tier-based lending rates
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-black/20 rounded-lg p-4 border border-gray-600/30">
                                    <div className="text-yellow-400 text-2xl mb-2">🥉</div>
                                    <div className="text-white font-bold">Bronze</div>
                                    <div className="text-gray-300 text-sm">10% APR • 50% LTV</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 border border-gray-600/30">
                                    <div className="text-yellow-400 text-2xl mb-2">🥇</div>
                                    <div className="text-white font-bold">Gold</div>
                                    <div className="text-gray-300 text-sm">5% APR • 70% LTV</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 border border-gray-600/30">
                                    <div className="text-cyan-400 text-2xl mb-2">💎</div>
                                    <div className="text-white font-bold">Diamond</div>
                                    <div className="text-gray-300 text-sm">2% APR • 90% LTV</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};