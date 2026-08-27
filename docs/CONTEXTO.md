# VERIFARM — Contexto del proyecto

Punto de entrada del repositorio. Explica **qué** estamos construyendo, **para
qué**, **por qué así**, **quiénes** y **cómo se trabaja**. Si alguien —persona o
asistente de IA— abre este repositorio por primera vez, empieza acá.

Ubicación en el repo: `docs/CONTEXTO.md`

---

## 1. Qué es

**Verifarm** es un sistema de gestión farmacéutica con dos módulos:

1. **Trazabilidad de stock por lote.** Registra el ingreso de medicación al
   depósito de farmacia, su egreso, y mantiene la trazabilidad de cada lote
   hasta que sale.
2. **Soporte a la decisión clínica.** Dado un conjunto de fármacos —los que toma
   un paciente, o una lista suelta— detecta interacciones medicamentosas y genera
   una observación en lenguaje comprensible para el médico.

Los dos módulos se tocan en un punto: `Medicamento`. Es la misma droga la que se
controla en inventario y la que se evalúa por interacciones. No son dos sistemas
pegados, es uno con dos salidas.

**Estado actual:** en construcción del prototipo. No hay código todavía.

---

## 2. Para qué

El destinatario es la **Colonia Psiquiátrica "Dr. Abelardo Irigoyen Freyre"**.
Dos problemas concretos de una institución de internación prolongada:

**Pérdida económica por vencimiento.** Medicación que caduca en el depósito
porque no había registro de qué lote debía salir primero. El sistema lo resuelve
con trazabilidad por lote y con **FEFO** (*First Expired, First Out*): cuando hay
varios lotes del mismo medicamento, sale primero el que vence antes, no el que
entró antes.

**Riesgo clínico por polimedicación.** Pacientes psiquiátricos sostienen esquemas
de cinco o más fármacos durante años. Cada prescripción nueva se suma a un
esquema que nadie revisa completo. El sistema cruza automáticamente la
medicación vigente y avisa cuando hay interacciones conocidas.

---

## 3. Por qué está diseñado así

Las decisiones que más extrañan a quien llega nuevo, y su motivo.

**El paciente no tiene nombre.** Solo un identificador seudonimizado. Los datos
de salud son datos personales sensibles (Ley 25.326, art. 8) y este es un trabajo
académico: no manipulamos datos reales. Todo lo que se carga es sintético.

**No hay recetas ni posología.** El sistema recibe una lista de fármacos a
evaluar. Si registrara la prescripción con dosis, pasaría a formar parte del acto
médico, con todo lo que eso implica. Fue una decisión explícita de alcance.

**Las interacciones viven en base propia, no en una API externa.** La *Drug
Interaction API* de RxNav —la fuente sobre la que se escribió la documentación
original del proyecto— **fue discontinuada por la NLM en enero de 2024**. No es
una caída: no volvió. RxNorm sigue operativo y se usa para normalizar nombres de
droga a RxCUI, pero la detección de interacciones se resuelve contra una tabla
propia, cargada desde una fuente pública y citable. Esto hace la detección
determinística, y por lo tanto verificable.

**El texto de la observación no lo genera un modelo de lenguaje.** Se compone por
plantilla, detrás de una interfaz que permite sustituir la implementación más
adelante. Sin presupuesto para una API de LLM, el sistema tiene que funcionar
igual. Que la explicación sea generada es deseable; que el sistema dependa de una
clave que puede fallar el día de la defensa, no.

**Los saldos de stock no se guardan, se calculan.** La cantidad disponible de un
lote es la cantidad ingresada menos los egresos. Persistir ese número sería
duplicar la verdad y garantizar que en algún momento quede desfasado.

**El historial de movimientos no se edita ni se borra.** Es un libro mayor. En el
prototipo eso se refleja en que la pantalla no ofrece esas acciones.

**El sistema asiste, no decide.** Ante una interacción no bloquea nada: informa.
El criterio clínico es del profesional.

---

## 4. Quiénes

Proyecto Final — Ingeniería en Sistemas de Información, UTN. Comisión 5K01, 2026.

- Fiorini, Mauricio Mateo (leg. 50475)
- Pastorino, Juan José (leg. 50469)
- Malizani, Juan Pablo (leg. 50917)

Tutora: Ing. Silvia Alicia Stortoni · Profesora: Valeria Aguzzi

Tres personas, tres máquinas, un repositorio compartido. El trabajo se reparte
**por módulo, no por tarea suelta**, para que dos personas no toquen los mismos
archivos en paralelo.

**El repositorio arranca de cero.** Hubo un repositorio anterior
(`MauricioFiorini/ProyectoFinal`) con otro modelo de datos y otro backlog. Quedó
descartado por decisión de equipo: no se migra nada de ahí —ni el esquema, ni el
backlog, ni las decisiones de arquitectura— y no es referencia para nada. El
repositorio vigente es `MauricioFiorini/ProyectoFinalVerifarm`.

---

## 5. Cómo

**Stack:** Next.js (App Router) · TypeScript estricto · PostgreSQL en Docker ·
Prisma 7.10.0 · Tailwind. Sin bibliotecas de componentes.

**Arquitectura en tres capas.** La lógica de negocio vive en `src/services/` y no
sabe que existe HTTP. Los *route handlers* en `src/app/api/` validan la entrada y
delegan. Las pantallas consumen la API. Una regla de negocio se escribe una sola
vez, en el servicio.

**Flujo de trabajo.** `main` siempre tiene que andar. Código en rama corta por
tarea, con revisión de otro antes del merge; documentación directo a `main`. El
esquema de Prisma lo toca **una sola persona a la vez**: dos migraciones en
paralelo rompen la base de todos.

**Autoría de commits.** Ninguna IA figura como autor ni coautor. El autor es la
persona que commitea; los otros integrantes se agregan como coautores solo si
participaron.

**Estado del proyecto.** Vive en `docs/ROADMAP.md`, no en la memoria de nadie. Se
actualiza en el mismo commit que completa la tarea.

---

## 6. Qué NO hace (y es a propósito)

Esta lista existe para que nadie —y ninguna IA— construya de más:

Sin autenticación ni roles · sin recetas ni posología · sin nombres comerciales
ni vademécum de ANMAT · sin proveedores ni órdenes de compra · sin destino del
egreso · sin análisis predictivo (solo puntos de corte por stock bajo y
vencimiento próximo) · sin auditoría implementada · sin registro de la validación
médica de la observación · sin pruebas automatizadas · sin consulta a RxNorm en
vivo.

**Cada una de estas ausencias es una decisión, no un olvido.** Todas están
registradas en `docs/ROADMAP_PRODUCTO.md` con su justificación, para retomarlas
después del prototipo.

---

## 7. Dónde está cada cosa

| Ruta | Qué contiene |
|---|---|
| `CLAUDE.md` (raíz) | Puntero de arranque para el asistente de IA. |
| `docs/CONTEXTO.md` | Este archivo. Por qué el proyecto es como es. |
| `docs/ROADMAP.md` | **Alcance vigente.** Qué falta, qué está hecho, quién está en cada cosa. |
| `docs/ROADMAP_PRODUCTO.md` | Lo que quedó fuera del prototipo. **No se implementa.** |
| `docs/TRASPASO.md` | Cómo quedó la última tarea y por dónde seguir. Lo primero que lee quien retoma. |
| `docs/CONVENCIONES.md` | Invariantes, política de ramas, autoría de commits, convenciones de código. |
| `docs/REGLAS_IA.md` | Reglas obligatorias para asistentes de IA. |
| `docs/decisiones/` | Decisiones de arquitectura y su porqué. Append-only. |
| `prisma/schema.prisma` | Modelo de datos, derivado del modelo de dominio en UML. |

---

## 8. Glosario

**FEFO** — *First Expired, First Out*. Sale primero el lote que vence antes, no
el que entró antes (eso sería FIFO). Es lo que evita el desperdicio.

**RxNorm / RxCUI** — Estándar de la Biblioteca Nacional de Medicina de EE.UU. que
asigna un identificador único a cada principio activo. Permite hablar de la misma
droga sin ambigüedad entre sistemas.

**Polimedicación** — Uso simultáneo y sostenido de varios fármacos, típicamente
cinco o más.

**Seudonimización** — El paciente se identifica con un código interno. No es
anonimización: hay un vínculo, pero fuera del sistema.

**Lote** — Unidad de trazabilidad. Cada ingreso de medicación llega como lote,
con número y fecha de vencimiento propios.

**Interacción** — Par de drogas cuyo uso conjunto implica un riesgo conocido.

**Observación** — Lo que el sistema le muestra al médico a partir de una
interacción detectada, en lenguaje comprensible.
