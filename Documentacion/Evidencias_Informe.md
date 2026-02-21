# Informe de Evidencias - Proyecto ESCROW

Este documento contiene las pruebas y evidencias de funcionamiento del proyecto Escrow DApp.

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

## 4. Pruebas de Frontend (UI)
### Conexión de Wallet
- [ ] Evidencia de conexión con MetaMask.

### Operaciones de Swap
- [ ] Creación de una operación (Usuario A).
- [ ] Finalización de la operación (Usuario B).
- [ ] Verificación de balances finales.
