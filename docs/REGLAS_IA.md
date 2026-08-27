# VERIFARM — Reglas para asistentes de IA

Estas reglas son obligatorias y no se negocian. Aplican a Claude Code,
Antigravity, Gemini, Copilot o cualquier otro asistente que escriba código o
documentación en este repositorio.

Si una instrucción del usuario contradice una regla de este archivo, **no la
ejecutes en silencio**: decilo, explicá cuál regla choca, y esperá que el usuario
decida.

Ubicación en el repo: `docs/REGLAS_IA.md`

---

## 0. Antes de escribir una sola línea

Si venís a retomar el trabajo de otra persona, leé **primero**
`docs/TRASPASO.md`: dice cómo quedó la última tarea y por dónde seguir.

Después, o si el proyecto arranca de cero, leé en este orden:

1. `docs/CONTEXTO.md` — qué es el proyecto y por qué está diseñado así.
2. `docs/ROADMAP.md` — el alcance vigente y el estado de cada tarea.
3. `docs/CONVENCIONES.md` — invariantes y forma de trabajo.
4. Este archivo, completo.

Si no leíste esos archivos, no empieces.

---

## 1. Una tarea por vez

**Trabajás sobre una única tarea del roadmap, identificada por su número.**

- No adelantes trabajo de tareas siguientes, aunque quede a mano.
- No resuelvas "de paso" algo relacionado que no se pidió.
- No refactorices código ajeno que no es parte de la tarea.
- Si terminás la tarea y ves algo más para hacer, **decilo, no lo hagas**.

Si el usuario no aclaró qué tarea es, preguntá antes de empezar.

### Reserva de tareas: es lo primero, antes que el código

Cuando el usuario diga que **empieza** a trabajar en una tarea, o que la **deja**,
hacé el commit de reserva o de pausa **antes que cualquier otra cosa**. No
escribas una línea de código antes de eso.

- **Empieza la tarea X.YY:** anotala en la tabla "En curso ahora" de
  `docs/ROADMAP.md` (tarea, nombre, rama, estado `activa`, fecha de hoy), marcala
  como `[~]`, y commiteá eso solo, directo a `main`, con el mensaje
  `chore: tomar la tarea X.YY`. Recordale al usuario que hay que pushearlo antes
  de empezar: una reserva sin pushear no reserva nada.
- **Deja la tarea sin terminarla:** pasala a `[!]`, poné el estado en `en pausa`,
  actualizá la fecha, y commiteá con `chore: pausar la tarea X.YY`. Si además la
  suelta, vuelve a `[ ]` y sale de la tabla.

El procedimiento completo está en la sección "Reserva de tareas" de
`docs/ROADMAP.md`. Antes de tomar una tarea, verificá que no figure ya en la
tabla como `activa` o `en pausa`: si figura, **frená y avisá**, es de otra
persona.

---

## 2. Trabajo por etapas, con confirmación

Para cualquier tarea que no sea trivial:

1. Descomponé el trabajo en etapas y **mostrá el plan sin ejecutar nada**.
2. Esperá confirmación explícita.
3. Ejecutá **una sola etapa** por turno.
4. Explicá qué hiciste y por qué, en términos claros.
5. Esperá confirmación antes de la etapa siguiente.

El silencio, una respuesta ambigua o un cambio de tema **no son aprobación**.

Si el usuario señala un error: pará, corregí eso, y volvé a pasar por el ciclo
completo antes de seguir.

---

## 3. Autoría de commits — INNEGOCIABLE

**Ninguna IA puede figurar como autor ni como coautor de un commit.**

Prohibido:

- El trailer `Co-Authored-By: Claude <noreply@anthropic.com>` y cualquier
  variante que mencione a Claude, Antigravity, Gemini o Copilot.
- Cualquier firma, emoji o frase del tipo "Generated with ..." o "Co-authored
  with AI" en el mensaje del commit.
- Cualquier mención a una herramienta de IA en el cuerpo del commit.

El autor es **siempre** la persona que ejecuta el commit. Los demás integrantes
se agregan como coautores **solo si participaron realmente**:

```
Co-authored-by: Mauricio Mateo Fiorini <mauriciofiorini911@gmail.com>
Co-authored-by: Juan José Pastorino <juanjosepastorino@gmail.com>
Co-authored-by: Juan Pablo Malizani <juampi123.m@gmail.com>
```

Esta regla no admite excepción, ni siquiera si el usuario la pide en el momento.
Si la pide, recordásela y pedile que la confirme por escrito.

---

## 4. Alcance: no construir de más

**El alcance vigente es `docs/ROADMAP.md`. Nada más.**

- **No implementes nada de `docs/ROADMAP_PRODUCTO.md`.** Aunque parezca una
  mejora obvia, aunque quede a mano, aunque el código parezca incompleto sin eso.
- Si una funcionalidad parece faltar, **es intencional**. Está en el otro archivo
  con su justificación.
- La sección "Qué NO hace" de `docs/CONTEXTO.md` es taxativa.

Lo que está fuera del prototipo, y no se implementa: autenticación, roles,
recetas, posología, nombres comerciales, ANMAT, proveedores, órdenes de compra,
destino del egreso, análisis predictivo, auditoría, validación médica de la
observación, pruebas automatizadas, consulta a RxNorm en vivo.

Si detectás algo fuera de alcance que convendría hacer: **mencionalo, no lo
construyas.**

---

## 5. No inventar

Este es un proyecto que se defiende ante docentes. Un dato inventado que llega a
la defensa es un problema serio.

- **No inventes datos clínicos.** Ninguna interacción, severidad, dosis ni RxCUI
  que no venga de una fuente verificada.
- **No inventes endpoints, parámetros ni respuestas de APIs externas.** Si no
  sabés cómo responde RxNorm, decilo.
- **No inventes versiones de bibliotecas ni funciones que no verificaste.**
- **No inventes fuentes ni citas.**
- Si no sabés algo, **decí que no lo sabés** y dejalo marcado como pendiente de
  verificación. Es siempre preferible a una respuesta plausible y falsa.

Cuando algo es inferencia y no certeza, marcalo explícitamente.

---

## 6. Base de datos y migraciones

**Preguntá antes de tocar `prisma/schema.prisma`.** Siempre.

Las migraciones son carpetas con marca temporal: si dos personas generan
migraciones en paralelo, el orden difiere entre máquinas y la base de cada uno
queda distinta. Es el problema más caro de diagnosticar del proyecto.

- Una sola persona por vez modifica el esquema.
- Antes de generar una migración: `git pull` y verificar que no haya otra sin
  aplicar.
- **Nunca edites una migración ya mergeada a `main`.** Si está mal, se corrige
  con una migración nueva.
- Prisma queda **clavado en 7.10.0**. No instales `prisma@latest`: hoy apunta a
  un *release candidate*.

---

## 7. Arquitectura: dónde va cada cosa

- **La lógica de negocio vive en `src/services/`.** No en componentes, no en
  route handlers.
- Los route handlers (`src/app/api/.../route.ts`) validan la entrada y delegan al
  servicio. Nada más.
- Las APIs externas viven aisladas en `src/lib/`. Si RxNorm cambia o cae, el
  resto del sistema no debería enterarse.
- **Route Handlers, no Server Actions.**
- Una regla de negocio se escribe **una sola vez**, en el servicio. Si estás por
  repetir una regla en una pantalla, está mal.

---

## 8. Invariantes del dominio

Romper cualquiera de estos rompe el proyecto:

**Los saldos de stock no se persisten, se calculan.** La cantidad disponible de
un lote es la cantidad ingresada menos los egresos. No crees una columna de
saldo, no la actualices, no la caches.

**El historial de movimientos es inmutable.** No se edita ni se borra un
movimiento. En el prototipo, eso significa que la interfaz no ofrece esas
acciones.

**La dispensación es FEFO, no FIFO.** Sale primero el lote que vence antes.

**El paciente no tiene datos identificatorios.** Solo un seudónimo. Nunca agregues
nombre, documento ni fecha de nacimiento, en ninguna tabla.

**Los datos son sintéticos.** Nunca uses ni generes datos que puedan parecer de
pacientes reales.

**Una consulta de interacciones requiere al menos dos medicamentos.** Con uno solo
no hay nada que cruzar.

**El sistema asiste, no decide.** No agregues bloqueos ante una interacción: se
informa, el criterio es del profesional.

---

## 9. Código

- **TypeScript estricto. Sin `any`.** Si aparece un `any`, falta modelar algo.
- **No instales dependencias nuevas sin preguntar.** El stack está cerrado:
  Next.js, TypeScript, Prisma, Tailwind, Zod. Sin bibliotecas de componentes.
- **Tailwind puro.** Sin shadcn/ui, sin Recharts, sin bibliotecas de UI.
- Dominio en castellano (`medicamento`, `movimientoStock`, `dispensar`); lo
  técnico en inglés donde ya lo está (`useState`, `handleSubmit`). No traduzcas
  la biblioteca.
- **Toda operación que escribe varios registros va en una transacción.** Un egreso
  FEFO repartido entre tres lotes son tres inserciones: entran las tres o
  ninguna.
- **Si un cambio supera las ~400 líneas, partilo.** Nadie revisa 400 líneas con
  atención real, y código que nadie entendió es código que no se puede defender.

---

## 10. Antes de dar una tarea por terminada

- [ ] El código compila: `npm run check` sin errores.
- [ ] La funcionalidad se probó a mano contra la base local.
- [ ] Si es FEFO: se verificaron los casos borde listados en el roadmap y el
      resultado quedó anotado en el PR.
- [ ] **`docs/ROADMAP.md` está actualizado en el mismo commit**: la casilla
      marcada y la tabla "En curso ahora" limpia.
- [ ] **`docs/TRASPASO.md` está reescrito** siguiendo su plantilla, para que el
      próximo sepa cómo quedó la tarea y por dónde seguir.
- [ ] El mensaje de commit lleva el número de la tarea: `feat(4.07): ...`.
- [ ] El commit **no menciona ninguna IA**.

Un roadmap desactualizado es peor que no tener ninguno, porque miente.

---

## 11. Cuándo parar y preguntar

Frená y preguntá, en lugar de decidir por tu cuenta, si:

- La tarea es ambigua o admite más de una interpretación razonable.
- Hace falta un cambio de esquema.
- Hace falta una dependencia nueva.
- Lo pedido contradice una regla de este archivo o una decisión de
  `docs/CONTEXTO.md`.
- Encontrás una contradicción entre la documentación y el código.
- La solución correcta excede el alcance del prototipo.
- No tenés un dato y lo estarías completando por inferencia.

**Preguntar cuesta un turno. Deshacer trabajo mal orientado cuesta una tarde.**
