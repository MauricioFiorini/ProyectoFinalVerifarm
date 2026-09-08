# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-08
**Entrega:** Mauricio Mateo Fiorini
**Ramas:** `feat/6.01-layout-y-navegacion` y `feat/5.01-servicio-de-pacientes`
(**ninguna mergeada**; la segunda está apilada sobre la primera y se mergean en
ese orden)

### Qué se hizo

| Tarea | Qué dejó |
| --- | --- |
| 6.01 | Layout general con barra lateral, y pantalla de inicio provisoria |
| 5.01 | `src/services/pacientes.ts` |
| — | **Sondeo de ONCHigh**, que no es una tarea del roadmap pero cambia el plan |

### 6.01 — Layout

Barra a la izquierda con las cinco secciones, resaltando la abierta; en pantalla
angosta pasa arriba en fila. Vive en `src/components/layout/`, carpeta nueva:
los cuatro de `src/components/ui/` son primitivas y la barra no lo es.

**Pacientes y Consultas figuran pero no son enlaces.** Esas pantallas son la
5.11 y la 5.20; un enlace daría 404. Van en gris con la etiqueta **Pendiente**.
Cuando existan, se les saca `pendiente: true` de `SECCIONES` y listo.

**Se borró la plantilla de `create-next-app`.** Lo que quedó **no es la 6.03**:
no consulta la base, no tiene tarjetas, y lo aclara en pantalla.

### 5.01 — Servicio de pacientes

`listarPacientes`, `buscarPacientesPorSeudonimo`, `obtenerPacientePorId` y
`crearPaciente`. Sigue la forma de `medicamentos.ts`: el servicio no sabe que
existe HTTP y lanza `ErrorDeNegocio` cuando la operación rompe una regla.

Tres reglas que conviene conocer:

**El seudónimo se normaliza con `trim()` antes de comparar y de guardar.** Un
espacio invisible al final produciría dos fichas para la misma persona sin que
nadie note la diferencia en pantalla.

**El duplicado se busca sin distinguir mayúsculas.** El `@unique` del esquema sí
las distingue, así que `PAC-001` y `pac-001` entrarían los dos. La comparación
insensible está en el servicio.

**Un seudónimo que sea 7 u 8 dígitos pelados se rechaza.** Casi seguro es un DNI
escrito en el campo equivocado, y el paciente no lleva datos filiatorios
(`docs/CONTEXTO.md` sección 3). La comprobación es a propósito estrecha:
`PAC-001`, `A-38123456` y `H12` pasan; lo único que corta es el número solo.
**Si al equipo le parece de más, se saca borrando `PARECE_DOCUMENTO`** — está
aislada justamente para eso.

Verificado contra la base con un script descartable: alta válida, normalización,
duplicado exacto, duplicado con otra caja, seudónimo corto, DNI de 7 y de 8
dígitos, tres seudónimos que sí tienen que pasar, orden del listado, búsqueda
insensible, búsqueda por id inexistente y paciente inactivo. **Los trece casos
dan lo esperado.**

### El sondeo de ONCHigh, y lo que encontró

Se hizo para decidir entre la **5.02** y la **5.03**, que es lo que pide la
decisión `0010`. Los archivos quedaron fuera del repo: cargarlos es la 5.02 y
todavía no está tomada.

**Lo que salió bien, y era el riesgo declarado:**

| | Resultado |
| --- | --- |
| Archivos | `ONC_High_Priority_Mapped.csv`, **1930 pares, 123 drogas** |
| Formato | `Nombre$DrugBankID$Nombre$DrugBankID$`. La primera droga es el **objeto**, la segunda el **precipitante** |
| **Mapeo DrugBank → RxCUI** | **123 de 123.** RxNav acepta `idtype=DRUGBANK` |
| Nivel ingrediente | 118 dan `TTY=IN` directo; las otras 5 lo dan en el segundo código que devuelve la consulta |

**El mapeo, que era el riesgo grande de la 5.02, no es un riesgo.** Resuelve
completo y automático.

**Lo que salió mal, y no estaba previsto:**

**ONCHigh no trae severidad ni descripción.** Verificado por tres caminos
distintos: la planilla original tiene cuatro columnas y ninguna es severidad; el
script de carga del proyecto original (`scripts/load-ONC-HighPriority-DDIs.py`)
lee exactamente esos cuatro campos; y en el conjunto combinado del repositorio
las 4031 filas de ONC tienen `effectConcept = None`.

Como la lista **entera** es de alta prioridad, lo honesto es cargar todo con
severidad `ALTA`. Eso deja la 5.18 —"ordenadas por severidad, con color según
ese valor"— con una sola categoría.

**Y el problema de verdad: el catálogo casi no se cruza con la fuente.**

| | |
| --- | --- |
| Medicamentos del seed presentes en ONCHigh | **4 de 10** (fluoxetina, sertralina, escitalopram, haloperidol) |
| Ausentes | paracetamol, ibuprofeno, amoxicilina, clonazepam, diazepam, risperidona |
| **Pares con las dos drogas en el catálogo** | **1** (haloperidol + escitalopram) |

O sea: se importan 1930 pares y la demostración encuentra **una** interacción.
La 6.06 pide "pacientes cuya medicación efectivamente dispara interacciones", y
con este catálogo no se puede.

**La fuente no es el problema; el catálogo sí.** ONCHigh está lleno de
psicofármacos: citalopram, clorpromazina, tioridazina, pimozida, los IMAO
(fenelzina, tranilcipromina), los tricíclicos, carbamazepina, metadona. Se probó
un catálogo de 20 drogas tomadas de la propia lista y da **47 pares distintos**.

Eso es lo que abre la **D9**. Los cuatro RxCUI que coinciden son además una
comprobación cruzada de la 2.11: los códigos que verificamos a mano coinciden
exactamente con los que RxNav devuelve por la vía de DrugBank.

### Qué quedó sin hacer

- **Las dos ramas sin mergear.** Primero la 6.01, después la 5.01.
- **La migración de `MedicacionVigente`.** Ver abajo.
- **La D9 sin decidir.**
- **La 5.02 y la 5.03 sin tomar.**
- **D8 sigue abierta.**

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`:

| Qué | Resultado |
| --- | --- |
| `/` | Barra a la izquierda, **Inicio** resaltado, sin rastro de la plantilla de Next |
| Clic en **Stock** y después en **Ver lotes** | En `/stock/[id]` la sección abierta sigue siendo Stock |
| **Pacientes** y **Consultas** | En gris, no clicables |
| 375 px | La barra pasa arriba; la tabla se desplaza dentro de su caja |
| Consola | Sin errores |

`npm run check` da 0 en las dos ramas.

### Qué sigue

1. **Decidir la D9.** Es lo que le da sentido a la 5.02: sin catálogo alineado,
   importar 1930 pares no cambia nada de lo que se ve.
2. **5.02** — importar ONCHigh. El mapeo ya se sabe que resuelve.
3. **La migración de `MedicacionVigente`**, y después **5.04** y **5.05**.
4. **5.06**, **5.07** y **5.08** — motor, validación y redacción.

La **5.03** ya no parece necesaria como red: la razón por la que existía era que
el mapeo pudiera fallar, y no falla. Conviene cerrarla explícitamente cuando se
resuelva la D9, no dejarla colgada.

### La migración que hace falta, y ya está decidida

`MedicacionVigente` hoy tiene `pacienteId`, `medicamentoId` y las marcas de
tiempo. **Nada más.** Cinco tareas piden campos que no existen: la 5.04
(suspender con motivo), la 5.05 (estado derivado de fechas y motivo), la 5.13
(mostrar fecha de inicio y estado), la 5.14 (modal con fecha de inicio) y la
5.15 (motivo obligatorio).

**Lo decidido el 2026-09-08:** se agregan `fechaInicio`, `fechaFin` y
`motivoSuspension`, y **se saca el `@@unique([pacienteId, medicamentoId])`**.

El `@@unique` se saca porque impide el historial: una droga suspendida y después
reiniciada son dos filas, no una sobrescrita. La regla "una sola vigente por
paciente y por droga" pasa al servicio. Es el mismo criterio del módulo de
stock, donde nada se reescribe.

**Esa migración todavía no se hizo.** Va antes de la 5.04.

### Antes de arrancar, tener en cuenta

- **Ningún dato clínico se inventa.** **Esto alcanza también a la 5.03:** "carga
  manual de 15 pares" no significa quince pares elegidos de memoria.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **Una consulta de interacciones necesita al menos dos medicamentos.**
- **El sistema asiste, no decide.**
- **`Interaccion` tiene `@@unique([rxcui1, rxcui2])`** y el par se ordena en
  código antes de insertarlo. Sin eso, `(A,B)` y `(B,A)` entran las dos. En
  ONCHigh esto importa: los pares vienen en las dos direcciones, con objeto y
  precipitante invertidos.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Las secciones nuevas se agregan en `SECCIONES`**, en
  `src/components/layout/BarraLateral.tsx`.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**La D9 bloquea el sentido de la 5.02**, no su ejecución: se puede importar
igual, pero conviene saber antes qué catálogo va a cruzarse contra esos datos.
D8 sigue abierta y no bloquea nada.
