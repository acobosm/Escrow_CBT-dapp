"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface EthereumContextType {
    account: string | null;
    chainId: number | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnecting: boolean;
    error: string | null;
}

const EthereumContext = createContext<EthereumContextType | undefined>(undefined);

export function EthereumProvider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateState = useCallback(async (browserProvider: ethers.BrowserProvider) => {
        try {
            const network = await browserProvider.getNetwork();
            const accounts = await browserProvider.listAccounts();
            const currentSigner = await browserProvider.getSigner();

            setChainId(Number(network.chainId));
            if (accounts.length > 0) {
                setAccount(accounts[0].address);
                setSigner(currentSigner);
            } else {
                setAccount(null);
                setSigner(null);
            }
        } catch (err) {
            console.error("Error updating Ethereum state:", err);
        }
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed");
            return;
        }

        setIsConnecting(true);
        setError(null);
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            setProvider(browserProvider);
            await updateState(browserProvider);
        } catch (err: any) {
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
        setChainId(null);
    };

    useEffect(() => {
        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            // Check if already connected
            browserProvider.listAccounts().then((accounts) => {
                if (accounts.length > 0) {
                    updateState(browserProvider);
                }
            });

            const handleAccountsChanged = () => updateState(browserProvider);
            const handleChainChanged = () => window.location.reload();

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);

            return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            };
        }
    }, [updateState]);

    return (
        <EthereumContext.Provider
            value={{
                account,
                chainId,
                provider,
                signer,
                connectWallet,
                disconnectWallet,
                isConnecting,
                error,
            }}
        >
            {children}
        </EthereumContext.Provider>
    );
}

export function useEthereum() {
    const context = useContext(EthereumContext);
    if (context === undefined) {
        throw new Error("useEthereum must be used within an EthereumProvider");
    }
    return context;
}

declare global {
    interface Window {
        ethereum: any;
    }
}
