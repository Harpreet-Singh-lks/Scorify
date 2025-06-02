"use client";
import { useState, useEffect } from "react";

interface LoanCalculation {
    collateralRequired: number;
    interest: number;
    maxBorrowableAmount: number;
    totalRepayment: number;
    liquidationThreshold: number;
    interestRate: number;
}

interface UserProfileProps {
    address: string;
    isConnected: boolean;
}

interface CircularMeterProps {
    value: number;
    maxValue: number;
    label: string;
    color: string;
    unit?: string;
    size?: number;
}

const CircularMeter = ({ value, maxValue, label, color, unit = "", size = 120 }: CircularMeterProps) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const radius = (size - 16) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center p-4">
            <div className="relative" style={{ width: size, height: size }}>
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
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-500 ease-out ${color}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-bold text-white drop-shadow-lg">
                        {value.toFixed(value >= 1000 ? 0 : 2)}
                    </div>
                    <div className="text-xs text-gray-200 drop-shadow-md">{unit}</div>
                </div>
            </div>
            <div className="text-sm text-gray-200 text-center mt-2 drop-shadow-md">{label}</div>
        </div>
    );
};

interface TierMeterProps {
    tierName: string;
    isSelected: boolean;
    maxLoan: number;
    interestRate: number;
    ltv: number;
    onClick: () => void;
}

const TierMeter = ({ tierName, isSelected, maxLoan, interestRate, ltv, onClick }: TierMeterProps) => {
    const getTierColor = (tier: string) => {
        switch (tier) {
            case "Bronze": return "stroke-orange-400";
            case "Silver": return "stroke-gray-400";
            case "Gold": return "stroke-yellow-400";
            case "Platinum": return "stroke-purple-400";
            case "Diamond": return "stroke-cyan-400";
            default: return "stroke-gray-400";
        }
    };

    const ltvPercentage = ltv * 100;
    const radius = 35;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (ltvPercentage / 100) * circumference;

    return (
        <div 
            className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
                isSelected 
                ? 'bg-blue-600/80 transform scale-105 border-blue-400/50' 
                : 'bg-black/30 hover:bg-black/40 border-gray-500/30'
            }`}
            onClick={onClick}
        >
            <div className="relative" style={{ width: 80, height: 80 }}>
                <svg
                    className="transform -rotate-90"
                    width={80}
                    height={80}
                >
                    <circle
                        cx={40}
                        cy={40}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-600"
                    />
                    <circle
                        cx={40}
                        cy={40}
                        r={radius}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-500 ease-out ${getTierColor(tierName)}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg">{tierName}</div>
                    <div className="text-xs text-gray-200 drop-shadow-md">{ltvPercentage.toFixed(0)}%</div>
                </div>
            </div>
            <div className="text-center mt-2">
                <div className="text-xs text-white font-medium drop-shadow-md">${(maxLoan/1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-200 drop-shadow-md">{interestRate}% APR</div>
            </div>
        </div>
    );
};

export const LoanSimulator = ({ address, isConnected }: UserProfileProps) => {
    const [loanAmount, setLoanAmount] = useState(0);
    const [selectedAsset, setSelectedAsset] = useState("ETH");
    const [tier, setTier] = useState("Bronze");
    const [tokenPrices, setTokenPrices] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [priceError, setPriceError] = useState(false);

    // Token contract addresses
    const tokenAddresses: { [key: string]: string } = {
        ETH: "0x0000000000000000000000000000000000000000",
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
        WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    };

    // Fallback prices (approximate market prices)
    const fallbackPrices: { [key: string]: number } = {
        ETH: 3500,
        USDC: 1.00,
        USDT: 1.00,
        DAI: 1.00,
        WBTC: 95000
    };

    // Interest rates based on tier and asset (annual %)
    const interestRates: { [tier: string]: { [asset: string]: number } } = {
        Bronze: { ETH: 8.5, USDC: 6.5, USDT: 6.5, DAI: 7.0, WBTC: 9.0 },
        Silver: { ETH: 7.0, USDC: 5.5, USDT: 5.5, DAI: 6.0, WBTC: 7.5 },
        Gold: { ETH: 5.5, USDC: 4.5, USDT: 4.5, DAI: 5.0, WBTC: 6.0 },
        Platinum: { ETH: 4.0, USDC: 3.5, USDT: 3.5, DAI: 4.0, WBTC: 4.5 },
        Diamond: { ETH: 3.0, USDC: 2.5, USDT: 2.5, DAI: 3.0, WBTC: 3.5 }
    };

    // LTV ratios based on tier and asset
    const ltvRatios: { [tier: string]: { [asset: string]: number } } = {
        Bronze: { ETH: 0.60, USDC: 0.85, USDT: 0.85, DAI: 0.80, WBTC: 0.55 },
        Silver: { ETH: 0.65, USDC: 0.87, USDT: 0.87, DAI: 0.82, WBTC: 0.60 },
        Gold: { ETH: 0.70, USDC: 0.90, USDT: 0.90, DAI: 0.85, WBTC: 0.65 },
        Platinum: { ETH: 0.75, USDC: 0.92, USDT: 0.92, DAI: 0.87, WBTC: 0.70 },
        Diamond: { ETH: 0.80, USDC: 0.95, USDT: 0.95, DAI: 0.90, WBTC: 0.75 }
    };

    // Max borrowable limits based on tier (USD)
    const maxBorrowableLimits: { [tier: string]: number } = {
        Bronze: 10000, Silver: 25000, Gold: 50000, Platinum: 100000, Diamond: 250000
    };

    const fetchTokenPrice = async (tokenSymbol: string): Promise<number> => {
        try {
            // Try multiple price sources
            const sources = [
                // CoinGecko API (may fail due to CORS)
                `https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(tokenSymbol)}&vs_currencies=usd`,
                // Alternative: use a CORS proxy (for demo purposes)
                `https://cors-anywhere.herokuapp.com/https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(tokenSymbol)}&vs_currencies=usd`
            ];

            for (const url of sources) {
                try {
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const coinId = getCoinGeckoId(tokenSymbol);
                        return data[coinId]?.usd || fallbackPrices[tokenSymbol] || 0;
                    }
                } catch (sourceError) {
                    console.warn(`Failed to fetch from source: ${url}`, sourceError);
                    continue;
                }
            }
            
            // If all sources fail, return fallback price
            return fallbackPrices[tokenSymbol] || 0;
        } catch (error) {
            console.error("Error fetching token price:", error);
            return fallbackPrices[tokenSymbol] || 0;
        }
    };

    const getCoinGeckoId = (tokenSymbol: string): string => {
        const coinGeckoIds: { [key: string]: string } = {
            ETH: "ethereum",
            USDC: "usd-coin",
            USDT: "tether",
            DAI: "dai",
            WBTC: "wrapped-bitcoin"
        };
        return coinGeckoIds[tokenSymbol] || "";
    };

    const initializePrices = () => {
        console.log("Initializing with fallback prices due to API limitations");
        setTokenPrices(fallbackPrices);
        setPriceError(true);
    };

    const fetchAllTokenPrices = async () => {
        setLoading(true);
        setPriceError(false);
        
        try {
            const symbols = Object.keys(tokenAddresses);
            const pricePromises = symbols.map(async symbol => {
                const price = await fetchTokenPrice(symbol);
                return { symbol, price };
            });

            const prices = await Promise.all(pricePromises);
            const priceMap: { [key: string]: number } = {};
            let hasValidPrices = false;
            
            prices.forEach(({ symbol, price }) => {
                priceMap[symbol] = price;
                if (price > 0 && price !== fallbackPrices[symbol]) {
                    hasValidPrices = true;
                }
            });

            if (hasValidPrices) {
                setTokenPrices(priceMap);
                setPriceError(false);
            } else {
                setTokenPrices(fallbackPrices);
                setPriceError(true);
            }
        } catch (error) {
            console.error("Error fetching token prices:", error);
            setTokenPrices(fallbackPrices);
            setPriceError(true);
        } finally {
            setLoading(false);
        }
    };

    const calculateLoan = (amount: number, asset: string, userTier: string): LoanCalculation => {
        if (amount <= 0 || !asset) {
            return {
                collateralRequired: 0, interest: 0, maxBorrowableAmount: 0,
                totalRepayment: 0, liquidationThreshold: 0, interestRate: 0
            };
        }

        const assetPrice = tokenPrices[asset] || fallbackPrices[asset] || 0;
        const ltv = ltvRatios[userTier]?.[asset] || 0.60;
        const interestRate = interestRates[userTier]?.[asset] || 8.0;

        if (assetPrice === 0) {
            return {
                collateralRequired: 0, interest: 0, maxBorrowableAmount: 0,
                totalRepayment: 0, liquidationThreshold: 0, interestRate: 0
            };
        }

        const collateralValueRequired = amount / ltv;
        const collateralAmountRequired = collateralValueRequired / assetPrice;
        const annualInterest = (amount * interestRate) / 100;
        const maxBorrowableByAsset = assetPrice * ltv;
        const maxBorrowableByTier = maxBorrowableLimits[userTier] || 10000;
        const maxBorrowable = Math.min(maxBorrowableByAsset, maxBorrowableByTier);
        const totalRepayment = amount + annualInterest;
        const liquidationThreshold = collateralValueRequired * 0.90;

        return {
            collateralRequired: collateralAmountRequired,
            interest: annualInterest,
            maxBorrowableAmount: maxBorrowable,
            totalRepayment: totalRepayment,
            liquidationThreshold: liquidationThreshold,
            interestRate: interestRate
        };
    };

    useEffect(() => {
        // Initialize with fallback prices immediately
        initializePrices();
        
        // Try to fetch real prices
        fetchAllTokenPrices();
        
        // Set up interval for price updates
        const interval = setInterval(fetchAllTokenPrices, 300000); // 5 minutes instead of 1 minute
        return () => clearInterval(interval);
    }, []);

    const loanCalculation = calculateLoan(loanAmount, selectedAsset, tier);

    return (
        <div className="text-white">
            <div className="max-w-full">
                <h1 className="text-4xl font-bold text-center mb-8 text-blue-400 drop-shadow-lg">Loan Simulator</h1>
                
                {/* Input Section */}
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-500/30">
                    <h2 className="text-2xl font-bold mb-6 drop-shadow-lg">Loan Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Loan Amount (USD)
                            </label>
                            <input
                                type="number"
                                value={loanAmount || ''}
                                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                                placeholder="Enter loan amount"
                                min="0"
                                max={maxBorrowableLimits[tier]}
                                step="100"
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500/30"
                            />
                            <small className="text-gray-300 drop-shadow-md">
                                Max for {tier} tier: ${maxBorrowableLimits[tier].toLocaleString()}
                            </small>
                        </div>

                        <div>
                            <label className="block text-gray-200 text-sm font-medium mb-2 drop-shadow-md">
                                Collateral Asset
                            </label>
                            <select
                                value={selectedAsset}
                                onChange={(e) => setSelectedAsset(e.target.value)}
                                className="w-full bg-black/40 backdrop-blur-sm text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500/30"
                            >
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="WBTC">Wrapped Bitcoin (WBTC)</option>
                                <option value="USDC">USD Coin (USDC)</option>
                                <option value="USDT">Tether (USDT)</option>
                                <option value="DAI">Dai (DAI)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Circular Meters for Loan Details */}
                {loanAmount > 0 && tokenPrices[selectedAsset] && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-500/30">
                        <h3 className="text-2xl font-bold mb-6 text-center drop-shadow-lg">Loan Terms for {tier} Tier</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <CircularMeter
                                value={loanCalculation.collateralRequired}
                                maxValue={loanCalculation.collateralRequired * 2}
                                label="Collateral Required"
                                color="stroke-blue-400"
                                unit={selectedAsset}
                                size={100}
                            />
                            <CircularMeter
                                value={loanCalculation.interestRate}
                                maxValue={10}
                                label="Interest Rate"
                                color="stroke-green-400"
                                unit="% APR"
                                size={100}
                            />
                            <CircularMeter
                                value={ltvRatios[tier]?.[selectedAsset] * 100 || 60}
                                maxValue={100}
                                label="Loan-to-Value"
                                color="stroke-yellow-400"
                                unit="% LTV"
                                size={100}
                            />
                            <CircularMeter
                                value={loanCalculation.totalRepayment}
                                maxValue={loanCalculation.totalRepayment * 1.5}
                                label="Total Repayment"
                                color="stroke-purple-400"
                                unit="USD"
                                size={100}
                            />
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center">
                            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
                                <div className="text-xl font-bold text-blue-400 drop-shadow-lg">
                                    ${loanCalculation.maxBorrowableAmount.toFixed(0)}
                                </div>
                                <div className="text-gray-200 text-sm drop-shadow-md">Max Borrowable (1 {selectedAsset})</div>
                            </div>
                            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
                                <div className="text-xl font-bold text-red-400 drop-shadow-lg">
                                    ${loanCalculation.liquidationThreshold.toFixed(0)}
                                </div>
                                <div className="text-gray-200 text-sm drop-shadow-md">Liquidation Threshold</div>
                            </div>
                            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
                                <div className="text-xl font-bold text-green-400 drop-shadow-lg">
                                    ${tokenPrices[selectedAsset]?.toLocaleString()}
                                </div>
                                <div className="text-gray-200 text-sm drop-shadow-md">Current {selectedAsset} Price</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tier Selection with Circular Meters */}
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-center drop-shadow-lg">Select Tier to Compare</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.keys(maxBorrowableLimits).map(tierName => (
                            <TierMeter
                                key={tierName}
                                tierName={tierName}
                                isSelected={tier === tierName}
                                maxLoan={maxBorrowableLimits[tierName]}
                                interestRate={interestRates[tierName]?.[selectedAsset] || 0}
                                ltv={ltvRatios[tierName]?.[selectedAsset] || 0.60}
                                onClick={() => setTier(tierName)}
                            />
                        ))}
                    </div>
                </div>

                {/* Current Prices */}
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-500/30">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold drop-shadow-lg">Current Market Prices</h4>
                        <div className="flex items-center gap-3">
                            {priceError && (
                                <span className="text-yellow-400 text-sm drop-shadow-md">Using demo prices</span>
                            )}
                            <button 
                                onClick={fetchAllTokenPrices} 
                                disabled={loading}
                                className="bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-gray-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition duration-200 border border-blue-500/30"
                            >
                                {loading ? "Updating..." : "Refresh"}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(tokenPrices).map(([symbol, price]) => (
                            <div key={symbol} className="bg-black/40 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-600/30">
                                <div className="text-lg font-bold text-white drop-shadow-lg">{symbol}</div>
                                <div className="text-blue-400 drop-shadow-md">${price.toLocaleString()}</div>
                                {priceError && (
                                    <div className="text-xs text-yellow-400 mt-1 drop-shadow-md">Demo</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};