# VERIFARM — Guion de Demostración (Defensa de 5 Minutos)

**Objetivo:** Guiar una exposición fluida, precisa y cronometrada de 5 minutos frente al tribunal evaluador, demostrando el valor asistencial y técnico del sistema sin improvisaciones.

**Destinatario del software:** Colonia Psiquiátrica «Dr. Abelardo Irigoyen Freyre» (Oliveros, Santa Fe).  
**Datos cargados:** Conjunto de datos del `seed.ts` definitivo (25 psicofármacos, 1150 interacciones ONCHigh, lotes FEFO y pacientes sintéticos).

---

## 1. Preparación Previa (Antes de llamar al jurado)

Tener todo levantado y verificado en la notebook:

1. **Contenedor activo:** `docker compose up -d` (PostgreSQL en puerto 5433).
2. **Base de datos limpia y seeded:** `npm run setup` (deja la base en su estado prístino).
3. **Servidor corriendo:** `npm run dev` en terminal oculta.
4. **Navegador:** Abierto en `http://localhost:3000` en pantalla completa (`F11`), con zoom al 100%.
5. **Selector de usuario inicial:** Posicionado en **Farmacéutica: Ana Clara Benítez**.

---

## 2. Cronograma de los 5 Minutos

| Tiempo | Bloque | Foco principal | Pantalla |
|---|---|---|---|
| **00:00 - 01:00** | **Acto 1: Apertura y Diagnóstico de Farmacia** | Contexto de la Colonia, rol simulado y 3 tarjetas clave | `/` (Inicio) |
| **01:00 - 02:45** | **Acto 2: Trazabilidad y Dispensación FEFO** | Dos lotes con distinto vencimiento y reparto automático | `/stock` y `/stock/[id]` |
| **02:45 - 04:15** | **Acto 3: Módulo Clínico y Soporte a la Decisión** | Paciente crónico, interacciones severas y cobertura | `/pacientes/[id]` y `/consultas/nueva` |
| **04:15 - 05:00** | **Acto 4: Síntesis de Arquitectura y Cierre** | Principios técnicos, determinismo y conclusiones | Barra superior / Diapositiva final |

---

## 3. Guion Paso a Paso (Minuto a Minuto)

---

### Acto 1: Apertura y Diagnóstico de Farmacia (00:00 - 01:00)

**Pantalla visible:** `http://localhost:3000` (Tablero de Inicio).  
**Rol activo:** Ana Clara Benítez (Farmacéutica).

#### Qué decir:
> *"Buenos días. Verifarm es una plataforma desarrollada para responder a dos problemáticas críticas de la Colonia Psiquiátrica Dr. Abelardo Irigoyen Freyre: el desperdicio económico por vencimiento de fármacos en depósito, y el riesgo vital por polimedicación en pacientes con internaciones prolongadas.*  
> *Ambos problemas convergen en el fármaco: la misma droga que se custodia en el inventario es la que ingiere el paciente y genera interacciones.*  
> *Comenzamos en el inicio del sistema. En el extremo superior derecho contamos con un selector de roles para simular los perfiles de la institución; en este momento actuamos como la Farmacéutica Ana Clara Benítez."*

#### Qué hacer en pantalla:
1. Señalar el selector de usuario en la barra superior.
2. Recorrer con el cursor las **tres tarjetas de alerta**:
   - **Stock bajo mínimo:** Mostrar que el sistema alerta sobre 17 medicamentos que requieren reposición inmediata (ej. Risperidona).
   - **Lotes por vencer:** Mostrar la tarjeta ámbar: hay 1 lote próximo a caducar en menos de 30 días (*Clonazepam Lote `CLO-2026-VENCE`*).
   - **Consultas del día:** 3 evaluaciones clínicas procesadas en la jornada.
3. Hacer clic en el botón **"Ir a Stock"** de la primera tarjeta.

---

### Acto 2: Trazabilidad y Dispensación FEFO (01:00 - 02:45)

**Pantalla visible:** `/stock` (Existencias en Tiempo Real).

#### Qué decir:
> *"Al ingresar a Stock observamos el saldo total calculado. En Verifarm los saldos nunca se guardan como un número fijo en la base de datos: se computan en tiempo real a partir del libro mayor de ingresos y egresos, eliminando cualquier posibilidad de desfasaje.*  
> *Veamos el caso de Haloperidol, un antipsicótico típico fundamental en la colonia."*

#### Qué hacer en pantalla:
1. En la tabla de stock, buscar **"Haloperidol"** y hacer clic sobre su fila.
2. Se abre `/stock/[id]` (*Lotes de Haloperidol*).
3. Mostrar la tabla de lotes:
   - **Lote `HAL-2026-L1`:** 40 ampollas, vence el **15/11/2026** (próximo a vencer).
   - **Lote `HAL-2027-L2`:** 80 ampollas, vence el **15/09/2027** (vencimiento lejano).
   - **Total disponible:** 120 ampollas.

#### Qué decir:
> *"Haloperidol tiene 120 ampollas disponibles repartidas en dos lotes de distinto vencimiento. En un sistema tradicional o FIFO saldría el que primero se compró, o el que el operador tenga más a mano.*  
> *En Verifarm la regla es FEFO: First Expired, First Out. Supongamos que sala 4 solicita una dispensación de 50 ampollas. El primer lote solo tiene 40; el sistema debe agotar esas 40 y tomar las 10 restantes del segundo lote automáticamente."*

#### Qué hacer en pantalla:
4. Clic en **"Registrar egreso"** (botón rojo/secundario).
5. En el modal emergente:
   - Cantidad: escribir `50`.
   - Motivo: seleccionar *"Dispensación a sala"*.
   - Clic en **"Confirmar egreso"**.
6. Observar inmediatamente la actualización de la tabla:
   - **Lote `HAL-2026-L1`:** Quedó en **0 ampollas** (agotado).
   - **Lote `HAL-2027-L2`:** Quedó en **70 ampollas** (se descontaron las 10 faltantes).
   - **Saldo total:** 70 ampollas.

#### Qué decir:
> *"El sistema fraccionó el pedido sin intervención manual: 40 salieron del lote próximo a vencer y 10 del siguiente. Cada fracción generó un registro inmutable con su usuario, hora y lote de origen, garantizando trazabilidad de punta a punta."*

---

### Acto 3: Módulo Clínico y Detección de Interacciones (02:45 - 04:15)

**Transición de rol:**  
1. En la barra superior, cambiar el selector de usuario a **Médico: Dr. Gregory House**.  
2. Clic en la barra lateral en **"Pacientes"** (`/pacientes`).

#### Qué decir:
> *"Cambiamos al rol médico. En internación psiquiátrica prolongada, los pacientes sostienen esquemas de polimedicación durante meses. Por cumplimiento estricto de la Ley 25.326 de Protección de Datos Personales de Salud, los pacientes se registran bajo un seudónimo sintético.*  
> *Ingresemos a la ficha del paciente `PAC-101`."*

#### Qué hacer en pantalla:
1. Hacer clic en la fila de **`PAC-101`**.
2. En la ficha (`/pacientes/[id]`):
   - Mostrar la tabla de **Medicación vigente**: toma `Sertralina` (antidepresivo ISRS) y `Tranilcipromina` (antidepresivo IMAO).
   - Resaltar que en la columna "Interacciones" el chip indica *"Posible interacción"*.
3. Hacer clic en el botón superior **"Evaluar interacciones"**.
4. El sistema redirige a `/consultas/nueva` con ambos medicamentos ya precargados en la lista de evaluación.
5. Clic en el botón principal **"Evaluar interacciones"**.
6. Se despliega el resultado clínico:
   - Aparece el banner `<AvisoClinico />`: *"El sistema asiste, no decide. La evaluación farmacológica no sustituye el criterio médico..."*.
   - Tarjeta de interacción detectada con chip de severidad **ALTA**:
     - **Par:** `Sertralina` + `Tranilcipromina`.
     - **Observación generada:** Advierte sobre riesgo severo de **Síndrome Serotoninérgico** y crisis hipertensiva por inhibición de la recaptación junto a bloqueo del catabolismo de serotonina.
7. Clic en **"Guardar consulta"** para registrarla en la historia de auditoría de la institución.

#### Qué decir:
> *"La detección no consulta APIs externas en vivo: la API de interacciones de RxNav fue dada de baja por la Biblioteca Nacional de Medicina de EE.UU. en enero de 2024. Verifarm opera con una base local normalizada de 1150 interacciones de alta severidad de la fuente oficial ONCHigh, garantizando disponibilidad determinística y fuera de línea.*  
> *Además, aplicamos la Decisión 0012: 'sin interacciones' no es lo mismo que 'sin datos'. Si evaluamos al paciente `PAC-103`, que toma Clonazepam y Risperidona —fármacos que no están en la lista ONCHigh— el sistema informa explícitamente 'Sin datos en la fuente', protegiendo al médico de una falsa sensación de seguridad."*

---

### Acto 4: Síntesis de Arquitectura y Cierre (04:15 - 05:00)

**Pantalla:** Volver a `/` (Inicio).

#### Qué decir:
> *"Para cerrar, destacamos tres decisiones de ingeniería que sustentan el proyecto:*  
> *Primero: **Arquitectura limpia en tres capas desacopladas**. Los componentes visuales solo consumen endpoints REST; los endpoints validan entradas con esquemas Zod; y la lógica de negocio (FEFO, cálculo de saldos y cruce de interacciones) reside en servicios puros de TypeScript que no conocen a HTTP ni a Next.js.*  
> *Segundo: **Independencia operativa total**. Sin bibliotecas de componentes externas pesadas, sin dependencias de APIs de LLM pagas que puedan fallar en la defensa, y con PostgreSQL en Docker sobre el puerto 5433.*  
> *Tercero: **El sistema asiste, no decide**. La tecnología aporta trazabilidad matemática y memoria farmacológica infalible, pero la decisión médica y de dispensación permanece siempre en el profesional de la salud.*  
> *Quedamos a disposición del jurado para sus preguntas. Muchas gracias."*

---

## 4. Respuestas Rápidas ante Contingencias durante la Demo

- **Si el jurado pregunta por qué no hay login:**  
  *«El sistema priorizó el núcleo de valor: FEFO, stock por lote y soporte clínico. La autenticación y RBAC están modeladas en la arquitectura y registradas en `docs/ROADMAP_PRODUCTO.md` para la etapa productiva; el selector de usuario simulado permite ensayar todos los perfiles sin fricción.»*
- **Si el jurado pregunta por qué FEFO y no FIFO:**  
  *«En medicamentos, la fecha de ingreso al depósito es irrelevante para la seguridad del paciente. Lo que previene el desperdicio económico y el riesgo sanitario es consumir siempre el lote cuya vida útil expira antes, independientemente de cuándo llegó al depósito.»*
- **Si el jurado pregunta qué pasa si se cae internet:**  
  *«El sistema corre 100% local. Toda la base de fármacos, lotes y las 1150 interacciones de ONCHigh residen en PostgreSQL en Docker. No requiere conexión a internet para operar.»*
- **Cómo reiniciar la base si algo sale mal durante un ensayo:**  
  Ejecutar en la consola:
  ```bash
  npm run setup
  ```
  Esto borra las tablas, corre las migraciones y vuelve a cargar los 25 fármacos, los lotes de Haloperidol (40 y 80) y los pacientes de prueba exactamente como al inicio.
