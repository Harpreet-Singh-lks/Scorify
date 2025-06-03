"use client";

import { Navbar } from "./components/Navbar";
import Dashboard from "./dashboard/dashboard";

export default function DashboardPage() {
    return (
        <>
            <Navbar />
            <Dashboard />
        </>
    );
}