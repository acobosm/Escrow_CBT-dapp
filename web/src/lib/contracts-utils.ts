import { ethers } from "ethers";
import { ESCROW_ADDRESS, ESCROW_ABI, ERC20_ABI } from "./contracts";

export function getEscrowContract(signerOrProvider: any) {
    return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signerOrProvider);
}

export function getTokenContract(address: string, signerOrProvider: any) {
    return new ethers.Contract(address, ERC20_ABI, signerOrProvider);
}

export async function getTokenSymbol(address: string, provider: any) {
    try {
        const contract = getTokenContract(address, provider);
        return await contract.symbol();
    } catch (err) {
        console.warn(`Could not fetch symbol for ${address}`, err);
        return null; // Return null instead of fallback to allow hierarchy check
    }
}

export function getLocalAlias(address: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        const aliases = JSON.parse(localStorage.getItem("token_aliases") || "{}");
        return aliases[address.toLowerCase()] || null;
    } catch {
        return null;
    }
}

// ... (existing code)

export async function getTokenDisplayName(address: string, provider: any): Promise<string> {
    const alias = getLocalAlias(address);
    if (alias) return alias;

    const symbol = await getTokenSymbol(address, provider);
    if (symbol) return symbol;

    return address.slice(0, 6) + "..." + address.slice(-4);
}

/**
 * Parses technical blockchain errors and returns user-friendly messages.
 */
export function handleError(err: any): string {
    console.error("Technical Error Detail:", err);

    // Extract raw message
    const message = (err.message || "").toLowerCase();
    const reason = (err.reason || "").toLowerCase();
    const data = (err.data || "").toLowerCase();
    const all = message + reason + data;

    // 1. User Cancellations
    if (all.includes("user rejected") || all.includes("action_rejected")) {
        return "Transaction cancelled by user.";
    }

    // 2. Gas issues
    if (all.includes("insufficient funds") || all.includes("not enough funds")) {
        return "Insufficient ETH for gas fees.";
    }

    // 3. Contract Reverts
    if (all.includes("execution reverted") || all.includes("call_exception")) {
        // Specific contract messages
        if (all.includes("busy in active swap")) return "Security alert: This token has active swaps and cannot be removed.";
        if (all.includes("not in whitelist")) return "Error: Token is not in the authorized list.";
        if (all.includes("creator cannot complete")) return "Invalid action: You cannot accept your own swap.";
        if (all.includes("only creator can cancel")) return "Access denied: Only the creator can cancel this swap.";

        // Generic balance check if it reverted without specific reason
        return "Transaction failed: Please verify you have enough tokens and ETH for this operation.";
    }

    // 4. Default
    return err.reason || "Unable to complete transaction. Please check your connection and balance.";
}
