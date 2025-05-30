"use client";
import {Navbar} from "./components/Navbar"
import { useState } from "react";
import Dashboard from "./dashboard/dashboard"
export default function Home(){
  const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);
  return (
    <div className="min-h-screen bg-gray-950">
            <Navbar 
                address={address}
                setAddress={setAddress}
                isConnected={isConnected}
                setIsConnected={setIsConnected}
            />
            <div className="container mx-auto px-4 py-8">
                <Dashboard address={address} isConnected={isConnected} />
            </div>
        </div>
  )
}