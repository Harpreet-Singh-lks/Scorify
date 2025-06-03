"use client";

import { useState, useEffect } from "react";
import Dashboard from "./dashboard";
import { Navbar } from "../components/Navbar";

export default function DashboardPage() {
    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    // Check for existing wallet connection on mount
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

    const handleConnectWallet = async () => {
        // This function is now handled by the Navbar component
        // We don't need it here since the Navbar manages wallet connections
        console.log("Wallet connection handled by Navbar");
    };

    return (
        <div>
            {/* Navbar with proper props */}
            <Navbar 
                address={address}
                setAddress={setAddress}
                isConnected={isConnected}
                setIsConnected={setIsConnected}
            />
            
            {/* Dashboard Content */}
            <Dashboard 
                address={address}
                isConnected={isConnected}
            />
        </div>
    );
}