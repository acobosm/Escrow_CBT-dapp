"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { getEscrowContract, getTokenContract, getTokenDisplayName } from "@/lib/contracts-utils";

export default function DebugPanel() {
    const { account, provider, signer } = useEthereum();
    const [ethBalance, setEthBalance] = useState("0");
    const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
    const [tokenNames, setTokenNames] = useState<Record<string, string>>({});
    const [allowedTokens, setAllowedTokens] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const fetchBalances = useCallback(async () => {
        if (!account || !provider || !signer) return;
        try {
            // 1. ETH Balance
            const ethBal = await provider.getBalance(account);
            setEthBalance(ethers.formatEther(ethBal));

            // 2. Fetch Allowed Tokens list from Escrow
            const escrow = getEscrowContract(signer);
            const tokens = await escrow.getAllowedTokens();
            setAllowedTokens(tokens);

            // 3. Fetch names first (more stable)
            const newNames: Record<string, string> = { ...tokenNames };
            await Promise.all(tokens.map(async (addr: string) => {
                try {
                    const name = await getTokenDisplayName(addr, provider);
                    newNames[addr] = name;
                } catch (e) {
                    newNames[addr] = addr.slice(0, 6) + "..." + addr.slice(-4);
                }
            }));
            setTokenNames(newNames);

            // 4. Fetch balances
            const newBalances: Record<string, string> = {};
            await Promise.all(tokens.map(async (addr: string) => {
                try {
                    const token = getTokenContract(addr, provider);
                    const bal = await token.balanceOf(account);
                    newBalances[addr] = ethers.formatEther(bal);
                } catch (e) {
                    console.warn(`Error fetching balance for ${addr}:`, e);
                    newBalances[addr] = "0";
                }
            }));
            setTokenBalances(newBalances);
        } catch (err) {
            console.error("Error fetching debug balances:", err);
        }
    }, [account, provider, signer, tokenNames]);

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 10000);

        window.addEventListener("tokenMetadataChanged", fetchBalances);

        return () => {
            clearInterval(interval);
            window.removeEventListener("tokenMetadataChanged", fetchBalances);
        };
    }, [fetchBalances]);

    if (!account) return null;

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed bottom-4 right-4 bg-[var(--primary)] text-white p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform font-bold text-xs flex items-center gap-2"
                title="Open Balances"
            >
                <span className="mb-0.5">💰</span>
                Balances
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 glass-card p-4 text-xs font-mono flex flex-col gap-2 z-50 shadow-2xl transition-all">
            <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-2 mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--primary)] text-sm">📊</span>
                    <span className="font-bold uppercase opacity-60">My Balances (Debug)</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchBalances} className="hover:text-[var(--primary)] transition-colors" title="Refresh">↻</button>
                    <button onClick={() => setIsCollapsed(true)} className="hover:text-[var(--primary)] transition-colors font-bold text-lg leading-none" title="Minimize">×</button>
                </div>
            </div>

            <div className="max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center py-2">
                    <span className="opacity-70">ETH (Anvil):</span>
                    <span className="font-bold text-[var(--foreground)]">{parseFloat(ethBalance).toFixed(4)}</span>
                </div>

                {allowedTokens.map((addr) => (
                    <div key={addr} className="flex justify-between items-center py-2 border-t border-[var(--glass-border)]/30">
                        <div className="flex flex-col">
                            <span className="font-bold text-[var(--primary)] text-[10px]">{tokenNames[addr] || "..."}</span>
                            <span className="text-[8px] opacity-40 font-mono truncate w-24" title={addr}>{addr.slice(0, 10)}...</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-[var(--foreground)] text-[11px]">
                                {parseFloat(tokenBalances[addr] || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                ))}

                {allowedTokens.length === 0 && (
                    <div className="text-center py-4 opacity-40 italic">
                        No authorized tokens found.
                    </div>
                )}
            </div>
        </div>
    );
}
