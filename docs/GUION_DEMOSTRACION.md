# VERIFARM — Guion de Demostración (Defensa de 5 Minutos)

**Objetivo:** Guiar una exposición fluida, precisa y cronometrada de 5 minutos frente al tribunal evaluador, demostrando el valor asistencial y técnico del sistema sin improvisaciones.

**Destinatario del software:** Colonia Psiquiátrica «Dr. Abelardo Irigoyen Freyre» (Oliveros, Santa Fe).  
**Datos cargados:** Conjunto de datos del `seed.ts` definitivo (25 psicofármacos, 1150 interacciones ONCHigh, lotes FEFO y pacientes sintéticos).

> **Este guion fue ensayado contra el sistema corriendo** (tarea 6.09, 2026-09-09).
> Todo lo que dice que se ve en pantalla, se ve; los nombres de botones y los
> números son los reales. El registro del ensayo está al final del archivo.
>
> **Regla al editarlo:** nada de lo que el expositor le atribuya a la pantalla
> puede escribirse de memoria. Si se agrega un paso, se verifica corriendo el
> sistema. Es la regla 6 del proyecto —no inventar— aplicada al guion, y es
> exactamente donde falló la primera versión.

---

## 1. Preparación Previa (Antes de llamar al jurado)

Tener todo levantado y verificado en la notebook:

1. **Contenedor activo:** `docker compose up -d` (PostgreSQL en puerto 5433).
2. **Base de datos cargada desde cero:**

   ```bash
   npx prisma db seed
   ```

   **Este es el comando, y no `npm run setup`.** `npm run setup` **no toca la
   base**: verifica el `.env` y regenera el cliente de Prisma, nada más. El seed
   sí borra todas las tablas antes de cargar, así que deja la base en su estado
   prístino cada vez que se corre.

3. **Servidor corriendo:** `npm run dev` en terminal oculta.
4. **Navegador:** Abierto en `http://localhost:3000` en pantalla completa (`F11`), con zoom al 100%.
5. **Selector de usuario en Farm. Pérez.** **Hay que mirarlo y corregirlo a
   mano.** El rol elegido se guarda en el `localStorage` del navegador
   (`verifarm_usuario_simulado_id`) y **no lo resetea ni el seed ni
   `npm run setup`**: si el último ensayo terminó como Dr. House, la defensa
   arranca como Dr. House. Se corrige desde el propio selector, en la barra
   superior.

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

**Pantalla visible:** `http://localhost:3000` (Panel General).  
**Rol activo:** Farm. Pérez (Farmacéutico).

#### Qué decir:
> *"Buenos días. Verifarm es una plataforma desarrollada para responder a dos problemáticas críticas de la Colonia Psiquiátrica Dr. Abelardo Irigoyen Freyre: el desperdicio económico por vencimiento de fármacos en depósito, y el riesgo vital por polimedicación en pacientes con internaciones prolongadas.*  
> *Ambos problemas convergen en el fármaco: la misma droga que se custodia en el inventario es la que ingiere el paciente y genera interacciones.*  
> *Comenzamos en el panel general. En el extremo superior derecho hay un selector de roles para simular los perfiles de la institución; en este momento actuamos como el farmacéutico."*

#### Qué hacer en pantalla:
1. Señalar el selector de usuario en la barra superior. Dice **"Farm. Pérez ·
   Farmacéutico"**.
2. Recorrer con el cursor las **tres tarjetas de alerta**:
   - **Medicamentos bajo mínimo: 17.** Nombrar Risperidona, que es la que está
     bajo mínimo **con stock real** (10 de 30). Es el caso interesante: hay
     existencia y aun así no alcanza.
   - **Lotes por vencer: 1.** Tarjeta ámbar, *Clonazepam*, lote
     `CLO-2026-VENCE`, vence el **24/09/2026, en 15 días**.
   - **Consultas del día: 2.** `PAC-101` y `PAC-102`, una interacción cada una.
3. Hacer clic en **"Ir a control de stock →"**, al pie de la primera tarjeta.

> **Ojo con el número de consultas.** Dice **2** con la base recién sembrada, y
> sube con cada evaluación que se haga. Si se ensayó sin volver a sembrar, va a
> decir otra cosa: o se resiembra antes de empezar, o no se canta el número.

---

### Acto 2: Trazabilidad y Dispensación FEFO (01:00 - 02:45)

**Pantalla visible:** `/stock` (Stock).

#### Qué decir:
> *"Al ingresar a Stock observamos el saldo disponible por medicamento. En Verifarm los saldos nunca se guardan como un número fijo en la base de datos: se computan en tiempo real a partir del libro mayor de ingresos y egresos, eliminando cualquier posibilidad de desfasaje.*  
> *Veamos el caso de Haloperidol, un antipsicótico típico fundamental en la colonia."*

#### Qué hacer en pantalla:
1. **La tabla no tiene buscador y son 25 filas.** Haloperidol es la **duodécima
   en orden alfabético** y **queda debajo del pliegue** en la notebook: hay que
   bajar. Conviene tener el scroll hecho de antemano, o entrar directo por la
   URL del medicamento.
2. Clic en **"Ver lotes"**, el botón al final de la fila. **La fila en sí no es
   clickeable**; hacer clic sobre el nombre no hace nada.
3. Se abre `/stock/[id]` (*Lotes de Haloperidol*). Mostrar la tabla:
   - **Lote `HAL-2026-L1`:** 40 ampollas, vence el **15/11/2026**.
   - **Lote `HAL-2027-L2`:** 80 ampollas, vence el **15/09/2027**.
   - **Total disponible:** 120 ampollas.

> **Los dos lotes figuran como "Vigente".** No decir que el primero está
> "próximo a vencer": el indicador reserva ese estado para los que vencen dentro
> de los 30 días, y este vence dentro de dos meses. Lo que importa acá no es que
> esté por vencer, sino que **vence antes que el otro**.

#### Qué decir:
> *"Haloperidol tiene 120 ampollas disponibles repartidas en dos lotes de distinto vencimiento. En un sistema tradicional o FIFO saldría el que primero se compró, o el que el operador tenga más a mano.*  
> *En Verifarm la regla es FEFO: First Expired, First Out. Supongamos que sala 4 solicita una dispensación de 50 ampollas. El primer lote solo tiene 40; el sistema debe agotar esas 40 y tomar las 10 restantes del segundo lote automáticamente."*

#### Qué hacer en pantalla:
4. Clic en **"Dispensar"** (el botón azul, arriba a la derecha).
5. En el modal, **el único campo es la cantidad**: escribir `50`. No hay
   selector de lote —ese es el punto— ni campo de motivo.
6. **Detenerse acá, antes de confirmar.** El modal ya muestra el **plan de
   egreso**, y es la mejor prueba visual que tiene la demostración:

   > **Plan de egreso**
   > **40** del lote HAL-2026-L1, vence 15/11/2026
   > **10** del lote HAL-2027-L2, vence 15/09/2027
   > *Se reparte entre 2 lotes porque el primero no alcanza.*

#### Qué decir (con el plan a la vista, sin confirmar todavía):
> *"El sistema ya resolvió el reparto y lo muestra antes de ejecutarlo: cuánto sale de cada lote y por qué. El farmacéutico confirma una decisión que puede leer, no una caja negra."*

#### Qué hacer en pantalla:
7. Clic en **"Confirmar egreso"**. La tabla se actualiza sola:
   - **`HAL-2026-L1`:** **0** ampollas (agotado).
   - **`HAL-2027-L2`:** **70** ampollas.
   - **Encabezado:** 70 disponibles en lotes vigentes.
8. Clic en **"Movimientos"** en la fila de `HAL-2026-L1`. Se ve el asiento
   recién generado: **Egreso, −40, Farm. Pérez**, con su fecha y hora, encima
   del ingreso original de +40.

#### Qué decir:
> *"El sistema fraccionó el pedido sin intervención manual: 40 salieron del lote que vence antes y 10 del siguiente. Cada fracción generó un asiento con su usuario, su hora y su lote de origen. Y el historial no se edita ni se borra: un error se corrige con un movimiento nuevo, como en cualquier libro mayor."*

---

### Acto 3: Módulo Clínico y Detección de Interacciones (02:45 - 04:15)

**Transición de rol:**  
1. En la barra superior, abrir el selector y elegir **Dr. House · Médico**.  
2. Clic en la barra lateral en **"Pacientes"** (`/pacientes`).

#### Qué decir:
> *"Cambiamos al rol médico, y ese cambio no es decorativo: el usuario activo es el que queda asentado en cada movimiento y en cada consulta.*  
> *En internación psiquiátrica prolongada, los pacientes sostienen esquemas de polimedicación durante meses. Los pacientes se registran bajo un seudónimo sintético: el sistema no guarda nombre, documento ni fecha de nacimiento.*  
> *Ingresemos a la ficha del paciente `PAC-101`."*

#### Qué hacer en pantalla:
1. Clic en **"Ver ficha"** en la fila de `PAC-101`. **La fila tampoco es
   clickeable acá.**
2. En la ficha (`/pacientes/[id]`):
   - **Medicación de PAC-101:** `Tranilcipromina` (IMAO, desde 15/08/2026) y
     `Sertralina` (ISRS, desde 01/06/2026), ambas **Vigente**.
   - En la columna **INTERACCIONES**, las dos dicen **"Se evalúa"**. Esa columna
     no anticipa hallazgos: dice si la droga **se puede cruzar** contra la
     fuente. Es la distinción de la decisión `0012`, y conviene nombrarla ya acá.
3. Clic en **"Evaluar interacciones"**, arriba a la derecha.
4. Se abre `/consultas/nueva` con el paciente y **sus dos medicamentos vigentes
   ya cargados**. Al pie: *"Se cargaron los 2 medicamentos vigentes de PAC-101."*
5. Clic en el botón **"Evaluar interacciones"**.
6. **La consulta queda guardada en ese mismo acto** y la pantalla pasa
   directamente al resultado. **No hay un botón "Guardar consulta"**: evaluar es
   guardar, porque una evaluación clínica que se mira y se descarta no deja
   registro de lo que se revisó.
7. En el resultado se ve:
   - **1 interacción encontrada** · `Tranilcipromina + Sertralina` · chip
     **Severidad alta**.
   - El texto de la observación, **tal como se guardó el día de la consulta**:

     > *Sertralina + Tranilcipromina: interaccion de severidad alta.*
     > *Par de alta prioridad de la lista ONC: inhibidores selectivos de la recaptacion de serotonina (ISRS) (farmaco afectado) con inhibidores de la monoaminooxidasa (IMAO) (farmaco desencadenante). Entrada #8 de la lista.*
     > *Fuente: ONC High Priority List (Phansalkar et al., JAMIA 2012), via dbmi-pitt/public-PDDI-analysis.*

   - **Medicamentos evaluados:** Sertralina · Tranilcipromina.
   - Al pie, el aviso clínico: *"El sistema informa lo que hay registrado en su
     fuente y **no reemplaza el criterio profesional**."*

> **No atribuirle a la pantalla un cuadro clínico que no muestra.** El sistema
> **no dice** "síndrome serotoninérgico" ni "crisis hipertensiva", y es a
> propósito: ONCHigh no publica descripciones de severidad, y redactarlas
> nosotros sería inventar farmacología (decisión `0011`). El expositor puede
> explicar de viva voz por qué el par ISRS + IMAO es grave —eso es conocimiento
> propio, y queda claro que lo aporta él— pero **no leerlo como si estuviera en
> la observación**.

#### Qué decir:
> *"La detección no consulta APIs externas en vivo. Verifarm opera con una base local normalizada de 1150 pares de la lista ONC de alta prioridad, lo que garantiza un resultado determinístico, reproducible y disponible sin conexión.*  
> *Y noten qué es lo que el sistema afirma: que este par figura en la fuente, con qué severidad y de dónde salió. No redacta un cuadro clínico que la fuente no publica. Esa contención es deliberada."*

#### El contraste que sostiene todo el módulo (`PAC-103`):
8. Volver a `/pacientes`, entrar a **`PAC-103`** (Clonazepam + Risperidona) y
   clic en **"Evaluar interacciones"**.
9. **Detenerse antes de evaluar.** En la pantalla de selección, cada droga ya
   viene marcada con **"la fuente no tiene datos de esta droga"**, y al pie
   aparece el aviso:

   > *"2 de los medicamentos elegidos no se van a poder cruzar. El resultado no
   > va a decir nada sobre esas drogas, ni siquiera que estén bien."*

10. Evaluar igual. El resultado muestra las dos cosas juntas: *"No se
    encontraron interacciones registradas"* **y** el bloque ámbar *"Sin datos en
    la fuente: no se pudo revisar esta droga"*, cerrado con *"El resultado de
    arriba no dice nada sobre estas drogas: no que estén bien, sino que no se
    revisaron."*

#### Qué decir:
> *"Este es el punto que más nos importa del módulo. 'No se encontraron interacciones' y 'no hay datos para revisarlo' son dos cosas distintas, y confundirlas es el peor error que un sistema como este puede cometer: le daría al médico una tranquilidad que nadie verificó.*  
> *Por eso la advertencia aparece antes de evaluar, y el resultado nunca dice 'sin interacciones' a secas cuando hay drogas que no se pudieron cruzar."*

---

### Acto 4: Síntesis de Arquitectura y Cierre (04:15 - 05:00)

**Pantalla:** Volver a `/` (Inicio).

#### Qué decir:
> *"Para cerrar, destacamos tres decisiones de ingeniería que sustentan el proyecto:*  
> *Primero: **arquitectura en tres capas desacopladas**. Los componentes visuales solo consumen endpoints REST; los endpoints validan la forma de la entrada con esquemas Zod; y la lógica de negocio —FEFO, cálculo de saldos y cruce de interacciones— vive en servicios de TypeScript que no conocen HTTP ni Next.js.*  
> *Segundo: **independencia operativa**. Sin bibliotecas de componentes externas, sin dependencias de APIs pagas que puedan fallar en la defensa, y con PostgreSQL en Docker sobre el puerto 5433. Todo corre local.*  
> *Tercero: **el sistema asiste, no decide**. Aporta trazabilidad y memoria farmacológica, pero la decisión médica y de dispensación permanece siempre en el profesional. Y cuando no sabe algo, lo dice.*  
> *Quedamos a disposición del jurado para sus preguntas. Muchas gracias."*

---

## 4. Respuestas Rápidas ante Contingencias durante la Demo

- **Si el jurado pregunta por qué no hay login:**  
  *«El prototipo priorizó el núcleo de valor: FEFO, stock por lote y soporte clínico. La autenticación está fuera del alcance por decisión, registrada en `docs/ROADMAP_PRODUCTO.md`; el selector de usuario simulado permite ensayar los perfiles, y el usuario activo sí queda asentado en cada movimiento.»*
- **Si el jurado pregunta por qué FEFO y no FIFO:**  
  *«En medicamentos, la fecha de ingreso al depósito es irrelevante para la seguridad del paciente. Lo que previene el desperdicio y el riesgo sanitario es consumir siempre el lote cuya vida útil expira antes, independientemente de cuándo llegó.»*
- **Si el jurado pregunta qué pasa si se cae internet:**  
  *«El sistema corre 100% local. El catálogo, los lotes y las 1150 interacciones residen en PostgreSQL en Docker. No requiere conexión para operar.»*
- **Si el jurado pregunta por qué casi todo el stock está en cero:**  
  *«Es el conjunto de datos de demostración: se cargaron lotes solo para los fármacos que participan del recorrido. Los 17 bajo mínimo son consecuencia de eso, no un estado de la institución.»*
- **Cómo reiniciar la base si algo sale mal durante un ensayo:**

  ```bash
  npx prisma db seed
  ```

  Borra todas las tablas y vuelve a cargar los 25 fármacos, las 1150
  interacciones, los lotes de Haloperidol (40 y 80) y los cuatro pacientes,
  exactamente como al inicio. **No sirve `npm run setup`**, que solo regenera el
  cliente de Prisma.

---

## 5. Registro del ensayo (tarea 6.09)

**Fecha:** 2026-09-09 · **Base:** cargada desde cero con `npx prisma db seed` ·
**Resolución:** 1366×768, la de la notebook de la defensa.

### El recorrido funciona entero

Se ejecutaron los cuatro actos contra el sistema corriendo. **Lo sustantivo se
cumple**: el reparto FEFO de 50 ampollas dejó 0 y 70 como promete el guion, el
par Sertralina + Tranilcipromina se detecta con severidad alta, el contraste de
`PAC-103` distingue "sin datos" de "sin interacciones", y el rol elegido en el
selector queda asentado en el libro mayor —se verificó dispensando como Dr.
House y leyendo el asiento—.

### Lo que el ensayo corrigió

Doce afirmaciones del guion no coincidían con la pantalla. Las que más costaban:

1. **`npm run setup` no resetea la base.** Solo regenera el cliente de Prisma.
   Estaba escrito como el comando de emergencia durante la defensa: si algo
   fallaba, el comando de rescate no rescataba nada.
2. **La observación no menciona síndrome serotoninérgico ni crisis
   hipertensiva.** El guion se lo atribuía a la pantalla. La fuente no publica
   descripciones (decisión `0011`) y el sistema no las inventa.
3. **Los usuarios son "Farm. Pérez" y "Dr. House"**, no "Ana Clara Benítez" ni
   "Gregory House".
4. **No existe el botón "Guardar consulta".** Evaluar guarda.
5. **El botón es "Dispensar"**, no "Registrar egreso", y el modal **no tiene
   campo de motivo**.
6. **Las filas de las tablas no son clickeables**: se entra por "Ver lotes" y
   "Ver ficha".
7. **La columna de la ficha dice "Se evalúa"**, no "Posible interacción".
8. **El texto del aviso clínico** citado no era el real.
9. **Las consultas del día son 2**, no 3.

### Lo que el ensayo agregó

- **El plan de egreso se ve antes de confirmar**, con el reparto y la razón
  escrita. Es la mejor prueba de FEFO y el guion se la salteaba.
- **La advertencia de cobertura de `PAC-103` aparece antes de evaluar**, que es
  más fuerte que verla después.
- **El asiento del libro mayor** con usuario y hora, que respalda la frase sobre
  trazabilidad en vez de dejarla como afirmación.

### Dos cosas que el equipo debería mirar

**No hay ningún paciente que muestre "sin interacciones" con cobertura real.**
`PAC-104` es Amoxicilina + Paracetamol y **las dos tienen cero cobertura**, así
que da "sin datos", igual que `PAC-103`. De los tres estados posibles, la demo
muestra dos. Para el tercero hace falta un par cubierto que no interactúe: sirve
**Carbamazepina + Fluoxetina**, verificado contra la base. Se arma a mano desde
`/consultas/nueva` si el jurado lo pide.

**16 de los 25 medicamentos están en cero.** La pantalla de stock se lee como un
sistema sin cargar. Hay una respuesta preparada arriba, pero se resuelve mejor
en el seed.
