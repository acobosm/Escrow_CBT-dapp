# Control de Fases - Proyecto ESCROW

Este documento sirve para llevar un seguimiento público del avance del proyecto.

## Fase 0: Planificación y Documentación
- [x] Análisis de requisitos (Markdown)
- [x] Plan de Implementación (`Implementation_Plan.md`)
- [x] Informe de Evidencias (`Evidencias_Informe.md`)
- [x] Guía de Gráficos para Eraser (`Graficos.md`)
- [x] Guion extendido para video de 12 min (`Discurso_video.md`)
- [x] Creación de este archivo de tareas (`Task.md`)

## Fase 1: Setup Inicial
- [x] Inicialización del repositorio y estructura de carpetas
- [x] Configuración de Foundry (Smart Contracts)
- [x] Configuración de Next.js 14 (Frontend)
- [x] Instalación de dependencias (OpenZeppelin, Ethers.js)

## Fase 2: Desarrollo de Smart Contracts
- [x] Implementación de `Escrow.sol`
- [x] Implementación de `Escrow.t.sol` (Tests unitarios)
- [x] Verificación de seguridad y reentrada

## Fase 3: Automatización de Despliegue
- [x] Script `deploy.sh`
- [x] Despliegue de contratos y tokens de prueba en Anvil

## Fase 4: Frontend - Setup Base
- [x] Configuración de Next.js 14 y ethers.js v6
- [x] Provider de Ethereum (`ethereum.tsx`)

## Fase 5: Componente de Conexión
- [x] Implementación de `ConnectButton.tsx` (MetaMask)

## Fase 6: Componente AddToken (Admin)
- [x] Implementación de `AddToken.tsx` (Interfaz Owner)

## Fase 7: Componente CreateOperation
- [x] Implementación de `CreateOperation.tsx` (Approve + Create)

## Fase 8: Componente OperationsList
- [x] Implementación de `OperationsList.tsx` (Polling 10s)

## Fase 9: Componente BalanceDebug
- [x] Implementación de `BalanceDebug.tsx` (Monitor 3 columnas)

## Fase 10: Página Principal
- [x] Ensamblaje en `app/page.tsx` (Grid 3 columnas)

## Fase 11: Manejo de Errores
- [x] Try-catch en llamadas a contrato
- [x] Feedback visual para el usuario (Alertas descriptivas de saldo)

## Fase 12: Testing End-to-End
- [x] Ciclo de prueba completo (2 cuentas - TKA por TKD)
- [x] Verificación de balances finales y contraste de UI
