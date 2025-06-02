"use client";
import { useState } from "react";
import { Navbar } from "./components/Navbar";
import Dashboard from "./dashboard/dashboard";
import { LoansPage } from "./loans/loans";

export default function Home() {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = async () => {
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
        console.log("Connected wallet address:", accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <Navbar 
        address={address}
        setAddress={setAddress}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
      />
      <Dashboard
        address={address}
        isConnected={isConnected}
        onConnectWallet={handleConnectWallet}
      />
     
    </div>
  );
}