"use client";

import Link from "next/link"
import { useState } from "react";
import { useWallet } from "./PageLayout";

export const Navbar = () => {
    const { address, setAddress, isConnected, setIsConnected, connectWallet } = useWallet();
    const [connecting, setConnecting] = useState(false);

    const handleWalletConnect = async () => {
        setConnecting(true);
        try {
            await connectWallet();
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        setAddress("");
        setIsConnected(false);
    };

    return (
        <nav className="relative bg-gray-900/80 backdrop-blur-sm text-white py-4 shadow-md border-b border-gray-700/50 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition duration-300">
                    Scorify
                </Link>
                <div className="hidden md:flex space-x-6">
                    <Link href="/" className="font-medium hover:text-blue-400 transition duration-300">Home</Link>
                    <Link href="/dashboard" className="font-medium hover:text-blue-400 transition duration-300">Dashboard</Link>
                    <Link href="/loans" className="font-medium hover:text-blue-400 transition duration-300">Loans</Link>
                    <Link href="/docs" className="font-medium hover:text-blue-400 transition duration-300">Docs</Link>
                </div>
                <div className="wallet-container">
                    {isConnected ? (
                        <div className="flex items-center space-x-2">
                            <div className="bg-green-600/80 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg border border-green-500/30">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                                </div>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="bg-red-600/80 hover:bg-red-700/80 backdrop-blur-sm text-white font-medium py-2 px-3 rounded-lg transition duration-300 border border-red-500/30"
                                title="Disconnect Wallet"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            className="flex items-center bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg transition duration-300 shadow-lg border border-blue-500/30"
                            onClick={handleWalletConnect}
                            disabled={connecting}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                            {connecting ? "Connecting..." : "Connect Wallet"}
                        </button>
                    )}
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