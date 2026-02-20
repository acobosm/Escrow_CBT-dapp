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

### [Frontend]
Build a responsive dashboard to interact with the Escrow contract.

#### [NEW] [page.tsx](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/web/app/page.tsx)
- Main entry point with grid layout for components.

---

### [Deployment]
Automation for local testing and deployment.

#### [NEW] [deploy.sh](file:///home/ebit/projects/0%20CodeCrypto%20Academy/03%20Ethereum%20Practice/Intro%20a%20Proyectos%20de%20Entrenamiento/Proyectos%20obligatorios/04%20ESCROW/deploy.sh)
- script to deploy contracts and update frontend config.

## Verification Plan

### Automated Tests
- Run Foundry tests: `forge test -vvv` in the `sc/` directory.

### Manual Verification
1. Start Anvil: `anvil`.
2. Run `deploy.sh`.
3. Perform a swap through the DApp UI and verify balances.
