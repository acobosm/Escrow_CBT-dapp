# Informe de Evidencias - Proyecto ESCROW

Este documento contiene las pruebas y evidencias de funcionamiento del proyecto Escrow DApp.

---

## Referencias Técnicas de Laboratorio

Para las pruebas y sustentación, se utilizan los siguientes recursos en el entorno local (Anvil):

### Direcciones de Tokens ERC20
- **Token A (TKA)**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Token B (TKB)**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Token C (TKC)**: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9`
- **Token D (TKD)**: `0xdc64a17e4a32263e25133744096012855c5323c1`
- **Token E (TKE)**: `0x0165878a594ca255338adfa4d48449f69242eb8f`

### Comandos de Acuñación (Minting)
Usa estos comandos en la terminal para asignar saldo (1000 tokens) a la **Cuenta 0 (Owner)**:

```bash
# Mint Token A
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Mint Token B
cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Mint Token D (para la Cuenta 0 - Owner)
cast send 0xdc64a17e4a32263e25133744096012855c5323c1 "mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Mint Token D (para la Cuenta 1 - Aceptante)
cast send 0xdc64a17e4a32263e25133744096012855c5323c1 "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Mint Token E
cast send 0x0165878a594ca255338adfa4d48449f69242eb8f "mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## 0. Planificación y Documentación (Fase 0)
- [x] **Implementation_Plan.md**: Documentación técnica del diseño del sistema.
- [x] **Graficos.md**: Guía para la creación de diagramas en Eraser.io.
- [x] **Discurso_video.md**: Guion detallado para la presentación final.

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

---

## 2. Desarrollo de Smart Contracts (Fase 2)
### Archivos Desarrollados:
- [x] **Escrow.sol**: Contrato principal con la lógica de swap, custodia y seguridad.
- [x] **MockERC20.sol**: Contrato de token auxiliar para realizar las pruebas de intercambio.
- [x] **Escrow.t.sol**: Suite de tests unitarios para validar todo el flujo.

### Tests Unitarios (Escrow.t.sol)
Se han implementado y verificado los siguientes casos de prueba:
- [x] **test_AddToken**: Verifica que solo el owner pueda añadir tokens.
- [x] **test_CreateOperation**: Verifica la creación correcta de una operación y la transferencia de tokens al contrato.
- [x] **test_CompleteOperation**: Verifica el intercambio exitoso de tokens entre las partes y el cambio de estado a `completed`.
- [x] **test_CancelOperation**: Verifica que el creador pueda cancelar y recibir su reembolso.
- [x] **test_Revert_...**: Verifica que las transacciones fallen correctamente (reviertan) cuando no se cumplen las condiciones de seguridad (no ser owner, intentar completar tu propia operación, cancelar operación ajena).

### Resultados de Ejecución
Los tests han pasado exitosamente (`suite result: ok. 7 passed; 0 failed`).

**Evidencia Requerida:**
- [ ] **Captura de pantalla 1**: Ejecución de `forge test -vvv` mostrando todos los tests en verde (PASS).
- [ ] **Captura de pantalla 2**: Confirmación de la estructura de archivos con `tree -L 2` o `ls -R` (para evidenciar la Fase 1).

---

## 3. Automatización de Despliegue (Fase 3)
### Script de Automatización (deploy.sh)
Se ha creado un script que orquestra el despliegue en Anvil y actualiza automáticamente la configuración del Frontend.

**Evidencia Requerida:**
- [ ] **Captura de pantalla 3**: Ejecución del comando `./deploy.sh` mostrando las direcciones de los contratos desplegados en la terminal.
- [ ] **Verificación de archivo**: Captura del archivo `deployment-info.txt` generado tras el despliegue.

---

## 4-10. Pruebas de Frontend (UI)
### Conexión de Wallet
- [ ] **Captura de pantalla 4**: Pantalla inicial con el botón "Conectar Wallet" habilitado.
- [ ] **Captura de pantalla 5**: Notificación de conexión exitosa y dirección visible.

### Gestión de Tokens y Swap
- [ ] **Captura de pantalla 6**: Panel de Administrador añadiendo un token.
- [ ] **Captura de pantalla 7**: Formulario de creación de swap completo.
- [ ] **Captura de pantalla 8**: Lista de swaps activos mostrando el nuevo swap creado.

### Firma de Transacciones
- [ ] **Captura de pantalla 9**: Ventana de MetaMask solicitando aprobación de gasto (Approve).
- [ ] **Captura de pantalla 10**: Ventana de MetaMask solicitando firma para completar intercambio (Swap).

### Resultados Finales
- [ ] **Captura de pantalla 11**: Panel de "Debug de Balances" mostrando los cambios tras el intercambio exitoso.

---

## 12. Protocolo de Prueba End-to-End (E2E)

Este protocolo describe el flujo completo para validar la interoperabilidad de todos los componentes de la DApp, incluyendo la nueva funcionalidad de alias.

### Objetivo:
Realizar un intercambio completo entre dos cuentas diferentes usando un token nuevo (Token D) identificado por un alias local.

### Paso 1: Preparación del Token D (Admin)
1. **Despliegue del Contrato**: Ejecutar desde la terminal:
   ```bash
   cd sc
   forge create test/MockERC20.sol:MockERC20 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --constructor-args "Token D" "TKD"
   ```
2. **Copiar Dirección**: Anotar la dirección que aparece en `Deployed to: 0x...`.
3. **Registro con Alias**: 
   - Conectar la Cuenta 0 en la DApp.
   - Ir al **Admin Panel**.
   - Ingresar la **nueva dirección** obtenida.
   - Ingresar el alias: **TKD**.
   - Clic en **Add Token** y confirmar.
4. **Minting para Cuenta 1**: Ejecutar (desde la misma carpeta `sc`):
   ```bash
   # SUSTITUIR <REAL_TOKEN_D_ADDRESS> por la dirección del paso 2
   (para el ejemplo se desplegó en la dirección 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0)
   cast send <REAL_TOKEN_D_ADDRESS> "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   *Nota: Recuerda volver a la raíz con `cd ..` si necesitas ejecutar scripts de la carpeta principal.*

### Paso 2: Creación del Swap (Cuenta 1 - Proponente)
1. **Selección**: En el formulario "Create Swap", seleccionar:
   - **You Send**: TKA (u otro con saldo).
   - **You Receive**: TKD (verificar que aparezca el alias en el dropdown).
2. **Montos**: Ingresar montos de prueba (ej: 10 TKA por 5 TKD).
3. **Ejecución**:
   - Clic en **Approve** y confirmar en MetaMask.
   - Clic en **Start Swap** y confirmar en MetaMask.
4. **Verificación**: La operación debe aparecer en la lista **Active Swaps** con el ID correspondiente y los nombres de los tokens legibles.

### Paso 3: Completar el Swap (Cuenta 2 - Aceptante)
1. **Cambio de Cuenta**: En MetaMask, cambiar a una segunda cuenta (ej: Cuenta 1 de Anvil).
2. **Preparación**: Asegurarse de tener saldo de **TKD** (repetir el comando de mint para esta nueva cuenta si es necesario).
3. **Aprobación de Gasto**: 
   - La DApp detectará que quieres completar un swap pidiendo TKD.
   - Se solicitará un **Approve** para el Token D desde esta segunda cuenta.
4. **Finalización**: Clic en **Complete Swap** y confirmar transacción.
    - [x] **VERIFICACIÓN EXITOSA**: Los balances se actualizaron correctamente para ambas cuentas tras el intercambio del Token D.
    - [x] **ERROR HANDLING**: Se validó el bloqueo por saldo insuficiente y mensajes claros en UI.
    - [x] **LIMPIEZA**: Se verificó la cancelación y reembolso de depósitos.

---
**Resultado Final**: El sistema ESCROW es estable, seguro y cumple con todos los requisitos de la Fase 12.
