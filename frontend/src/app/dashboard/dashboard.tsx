import { UserProfile } from "../components/userProfile";
import { LoanSimulator } from "../components/LoanSimulator";
import { FirstPage } from "../components/Firstpage";
import { LoanActivity } from "../components/loanactivity";
import { useState } from "react";

interface DashboardProps {
    address: string;
    isConnected: boolean;
    onConnectWallet?: () => void;
}

export default function Dashboard({ address, isConnected, onConnectWallet }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'simulator' | 'activity'>('simulator');

    // If wallet is not connected, show the FirstPage
    if (!isConnected || !address) {
        return <FirstPage onConnectWallet={onConnectWallet} />;
    }

    // If wallet is connected, show the main dashboard
    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* User Profile - Left Side (4 columns) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6">
                            <UserProfile address={address} isConnected={isConnected} />
                        </div>
                    </div>
                    
                    {/* Main Content - Right Side (8 columns) */}
                    <div className="lg:col-span-8">
                        {/* Tab Navigation */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('simulator')}
                                    className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                        activeTab === 'simulator' 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    Loan Simulator
                                </button>
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                        activeTab === 'activity' 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    Loan Activity
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'simulator' ? (
                            <LoanSimulator address={address} isConnected={isConnected} />
                        ) : (
                            <LoanActivity address={address} isConnected={isConnected} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}