"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useEthereum } from "@/lib/ethereum";
import { getEscrowContract, getTokenDisplayName, handleError } from "@/lib/contracts-utils";
import { TOKEN_A_ADDRESS, TOKEN_B_ADDRESS } from "@/lib/contracts";

const ANVIL_ACCOUNTS = [
    { id: 2, label: "Account #2", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
    { id: 3, label: "Account #3", address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
    { id: 4, label: "Account #4", address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" },
    { id: 5, label: "Account #5", address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" },
    { id: 6, label: "Account #6", address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" },
    { id: 7, label: "Account #7", address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" },
    { id: 8, label: "Account #8", address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" },
    { id: 9, label: "Account #9", address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" },
];

export default function AdminPanel() {
    const { account, signer, provider } = useEthereum();
    const [isOwner, setIsOwner] = useState(false);
    const [mode, setMode] = useState<"import" | "deploy">("import");

    // Form states
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenTicker, setTokenTicker] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [selectedAccounts, setSelectedAccounts] = useState<Record<string, boolean>>({});
    const [mintAmount, setMintAmount] = useState("1000");

    const [allowedTokens, setAllowedTokens] = useState<string[]>([]);
    const [tokenMetadata, setTokenMetadata] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

    const saveLocalAlias = (address: string, alias: string) => {
        if (typeof window === "undefined" || !alias) return;
        const aliases = JSON.parse(localStorage.getItem("token_aliases") || "{}");
        aliases[address.toLowerCase()] = alias.toUpperCase();
        localStorage.setItem("token_aliases", JSON.stringify(aliases));
        window.dispatchEvent(new CustomEvent("tokenMetadataChanged"));
    };

    const fetchAllowedTokens = useCallback(async () => {
        if (!signer || !provider) return;
        try {
            const contract = getEscrowContract(signer);
            const tokens = await contract.getAllowedTokens();
            setAllowedTokens(tokens);

            const newMetadata: Record<string, string> = {};
            await Promise.all(tokens.map(async (addr: string) => {
                newMetadata[addr] = await getTokenDisplayName(addr, provider);
            }));
            setTokenMetadata(newMetadata);

            const owner = await contract.owner();
            setIsOwner(owner.toLowerCase() === account?.toLowerCase());
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    }, [account, signer, provider]);

    useEffect(() => {
        fetchAllowedTokens();
    }, [fetchAllowedTokens]);

    const handleImportToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !tokenAddress) return;

        setIsLoading(true);
        setMessage({ type: "info", text: "Adding existing token to whitelist..." });
        try {
            if (tokenTicker) saveLocalAlias(tokenAddress, tokenTicker);

            const contract = getEscrowContract(signer);
            const tx = await contract.addToken(tokenAddress);
            await tx.wait();

            setMessage({ type: "success", text: "Token imported successfully!" });
            setTokenAddress("");
            setTokenTicker("");
        } catch (err: any) {
            setMessage({ type: "error", text: handleError(err) });
        } finally {
            fetchAllowedTokens();
            setIsLoading(false);
        }
    };

    const handleDeployToken = async (e: React.FormEvent) => {
        e.preventDefault();
        const mintToAddresses = ANVIL_ACCOUNTS
            .filter(acc => selectedAccounts[acc.address])
            .map(acc => acc.address);

        if (mintToAddresses.length === 0) {
            setMessage({ type: "error", text: "Please select at least one account for initial minting." });
            return;
        }

        if (!mintAmount || parseFloat(mintAmount) <= 0) {
            setMessage({ type: "error", text: "Please specify a valid mint amount." });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "info", text: "Deploying new token and minting..." });
        try {
            const contract = getEscrowContract(signer);

            const mintAmounts = mintToAddresses.map(() => ethers.parseEther(mintAmount));

            const tx = await contract.deployAndAddToken(
                tokenName,
                tokenTicker,
                mintToAddresses,
                mintAmounts
            );

            setMessage({ type: "info", text: "Contract deployment sent. Waiting for confirmation..." });
            const receipt = await tx.wait();

            // Find the TokenAdded event or use the transaction result if available
            // In Version 2, deployAndAddToken returns the address. 
            // We can also find it in logs or just refresh the list.

            setMessage({ type: "success", text: `Token "${tokenName}" deployed and registered!` });

            // Clear form
            setTokenName("");
            setTokenTicker("");
            setSelectedAccounts({});
        } catch (err: any) {
            setMessage({ type: "error", text: handleError(err) });
        } finally {
            fetchAllowedTokens();
            setIsLoading(false);
        }
    };

    const handleRemoveToken = async (addr: string) => {
        if (!signer) return;
        setIsLoading(true);
        setMessage({ type: "info", text: "Removing token..." });
        try {
            const contract = getEscrowContract(signer);
            const tx = await contract.removeToken(addr);
            await tx.wait();
            setMessage({ type: "success", text: "Token removed from authorized list." });
        } catch (err: any) {
            setMessage({ type: "error", text: handleError(err) });
        } finally {
            fetchAllowedTokens();
            setIsLoading(false);
        }
    };

    const toggleAccount = (addr: string) => {
        setSelectedAccounts(prev => ({ ...prev, [addr]: !prev[addr] }));
    };

    if (!isOwner) return null;

    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-4">
                <h2 className="text-xl font-bold text-gradient">Admin Panel V2</h2>
                <div className="flex bg-[var(--card)] rounded-lg p-1 border border-[var(--card-border)]">
                    <button
                        onClick={() => setMode("import")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === "import" ? "bg-[var(--primary)] text-white" : "opacity-60 hover:opacity-100"}`}
                    >
                        Import Existing
                    </button>
                    <button
                        onClick={() => setMode("deploy")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === "deploy" ? "bg-[var(--primary)] text-white" : "opacity-60 hover:opacity-100"}`}
                    >
                        Deploy New
                    </button>
                </div>
            </div>

            {mode === "import" ? (
                <form onSubmit={handleImportToken} className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Token Address (0x...)"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="flex-[2] bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Ticker Alias (Optional)"
                            value={tokenTicker}
                            onChange={(e) => setTokenTicker(e.target.value)}
                            className="flex-[1] bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? "Processing..." : "Authorize Existing Token"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleDeployToken} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Token Name (ej: Golden Coin)"
                            value={tokenName}
                            onChange={(e) => setTokenName(e.target.value)}
                            className="flex-1 bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Ticker (ej: GLD)"
                            value={tokenTicker}
                            onChange={(e) => setTokenTicker(e.target.value)}
                            className="w-full md:w-32 bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        />
                    </div>

                    <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--card-border)]">
                        <label className="text-xs font-bold text-[var(--secondary)] uppercase mb-3 block">Selective Minting (Initial Supply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            {ANVIL_ACCOUNTS.map(acc => (
                                <button
                                    key={acc.address}
                                    type="button"
                                    onClick={() => toggleAccount(acc.address)}
                                    className={`text-[10px] p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${selectedAccounts[acc.address] ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "bg-transparent border-[var(--card-border)] opacity-60"}`}
                                >
                                    <span className="font-bold">{acc.label}</span>
                                    <span className="opacity-70 font-mono">{acc.address.slice(0, 4)}...{acc.address.slice(-4)}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--secondary)]">Amount to Mint:</span>
                            <input
                                type="number"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(e.target.value)}
                                className="bg-transparent border-b border-[var(--card-border)] p-1 text-sm w-32 focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? "Deploying & Minting..." : "Deploy & Add Token"}
                    </button>
                </form>
            )}

            {allowedTokens.length > 0 && (
                <div className="pt-4 border-t border-[var(--glass-border)]">
                    <h3 className="text-xs font-bold uppercase text-[var(--secondary)] mb-3">Authorized Tokens</h3>
                    <div className="flex flex-wrap gap-3">
                        {allowedTokens.map(addr => (
                            <div key={addr} className="relative group">
                                <div className="text-[10px] bg-[var(--primary)] px-4 py-3 rounded-xl border border-[var(--primary)] flex flex-col items-center min-w-[100px] text-white transition-all group-hover:bg-opacity-90 shadow-lg shadow-[var(--primary)]/10">
                                    <span className="font-bold text-sm mb-0.5">{tokenMetadata[addr] || "..."}</span>
                                    <span className="opacity-70 font-mono text-[9px]">{addr.slice(0, 6)}...{addr.slice(-4)}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveToken(addr)}
                                    disabled={addr.toLowerCase() === TOKEN_A_ADDRESS.toLowerCase() || addr.toLowerCase() === TOKEN_B_ADDRESS.toLowerCase()}
                                    className={`absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-[var(--background)] transition-all
                                        ${(addr.toLowerCase() === TOKEN_A_ADDRESS.toLowerCase() || addr.toLowerCase() === TOKEN_B_ADDRESS.toLowerCase())
                                            ? "opacity-0 pointer-events-none"
                                            : "opacity-0 group-hover:opacity-100 hover:bg-orange-600"}`}
                                    title="Remove Token"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {message && (
                <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                    message.type === "info" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                    <span className="text-lg leading-none">{message.type === "success" ? "✅" : message.type === "info" ? "ℹ️" : "❌"}</span>
                    {message.text}
                </div>
            )}
        </div>
    );
}
