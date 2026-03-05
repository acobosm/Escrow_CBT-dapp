"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { getEscrowContract, getTokenContract, getTokenDisplayName, handleError } from "@/lib/contracts-utils";
import { ESCROW_ADDRESS } from "@/lib/contracts";

export default function CreateSwap() {
    const { account, signer, provider } = useEthereum();
    const [tokens, setTokens] = useState<string[]>([]);
    const [tokenMetadata, setTokenMetadata] = useState<Record<string, string>>({});
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    // ...
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"approve" | "create" | "idle">("idle");
    const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

    const fetchTokens = useCallback(async () => {
        if (!signer || !provider) return;
        try {
            const contract = getEscrowContract(signer);
            const allowedTokens = await contract.getAllowedTokens();
            setTokens(allowedTokens);

            // Fetch metadata for each token using hierarchy
            const metadata: Record<string, string> = {};
            for (const addr of allowedTokens) {
                metadata[addr] = await getTokenDisplayName(addr, provider);
            }
            setTokenMetadata(metadata);

            if (allowedTokens.length > 0) {
                setTokenA(allowedTokens[0]);
                if (allowedTokens.length > 1) setTokenB(allowedTokens[1]);
            }
        } catch (err) {
            console.error("Error fetching tokens:", err);
        }
    }, [signer, provider]);

    useEffect(() => {
        fetchTokens();

        // Escuchar cambios en los alias locales
        window.addEventListener("tokenMetadataChanged", fetchTokens);
        return () => window.removeEventListener("tokenMetadataChanged", fetchTokens);
    }, [fetchTokens]);

    const handleCreateSwap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !tokenA || !tokenB || !amountA || !amountB) return;

        setIsLoading(true);
        setMessage(null);
        try {
            const escrow = getEscrowContract(signer);
            const tA = getTokenContract(tokenA, signer);

            const parsedAmountA = ethers.parseEther(amountA);
            const parsedAmountB = ethers.parseEther(amountB);

            // Pre-check balance to be extra helpful
            const balance = await tA.balanceOf(account);
            if (balance < parsedAmountA) {
                throw new Error("Execution reverted: Insufficient balance");
            }

            // Check allowance
            const allowance = await tA.allowance(account, ESCROW_ADDRESS);

            if (allowance < parsedAmountA) {
                setStep("approve");
                setMessage({ type: "info", text: "Please approve Token A spend..." });
                const approveTx = await tA.approve(ESCROW_ADDRESS, parsedAmountA);
                await approveTx.wait();
            }

            setStep("create");
            setMessage({ type: "info", text: "Creating swap operation..." });
            const createTx = await escrow.createOperation(tokenA, tokenB, parsedAmountA, parsedAmountB);
            await createTx.wait();

            setMessage({ type: "success", text: "Swap created successfully!" });
            setAmountA("");
            setAmountB("");
            setStep("idle");
        } catch (err: any) {
            setMessage({ type: "error", text: handleError(err) });
            setStep("idle");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gradient">Create Swap</h2>
            <p className="text-sm text-[var(--secondary)]">Deposit tokens to start a secure exchange.</p>

            <form onSubmit={handleCreateSwap} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[var(--secondary)]">You Send</label>
                        <select
                            value={tokenA}
                            onChange={(e) => setTokenA(e.target.value)}
                            className="bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm"
                        >
                            {tokens.map((t) => (
                                <option key={t} value={t} className="text-black">
                                    {tokenMetadata[t] || t.slice(0, 8) + "..."}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount A"
                            value={amountA}
                            onChange={(e) => setAmountA(e.target.value)}
                            className="bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm mt-1"
                            required
                            step="any"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[var(--secondary)]">You Receive</label>
                        <select
                            value={tokenB}
                            onChange={(e) => setTokenB(e.target.value)}
                            className="bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm"
                        >
                            {tokens.map((t) => (
                                <option key={t} value={t} className="text-black">
                                    {tokenMetadata[t] || t.slice(0, 8) + "..."}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount B"
                            value={amountB}
                            onChange={(e) => setAmountB(e.target.value)}
                            className="bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm mt-1"
                            required
                            step="any"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (step === "approve" ? "Approving..." : "Creating...") : "Start Swap"}
                </button>
            </form>

            {message && (
                <div className={`text-xs p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    message.type === "info" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
