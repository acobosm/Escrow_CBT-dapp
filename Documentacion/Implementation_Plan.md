# ESCROW DApp Implementation Plan

Create a decentralized application (DApp) for secure ERC20 token exchanges using a smart contract escrow system.

## Proposed Changes

### [Smart Contracts]
Develop a secure Escrow contract to handle token deposits and swaps.

#### [NEW] [Escrow.sol](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/sc/src/Escrow.sol)
- Inherit from `Ownable` and `ReentrancyGuard`.
- Core functions: `addToken`, `createOperation`, `completeOperation`, `cancelOperation`.

#### [NEW] [Escrow.t.sol](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/sc/test/Escrow.t.sol)
- Unit tests for all contract logic.

---

### [Phases 4-10: Frontend]
Granular development of the dashboard components.

#### [Phase 4] [ethereum.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/lib/ethereum.tsx)
- Ethereum Provider and MetaMask logic.

#### [Phase 5] [ConnectButton.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/components/ConnectButton.tsx)
- Unified wallet connection UI.

#### [Phase 6] [AdminPanel.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/components/AdminPanel.tsx)
- Interface for adding tokens (Owner only).

#### [Phase 7] [CreateSwap.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/components/CreateSwap.tsx)
- Swap creation logic with integrated token approval.

#### [Phase 8] [OperationsList.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/components/OperationsList.tsx)
- Active swap monitoring and interaction (Accept/Cancel).

#### [Phase 9] [DebugPanel.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/components/DebugPanel.tsx)
- Balance tracker for testing.

#### [Phase 10] [page.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/src/app/page.tsx)
- Full dashboard assembly.

---

### [Phase 11: Error Handling]
- Global catch for reverted transactions.
- Zero-state handling (no tokens, no operations).

---

### [Phase 12: Deployment & Verification]
- Automation script and E2E swap confirmation.

## Verification Plan

### Automated Tests
- Run Foundry tests: `forge test -vvv` in the `sc/` directory.

### Manual Verification
1. Start Anvil: `anvil`.
2. Run `deploy.sh`.
3. Perform a swap through the DApp UI and verify balances.
