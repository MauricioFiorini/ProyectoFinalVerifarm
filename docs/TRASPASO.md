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
**Todo mergeado a `main`.** PR #13 a #19. No queda nada sin integrar.

### Qué se hizo

**La 5.06: el motor de interacciones**, en `src/services/interacciones.ts`. Es
la pieza central del módulo clínico.

También se corrigió en el roadmap la dependencia de la tarea: decía **5.03**, y
esa tarea quedó sin efecto por la decisión `0012`. Los datos los pone la
**5.02**.

### Qué expone

| Función | Qué hace |
| --- | --- |
| `combinarPares(rxcuis)` | **Pura.** Todos los pares distintos de la lista, en orden canónico |
| `evaluarInteracciones(rxcuis)` | Las interacciones registradas entre esas drogas |
| `rxcuisConCobertura(rxcuis)` | Cuáles de esas drogas están en la fuente |

### Es determinístico, y eso no es un adorno

No consulta ninguna fuente externa, no usa un modelo de lenguaje y no depende de
la hora ni del orden en que le pasen las drogas. La misma lista devuelve siempre
el mismo resultado, y ese resultado se puede rastrear hasta la fila que lo
produjo y hasta la fuente que la cargó. **En un sistema que asiste una decisión
clínica, poder explicar por qué salió un aviso es parte del aviso.**

Se verificó explícitamente: tres órdenes de entrada distintos dan la misma
salida, y dos corridas contra la base dan la misma lista.

### La decisión de diseño que importa: una sola consulta, no N

Con N drogas hay N(N-1)/2 pares. Para un paciente con diez drogas, preguntarlos
de a uno serían 45 consultas. Se resuelve con **una**: las filas donde los dos
RxCUI están en la lista.

Esa forma tiene además una propiedad que la otra no tiene. **No depende de que
la tabla esté ordenada canónicamente.** Si una fila estuviera cargada como
(B, A), la consulta la encuentra igual, porque solo pide que los dos códigos
pertenezcan al conjunto. Preguntando par por par —`rxcui1 = a AND rxcui2 = b`—
esa fila se perdería **en silencio**.

Conviene ser preciso con esto, porque el traspaso anterior lo dejó más fuerte de
lo que corresponde: el orden canónico sigue siendo obligatorio **para que la
misma interacción no esté cargada dos veces**, y `ordenarParRxcui` se usa igual
para normalizar entrada y salida. Pero para *encontrar* una fila, esta consulta
no depende de él. Quien escriba una búsqueda par por par sí va a depender, y ahí
el riesgo vuelve.

### `rxcuisConCobertura`: por qué existe

Porque **"no se encontraron interacciones" y "no hay datos de esta droga" son
dos cosas distintas**, y mostrarlas igual sería el peor error de interfaz que
este sistema puede cometer.

ONCHigh no cubre todo el catálogo. El clonazepam, que es de los psicofármacos
más usados en la institución, **no está**. Evaluar un esquema con clonazepam y
decir "sin interacciones" da a entender que se lo revisó y está limpio, cuando
lo que pasó es que no había contra qué revisarlo.

Con esta función la pantalla puede distinguir los tres casos de la decisión
`0012`. **La 5.16 y la 5.18 tienen que usarla.**

### Cómo verificarlo

Script descartable, **26 casos, todos dan lo esperado**.

Sobre la función pura: lista vacía; una sola droga; dos drogas; orden canónico
del par; cuatro drogas dan seis pares; drogas repetidas no se cruzan consigo
mismas; y el determinismo con tres órdenes de entrada.

Contra la base: lista vacía; una sola droga (corta antes de consultar);
escitalopram + haloperidol da una; invertir la entrada da lo mismo; clonazepam +
paracetamol da cero; un RxCUI inexistente no rompe; ningún resultado involucra
una droga fuera de la lista; todos los pares salen en orden canónico; no hay
repetidos; y dos corridas dan la misma salida.

Sobre la cobertura: escitalopram y fenelzina cubiertos; clonazepam, paracetamol
y un código inventado no; y no devuelve drogas que no se preguntaron.

**El caso que vale la pena mirar** es un esquema de cinco drogas —escitalopram,
haloperidol, fenelzina, fluoxetina, clonazepam—, que devuelve **tres**
interacciones:

| Par | Por qué |
| --- | --- |
| escitalopram + haloperidol | Ambos prolongan el intervalo QT |
| escitalopram + fenelzina | ISRS con IMAO |
| fluoxetina + fenelzina | ISRS con IMAO |

Y el clonazepam no aporta ninguna, correctamente marcado como sin cobertura.
**Ese es el recorrido de la demostración del módulo clínico.**

`npm run check` da 0.

### Qué quedó sin hacer

- **La 5.07 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Lo que pasó al mergear, porque conviene que quede escrito

La 5.06 se abrió como rama desde `main` antes de que entraran la 5.04 y la 5.05.
Las tres tocan la tabla "En curso ahora" y este archivo, así que la tercera dio
conflicto.

Al resolverlo se mergeó el commit de **reserva** de la 5.06 (`chore: tomar la
tarea 5.06`) en lugar del commit con el código. Resultado: `main` quedó con todo
lo demás correcto —y `npm run check` daba 0, porque nada referenciaba al archivo
que faltaba— pero **sin `src/services/interacciones.ts`**. Se recuperó en esta
rama.

**Es el modo de falla que hay que conocer:** que el proyecto compile no
significa que esté completo. Un archivo que todavía no usa nadie se puede perder
en un merge sin que ninguna comprobación se queje.

Para la próxima, la forma de evitarlo es simple: **una tarea por vez hasta el
merge**, o si se abren varias, rebasar cada una sobre `main` antes de pedir el
PR. La tabla de reservas es una sola línea que todas quieren editar.

### Qué sigue

1. **5.07** — validar que una consulta necesita al menos dos medicamentos. Es de
   tamaño S, y el motor ya devuelve lista vacía con menos de dos: lo que falta es
   que sea un error explícito y no un resultado vacío silencioso.
2. **5.08** — la redacción de la observación por plantilla.
3. **5.09** — crear la consulta y persistir las observaciones, en transacción.

### Antes de arrancar, tener en cuenta

- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial. `listarMedicacionVigente`, no `listarMedicacionDePaciente`.
- **`ordenarParRxcui` normaliza los pares.** Está en `src/lib/rxcui.ts`.
- **`rxcuisConCobertura` no es opcional para las pantallas.** Sin ella, "sin
  datos" se muestra como "sin interacciones".
- **Ningún dato clínico se inventa.** Las descripciones cargadas dicen la clase,
  no el efecto, porque la fuente no publica el efecto (decisión `0011`).
- **Todas las interacciones tienen severidad `ALTA`.** La fuente no publica una
  escala. La 5.18 va a mostrar un solo color y está asumido. El motor ordena por
  severidad igual, porque el campo existe.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.** Ninguna función del motor bloquea nada.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **La migración de la 5.04 ya está en `main`.** Quien no la haya aplicado:
  `npx prisma migrate dev` y después `npm run setup`.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
