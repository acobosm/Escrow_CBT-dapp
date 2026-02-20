# Informe de Evidencias - Proyecto ESCROW

Este documento contiene las pruebas y evidencias de funcionamiento del proyecto Escrow DApp.

## 1. Setup Inicial y Estructura (Fase 1)
Se ha creado la estructura base del proyecto dividiendo la lógica de Smart Contracts y el Frontend.

### Comandos de Inicialización:

**Creación de directorios base:**
```bash
mkdir -p sc web
```

**Inicialización de Foundry (Smart Contracts):**
```bash
cd sc
forge init --force
```

**Instalación de librerías en Foundry (OpenZeppelin):**
```bash
forge install openzeppelin/openzeppelin-contracts --no-git
```

**Inicialización de Next.js 14 (Frontend):**
```bash
cd ../web
npx create-next-app@14 . --ts --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm --yes
```

**Instalación de dependencias en Frontend (Ethers.js):**
```bash
npm install ethers
```

### Configuración de Ignorados (.gitignore):
Se han configurado archivos `.gitignore` en tres niveles para garantizar que no se filtren archivos sensibles o innecesarios:
-   **./.gitignore (Raíz)**: Bloquea archivos de sistema (`.DS_Store`), metadatos de Windows (`*.Identifier`), estados de Anvil y carpetas de dependencias en una sola vista.
-   **sc/.gitignore**: Específico para Foundry (`out/`, `cache/`, `broadcast/`).
-   **web/.gitignore**: Específico para Next.js (`node_modules/`, `.next/`).
- [ ] Captura del script `deploy.sh` ejecutándose.
- [ ] Direcciones de los contratos desplegados.

## 3. Pruebas de Frontend (UI)
### Conexión de Wallet
- [ ] Evidencia de conexión con MetaMask.

### Operaciones de Swap
- [ ] Creación de una operación (Usuario A).
- [ ] Finalización de la operación (Usuario B).
- [ ] Verificación de balances finales.
