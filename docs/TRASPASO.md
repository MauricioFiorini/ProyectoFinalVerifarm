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
**Rama:** `feat/5.08-redaccion-de-la-observacion` (**sin mergear**)

### Qué se hizo

**La 5.08: el texto de la observación**, en `src/lib/redaccion/`. Es lo que lee
el médico cuando el sistema detecta una interacción, y lo que la 5.09 va a
guardar en `ObservacionInteraccion.descripcion`.

| Archivo | Qué |
| --- | --- |
| `tipos.ts` | `DatosDeObservacion` y el tipo `Redactor` |
| `plantilla.ts` | La implementación vigente |
| `index.ts` | **El punto de cambio.** Todo el sistema importa de acá |

### La forma del texto: tres líneas, y solo una es nuestra

```
Escitalopram + Haloperidol: interaccion de severidad alta.     <- la plantilla
Ambos farmacos prolongan el intervalo QT. Par de alta          <- la fuente
prioridad de la lista ONC; las drogas provienen de la lista
de riesgo conocido de torsades de pointes de CredibleMeds.
Fuente: ONC High Priority List (Phansalkar et al., JAMIA       <- la fuente
2012), via dbmi-pitt/public-PDDI-analysis.
```

**Solo la primera línea es texto escrito por nosotros.** Las otras dos se copian
tal como vinieron. Esa separación no es estética: es la que permite decir en la
defensa que el sistema **no interpreta** información clínica, la transporta.

Lo que la plantilla no hace, y no es que falte: no dice qué hacer, no sugiere
suspender ni ajustar nada, y no explica ningún mecanismo que la fuente no
explique. Con ONCHigh eso significa que muchas observaciones nombran clases de
fármacos y no consecuencias — limitación de la fuente, declarada en la decisión
`0011`. Taparla escribiendo la consecuencia de memoria sería inventar.

### Por qué es una interfaz y no una función suelta

`docs/CONTEXTO.md` sección 3 dice que el texto **no lo genera un modelo de
lenguaje**. El motivo no es que un modelo no sirva: es que no puede haber una
clave de API que falle el día de la defensa, y no hay presupuesto para una.

Así que la puerta queda abierta sin pagar nada por adelantado. Quien quiera
enchufar un modelo escribe otro `Redactor` y **cambia una línea en `index.ts`**.
El resto del sistema solo conoce el tipo.

`Redactor` es sincrónico a propósito. Si algún día entra una implementación que
consulta un modelo, ese cambio de forma tiene que ser visible y discutido, no
colarse detrás de un `await` que ya estaba.

### Dos detalles chicos que están decididos

**Las dos drogas se ordenan alfabéticamente.** Podrían salir en el orden en que
vienen —que es el del RxCUI, porque así está guardado el par—, pero ese orden es
un número interno y en pantalla se leería como arbitrario. Alfabético es igual
de determinista y además se entiende. Verificado con acentos.

**La puntuación se normaliza.** Las descripciones de la fuente vienen redactadas
por personas distintas: algunas cierran con punto y otras no. Sin normalizar, el
texto final queda despareja según de qué fila venga.

### Cómo verificarlo

Script descartable, **21 casos, todos dan lo esperado**.

| Bloque | Qué se probó |
| --- | --- |
| Forma | tres líneas; nombra las dos drogas; dice la severidad; copia la descripción; cita la fuente |
| Orden | invertir la entrada da el mismo texto; alfabético; **con acentos** (Á antes que B) |
| Puntuación | no duplica el punto; colapsa espacios; respeta `?` y `!` |
| Casos borde | descripción vacía y fuente vacía **no dejan líneas colgadas**; las tres severidades; nombre largo |
| **Datos reales** | los tres pares que devuelve el motor para un esquema de cinco drogas |

Ese último bloque es el que importa: el texto se generó sobre las filas que ya
están cargadas en `Interaccion`, no sobre datos inventados para la prueba.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La 5.09 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14 pide comprobar que la rama aporta el archivo
de la tarea. Acá tiene que listar los tres de `src/lib/redaccion/`:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.08-redaccion-de-la-observacion
```

Es el mismo chequeo que habría evitado perder el motor de la 5.06.

### Qué sigue

**La 5.09 se destraba con esto, y es la que abre todo lo demás.**

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.09** | L | `src/services/consultas.ts`: crear consulta, generar observaciones y persistir, **en transacción** |
| **5.07** | S | Que una consulta con menos de dos medicamentos sea un error explícito |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

De la 5.09 cuelgan los route handlers, las pantallas de paciente y de consulta, y
la **6.06**, que es el seed con el que se hace la demostración.

**La 5.07 conviene hacerla antes que la 5.09**, aunque no la bloquee: la 5.09 va
a necesitar esa validación al crear la consulta, y si no existe la va a escribir
igual, en el lugar equivocado.

**Si trabajan dos en paralelo: 5.09 con 6.02, o 5.09 con 6.04.** Van por carpetas
distintas. **La 5.03 no se toma:** quedó sin efecto por la decisión `0012`.

### Antes de arrancar, tener en cuenta

- **El texto de la observación se compone con `redactarObservacion`**, importado
  de `src/lib/redaccion`. Nunca desde `plantilla.ts` directo.
- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial. `listarMedicacionVigente`, no `listarMedicacionDePaciente`.
- **`ordenarParRxcui` normaliza los pares.** Está en `src/lib/rxcui.ts`.
- **`rxcuisConCobertura` no es opcional para las pantallas.** Sin ella, "sin
  datos" se muestra como "sin interacciones". Las tareas 5.13, 5.16 y 5.18 ya lo
  dicen en el roadmap, con el texto que tiene que ver el usuario en cada caso.
- **Ningún dato clínico se inventa.**
- **Todas las interacciones tienen severidad `ALTA`.** La fuente no publica una
  escala. La 5.18 va a mostrar un solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Si falta aplicar la migración de la 5.04:** `npx prisma migrate dev` y
  después `npm run setup`.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
