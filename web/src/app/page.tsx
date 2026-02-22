import ConnectButton from "@/components/ConnectButton";
import AdminPanel from "@/components/AdminPanel";
import CreateSwap from "@/components/CreateSwap";
import OperationsList from "@/components/OperationsList";
import DebugPanel from "@/components/DebugPanel";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass-card p-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
            Escrow DApp
          </h1>
          <p className="text-[var(--secondary)] text-sm">
            Atomic P2P Token Swaps with On-chain Custody
          </p>
        </div>
        <ConnectButton />
      </header>

      {/* Admin Panel (Only visible to owner) */}
      <AdminPanel />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Create Swap */}
        <aside className="col-span-1">
          <CreateSwap />
        </aside>

        {/* Right Column: Operations List */}
        <section className="col-span-1 md:col-span-2">
          <OperationsList />
        </section>
      </div>

      {/* Floating Debug Panel */}
      <DebugPanel />

      <footer className="mt-auto pt-8 text-center text-[var(--secondary)] text-xs border-t border-[var(--card-border)]">
        &copy; 2026 Escrow DApp - Built with Next.js 14 & Ethers.js
      </footer>
    </main>
  );
}
