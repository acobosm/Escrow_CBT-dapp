"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { ESCROW_ADDRESS, ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";

const TEST_ACCOUNTS = [
    { name: "Escrow Contract", address: ESCROW_ADDRESS, color: "blue" },
    { name: "Account #0", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", color: "indigo" },
    { name: "Account #1", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", color: "indigo" },
    { name: "Account #2", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", color: "indigo" },
];

export default function BalanceDebug() {
    const { provider, signer } = useEthereum();
    const [balances, setBalances] = useState<Record<string, any>>({});
    const [tokens, setTokens] = useState<{ address: string; symbol: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (signer) {
            fetchTokens();
        }
    }, [signer]);

    useEffect(() => {
        if (tokens.length >= 0 && provider) {
            refreshBalances();
        }
    }, [tokens, provider]);

    const fetchTokens = async () => {
        if (!signer) return;
        try {
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
            const tokenAddrs = await escrow.getAllowedTokens();
            const details = await Promise.all(
                tokenAddrs.map(async (addr: string) => {
                    const t = new ethers.Contract(addr, ERC20_ABI, signer);
                    const symbol = await t.symbol();
                    return { address: addr, symbol };
                })
            );
            setTokens(details);
        } catch (e) {
            console.error(e);
        }
    };

    const refreshBalances = async () => {
        if (!provider) return;
        setLoading(true);
        const newBalances: Record<string, any> = {};

        for (const acc of TEST_ACCOUNTS) {
            if (!acc.address) continue;

            const ethBal = await provider.getBalance(acc.address);
            const tokenBals: Record<string, string> = {};

            for (const token of tokens) {
                try {
                    const tContract = new ethers.Contract(token.address, ERC20_ABI, provider);
                    const bal = await tContract.balanceOf(acc.address);
                    tokenBals[token.symbol] = ethers.formatEther(bal);
                } catch (e) {
                    tokenBals[token.symbol] = "0.00";
                }
            }

            newBalances[acc.address] = {
                eth: ethers.formatEther(ethBal),
                tokens: tokenBals
            };
        }

        setBalances(newBalances);
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Debug Balances</h2>
                <button
                    onClick={refreshBalances}
                    disabled={loading}
                    className="bg-gray-800 hover:bg-black text-white text-xs px-3 py-1 rounded transition-all"
                >
                    {loading ? "..." : "Refresh"}
                </button>
            </div>

            <div className="space-y-4">
                {TEST_ACCOUNTS.map((acc) => (
                    <div key={acc.address} className={`p-4 rounded-lg border-l-4 ${acc.name.includes("Contract") ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-300"
                        }`}>
                        <p className="text-xs font-bold text-gray-800 mb-1">{acc.name}</p>
                        <p className="text-[10px] font-mono text-gray-400 mb-3 truncate">{acc.address}</p>

                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">ETH</span>
                            <span className="text-sm font-mono font-bold text-gray-700">
                                {parseFloat(balances[acc.address]?.eth || "0").toFixed(4)}
                            </span>
                        </div>

                        {Object.entries(balances[acc.address]?.tokens || {}).map(([symbol, bal]: [string, any]) => (
                            <div key={symbol} className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{symbol}</span>
                                <span className="text-sm font-mono font-bold text-gray-600">{bal}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
