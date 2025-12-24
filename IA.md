# Retrospectiva del Desarrollo: Colaboración con Gemini Pro

Este documento resume la experiencia técnica y estratégica de utilizar **Gemini Pro** como herramienta de IA para el desarrollo integral de la DApp de Trazabilidad en Cadena de Suministro ("Supply Chain Tracker").

## 1. Retrospectiva del uso de la IA, Gemini Pro como herramienta
El uso de Gemini Pro ha sido el motor de aceleración del proyecto. Se ha comportado como un **arquitecto de software y desarrollador Full-Stack**, permitiendo pasar de la lógica conceptual a una aplicación funcional en tiempo récord.

**Puntos destacados de la herramienta:**
* **Omnicanalidad técnica:** Capacidad para generar código en **Solidity** (Backend de Blockchain), **TypeScript** (Lógica de Frontend) y **Tailwind** (Diseño de Interfaz) de manera coherente.
* **Adaptabilidad de diseño:** La IA logró mantener una estética "industrial y limpia" utilizando componentes de Shadcn/UI y Lucide Icons, alineándose con la temática de logística.
* **Pensamiento sistémico:** No solo generó funciones aisladas, sino que ayudó a estructurar un sistema de **Control de Acceso Basado en Roles (RBAC)** que se comunica perfectamente entre el contrato inteligente y la UI.

## 1.2 Tiempo consumido aproximado
El tiempo de desarrollo se ha optimizado drásticamente gracias a la generación de código y resolución de problemas por IA. A continuación, se detalla la inversión de tiempo estimada por fases:

| Fase del Proyecto | Detalle de Sesiones | Total Horas Estimadas |
| :--- | :--- | :--- |
| **Setup y Configuración** | Instalación de dependencias, configuración de Next.js y entorno Anvil. | **3 horas** |
| **Smart Contract** | Lógica de tokens, transferencias y estados en Solidity (3 sesiones de 2h). | **6 horas** |
| **Web DApp** | Desarrollo de vistas, integración de Ethers.js, hooks y UI (6 sesiones de 4h). | **24 horas** |
| **TOTAL** | | **33 horas** |

## 1.3 Errores más habituales analizando los chats con Gemini Pro
A lo largo de la interacción, se identificaron patrones de errores técnicos que requirieron intervención manual y refinamiento del prompt:

* **Inconsistencia en el Naming (Contexto):** En ocasiones, la IA cambiaba nombres de variables clave entre contextos (ej. usar `userStatus` en el frontend vs `status` en el contrato), lo que provocaba errores de tipado en TypeScript. Se solucionó centralizando la lógica en el hook `useWallet.ts`.
* **Manejo de Reversiones en Solidity (Revert):** Al consultar el `getUserInfo` de una cuenta no registrada (como el Admin), la IA inicialmente no previó que el contrato lanzaría una excepción que detendría la ejecución del frontend. Se ajustó el código en `lib/web3.ts` para manejar esto con bloques `try/catch` específicos.
* **Pérdida de Scope en Refactorizaciones:** Al solicitar actualizaciones de componentes extensos (como `app/page.tsx`), la IA a veces omitía funciones de apoyo previamente creadas (como `handleRegister`), generando errores de compilación.
* **Estado Asíncrono de Blockchain:** La IA tendía a asumir que los datos de la blockchain estarían disponibles instantáneamente tras una conexión (latencia cero), lo que obligó a implementar pantallas de carga (`loading states`) más robustas para evitar inconsistencias visuales en la UI.

## 1.4 Chat Inicial
A continuación se presenta el prompt inicial utilizado para contextualizar a la IA sobre el alcance, roles y requerimientos técnicos del proyecto:

> You're an expert Blockchain in Solidity and web3 developer and you'll provide assistance during al development, testing and deployment processes for a DApp called "Supply Chain Tracker". This solution includes two projects. One for smart contract "SupplyChain.sol" and the other project for web with Next.js where Management users is implemented. The DApp will track products from its origin to final consumer. 
>
> The roles or actors in the DApp in order are: 
>
> 1. Producer: (has access to: My Tokens, Create Tokens (materias primas), Transfers, Profile). Transfers tokens to Factory.
>
> 2. Factory: (has access to: My Tokens, Create Tokens (producto, tokens de materias primas), Transfers, Profile). Transfers tokens to Retailer.
>
> 3. Retailer: (has access to: My Tokens, Transfers, Profile). Transfers tokens to Factory.
>
> 4. Consumer: (has access to: My Tokens, Profile). 
>
> There's also admin role which is who deploy the contract on Anvil local Network and approve, reject or cancel users registrations. 
>
> Follow in detail the next repo 
> https://github.com/codecrypto-academy/98_pfm_traza_2025 
> and analyze carefully all specs for this DApp in the README.md. Confirm you got the context and understand all requirements for the DApp and you're ready to collaborate during all development, testing and deployment.