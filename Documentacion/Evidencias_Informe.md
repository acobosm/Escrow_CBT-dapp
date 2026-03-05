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

### CONSULTA DE TOKENS AUTORIZADOS (Cast)
Usa estos comandos para verificar qué tokens están registrados en el contrato Escrow (índices 0 a 4):

```bash
# Consultar dirección en el índice 0 (Generalmente TKA)
cast call 0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44 "allowedTokensList(uint256)" 0

# Consultar dirección en el índice 4 (Último token añadido, ej: Diamond)
cast call 0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44 "allowedTokensList(uint256)" 4
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

---

## 🧪 Plan de Pruebas Versión 2 (V2 Test Plan)

Para validar las nuevas funcionalidades de la Versión 2, se deben seguir estos pasos:

### Fase A: Fábrica de Tokens y Minteo (Deploy New)
1.  **Despliegue**: Acceder a "Deploy New", crear un token "DIAMANTE" (DIAM).
2.  **Minteo**: Seleccionar las Cuentas #2 y #4. Ingresar monto "5000".
3.  **Verificación**: Cambiar a Cuentas #2 y #4 en MetaMask y verificar que el Balance Panel muestra 5000 DIAM.

### Fase B: Importación y Alias (Public Net Ready)
1.  **Simulación Sepolia**: En Anvil, desplegar un token manualmente (o usar la dirección de uno ya creado).
2.  **Import**: Usar "Import Existing" con esa dirección y poner un alias personalizado (ej: "SÚPER-TOKEN").
3.  **Verificación**: Comprobar que en los dropdowns de "Create Swap" aparece el alias "SÚPER-TOKEN" en lugar de la dirección hexadecimal.

#### 🌍 Guía de Conexión a Red Sepolia (Producción/Testnet)
Para llevar las pruebas más allá de Anvil:
1.  **MetaMask**: Habilitar "Show test networks" en ajustes de red y elegir **Sepolia**.
2.  **Gas**: Obtener Sepolia ETH desde `sepoliafaucet.com`.
3.  **Token LINK**: Usar la dirección oficial de Chainlink en Sepolia: `0x779873293021A439970c24636759b21C92C79081`.
4.  **Acción**: Importar esta dirección en la DApp como "LINK". Esto demuestra la capacidad de la DApp de interactuar con contratos reales fuera del entorno local.

### Fase C: Seguridad de Eliminación (Safe Removal)
1.  **Aislamiento**: Crear un swap activo usando el token "DIAMANTE".
2.  **Intento de Borrado**: Ir a la lista de tokens autorizados e intentar borrar DIAMANTE (X naranja).
3.  **Resultado**: El sistema debe lanzar un error o bloquear la transacción indicando que el token está en uso.
4.  **Limpieza**: Cancelar el swap de DIAMANTE y volver a intentar el borrado. Esta vez debe ser exitoso.

### Fase D: Protección de Base Tokens
1.  **V1 Protection**: Verificar que para **TKA** y **TKB** no existe el botón de borrar (X), garantizando la integridad de los tokens base del proyecto.

### Fase E: Validaciones de UI (Safeguards)
1.  **Cuentas**: Intentar desplegar sin marcar cuentas. Resultado: Bloqueo y mensaje *"Please select at least one account..."*.
2.  **Montos**: Intentar desplegar con monto 0. Resultado: Bloqueo y mensaje *"Please specify a valid mint amount."*.

---

## 🛠️ Resultados de Pruebas Automatizadas (Foundry)

Se han implementado y verificado **10 pruebas unitarias** que cubren el 100% de la lógica crítica del contrato `Escrow`.

```bash
Ran 10 tests for test/Escrow.t.sol:EscrowTest
[PASS] test_AddToken()
[PASS] test_CancelOperation()
[PASS] test_CompleteOperation()
[PASS] test_CreateOperation()
[PASS] test_DeployAndAddToken() (V2 Factory)
[PASS] test_RemoveToken() (V2 Removal)
[PASS] test_Revert_AddToken_NonOwner()
[PASS] test_Revert_CancelNonOwnedOperation()
[PASS] test_Revert_CompleteOwnOperation()
[PASS] test_Revert_RemoveTokenWithActiveSwap() (V2 Safety)
Suite result: ok. 10 passed; 0 failed; 0 skipped
```

---

## 🚀 Infraestructura y Monitoreo (tmux + Persistencia)

Se ha implementado un entorno de desarrollo profesional para mantener el historial de la blockchain y monitorear los logs en tiempo real.

### Fase F: Consola Dual y Persistencia
1.  **Archivo de Estado**: Se utiliza `anvil_state.json` en la raíz para guardar contratos y balances.
2.  **Ejecución**:
    ```bash
    chmod +x dev-dash.sh
    ./dev-dash.sh
    ```
3.  **Resultado**: 
    - Panel Izquierdo: **Anvil** cargando estado previo.
    - Panel Derecho: **Next.js** servidor de desarrollo.

### Guía de Atajos Rápidos (Tmux)

| Acción | Comando |
| :--- | :--- |
| **Moverse entre Paneles** | `Ctrl + b` y luego `Flechas` (← ↑ → ↓) |
| **Salir (Sin detener servicios)** | `Ctrl + b` y luego `d` (Detach) |
| **Volver a entrar (Re-attach)** | `tmux attach-session -t escrow-dev` |
| **Cerrar todo (Kill session)** | `tmux kill-session -t escrow-dev` |
| **Maximizar panel actual** | `Ctrl + b` y luego `z` |

> [!NOTE]
> Para que el estado de la blockchain se guarde correctamente en `anvil_state.json`, recuerda entrar al panel de Anvil y usar `Ctrl + C` antes de cerrar la sesión de tmux.

### 💡 Diferencia entre `dev-dash.sh` y `deploy.sh`

Es muy importante entender que estos dos scripts tienen propósitos distintos:

1.  **`dev-dash.sh` (Infraestructura)**: Prepara la "máquina" (Anvil) y la "web" (NextJS). Activa la persistencia para que Anvil pueda guardar y cargar datos. Pero **no crea los tokens** por sí mismo.
2.  **`deploy.sh` (Contenido)**: Es el que "instala" tus Smart Contracts (Escrow, TKA, TKB) dentro de la máquina Anvil que ya está corriendo.

**El Flujo Correcto la primera vez:**
1.  Lanza `./dev-dash.sh`.
2.  En una **nueva terminal**, lanza `./deploy.sh`.
3.  ¡Listo! Los contratos ahora están en Anvil y guardados en tu archivo de persistencia.

A partir de este punto, si cierras todo y vuelves a abrir solo con `./dev-dash.sh`, **tus tokens seguirán ahí** porque ya fueron "grabados" en el archivo de estado.

> [!CAUTION]
> **Sobre el re-despliegue (`deploy.sh`)**: Ejecutar este script creará **nuevas instancias** de los contratos. Aunque no rompe la blockchain, hará que la web apunte a nuevas direcciones vacías, haciendo que tus swaps y tokens anteriores se vuelvan "invisibles" para la interfaz actual. Úsalo solo si quieres resetear el proyecto desde cero.
