"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { ESCROW_ADDRESS, ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";

export default function CreateOperation() {
    const { signer, account } = useEthereum();
    const [allowedTokens, setAllowedTokens] = useState<{ address: string; symbol: string }[]>([]);
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (signer) {
            fetchAllowedTokens();
        }
    }, [signer]);

    const fetchAllowedTokens = async () => {
        if (!signer) return;
        try {
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
            const tokens = await escrow.getAllowedTokens();
            const details = await Promise.all(
                tokens.map(async (addr: string) => {
                    const token = new ethers.Contract(addr, ERC20_ABI, signer);
                    const symbol = await token.symbol();
                    return { address: addr, symbol };
                })
            );
            setAllowedTokens(details);
        } catch (err) {
            console.error("Error fetching tokens:", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !tokenA || !tokenB || !amountA || !amountB) return;

        setLoading(true);
        setError(null);
        try {
            const parsedAmountA = ethers.parseEther(amountA);
            const parsedAmountB = ethers.parseEther(amountB);

            // 1. Approve Token A
            const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
            const approveTx = await tokenAContract.approve(ESCROW_ADDRESS, parsedAmountA);
            await approveTx.wait();

            // 2. Create Operation
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
            const tx = await escrow.createOperation(tokenA, tokenB, parsedAmountA, parsedAmountB);
            await tx.wait();

            setAmountA("");
            setAmountB("");
            window.location.reload(); // Simple way to refresh lists
        } catch (err: any) {
            setError(err.reason || err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create Operation</h2>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token A Address (You provide)</label>
                    <select
                        value={tokenA}
                        onChange={(e) => setTokenA(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select token...</option>
                        {allowedTokens.map((t) => (
                            <option key={t.address} value={t.address}>{t.symbol} ({t.address.slice(0, 6)}...)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount A</label>
                    <input
                        type="number"
                        step="0.000001"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                        placeholder="0.0"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <hr className="border-gray-100" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token B Address (You want)</label>
                    <select
                        value={tokenB}
                        onChange={(e) => setTokenB(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select token...</option>
                        {allowedTokens.map((t) => (
                            <option key={t.address} value={t.address}>{t.symbol} ({t.address.slice(0, 6)}...)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount B</label>
                    <input
                        type="number"
                        step="0.000001"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                        placeholder="0.0"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !ESCROW_ADDRESS}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md active:scale-95"
                >
                    {loading ? "Processing..." : "Create Swap Operation"}
                </button>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </form>
        </div>
    );
}
