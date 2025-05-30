"use client";

import Link from "next/link"
import { useState } from "react";

interface NavbarProps {
    address: string;
    setAddress: (address: string) => void;
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;
}

export const Navbar = ({ address, setAddress, isConnected, setIsConnected }: NavbarProps) => {
    
    const [connecting, setConnecting] = useState(false);

    const handleWalletConnect = async () => {
        setConnecting(true);
        try {
            if (!window.graphite) {
                alert("Please install the Graphite wallet or MetaMask.");
                setConnecting(false);
                return;
            }

            const enabled = await window.graphite.enable();
            if (enabled) {
                const addr = await window.graphite.getAddress();
                setAddress(addr);
                setIsConnected(true);
                console.log("Connected wallet address:", addr);
            } else {
                alert("Wallet connection was not approved.");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet");
        } finally {
            setConnecting(false);
        }
    };

    return (
        <nav className="bg-gray-900 text-white py-4 shadow-md" 
        style={{
            backgroundImage: "url('/Images/ProfilePage.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center"}}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                <a href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition duration-300">
                    Scortify
                </a>
                <div className="hidden md:flex space-x-6">
                    <Link href="/" className="font-medium hover:text-blue-400 transition duration-300">Home</Link>
                    <Link href="/loans" className="font-medium hover:text-blue-400 transition duration-300">Loans</Link>
                    <Link href="/lend" className="font-medium hover:text-blue-400 transition duration-300">Lend</Link>
                    <Link href="/docs" className="font-medium hover:text-blue-400 transition duration-300">Docs</Link>
                </div>
                <div className="wallet-container">
                    <button
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 shadow-lg"
                        onClick={handleWalletConnect}
                        disabled={connecting}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                        {connecting
                            ? "Connecting..."
                            : isConnected
                                ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                                : "Connect Wallet"}
                    </button>
                </div>
                <div className="md:hidden">
                    <button className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};