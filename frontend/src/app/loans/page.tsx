"use client";

import { useState, useEffect } from "react";
import { LoansPage } from "./loans";
import { Navbar } from "../components/Navbar";

export default function Loans() {
    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    // Check for existing wallet connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            // Check MetaMask connection
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
                    console.error("Error checking MetaMask connection:", error);
                }
            }

            // Check Graphite wallet connection
            if (window.graphite ) {
                try {
                    const enabled = await window.graphite.enable();
                    if (!enabled) {
                        throw new Error('User denied access to the wallet');
                    }
                    const address = await window.graphite.getAddress();
                    console.log('GraphiteWallet Address:', address);
                        setIsConnected(true);
                    
                } catch (error) {
                    console.error("Error checking Graphite wallet connection:", error);
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
            
            {/* Loans Page Content */}
            <LoansPage 
                address={address}
                isConnected={isConnected}
                onConnectWallet={handleConnectWallet}
            />
        </div>
    );
}