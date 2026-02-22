"use client";

import { useState, useEffect, useCallback } from "react";
import { useEthereum } from "@/lib/ethereum";
import { getEscrowContract, getTokenDisplayName } from "@/lib/contracts-utils";

export default function AdminPanel() {
    const { account, signer, provider } = useEthereum();
    const [isOwner, setIsOwner] = useState(false);
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenTicker, setTokenTicker] = useState("");
    const [allowedTokens, setAllowedTokens] = useState<string[]>([]);
    const [tokenMetadata, setTokenMetadata] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Función para guardar alias en el localStorage
    const saveLocalAlias = (address: string, alias: string) => {
        if (typeof window === "undefined" || !alias) return;
        const aliases = JSON.parse(localStorage.getItem("token_aliases") || "{}");
        aliases[address.toLowerCase()] = alias.toUpperCase();
        localStorage.setItem("token_aliases", JSON.stringify(aliases));

        // Notificar cambio de metadata
        window.dispatchEvent(new CustomEvent("tokenMetadataChanged"));
    };

    const fetchAllowedTokens = useCallback(async () => {
        if (!signer || !provider) return;
        try {
            const contract = getEscrowContract(signer);
            const tokens = await contract.getAllowedTokens();
            setAllowedTokens(tokens);

            const newMetadata: Record<string, string> = { ...tokenMetadata };
            let hasNew = false;
            await Promise.all(tokens.map(async (addr: string) => {
                const displayName = await getTokenDisplayName(addr, provider);
                if (newMetadata[addr] !== displayName) {
                    newMetadata[addr] = displayName;
                    hasNew = true;
                }
            }));
            if (hasNew) setTokenMetadata(newMetadata);

            const owner = await contract.owner();
            setIsOwner(owner.toLowerCase() === account?.toLowerCase());
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    }, [account, signer, provider, tokenMetadata]);

    useEffect(() => {
        fetchAllowedTokens();
    }, [fetchAllowedTokens]);

    const handleAddToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !tokenAddress) return;

        setIsLoading(true);
        setMessage(null);
        try {
            if (tokenTicker) {
                saveLocalAlias(tokenAddress, tokenTicker);
            }

            const contract = getEscrowContract(signer);
            const tx = await contract.addToken(tokenAddress);
            setMessage({ type: "success", text: "Transaction sent. Waiting for confirmation..." });
            await tx.wait();

            setMessage({ type: "success", text: "Token added successfully and identity saved!" });
            setTokenAddress("");
            setTokenTicker("");

            // Notificar a otros componentes que la lista de tokens cambió tras el éxito
            window.dispatchEvent(new CustomEvent("tokenMetadataChanged"));
        } catch (err: any) {
            if (err.message?.includes("already allowed") || err.reason?.includes("already allowed")) {
                setMessage({
                    type: "success",
                    text: "Token was already registered. Local identity updated successfully!"
                });
                setTokenAddress("");
                setTokenTicker("");
                // Incluso si ya existía, notificamos por si cambió el alias
                window.dispatchEvent(new CustomEvent("tokenMetadataChanged"));
            } else {
                setMessage({ type: "error", text: err.reason || err.message || "Failed to add token" });
            }
        } finally {
            fetchAllowedTokens();
            setIsLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
            <p className="text-sm text-[var(--secondary)]">Add a new ERC20 token and assign an optional ticker alias.</p>

            <form onSubmit={handleAddToken} className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Token Address (0x...)"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        className="flex-[2] bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Ticker Alias (ej: TKC)"
                        value={tokenTicker}
                        onChange={(e) => setTokenTicker(e.target.value)}
                        className="flex-[1] bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                >
                    {isLoading ? "Processing..." : "Add Token"}
                </button>
            </form>

            {allowedTokens.length > 0 && (
                <div className="mt-2">
                    <h3 className="text-xs font-bold uppercase text-[var(--secondary)] mb-2">Authorized Tokens</h3>
                    <div className="flex flex-wrap gap-2">
                        {allowedTokens.map(addr => (
                            <div key={addr} className="text-[10px] bg-[var(--primary)] px-3 py-2 rounded-lg border border-[var(--primary)] flex flex-col items-center min-w-[80px] text-white transition-transform hover:scale-105 shadow-sm">
                                <span className="font-bold text-sm mb-0.5">
                                    {tokenMetadata[addr] || "..."}
                                </span>
                                <span className="opacity-80 font-mono text-[9px]">{addr.slice(0, 6)}...{addr.slice(-4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {message && (
                <div className={`text-xs p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
