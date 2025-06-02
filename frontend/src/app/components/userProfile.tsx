"use client";
import { useState, useEffect } from "react";
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

interface UserProfileProps {
    address: string;
    isConnected: boolean;
}

const ReputationMeter = ({ reputation, size = 200 }: { reputation: number; size?: number }) => {
    const percentage = (reputation / 1000) * 100;
    const radius = (size - 20) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Determine color based on reputation
    const getScoreColor = (score: number) => {
        if (score >= 900) return "text-cyan-400";
        if (score >= 750) return "text-purple-400";
        if (score >= 600) return "text-yellow-400";
        if (score >= 400) return "text-blue-400";
        return "text-orange-400";
    };

    const getStrokeColor = (score: number) => {
        if (score >= 900) return "stroke-cyan-400";
        if (score >= 750) return "stroke-purple-400";
        if (score >= 600) return "stroke-yellow-400";
        if (score >= 400) return "stroke-blue-400";
        return "stroke-orange-400";
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg
                    className="transform -rotate-90"
                    width={size}
                    height={size}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-600"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`${getStrokeColor(reputation)} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-4xl font-bold ${getScoreColor(reputation)} drop-shadow-lg`}>
                        {reputation}
                    </div>
                    <div className="text-gray-200 text-sm mt-1 drop-shadow-md">
                        Reputation Score
                    </div>
                    <div className="text-gray-300 text-xs drop-shadow-md">
                        {Math.round(percentage)}% Complete
                    </div>
                </div>
            </div>
            
            {/* Tier indicators */}
            <div className="mt-4 w-full max-w-xs">
                <div className="flex justify-between text-xs text-gray-300 mb-2 drop-shadow-md">
                    <span>0</span>
                    <span>400</span>
                    <span>600</span>
                    <span>750</span>
                    <span>900</span>
                    <span>1000</span>
                </div>
                <div className="relative w-full h-2 bg-gray-600/50 backdrop-blur-sm rounded-full border border-gray-500/30">
                    <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                            reputation >= 900 ? 'bg-gradient-to-r from-cyan-400 to-cyan-300' :
                            reputation >= 750 ? 'bg-gradient-to-r from-purple-400 to-purple-300' :
                            reputation >= 600 ? 'bg-gradient-to-r from-yellow-400 to-yellow-300' :
                            reputation >= 400 ? 'bg-gradient-to-r from-blue-400 to-blue-300' :
                            'bg-gradient-to-r from-orange-400 to-orange-300'
                        }`}
                        style={{ width: `${(reputation / 1000) * 100}%` }}
                    ></div>
                    
                    {/* Tier markers */}
                    {[400, 600, 750, 900].map((threshold) => (
                        <div
                            key={threshold}
                            className="absolute top-0 w-0.5 h-2 bg-white opacity-80"
                            style={{ left: `${(threshold / 1000) * 100}%` }}
                        ></div>
                    ))}
                </div>
                <div className="flex justify-between text-xs mt-1 drop-shadow-md">
                    <span className="text-orange-400">Bronze</span>
                    <span className="text-blue-400">Silver</span>
                    <span className="text-yellow-400">Gold</span>
                    <span className="text-purple-400">Platinum</span>
                    <span className="text-cyan-400">Diamond</span>
                </div>
            </div>
        </div>
    );
};

export const UserProfile = ({ address, isConnected }: UserProfileProps) => {
    const [reputation, setReputation] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tier, setTier] = useState("Bronze");
    const [kycStatus, setKycStatus] = useState<"verified" | "pending" | "not_started" | "rejected">("not_started");

    const getTierFromReputation = (score: number) => {
        if (score >= 900) return "Diamond";
        if (score >= 750) return "Platinum";
        if (score >= 600) return "Gold";
        if (score >= 400) return "Silver";
        return "Bronze";
    };

    const getTierColor = (tier: string): string => {
        switch (tier) {
            case "Diamond": return "text-cyan-400";
            case "Platinum": return "text-gray-300";
            case "Gold": return "text-yellow-400";
            case "Silver": return "text-gray-400";
            default: return "text-orange-600";
        }
    };

    const getKycStatusColor = (status: string): string => {
        switch (status) {
            case "verified": return "text-green-400";
            case "pending": return "text-yellow-400";
            case "rejected": return "text-red-400";
            default: return "text-gray-400";
        }
    };

    const getKycStatusIcon = (status: string) => {
        switch (status) {
            case "verified":
                return (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case "pending":
                return (
                    <svg className="w-5 h-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case "rejected":
                return (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
        }
    };

    const getReputation = async (useraddress: string): Promise<number> => {
        try {
            if (window.graphite) {
                const accountInfo = await window.graphite.getAccountInfo();
                return accountInfo?.reputation || accountInfo?.reputationScore || 0;
            }
            // Fallback mock value if graphite is not available
            return Math.floor(Math.random() * 1000);
        } catch (error) {
            console.error("Error fetching reputation:", error);
            return 0;
        }
    };

    const getKycStatus = async (useraddress: string): Promise<"verified" | "pending" | "not_started" | "rejected"> => {
        try {
            if (window.graphite) {
                const accountInfo = await window.graphite.getAccountInfo();
                // Check if KYC status exists in account info
                return accountInfo?.kycStatus || accountInfo?.kyc_status || "not_started";
            }
            // Mock KYC status for demo
            const statuses: ("verified" | "pending" | "not_started" | "rejected")[] = ["verified", "pending", "not_started", "rejected"];
            return statuses[Math.floor(Math.random() * statuses.length)];
        } catch (error) {
            console.error("Error fetching KYC status:", error);
            return "not_started";
        }
    };

    const getAvatarUrl = (address: string) => {
        const avatar = createAvatar(identicon, {
            seed: address,
            size: 64,
        });
        return avatar.toDataUri();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (isConnected && address) {
                setLoading(true);
                try {
                    const [reputationScore, kycStatusResult] = await Promise.all([
                        getReputation(address),
                        getKycStatus(address)
                    ]);
                    setReputation(reputationScore);
                    setTier(getTierFromReputation(reputationScore));
                    setKycStatus(kycStatusResult);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [address, isConnected]);

    if (!isConnected) {
        return (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-600/30">
                <p className="text-gray-200 drop-shadow-lg">Please connect your wallet to view profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <img 
                    src={getAvatarUrl(address)} 
                    alt="User Avatar" 
                    className="w-16 h-16 rounded-full border-2 border-white/20 backdrop-blur-sm shadow-2xl"
                />
                <div className="ml-4">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">User Profile</h2>
                    <p className="text-gray-200 text-sm drop-shadow-md">Wallet connected</p>
                </div>
            </div>
            
            {/* User Address */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2 drop-shadow-md">Wallet Address</h3>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-500/30">
                    <p className="text-blue-300 font-mono text-sm break-all drop-shadow-md">
                        {address}
                    </p>
                </div>
            </div>

            {/* KYC Status */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2 drop-shadow-md">KYC Verification</h3>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-500/30">
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                            <span className="text-gray-200 drop-shadow-md">Loading...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getKycStatusIcon(kycStatus)}
                                <span className={`font-medium capitalize ${getKycStatusColor(kycStatus)} drop-shadow-md`}>
                                    {kycStatus.replace('_', ' ')}
                                </span>
                            </div>
                            {kycStatus === "not_started" && (
                                <button className="text-blue-300 text-sm hover:text-blue-200 transition duration-200 drop-shadow-md">
                                    Start KYC
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reputation Score - Big Meter */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4 text-center drop-shadow-lg">Reputation Assessment</h3>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-500/30">
                    {loading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400"></div>
                            <span className="text-gray-200 drop-shadow-md">Loading reputation data...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <ReputationMeter reputation={reputation} />
                            
                            {/* Additional metrics */}
                            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white drop-shadow-lg">{reputation}</div>
                                    <div className="text-xs text-gray-200 drop-shadow-md">Current Score</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getTierColor(tier)} drop-shadow-lg`}>{tier}</div>
                                    <div className="text-xs text-gray-200 drop-shadow-md">Current Tier</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white drop-shadow-lg">
                                        {reputation < 400 ? 400 - reputation :
                                         reputation < 600 ? 600 - reputation :
                                         reputation < 750 ? 750 - reputation :
                                         reputation < 900 ? 900 - reputation : 0}
                                    </div>
                                    <div className="text-xs text-gray-200 drop-shadow-md">
                                        {reputation >= 900 ? "Max Tier!" : "To Next Tier"}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress message */}
                            <div className="mt-4 text-center">
                                <div className="text-sm text-gray-200 drop-shadow-md">
                                    {reputation < 400 ? `${400 - reputation} points needed for Silver tier` :
                                     reputation < 600 ? `${600 - reputation} points needed for Gold tier` :
                                     reputation < 750 ? `${750 - reputation} points needed for Platinum tier` :
                                     reputation < 900 ? `${900 - reputation} points needed for Diamond tier` :
                                     "🎉 Maximum tier achieved! You're a Diamond member!"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tier */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2 drop-shadow-md">Tier</h3>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-500/30">
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                            <span className="text-gray-200 drop-shadow-md">Loading...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <div className={`text-2xl font-bold ${getTierColor(tier)} drop-shadow-lg`}>
                                {tier}
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-200 drop-shadow-md">
                                    Next tier: {reputation < 400 ? "Silver (400)" : 
                                             reputation < 600 ? "Gold (600)" : 
                                             reputation < 750 ? "Platinum (750)" : 
                                             reputation < 900 ? "Diamond (900)" : "Max tier reached!"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-500/30">
                    <p className="text-gray-200 text-xs drop-shadow-md">Loans Taken</p>
                    <p className="text-white font-bold drop-shadow-lg">0</p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-500/30">
                    <p className="text-gray-200 text-xs drop-shadow-md">Loans Given</p>
                    <p className="text-white font-bold drop-shadow-lg">0</p>
                </div>
            </div>
        </div>
    );
};