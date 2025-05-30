"use client";
import { useState } from "react";

interface FirstPageProps {
    onConnectWallet?: () => void;
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300">
            <div className="flex items-center mb-4">
                <div className="text-blue-400 mr-3">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            <p className="text-gray-300">{description}</p>
        </div>
    );
};

const TierBadge = ({ tier, color, features }: { tier: string; color: string; features: string[] }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-blue-500 transition-colors duration-300">
            <div className="text-center mb-4">
                <h3 className={`text-2xl font-bold ${color}`}>{tier}</h3>
                <div className="mt-2 text-gray-400">Tier Benefits</div>
            </div>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                        <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const FirstPage = ({ onConnectWallet }: FirstPageProps) => {
    const [activeTab, setActiveTab] = useState("features");

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Reputation-Based Lending",
            description: "Get better loan terms based on your on-chain reputation and transaction history."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: "Real-time Pricing",
            description: "Access live token prices and dynamic interest rates that adjust to market conditions."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            title: "Secure Collateral",
            description: "Multiple collateral options including ETH, WBTC, USDC, USDT, and DAI with secure smart contracts."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
            ),
            title: "Loan Simulation",
            description: "Test different loan scenarios before committing with our advanced loan simulator."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Tier System",
            description: "Progress through Bronze, Silver, Gold, Platinum, and Diamond tiers for better benefits."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "KYC Verification",
            description: "Enhanced security and higher limits with optional KYC verification process."
        }
    ];

    const tiers = [
        {
            tier: "Bronze",
            color: "text-orange-400",
            features: [
                "Up to $10K loans",
                "60% LTV on ETH",
                "8.5% APR on ETH",
                "Basic features"
            ]
        },
        {
            tier: "Silver",
            color: "text-gray-400",
            features: [
                "Up to $25K loans",
                "65% LTV on ETH",
                "7.0% APR on ETH",
                "Priority support"
            ]
        },
        {
            tier: "Gold",
            color: "text-yellow-400",
            features: [
                "Up to $50K loans",
                "70% LTV on ETH",
                "5.5% APR on ETH",
                "Advanced analytics"
            ]
        },
        {
            tier: "Platinum",
            color: "text-purple-400",
            features: [
                "Up to $100K loans",
                "75% LTV on ETH",
                "4.0% APR on ETH",
                "Premium features"
            ]
        },
        {
            tier: "Diamond",
            color: "text-cyan-400",
            features: [
                "Up to $250K loans",
                "80% LTV on ETH",
                "3.0% APR on ETH",
                "Elite benefits"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-6">
                            Graphite Lending
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            The future of decentralized lending powered by reputation scores and real-time analytics
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={onConnectWallet}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                            >
                                Connect Wallet & Start
                            </button>
                            <button 
                                onClick={() => setActiveTab("features")}
                                className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Background Animation */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-10 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-gray-800 rounded-lg p-8">
                        <div className="text-4xl font-bold text-blue-400 mb-2">$0M+</div>
                        <div className="text-gray-300">Total Value Locked</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-8">
                        <div className="text-4xl font-bold text-purple-400 mb-2">0+</div>
                        <div className="text-gray-300">Active Loans</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-8">
                        <div className="text-4xl font-bold text-cyan-400 mb-2">0+</div>
                        <div className="text-gray-300">Verified Users</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab("features")}
                            className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                activeTab === "features" 
                                ? "bg-blue-600 text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Features
                        </button>
                        <button
                            onClick={() => setActiveTab("tiers")}
                            className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                activeTab === "tiers" 
                                ? "bg-blue-600 text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Tier System
                        </button>
                        <button
                            onClick={() => setActiveTab("how-it-works")}
                            className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                activeTab === "how-it-works" 
                                ? "bg-blue-600 text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                        >
                            How It Works
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            {activeTab === "features" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-center mb-12">Platform Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            )}

            {/* Tier System Section */}
            {activeTab === "tiers" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-center mb-12">Reputation Tier System</h2>
                    <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
                        Progress through our tier system to unlock better loan terms, higher limits, and exclusive features. 
                        Your reputation score determines your tier and the benefits you receive.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {tiers.map((tier, index) => (
                            <TierBadge key={index} {...tier} />
                        ))}
                    </div>
                </div>
            )}

            {/* How It Works Section */}
            {activeTab === "how-it-works" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold">1</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Connect & Verify</h3>
                            <p className="text-gray-300">
                                Connect your wallet and complete optional KYC verification to start building your reputation score.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold">2</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Build Reputation</h3>
                            <p className="text-gray-300">
                                Engage with DeFi protocols, maintain good transaction history, and build your on-chain reputation.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold">3</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Get Better Terms</h3>
                            <p className="text-gray-300">
                                As your reputation grows, unlock higher loan limits, better interest rates, and premium features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Lending?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join thousands of users already benefiting from reputation-based lending
                    </p>
                    <button 
                        onClick={onConnectWallet}
                        className="bg-white text-blue-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                    >
                        Connect Wallet Now
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">Graphite Lending</h3>
                        <p className="text-gray-400 mb-6">Decentralized lending powered by reputation</p>
                        <div className="flex justify-center space-x-6 text-gray-400">
                            <a href="#" className="hover:text-white transition duration-200">Documentation</a>
                            <a href="#" className="hover:text-white transition duration-200">Terms</a>
                            <a href="#" className="hover:text-white transition duration-200">Privacy</a>
                            <a href="#" className="hover:text-white transition duration-200">Support</a>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-800">
                            <p className="text-gray-500">© 2024 Graphite Lending. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};