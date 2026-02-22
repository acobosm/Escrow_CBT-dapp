"use client";

import { useEthereum } from "@/lib/ethereum";

export default function ConnectButton() {
    const { account, connectWallet, disconnectWallet, isConnecting, error } = useEthereum();

    if (account) {
        return (
            <div className="flex items-center gap-4">
                <div className="px-4 py-2 glass-card bg-opacity-50 text-sm font-mono text-[var(--secondary)]">
                    {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button onClick={disconnectWallet} className="btn-outline border-red-500 text-red-500 hover:bg-red-500">
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary"
            >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
}
