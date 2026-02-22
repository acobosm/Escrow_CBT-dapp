Este documento describe la arquitectura y los flujos para ser replicados en **Eraser.io**.

## 0. Estructura del Proyecto (Fase 1)

Código para generar el diagrama de cajas en Eraser:

```text
title Escrow DApp - Estructura de Proyecto (Fase 1)

// Directorio raíz
[shape: folder, color: blue] "Root Project" {
  [shape: folder, color: blue] "sc (Smart Contracts)" {
    [shape: folder] "src"
    [shape: folder] "test"
    [shape: folder] "lib"
    [shape: folder] "script"
    ".gitignore" [shape: file]
  }
  [shape: folder, color: green] "web (Frontend)" {
    [shape: folder] "src" {
      [shape: folder] "app"
      [shape: folder] "components"
      [shape: folder] "lib"
    }
    ".gitignore" [shape: file]
  }
  [shape: folder, color: yellow] "Documentacion" {
    "Task.md" [shape: file]
    "Implementation_Plan.md" [shape: file]
    "Evidencias_Informe.md" [shape: file]
  }
}
```

---

## 1. Diagrama de Arquitectura de Sistema

**Elementos a dibujar en Eraser:**
- **Actores**: 
    - `Usuario` (Icono de persona)
- **Componentes**:
    - `MetaMask` (Wallet / Extension)
    - `Frontend (Next.js 14)` (Caja principal)
    - `Escrow Smart Contract` (Icono de contrato/blockchain)
    - `Anvil Local Node` (Nube o servidor de red)

**Conexiones:**
1. `Usuario` -> `Frontend`: "Interacciona con la UI"
2. `Frontend` -> `MetaMask`: "Solicita firma/conexión"
3. `MetaMask` -> `Escrow Smart Contract`: "Envía transacciones firmadas"
4. `Escrow Smart Contract` -> `Anvil`: "Reside en la red"

---

---

## 2. Diagrama de Secuencia: Creación de Operación (Fase 2)

Código para generar el diagrama de secuencia en Eraser:

```text
title Sequence: Create Operation

Usuario A -> Frontend: Input (TokenA, TokenB, Amount)
Frontend -> TokenA: approve(Escrow, Amount)
TokenA --> Frontend: Access Granted
Frontend -> Escrow: createOperation(TokenA, TokenB, Amount)
Escrow -> TokenA: transferFrom(Usuario A, Escrow, Amount)
TokenA --> Escrow: Content Transferred
Escrow -> Escrow: Store Operation (ID, Creator, ...)
Escrow --> Frontend: Emit Event (OperationCreated)
```

---

## 3. Flujo de Secuencia: Finalización de Swap (Completion)

**Pasos para el diagrama en Eraser:**
1. **Usuario B** selecciona una operación activa.
2. **Frontend** llama a `approve()` en el contrato del **Token B**.
3. **Frontend** llama a `completeOperation()` en el **Escrow**.
4. **Escrow** transfiere **Token B** del Usuario B al Usuario A.
5. **Escrow** transfiere **Token A** (en custodia) al Usuario B.
6. Se emite `OperationCompleted` y el estado cambia a `Closed`.

---

## 4. Arquitectura de Despliegue (Fase 3)

Código para generar el diagrama en Eraser:

```text
title Deployment Architecture

[shape: cylinder] "Anvil (Local Node)" as node
[shape: diamond] "DeployScript (Foundry)" as script
[shape: folder] "Frontend (contracts.ts)" as config

script -> node: 1. Deploy Escrow & Tokens
script -> node: 2. Authorize Tokens
script -> node: 3. Mint Initial Balances
node --> script: Returns Addresses & Events
script -> config: Update Addresses & ABIs
```

---

## 5. Jerarquía de Componentes Frontend (Fase 10)

Código para generar el diagrama en Eraser:

```text
title Component Hierarchy

[shape: card] "Root Layout" {
  [shape: card] "Navigation (ConnectButton)"
  [shape: card] "Main Dashboard" {
    [shape: card] "Admin: AddTokenForm"
    [shape: card] "User: CreateSwapForm"
    [shape: card] "Market: ActiveSwapsList" {
      [shape: card] "SwapItem (Approve/Complete)"
    }
  }
  [shape: card] "Footer (DebugBalancePanel)"
}
```
