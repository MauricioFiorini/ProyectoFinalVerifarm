# VERIFARM — Respuestas a las preguntas previsibles (tarea 6.10)

Preparación para la defensa. **Complementa a
[`docs/GUION_DEMOSTRACION.md`](GUION_DEMOSTRACION.md)**, que trae cuatro
respuestas rápidas para usar sin salir del recorrido. Este archivo es para lo
que viene después, cuando el jurado pregunta.

## Cómo usar esto

Cada pregunta tiene tres partes:

- **La respuesta corta.** Lo que se dice en voz alta. Dos o tres frases.
- **En qué se apoya.** El documento del repositorio que la respalda, por si
  piden verla.
- **Si insisten.** La repregunta que sigue naturalmente, y qué contestar.

**La postura general, que vale para casi todas:** ninguna de estas ausencias es
un olvido. Están enumeradas en `docs/CONTEXTO.md` sección 6 y desarrolladas con
su justificación en `docs/ROADMAP_PRODUCTO.md`, escritas **antes** de que
alguien preguntara. Eso es lo que conviene mostrar: que el límite estaba
decidido y documentado, no improvisado.

**Y la trampa a evitar:** que "está en el roadmap del producto" suene a excusa
para todo. Si algo se dejó afuera porque no llegaba el tiempo, se dice así. El
jurado distingue una decisión de alcance de una tarea que no se hizo, y
disfrazar la segunda de la primera es peor que reconocerla.

---

## 1. ¿Por qué el sistema no registra la receta ni la posología?

### La respuesta corta

> *"Porque registrar la prescripción con dosis convertiría al sistema en parte
> del acto médico, y eso cambia lo que el sistema es y de qué responde. Verifarm
> recibe una lista de fármacos y devuelve qué pares figuran en una fuente
> pública. Es una herramienta de consulta, no un sistema de prescripción.*
> *Fue una decisión explícita de alcance, tomada al definir el modelo de
> dominio."*

### En qué se apoya

- `docs/CONTEXTO.md` sección 3: *"Si registrara la prescripción con dosis,
  pasaría a formar parte del acto médico, con todo lo que eso implica."*
- `docs/ROADMAP_PRODUCTO.md` **P.10.01**, en la sección de alcance que el equipo
  excluyó del modelo: *"Receta y posología: el sistema pasaría a formar parte
  del acto médico."*

### Si insisten: *"¿Pero no pierde precisión la detección sin la dosis?"*

Sí, y conviene decirlo derecho: **la fuente que usamos tampoco distingue por
dosis.** ONCHigh publica pares de clases de fármacos, no umbrales. Una detección
sensible a la dosis necesitaría otra fuente, no solo otro modelo de datos. Pedir
la dosis para no usarla sería falsa precisión.

---

## 2. ¿Por qué no hay proveedores ni órdenes de compra?

### La respuesta corta

> *"Porque el problema que el sistema resuelve empieza cuando el medicamento ya
> está en el depósito. Lo que se pierde por vencimiento no se pierde en la
> compra: se pierde en el estante, porque nadie sabía qué lote debía salir
> primero. Ahí es donde FEFO interviene.*
> *La cadena de abastecimiento es un módulo entero —proveedor, orden de compra,
> recepción— y sumarlo habría diluido el argumento del prototipo sin fortalecerlo."*

### En qué se apoya

- `docs/ROADMAP_PRODUCTO.md` **P.10.03** (proveedor y órdenes de compra),
  **P.10.04** (destino del egreso) y **P.10.05** (análisis predictivo de
  abastecimiento, que **depende de las dos anteriores**).
- `docs/CONTEXTO.md` sección 2: el problema declarado es la pérdida por
  vencimiento en depósito.

### Si insisten: *"¿Y cómo saben cuánto reponer?"*

Hoy no lo sabe: **el sistema avisa que un medicamento está bajo su mínimo, y
nada más.** Es un punto de corte, no una predicción. El análisis predictivo
figura como P.10.05 y está declarado como dependiente de tener registrado el
destino del egreso, que tampoco está. **No hay que vender el mínimo como si
fuera planificación de compras.**

---

## 3. ¿Por qué las interacciones no vienen de una API en vivo?

**Es la pregunta más probable de todas**, porque la documentación original del
proyecto decía que sí. Conviene contestarla de frente.

### La respuesta corta

> *"Porque la fuente que la documentación original preveía ya no existe. La Drug
> Interaction API de RxNav fue discontinuada por la Biblioteca Nacional de
> Medicina de Estados Unidos en enero de 2024. No es una caída temporal: no
> volvió.*
> *Adoptamos entonces una fuente pública y citable —la lista ONC de
> interacciones de alta prioridad, de Phansalkar y colaboradores, publicada en
> JAMIA en 2012— y la cargamos en base propia: 1150 pares. El resultado es
> determinístico y verificable, y funciona sin conexión.*
> *RxNorm, que es otra cosa, sí sigue operativo: de ahí salen los RxCUI que
> usamos para identificar cada principio activo."*

### En qué se apoya

- `docs/CONTEXTO.md` sección 3, párrafo sobre la discontinuación.
- `docs/decisiones/0010-se-adopta-onchigh.md` — la elección de la fuente.
- `docs/decisiones/0011-como-se-importa-onchigh.md` — cómo se importó y qué
  **no** trae la fuente.
- `docs/ROADMAP_PRODUCTO.md` **DOC.01**: corregir esa referencia en las tres
  entregas ya está anotado como pendiente de documentación.

### Si insisten: *"¿Y no queda desactualizada una base local?"*

Sí, y está declarado: **los archivos son de 2017 y la extracción original es de
2014.** Está escrito en la tarea 5.02 del roadmap y en la decisión `0010`. La
contrapartida es que un resultado determinístico se puede auditar y reproducir;
uno que depende de un servicio externo, no —y menos si el servicio se da de
baja, que es exactamente lo que pasó—.

### Si insisten: *"Es una fuente de Estados Unidos. ¿Sirve para Argentina?"*

**La identificación sí; la cobertura, parcialmente.** Los RxCUI que usamos son
de **ingrediente** —principio activo, sin marca ni presentación—, y un principio
activo es el mismo en cualquier país: la sertralina es sertralina acá y allá. Lo
que no es neutro es **qué pares están en la lista**: ONCHigh refleja la práctica
clínica estadounidense de su época, y hay fármacos de uso corriente en una
colonia psiquiátrica argentina que simplemente no figuran.

**Por eso el sistema distingue "sin interacciones" de "sin datos"** y lo muestra
en pantalla. Esa limitación no está escondida: es lo primero que ve el médico.

---

## 4. ¿Por qué no hay auditoría implementada?

**Cuidado con esta.** Es la única de las cinco donde el modelo de datos promete
algo que el sistema no cumple, y el jurado puede verlo en el diagrama.

### La respuesta corta

> *"La clase `RegistroAuditoria` está en el modelo de datos desde la etapa de
> diseño y la tabla existe en la base, pero el prototipo no la escribe ni la
> consulta. Está declarado como pendiente.*
> *Lo que sí quedó implementado es la trazabilidad de lo que más importa: cada
> movimiento de stock guarda quién, cuándo, qué lote y qué cantidad, y no se
> edita ni se borra. Eso se puede ver en pantalla.*
> *La auditoría transversal —quién consultó qué, quién modificó el catálogo— es
> un requisito de cumplimiento y está planificada como módulo propio."*

### En qué se apoya

- `docs/ROADMAP_PRODUCTO.md` **P.2**, cuyo encabezado lo dice con todas las
  letras: *"La clase `RegistroAuditoria` existe en el modelo de datos desde el
  prototipo (tarea 2.06), pero no se escribe ni se consulta. Es un requisito de
  cumplimiento legal del proyecto."* Cinco tareas: P.2.01 a P.2.05.
- `docs/CONTEXTO.md` sección 6: *"sin auditoría implementada"*.
- Lo que sí existe: `MovimientoStock` con `usuarioId`, visible en el historial
  por lote (tarea 4.16), sin acciones de editar ni borrar.

### Si insisten: *"¿Entonces la tabla está vacía?"*

Sí. **Decirlo.** La alternativa —insinuar que algo se registra— se cae con una
consulta a la base. Lo defendible es que el modelo la previó, que la ausencia
está documentada como pendiente de cumplimiento, y que el libro mayor de stock
ya funciona con esa lógica de no-borrado.

---

## 5. ¿Por qué no hay registro de la validación médica de la observación?

### La respuesta corta

> *"Porque el prototipo se concentró en producir la advertencia correcta, no en
> registrar qué hizo el médico con ella. Hoy la pantalla informa y ahí termina.*
> *El registro del pronunciamiento del médico —aceptar o rechazar cada
> observación, con justificación escrita si la rechaza— está planificado como
> módulo propio, y la documentación del proyecto lo plantea como resguardo ante
> mala praxis. Es una de las primeras cosas que un producto real necesitaría."*

### En qué se apoya

- `docs/ROADMAP_PRODUCTO.md` **P.3**: *"Es el resguardo legal ante mala praxis
  que la documentación del proyecto plantea (…) Sin esto, la pantalla de
  resultado informa pero no registra ninguna decisión clínica."* Cinco tareas,
  P.3.01 a P.3.05.
- `docs/CONTEXTO.md` sección 6: *"sin registro de la validación médica de la
  observación"*.

> **Ojo con un dato que el roadmap del producto tiene mal.** La tarea P.3.01
> dice *"Los campos ya están en `ObservacionInteraccion`"*, y **no están**: el
> modelo tiene `consultaId`, los dos medicamentos, `severidad`, `descripcion` y
> `createdAt`, nada más. **No afirmar en la defensa que el campo existe.** La
> respuesta correcta es que agregarlo es parte de P.3. Está anotado para
> corregir en el roadmap del producto.

### Si insisten: *"¿Y qué queda registrado entonces de una consulta?"*

Bastante, y es un punto fuerte: **queda qué se evaluó, no solo qué se
encontró.** Cada consulta guarda la lista completa de medicamentos evaluados
—tengan o no cobertura en la fuente— además de las observaciones. Sin eso, una
consulta sin hallazgos no dejaría rastro de qué se revisó, y al releerla parecería
que se revisó todo. Es la decisión `0014`.

---

# Segunda tanda: lo que suele preguntarse después

## 6. Todas las interacciones salen con la misma severidad. ¿Por qué?

> *"Porque la fuente no publica una escala. ONCHigh es, por definición, una
> lista de interacciones de alta prioridad: todas entran como severidad alta.*
> *Podríamos haber inventado tres niveles para que la pantalla se viera mejor.
> No lo hicimos: la pantalla está construida para tres severidades, el campo
> existe, y otra fuente podría traerlas graduadas. Con esta fuente hay una sola,
> y preferimos decirlo."*

**Se apoya en** `docs/decisiones/0011-como-se-importa-onchigh.md`, que además
deja constancia de que la ausencia se verificó **por tres caminos
independientes** —las columnas de la planilla original, el script de carga del
proyecto de origen, y las 4031 filas con `effectConcept = None`— *"porque es una
ausencia y las ausencias se confirman, no se suponen"*.

Es una buena respuesta para dar: muestra método.

## 7. ¿Cómo saben que los RxCUI son correctos?

> *"Se verificaron uno por uno contra la API de RxNorm, y son todos de nivel
> ingrediente. Ninguno se escribió de memoria."*

**Se apoya en** `docs/decisiones/0008-los-rxcui-son-de-ingrediente.md` y en los
comentarios del propio `prisma/seed.ts`, que dejan anotado el nombre en RxNorm
de cada droga para poder reverificar sin adivinar. Del mapeo de la fuente:
**123 de 123 drogas resolvieron**.

## 8. ¿Qué pasa si dos personas dispensan el mismo lote a la vez?

> *"Las operaciones que tocan saldos corren en transacción con nivel de
> aislamiento serializable. Si dos dispensaciones concurrentes se pisan, una
> falla y se reintenta; no quedan saldos negativos ni movimientos a medias."*

**Se apoya en** `src/services/dispensacion.ts` y `src/services/movimientos.ts`,
que usan `$transaction` con `isolationLevel: "Serializable"`. Y en que **el
saldo no se persiste**: se calcula como ingresos menos egresos, así que no hay
un número que pueda quedar desfasado.

## 9. ¿Por qué no hay pruebas automatizadas?

**Esta es la que conviene no adornar.**

> *"No hay. Está declarado en el alcance y planificado como módulo, con los
> casos ya enumerados: el motor FEFO con sus siete escenarios, el motor de
> interacciones incluyendo los casos que no deben disparar alerta, y la
> integridad de saldos bajo concurrencia.*
> *La verificación del prototipo fue manual y documentada, incluido un ensayo
> completo de esta demostración con la base cargada desde cero."*

**Se apoya en** `docs/ROADMAP_PRODUCTO.md` **P.4** (P.4.01 a P.4.07) y en el
registro del ensayo al final de `docs/GUION_DEMOSTRACION.md`.

No decir "no llegamos" ni "no hacía falta". Los casos están enumerados, que es
más de lo que suele haber; eso es lo defendible.

## 10. ¿Por qué casi todo el stock está en cero?

> *"Es el conjunto de datos de demostración: se cargaron lotes solo para los
> fármacos que participan del recorrido. Los 17 bajo mínimo son consecuencia de
> eso, no un estado de la institución."*

El caso que conviene señalar es **Risperidona**, que está bajo mínimo **con
existencia real** (10 de 30): ahí se ve que el indicador compara contra el
umbral, no que detecta el vacío.

## 11. ¿Por qué no hay login, si el modelo tiene usuarios?

Ya está en el guion, pero la versión larga:

> *"La autenticación quedó fuera por decisión: agrega trabajo a cada pantalla y
> no aporta al argumento del proyecto. El selector de usuario simulado la
> reemplaza, y no es decorativo: el usuario elegido es el que queda asentado en
> cada movimiento de stock y en cada consulta.*
> *El módulo está planificado, incluido el punto que más importa: que el control
> de acceso se verifique en la capa de servicio y no en el componente. Ocultar
> un botón no es una restricción."*

**Se apoya en** `docs/ROADMAP_PRODUCTO.md` **P.1**, especialmente **P.1.04**.

## 12. ¿Por qué el texto de la observación no lo genera un modelo de lenguaje?

> *"Se compone por plantilla, detrás de una interfaz preparada para sustituir la
> implementación. Sin presupuesto para una API de modelo, el sistema tiene que
> funcionar igual. Que la explicación sea generada es deseable; que el sistema
> dependa de una clave que puede fallar el día de la defensa, no.*
> *Y si algún día se cambia, la condición ya está escrita: si el dato no está en
> el contexto recuperado, el modelo lo dice en vez de inventar, con respaldo
> automático a la plantilla."*

**Se apoya en** `docs/CONTEXTO.md` sección 3, `src/lib/redaccion/` (una sola
línea a cambiar) y `docs/ROADMAP_PRODUCTO.md` **P.7**, en particular **P.7.03**
y **P.7.04**.

---

## Lo único que no hay que hacer

**Inventar en la defensa lo que el sistema no hace.** Es la misma regla que rige
el código y los datos, y es también el criterio con el que se corrigió el guion:
la primera versión le atribuía a la pantalla un cuadro clínico que la fuente no
publica.

Frente a una pregunta cuya respuesta no se sabe, la salida es *"eso no está
resuelto en el prototipo"* o *"no lo sé, lo verifico"*. Un jurado perdona un
límite declarado. Una afirmación que se cae con una consulta a la base, no.
