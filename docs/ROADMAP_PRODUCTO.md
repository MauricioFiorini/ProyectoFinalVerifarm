# VERIFARM — Roadmap del PRODUCTO FINAL

**Este archivo NO se implementa durante el prototipo.** Es el registro de todo lo
que se dejó afuera deliberadamente, para retomarlo después.

Si sos un asistente de IA: **no implementes nada de este archivo.** El alcance
vigente es `docs/ROADMAP.md`. Si una tarea del prototipo parece incompleta sin
algo de acá, no la completes: es intencional.

Ubicación en el repo: `docs/ROADMAP_PRODUCTO.md`

---

## Estados

Mismos símbolos que el roadmap del prototipo. Todo arranca en `[ ]`.

---

## P.1 — Autenticación y control de acceso

Fuera del prototipo por decisión de equipo: agrega trabajo a cada pantalla y no
aporta al argumento del proyecto.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.1.01 | Login con Auth.js: usuario y contraseña contra la tabla `Usuario`. | `[ ]` | L |
| P.1.02 | Hash de contraseñas. **Hoy el campo existe pero no se usa.** | `[ ]` | M |
| P.1.03 | Sesión y protección de rutas. | `[ ]` | M |
| P.1.04 | Control de acceso por tipo de usuario **verificado en la capa de servicio**, no en el componente. Ocultar un botón no es una restricción. | `[ ]` | L |
| P.1.05 | Reemplazar el selector de usuario simulado (6.02 del prototipo) por el usuario de la sesión. | `[ ]` | M |

> Los servicios del prototipo se escriben preparados para recibir el usuario,
> así que este bloque no debería obligar a reescribirlos.

---

## P.2 — Auditoría

La clase `RegistroAuditoria` **existe en el modelo de datos desde el prototipo**
(tarea 2.06), pero no se escribe ni se consulta. Es un requisito de cumplimiento
legal del proyecto.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.2.01 | `src/services/auditoria.ts`: registrar operación con tipo, entidad afectada, id y descripción. | `[ ]` | M |
| P.2.02 | Integrar el registro en todas las operaciones de escritura de stock. | `[ ]` | M |
| P.2.03 | Integrar el registro en las operaciones clínicas. | `[ ]` | M |
| P.2.04 | Pantalla `/auditoria`: tabla filtrable por entidad, tipo de operación y rango de fechas. | `[ ]` | L |
| P.2.05 | Exportación del registro filtrado a CSV. | `[ ]` | M |

---

## P.3 — Validación médica de la observación

Fuera del prototipo. **Es el resguardo legal ante mala praxis que la
documentación del proyecto plantea**, y el modelo de dominio lo contempla con esa
justificación explícita. Sin esto, la pantalla de resultado informa pero no
registra ninguna decisión clínica.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.3.01 | Persistir el pronunciamiento del médico sobre cada observación: aceptada o rechazada, con fecha. Los campos ya están en `ObservacionInteraccion`. | `[ ]` | M |
| P.3.02 | Botones **"Aceptar"** y **"Rechazar"** por observación en la pantalla de resultado. | `[ ]` | M |
| P.3.03 | El rechazo exige justificación escrita. | `[ ]` | S |
| P.3.04 | Que el médico que valida sea siempre el que generó la consulta (decisión de modelo ya tomada). | `[ ]` | S |
| P.3.05 | Vista de observaciones pendientes de validación. | `[ ]` | M |

---

## P.4 — Pruebas automatizadas

Fuera del prototipo. Las dos primeras son las que sostienen los argumentos
centrales del proyecto y son las que conviene hacer primero.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.4.01 | Configurar Vitest y `npm run test`. | `[ ]` | M |
| P.4.02 | **Motor FEFO**: un solo lote alcanza; reparto entre dos; reparto entre tres; lote vencido ignorado; lote con disponible cero; existencia insuficiente; empate de fechas de vencimiento. | `[ ]` | L |
| P.4.03 | **Motor de interacciones**, incluyendo los casos que **no** deben disparar alerta. | `[ ]` | L |
| P.4.04 | Disponibilidad de lote y stock disponible por medicamento. | `[ ]` | M |
| P.4.05 | Estado derivado de la medicación vigente. | `[ ]` | M |
| P.4.06 | Integridad de saldos bajo operaciones concurrentes. | `[ ]` | L |
| P.4.07 | Pruebas end-to-end (Playwright) de los dos recorridos principales. | `[ ]` | L |

---

## P.5 — Integración con RxNorm en vivo

En el prototipo el RxCUI se carga a mano. RxNorm sigue operativo (a diferencia de
la Interaction API, discontinuada en enero de 2024).

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.5.01 | `src/lib/rxnorm/`: cliente aislado con `findRxcuiByString` y `getApproximateMatch`, con manejo de error y tiempo de espera. | `[ ]` | L |
| P.5.02 | Botón **"Buscar en RxNorm"** en el alta de medicamento, que sugiere el RxCUI a partir del nombre. | `[ ]` | M |
| P.5.03 | Resolución de nombres que no matchean de forma exacta, con revisión manual. | `[ ]` | L |
| P.5.04 | Caché local de las respuestas para no depender de la conexión en una demostración. | `[ ]` | M |

---

## P.6 — Fuente completa de interacciones

En el prototipo son 15 pares cargados a mano (tarea 5.03).

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.6.01 | Importar el conjunto **ONCHigh** completo. Está en el repositorio público `dbmi-pitt/public-PDDI-analysis`, carpeta `PDDI-Datasets/ONC-High-Priority`. | `[ ]` | L |
| P.6.02 | Mapear los nombres de droga a RxCUI: los archivos traen identificadores de DrugBank, no RxCUI. Requiere RxNorm (P.5.01) y revisión manual de los que no resuelven. | `[ ]` | L |
| P.6.03 | Redactar las descripciones de severidad a partir del artículo de Phansalkar y colaboradores (JAMIA, 2012), que es la fuente original de la lista. Los archivos del repositorio no las traen. | `[ ]` | L |
| P.6.04 | Incorporar la lista de CredibleMeds de fármacos con riesgo conocido de Torsades de Pointes. | `[ ]` | M |
| P.6.05 | Documentar la vigencia de la fuente: los archivos son de 2017 y la extracción original de 2014. | `[ ]` | S |

---

## P.7 — Texto explicativo generado

En el prototipo la observación se compone por plantilla (tarea 5.08), detrás de
una interfaz que permite sustituir la implementación.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.7.01 | Evaluar proveedores de modelo de lenguaje con capa gratuita y sus límites. | `[ ]` | M |
| P.7.02 | Implementación generativa detrás de la misma interfaz, activada por variable de entorno. | `[ ]` | L |
| P.7.03 | Restricción estricta al contexto recuperado: si el dato no está, el modelo lo dice en vez de inventar. | `[ ]` | L |
| P.7.04 | Respaldo automático a la plantilla si el modelo no responde. **El sistema tiene que funcionar sin modelo generativo.** | `[ ]` | M |

---

## P.8 — Stock: operaciones avanzadas

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.8.01 | Movimientos de **ajuste** por diferencia de conteo físico, con motivo obligatorio. | `[ ]` | M |
| P.8.02 | **Corrección de movimientos**: no se editan ni se borran; se registra uno de signo contrario enlazado al original por `movimientoRelacionadoId`. | `[ ]` | M |
| P.8.03 | Botón **"Corregir"** en el historial de movimientos, que abre el contramovimiento. | `[ ]` | M |
| P.8.04 | Impedir por restricción de base la edición o borrado de un movimiento. | `[ ]` | M |
| P.8.05 | Modo manual como excepción a FEFO: permite apartarse del plan con motivo escrito, registrado en auditoría. | `[ ]` | M |
| P.8.06 | Panel de alertas dedicado, con listas separadas de stock bajo y vencimientos próximos. En el prototipo son indicadores dentro de la tabla. | `[ ]` | M |
| P.8.07 | Marcar una alerta como atendida. **Requiere una clase nueva**: hoy las alertas se calculan y reaparecen en cada visita. | `[ ]` | L |

---

## P.9 — Catálogo y pantallas: completitud

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.9.01 | Edición de medicamento. En el prototipo se corrige desde Prisma Studio. | `[ ]` | M |
| P.9.02 | Desactivación lógica de medicamento, con confirmación. | `[ ]` | S |
| P.9.03 | Filtros y paginación en el historial de consultas. | `[ ]` | M |
| P.9.04 | Componentes de interfaz faltantes: `Select` estilizado, `Alerta`, `EstadoVacio`, `Cargando`, `Etiqueta`. En el prototipo son cuatro componentes. | `[ ]` | L |
| P.9.05 | Página 404 propia. | `[ ]` | S |
| P.9.06 | Revisión de accesibilidad: foco visible, etiquetas en campos, contraste suficiente, navegación por teclado. | `[ ]` | M |

---

## P.10 — Alcance funcional que el equipo excluyó del modelo

**Ninguna de estas está en el modelo de dominio.** Incorporarlas exige rehacer el
diagrama, recalcular los puntos de función y corregir la documentación. No son
tareas de programación: son decisiones de alcance.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| P.10.01 | Receta y posología: el sistema pasaría a formar parte del acto médico. | `[ ]` | L |
| P.10.02 | Nombre comercial y mapeo contra el vademécum de ANMAT. | `[ ]` | L |
| P.10.03 | Proveedor y órdenes de compra. | `[ ]` | L |
| P.10.04 | Destino del egreso, para poder analizar consumo por sala. | `[ ]` | M |
| P.10.05 | Análisis predictivo de abastecimiento a partir del historial de consumo. **Requiere P.10.03 y P.10.04.** | `[ ]` | L |
| P.10.06 | Administración individual por enfermería. | `[ ]` | L |
| P.10.07 | Depósito como entidad, para instituciones con más de uno. | `[ ]` | M |

---

## Documentación de las entregas

Trabajo paralelo, no depende de que haya código.

| # | Tarea | Estado | Tamaño |
|---|---|---|---|
| DOC.01 | Corregir la referencia a la Drug Interaction API de RxNav, discontinuada en enero de 2024, en las tres entregas. | `[ ]` | L |
| DOC.02 | Sacar el mapeo de ANMAT del cronograma y del texto: está fuera de alcance. | `[ ]` | M |
| DOC.03 | Corregir la validación cruzada contra prescripciones: el sistema valida listas de fármacos, sin posología. | `[ ]` | M |
| DOC.04 | Resolver la contradicción de horas entre el cálculo de puntos de función y la factibilidad económica. | `[ ]` | L |
| DOC.05 | Actualizar el modelo de dominio en draw.io: agregar `Interaccion`, corregir `evalua` a `2..*`, corregir `contrasena` a `contraseña`. | `[ ]` | M |
| DOC.06 | Recalcular los puntos de función contra el alcance realmente implementado. | `[ ]` | L |
