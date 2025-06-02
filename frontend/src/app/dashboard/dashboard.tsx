import { UserProfile } from "../components/userProfile";
import { LoanSimulator } from "../components/LoanSimulator";
import { FirstPage } from "../components/Firstpage";
import { LoanActivity } from "../components/loanactivity";
import { PageLayout } from "../components/PageLayout";
import { useState } from "react";
import { useWallet } from "../components/PageLayout";

interface DashboardProps {
    address: string;
    isConnected: boolean;
}

export default function Dashboard({ address, isConnected }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'simulator' | 'activity'>('simulator');
    const { connectWallet } = useWallet();

    // If wallet is not connected, show the FirstPage
    if (!isConnected || !address) {
        return <FirstPage onConnectWallet={connectWallet} />;
    }

    // If wallet is connected, show the main dashboard
    return (
        <PageLayout>
            <div className="p-6">
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
                                <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 border border-gray-600/50">
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
        </PageLayout>
    );
}