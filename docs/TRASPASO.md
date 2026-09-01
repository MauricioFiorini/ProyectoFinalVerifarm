# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-01
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `main` (es documentación y una casilla de verificación)
**Commit:** de `e252c50` al que trae este traspaso

### Qué se hizo

Dos cosas, y la segunda es la importante.

**1. La 2.09 quedó verificada en la máquina de Mauricio.** La migración inicial
aplica sin errores. El detalle está en "Cómo verificarlo".

**2. Se cerraron seis de las siete decisiones abiertas**, en la reunión del
2026-09-01. Cada una quedó escrita en `docs/decisiones/`, con su contexto, la
decisión y sus consecuencias:

| Era | Se resolvió como | Archivo |
|---|---|---|
| D2 | Se adopta **ONCHigh** como fuente de interacciones | `0010-se-adopta-onchigh.md` |
| D3 | **`rxcui` opcional**, y único cuando tiene valor | `0005-el-rxcui-es-opcional.md` |
| D4 | El nombre es el **principio activo, sin dosis** | `0006-el-nombre-no-lleva-la-dosis.md` |
| D5 | `Lote` lleva **`fechaIngreso`**; la cantidad vive en los movimientos | `0007-lote-lleva-fecha-de-ingreso.md` |
| D6 | Los RxCUI son de **ingrediente**, verificados contra RxNorm | `0008-los-rxcui-son-de-ingrediente.md` |
| D7 | **Usuario fijo del seed**, desde una constante en el servicio | `0009-usuario-fijo-para-los-movimientos.md` |

**Queda abierta D8** —si se sostiene la regla de rama y revisión— que no bloquea
ninguna tarea.

Con eso, **ninguna tarea del roadmap queda en `[?]`.** Las seis que estaban
trabadas por una decisión pasaron a `[ ]`, con sus dependencias reescritas: la
3.02, la 3.07, la 4.01, la 4.02, la 5.02 y la 5.03.

**Y se agregaron dos tareas a la fase 2**, que son la razón por la que las fases
3, 4 y 5 todavía no arrancan:

- **2.10** — Migración: `rxcui` a `String? @unique` y `fechaIngreso DateTime` en
  `Lote`. Las dos en la misma migración.
- **2.11** — Corregir el seed: nombres sin dosis, los diez RxCUI verificados
  contra RxNorm y llevados a ingrediente, e `id` fijo para el usuario de los
  movimientos.

### Decisiones tomadas sobre la marcha

**Las dos tareas nuevas existen porque decidido no es hecho.** Tres de las seis
decisiones —0005, 0007 y las tres del seed— no se aplican solas: son una
migración y una corrección de datos. Marcar las fases como destrabadas sin ese
trabajo hecho habría dejado el roadmap diciendo que se puede empezar la 4.01
cuando el modelo `Lote` todavía no tiene `fechaIngreso`.

**Las dos modificaciones de esquema van en una sola migración.** `rxcui` opcional
y `Lote.fechaIngreso` podrían ser dos, pero cada migración es una pasada que los
tres tienen que aplicar en su base. Una sola es un solo `prisma migrate dev` para
todos.

**La 5.03 no se elimina, aunque D2 haya elegido ONCHigh.** La 5.02 es de tamaño L
y depende de un mapeo de DrugBank a RxCUI que puede resolver peor de lo esperado.
La fase 5 es la más importante para la defensa. Quince pares cargados a mano son
la red, y si hace falta o no se decide **cuando se sepa cómo resolvió el mapeo**,
no antes.

**Los diez RxCUI no se verificaron todavía, a propósito.** La decisión 0008 fija
el criterio —nivel ingrediente, consultados contra RxNorm—, pero la consulta es
trabajo y quedó como parte de la 2.11. Completarlos de memoria o por inferencia
habría sido inventar datos clínicos, que es lo que `docs/REGLAS_IA.md` sección 5
prohíbe explícitamente.

### Qué quedó sin hacer

- **La 2.09 le falta a Juan José.** Juan Pablo y Mauricio tienen su casilla; la
  tarea sigue en `[ ]` hasta que estén las tres.
- **La 2.10 y la 2.11 no se empezaron.** Nadie las tiene tomadas.
- **Los diez RxCUI del seed siguen sin verificar**, y siguen con la dosis dentro
  del nombre. Es la 2.11.
- **ONCHigh no se descargó.** La decisión de adoptarlo está tomada; los archivos
  no están y el mapeo no se hizo. Es la 5.02, y va después de la 2.11.
- **D8 sigue abierta.**
- **`docs/TRASPASO.md` perdió su sección "Plantilla (no borrar)"** en algún
  momento, y `docs/CONVENCIONES.md` sección 13 la sigue referenciando: dice que
  el traspaso se reescribe "siguiendo su plantilla", que ya no está en ningún
  lado. Este traspaso respeta los mismos siete títulos de siempre, pero la
  plantilla habría que reponerla o cambiar la referencia.

### Cómo verificarlo

**De la 2.09**, corrido en la máquina de Mauricio con Node 24.20.0 y npm 11.19.0:

| Qué se probó | Resultado |
|---|---|
| `npm ci` | Instala y **deja el árbol limpio** |
| `npm run setup` | Código 0, genera el cliente Prisma |
| `docker compose up -d` | `healthy`, y confirmado que el contenedor es el de esta carpeta |
| `npx prisma migrate status` antes | `1 migration found`, `have not yet been applied` |
| `npx prisma migrate dev` | Aplica `20260901142250_inicial` sin errores |
| `npx prisma migrate status` después | `Database schema is up to date!` — sin *drift* |
| Tablas creadas | Las 10 del modelo más `_prisma_migrations` |
| `npx prisma db seed` | `Seed completado con éxito`: 3 usuarios y 10 medicamentos |
| `npm run check` | Código 0 |

**De la decisión 0009**, que es la que tiene una prueba concreta: se corrió el
seed dos veces seguidas y se compararon los ids del mismo usuario.

```
primera corrida:  01efb636-84a4-4557-a34c-b7949beaea8c | Admin Sistema
segunda corrida:  ff3d97ca-acbe-42a8-b2dc-89228c28fdbf | Admin Sistema
```

Cambian. Por eso la 2.11 tiene que darle `id` explícito al usuario del seed antes
de que ninguna constante lo referencie.

**De la decisión 0006:** se verificó que los diez medicamentos del seed son diez
principios activos distintos, así que sacarles la dosis del nombre **no genera
ninguna colisión** con la restricción de nombre único.

### Qué sigue

**La 2.10**, la migración. Es la que destraba más cosas: la 3.02 y la 4.01
dependen de ella.

Después la **2.11**, el seed. Sin ella no arrancan ni la 4.02 —que necesita el
usuario con `id` fijo— ni nada de la fase 5, porque los pares de interacciones se
cruzan por RxCUI y hasta que los del seed no estén verificados no hay contra qué
cruzar.

Las dos son de la fase 2 y **las toma una sola persona**, como el resto de esa
fase: la 2.10 genera una migración, y dos migraciones en paralelo dejan la base
de cada uno distinta.

**En paralelo, y sin esperar nada:** la **3.05**, los cuatro componentes base de
`src/components/ui/`, no depende de la 2.10 ni de la 2.11. Y **Juan José tiene
pendiente su 2.09**.

Después de la 2.11 se abre todo: la fase 3 por la 3.02, la fase 4 por la 4.01 y
la fase 5 por la 5.02.

### Antes de arrancar, tener en cuenta

- **La 2.10 agrega una migración, así que los tres van a tener que aplicarla.**
  Conviene avisar cuando entre a `main`, y que nadie corra su 2.09 pendiente
  justo antes: le tocaría hacerlo dos veces.
- **Nunca se edita la migración inicial.** Ya está mergeada. `rxcui` opcional y
  `fechaIngreso` van en una migración nueva.
- **`npm run check` falla si `.next/` quedó de un build viejo.** El síntoma es
  `Type 'Route' does not satisfy the constraint 'never'` en
  `.next/types/validator.ts`, que es un archivo generado que el `tsconfig.json`
  incluye. Se arregla con `rm -rf .next`. Le pasa a quien viene trabajando, no a
  un clon limpio, y el error no apunta a su causa.
- **El puerto de PostgreSQL es el 5433.** Si tenés PostgreSQL instalado en
  Windows, con el 5432 Prisma conecta contra el tuyo y responde
  `Authentication failed`.
- **Docker Desktop no arranca solo** al iniciar sesión en Windows.
- **El `rxcui` opcional no es permiso para dejarlo vacío.** Los diez del seed van
  con código real y verificado. Lo opcional es la red para lo que se cargue
  después, no un atajo.
- **Nada de lo que entre a `Interaccion` se inventa.** Ni pares, ni severidades,
  ni descripciones. Lo que no venga de ONCHigh o del artículo citado, no entra.

### Bloqueos

**Ninguno por decisión.** Las seis que trababan las fases 3, 4 y 5 están
cerradas, y D8 no bloquea ninguna tarea.

**Lo que traba hoy es trabajo, no reunión:** la 2.10 y la 2.11. Alguien las tiene
que tomar.
