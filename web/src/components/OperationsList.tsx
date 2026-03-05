"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { getEscrowContract, getTokenContract, getTokenDisplayName, handleError } from "@/lib/contracts-utils";
import { ESCROW_ADDRESS } from "@/lib/contracts";

interface Operation {
    id: bigint;
    creator: string;
    tokenA: string;
    tokenB: string;
    amountA: bigint;
    amountB: bigint;
    active: boolean;
    completed: boolean;
    cancelled: boolean;
}

export default function OperationsList() {
    const { account, signer, provider } = useEthereum();
    const [operations, setOperations] = useState<Operation[]>([]);
    const [tokenMetadata, setTokenMetadata] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<bigint | null>(null);

    const fetchOperations = useCallback(async () => {
        if (!signer || !provider) return;
        try {
            const contract = getEscrowContract(signer);
            const allOps = await contract.getAllOperations();
            setOperations([...allOps].reverse());

            // Collect unique tokens to fetch metadata
            const uniqueTokens = Array.from(new Set(allOps.flatMap((op: any) => [op.tokenA, op.tokenB]))) as string[];

            const newMetadata: Record<string, string> = { ...tokenMetadata };
            let hasNew = false;

            await Promise.all(uniqueTokens.map(async (addr: string) => {
                const displayName = await getTokenDisplayName(addr, provider);
                if (newMetadata[addr] !== displayName) {
                    newMetadata[addr] = displayName;
                    hasNew = true;
                }
            }));

            if (hasNew) setTokenMetadata(newMetadata);
        } catch (err) {
            console.error("Error fetching operations:", err);
        }
    }, [signer, provider, tokenMetadata]);

    useEffect(() => {
        fetchOperations();
        const interval = setInterval(fetchOperations, 10000); // Poll every 10s

        // Escuchar cambios en los alias locales
        window.addEventListener("tokenMetadataChanged", fetchOperations);

        return () => {
            clearInterval(interval);
            window.removeEventListener("tokenMetadataChanged", fetchOperations);
        };
    }, [fetchOperations]);

    const handleComplete = async (op: Operation) => {
        if (!signer || !provider) return;
        setActionLoading(op.id);
        try {
            const escrow = getEscrowContract(signer);
            const tB = getTokenContract(op.tokenB, signer);
            const tokenName = tokenMetadata[op.tokenB] || "the required token";

            // 0. Check Balance
            const balance = await tB.balanceOf(account);
            if (balance < op.amountB) {
                const required = ethers.formatEther(op.amountB);
                const actual = ethers.formatEther(balance);
                alert(`Insufficient Balance: You need ${required} ${tokenName}, but you only have ${actual}.`);
                return;
            }

            // 1. Approve Token B spend
            const allowance = await tB.allowance(account, ESCROW_ADDRESS);
            if (allowance < op.amountB) {
                const approveTx = await tB.approve(ESCROW_ADDRESS, op.amountB);
                await approveTx.wait();
            }

            // 2. Complete Operation
            const completeTx = await escrow.completeOperation(op.id);
            await completeTx.wait();
            fetchOperations();
        } catch (err: any) {
            alert(handleError(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (opId: bigint) => {
        if (!signer) return;
        setActionLoading(opId);
        try {
            const escrow = getEscrowContract(signer);
            const tx = await escrow.cancelOperation(opId);
            await tx.wait();
            fetchOperations();
        } catch (err) {
            alert(handleError(err));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gradient">Active Swaps</h2>
                <button onClick={fetchOperations} className="text-xs btn-outline px-2 py-1">Refresh</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--card-border)] text-[var(--secondary)]">
                            <th className="py-3 px-2">ID</th>
                            <th className="py-3 px-2">Maker</th>
                            <th className="py-3 px-2">Giving</th>
                            <th className="py-3 px-2">Wanting</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-[var(--secondary)]">No operations found.</td>
                            </tr>
                        ) : (
                            operations.map((op) => (
                                <tr key={op.id.toString()} className="border-b border-[var(--card-border)] hover:bg-[var(--primary)] hover:bg-opacity-5 transition-colors">
                                    <td className="py-4 px-2 font-mono">#{op.id.toString()}</td>
                                    <td className="py-4 px-2 font-mono text-xs">{op.creator.slice(0, 6)}...{op.creator.slice(-4)}</td>
                                    <td className="py-4 px-2">
                                        <span className="font-bold">{ethers.formatEther(op.amountA)}</span>
                                        <span className="text-xs ml-1 text-[var(--secondary)] font-mono">
                                            {tokenMetadata[op.tokenA] || op.tokenA.slice(0, 6)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <span className="font-bold">{ethers.formatEther(op.amountB)}</span>
                                        <span className="text-xs ml-1 text-[var(--secondary)] font-mono">
                                            {tokenMetadata[op.tokenB] || op.tokenB.slice(0, 6)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2">
                                        {op.completed ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span>
                                        ) : op.cancelled ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Cancelled</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs animate-pulse">Active</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-2">
                                        {op.active && (
                                            <div className="flex gap-2">
                                                {op.creator.toLowerCase() === account?.toLowerCase() ? (
                                                    <button
                                                        onClick={() => handleCancel(op.id)}
                                                        disabled={actionLoading === op.id}
                                                        className="text-xs btn-outline border-red-500 text-red-500 hover:bg-red-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleComplete(op)}
                                                        disabled={actionLoading === op.id}
                                                        className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Accept Swap
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
