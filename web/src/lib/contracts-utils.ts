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

export async function getTokenDisplayName(address: string, provider: any): Promise<string> {
    // 1. Local Alias
    const alias = getLocalAlias(address);
    if (alias) return alias;

    // 2. Blockchain Symbol
    const symbol = await getTokenSymbol(address, provider);
    if (symbol) return symbol;

    // 3. Fallback to truncated address
    return address.slice(0, 6) + "..." + address.slice(-4);
}
