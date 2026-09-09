# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `feat/5.17-precarga-del-paciente` (**sin mergear**)

### Qué se hizo

**La 5.17: la precarga del paciente.** Desde la ficha, "Evaluar interacciones"
ahora abre la consulta con la medicación vigente ya cargada.

| Archivo | Qué |
| --- | --- |
| `src/app/consultas/nueva/NuevaConsulta.tsx` | La precarga |
| `src/app/consultas/nueva/page.tsx` | El `<Suspense>` que pide `useSearchParams` |
| `src/app/pacientes/[id]/MedicacionDelPaciente.tsx` | El enlace pasa `?pacienteId=` |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### Tres reglas de la precarga

**Se cargan las vigentes, no el historial.** Una droga suspendida ya no la toma
el paciente, y evaluarla daría un aviso por una interacción que no puede
ocurrir. Se pide sin `incluirNoVigentes`, que es el defecto del endpoint.
Comprobado: un paciente con tres vigentes y una suspendida precarga tres.

**Elegir un paciente REEMPLAZA la selección, no la suma.** Si se agregara
encima, pasar de un paciente a otro dejaría mezcladas las drogas de los dos y
nadie lo notaría hasta leer el resultado. Comprobado cambiando de PAC-001 a
PAC-002: quedan solo las de PAC-002.

**Quitar el paciente NO borra los medicamentos.** Quedan como lista suelta. Es
lo que hace el médico de guardia que arranca de un esquema y lo modifica;
borrarlos lo obligaría a rearmar todo.

En los tres casos la pantalla dice qué pasó, y el cartel desaparece apenas se
agrega o se quita algo a mano: dejarlo diciendo "se cargaron los 3 de PAC-001"
cuando ya no es cierto sería peor que no decir nada.

### El `<Suspense>` no es decorativo

`NuevaConsulta` usa `useSearchParams` para leer `?pacienteId=`, y sin un límite
de suspenso Next no puede prerenderizar la página. El respaldo es una línea
porque la espera es de milisegundos y un esqueleto completo parpadearía más de
lo que ayuda.

### Tres errores de concordancia que se corrigieron

Los tres se vieron **leyendo la pantalla**, no compilando, y los tres estaban en
frases donde más importa que se entienda:

| Decía | Dónde |
| --- | --- |
| "esa droga… ni siquiera que **estén** bien" | El aviso de la 5.16 |
| "esta droga: no que **estén** bien… no se **revisaron**" | El resultado de la 5.18 (corregido ayer) |
| "Se cargaron **los 1 medicamentos** vigentes" | El cartel de precarga, nuevo |

Singular y plural mezclados. Un texto así se lee como armado sin mirar, y esta
pantalla ya pide bastante confianza. Los tres casos ahora están escritos por
separado.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`:

| Qué | Resultado |
| --- | --- |
| Entrar con `?pacienteId=` de un paciente con 3 vigentes y 1 suspendida | Precarga **3**, no 4 |
| El cartel | "Se cargaron los 3 medicamentos vigentes de PAC-001. Se pueden quitar o agregar otros." |
| Con un paciente de una sola droga | "Se cargó **el único** medicamento vigente de PAC-002." |
| Las marcas de cobertura | Vienen con la precarga: la droga sin RxCUI ya sale marcada |
| Quitar el paciente | Los medicamentos **quedan**; el cartel desaparece |
| Elegir otro paciente | **Reemplaza** la lista |
| Consola | Solo los 404 disparados a propósito |

Los datos de prueba **se borraron**: 0 pacientes, 0 consultas, los 10
medicamentos del seed y las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **El aviso clínico está como texto chico al pie**, repetido en varias
  pantallas. Formalizarlo es la **5.19**, la última de la fase.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.17-precarga-del-paciente
```

### Dónde está el proyecto

```
Fase 5 — módulo clínico ....  19 de 21   (la 5.03 quedó sin efecto)
Fase 6 — cierre ...........    1 de 10
```

**Falta una sola tarea de la fase 5.**

### Qué sigue

**La 5.19**, tamaño S, y con eso la fase 5 queda cerrada.

El texto ya existe, repetido al pie de las pantallas clínicas: *"El sistema
informa lo que hay registrado en su fuente. No reemplaza el criterio
profesional."* Lo que falta es que sea **un componente y no cuatro copias**, y
que esté en todas las pantallas clínicas: `/pacientes`, `/pacientes/[id]`,
`/consultas`, `/consultas/nueva` y `/consultas/[id]`.

**Es candidata a un sexto componente en `src/components/ui/`**, y esta vez la
regla se cumple sola: lo necesitan cinco rutas distintas.

Después queda **la fase 6 entera menos la 6.01**. De esas, la que no se puede
recortar es la **6.06**, el seed definitivo: hoy el catálogo cruza con **una
sola** interacción (decisión `0012`), y sin datos que disparen hallazgos no hay
demostración.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **"Sin interacciones" y "sin datos" no se pueden ver igual.** Es la regla que
  atraviesa todo el módulo (decisión `0012`).
- **Las interacciones se evalúan sobre la medicación VIGENTE.**
- **La `evaluabilidad` viene resuelta del servidor.**
- **El texto de la observación viene guardado**, no se recompone al mostrar. La
  cobertura sí se recalcula al releer (decisión `0014`).
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
