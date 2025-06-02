// filepath: /Users/harpreetsingh/Documents/Solidity/Graphite-hackathon/frontend/src/app/components/PageLayout.tsx
"use client";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
    return (
        <div 
            className={`min-h-screen w-full text-white relative ${className}`}
            style={{
                backgroundImage: "url('/Images/p1.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
            
            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
};

// filepath: /Users/harpreetsingh/Documents/Solidity/Graphite-hackathon/frontend/src/app/context/WalletContext.tsx


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
    address: string;
    isConnected: boolean;
    connecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const connectWallet = async () => {
        setConnecting(true);
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask or another Ethereum wallet.");
                return;
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0) {
                setAddress(accounts[0]);
                setIsConnected(true);
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet");
        } finally {
            setConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAddress("");
        setIsConnected(false);
    };

    // Check for existing connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts'
                    });
                    
                    if (accounts.length > 0) {
                        setAddress(accounts[0]);
                        setIsConnected(true);
                    }
                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            }
        };

        checkConnection();
    }, []);

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    setAddress(accounts[0]);
                    setIsConnected(true);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const value = {
        address,
        isConnected,
        connecting,
        connectWallet,
        disconnectWallet
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};