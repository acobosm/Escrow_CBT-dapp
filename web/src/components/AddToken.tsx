"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { ESCROW_ADDRESS, ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";

export default function AddToken() {
    const { signer, account } = useEthereum();
    const [tokenAddress, setTokenAddress] = useState("");
    const [allowedTokens, setAllowedTokens] = useState<{ address: string; symbol: string }[]>([]);
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

            const tokenDetails = await Promise.all(
                tokens.map(async (addr: string) => {
                    try {
                        const token = new ethers.Contract(addr, ERC20_ABI, signer);
                        const symbol = await token.symbol();
                        return { address: addr, symbol };
                    } catch (e) {
                        return { address: addr, symbol: "???" };
                    }
                })
            );
            setAllowedTokens(tokenDetails);
        } catch (err) {
            console.error("Error fetching tokens:", err);
        }
    };

    const handleAddToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !tokenAddress) return;

        setLoading(true);
        setError(null);
        try {
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
            const tx = await escrow.addToken(tokenAddress);
            await tx.wait();
            setTokenAddress("");
            fetchAllowedTokens();
        } catch (err: any) {
            setError(err.reason || err.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Token (Admin Only)</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-1">Escrow Contract:</label>
                <div className="bg-blue-50 p-2 rounded text-xs font-mono text-blue-700 break-all">
                    {ESCROW_ADDRESS || "Not deployed"}
                </div>
            </div>

            <form onSubmit={handleAddToken} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token Address</label>
                    <input
                        type="text"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !ESCROW_ADDRESS}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md active:scale-95"
                >
                    {loading ? "Adding..." : "Add Token"}
                </button>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </form>

            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Added Tokens ({allowedTokens.length})</h3>
                <div className="space-y-3">
                    {allowedTokens.map((token) => (
                        <div key={token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <p className="font-bold text-gray-800">{token.symbol}</p>
                                <p className="text-[10px] font-mono text-gray-400">{token.address}</p>
                            </div>
                        </div>
                    ))}
                    {allowedTokens.length === 0 && <p className="text-sm text-gray-400 italic text-center">No tokens allowed yet</p>}
                </div>
            </div>
        </div>
    );
}
