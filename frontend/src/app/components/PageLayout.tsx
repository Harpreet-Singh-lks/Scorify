"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from "next/navigation";

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

interface WalletContextType {
    address: string;
    setAddress: (address: string) => void;
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;
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
    const router = useRouter();

    const connectWallet = async () => {
        setConnecting(true);
        try {
            if (!window.graphite) {
                throw new Error('Graphite Wallet extension not found. Please install it first.');
            }
    
            // Request permission to connect to the wallet
            const enabled = await window.graphite.enable();
            if (!enabled) {
                throw new Error('User denied access to Graphite Wallet');
            }
    
            // Get the wallet address
            const walletAddress = await window.graphite.getAddress();
            console.log('Graphite Wallet Address:', walletAddress);
            
            setAddress(walletAddress);
            setIsConnected(true);
            
            // Redirect to dashboard after successful connection
            router.push("/dashboard");
            
        } catch (error) {
            console.error("Error connecting Graphite Wallet:", error);
            alert("Failed to connect Graphite Wallet. Please make sure it's installed and try again.");
        } finally {
            setConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAddress("");
        setIsConnected(false);
        // Redirect to home after disconnection
        router.push("/");
    };

    // Check for existing connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (window.graphite && !isConnected) {
                try {
                    // Check if already connected without requesting permission
                    const accounts = await window.graphite.request({ method: 'eth_accounts' });
                    
                    if (accounts && accounts.length > 0) {
                        setAddress(accounts[0]);
                        setIsConnected(true);
                        console.log('Auto-connected to Graphite Wallet:', accounts[0]);
                    }
                } catch (error) {
                    console.error("Error checking Graphite Wallet connection:", error);
                }
            }
        };

        checkConnection();
    }, [isConnected]);

    // Listen for Graphite Wallet account changes
    useEffect(() => {
        if (window.graphite) {
            const handleAccountsChanged = async (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    setAddress(accounts[0]);
                    setIsConnected(true);
                    console.log('Graphite Wallet account changed:', accounts[0]);
                }
            };

            // Listen for account changes (if Graphite Wallet supports this)
            if (window.graphite.on) {
                window.graphite.on('accountsChanged', handleAccountsChanged);
                
                return () => {
                    if (window.graphite.removeListener) {
                        window.graphite.removeListener('accountsChanged', handleAccountsChanged);
                    }
                };
            }
        }
    }, []);

    const value = {
        address,
        setAddress,
        isConnected,
        setIsConnected,
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