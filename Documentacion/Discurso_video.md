# Guion Extendido para Video (12 Minutos) - Proyecto ESCROW

Este guion está diseñado para una presentación detallada de aproximadamente 12 minutos.

---

## 1. Introducción y Gancho (0:00 - 1:00)
- **Visual**: Primer plano del estudiante o pantalla de bienvenida con el título.
- **Voz**: "Bienvenidos a la presentación de mi proyecto final: Escrow DApp. Mi nombre es [Tu Nombre] y hoy vamos a explorar cómo la tecnología blockchain puede solucionar uno de los problemas más antiguos del comercio: la confianza en los intercambios entre pares."
- **Punto clave**: Presentar el problema de los intercambios inseguros (scams) y cómo un contrato inteligente actúa como un árbitro imparcial.

## 2. El Problema y la Solución Escrow (1:00 - 2:30)
- **Visual**: Diagrama de arquitectura en Eraser.io.
- **Voz**: "Imagina que quieres cambiar tus tokens A por tokens B de otra persona. ¿Quién envía primero? Si envías tú, te arriesgas a que la otra parte no cumpla. Aquí es donde entra nuestro Escrow."
- **Explicación**: El contrato retiene los activos en custodia hasta que ambas partes cumplen las condiciones predefinidas en el código, eliminando el riesgo de contraparte.

## 3. Arquitectura del Smart Contract (2:30 - 4:30)
- **Visual**: Código en VS Code (Escrow.sol).
- **Voz**: "He desarrollado este contrato utilizando Solidity v0.8.x y el framework Foundry. La seguridad ha sido mi prioridad número uno."
- **Detalles técnicos**:
    - **Ownable**: Solo el administrador autoriza qué tokens son intercambiables para evitar spam.
    - **ReentrancyGuard**: Protección contra ataques de reentrada en las funciones de retiro.
    - **Estructura de Datos**: Uso de `structs` para almacenar el estado de cada operación (monto, tokens, creador, estado activo/cerrado/cancelado).
    - **Eventos**: Importancia de los eventos para que el frontend pueda escuchar cambios en tiempo real.

## 4. Frontend y Experiencia de Usuario (4:30 - 6:30)
- **Visual**: Navegador mostrando la DApp (basada en el diseño de 3 columnas).
- **Voz**: "Para el frontend, elegí Next.js 14 con su nuevo App Router por su eficiencia y velocidad. La interfaz está construida con Tailwind CSS, buscando una estética profesional y limpia."
- **Recorrido por la UI**: 
    - Explicar la disposición en 3 columnas: Administración y Creación (Izquierda), Lista de Operaciones (Centro) y el Panel de Debug de Balances (Derecha).
    - "El panel de balances es fundamental durante el desarrollo para verificar que cada wei se mueve a donde corresponde."

## 5. Integración Web3 con Ethers.js (6:30 - 8:00)
- **Visual**: Código de `lib/ethereum.tsx` y hooks.
- **Voz**: "La conexión entre la web y la blockchain se realiza mediante Ethers.js v6. Hemos implementado un context provider que gestiona el estado de MetaMask, detecta cambios de cuenta y maneja las firmas de transacciones."
- **Manejo de Aprobaciones**: "Un punto crítico es el patrón 'Approve + Call'. Antes de interactuar con el Escrow, el usuario debe autorizar al contrato para mover sus tokens ERC20."

## 6. Demostración en Vivo: Setup y Deployment (8:00 - 9:30)
- **Visual**: Terminal dividida (Anvil corriendo, ejecución de `deploy.sh`).
- **Voz**: "Vamos a ver el sistema en acción. Primero iniciamos nuestro nodo local Anvil. Luego ejecutamos mi script automatizado de despliegue, que no solo sube el contrato Escrow, sino que también crea dos tokens de prueba (TKA y TKB) y los configura automáticamente en el frontend."

## 7. Demostración en Vivo: El Ciclo Completo (9:30 - 11:00)
- **Visual**: Navegador con MetaMask cambiando de cuentas.
- **Voz**: "Como Usuario 1, deposito 100 TKA y pido 50 TKB. Noten cómo MetaMask me pide dos firmas. Ahora cambiamos al Usuario 2. Él ve la oferta en el panel central, decide aceptarla y, tras confirmar, el contrato realiza el swap atómico instantáneamente."
- **Cancelación**: Mostrar qué pasa si el Usuario 1 decide recuperar sus fondos antes de que alguien acepte la oferta.

## 9. Evolución a Versión 2: Fábrica de Tokens (11:00 - 12:00)
- **Visual**: Pestaña "Deploy New" en el Admin Panel.
- **Voz**: "Pero no nos detuvimos ahí. En la Versión 2 hemos convertido el Escrow en una verdadera fábrica de tokens. Ahora el administrador puede crear nuevos contratos ERC20 directamente desde la interfaz, asignarles nombre y ticker, y lo más interesante: realizar un minteo selectivo a cuentas específicas de Anvil para pruebas inmediatas."
- **Seguridad**: "También implementamos una eliminación segura de tokens, asegurando que ningún activo se desliste si hay swaps activos que lo utilicen."

## 10. Desafíos, Redes Públicas y Conclusiones (12:00 - 13:00)
- **Voz**: "La DApp es multi-red. Usando la función 'Import Existing', podemos autorizar tokens de redes públicas reales como Sepolia, como por ejemplo LINK o WETH, simplemente pegando su dirección. El sistema es escalable y está listo para producción."
- **Despedida**: "Este proyecto ha evolucionado de un simple escrow a una suite de gestión de activos P2P. Mi nombre es [Tu Nombre], ¡y gracias por acompañarme!"
