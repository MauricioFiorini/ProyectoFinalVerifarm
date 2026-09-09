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
**Rama:** `feat/5.19-aviso-clinico` (**sin mergear**)

## La fase 5 está cerrada

**20 de 21, y la que falta —la 5.03— quedó sin efecto por la decisión `0012`.**

Con esto **los dos módulos del proyecto están completos**: el de stock desde la
fase 4 y el clínico desde ahora. El recorrido de la defensa se puede hacer
entero, de punta a punta, en las dos mitades.

Lo que queda es la **fase 6**: interfaz transversal, seed definitivo y cierre.

### Qué se hizo

**La 5.19: el aviso clínico obligatorio.**

| Archivo | Qué |
| --- | --- |
| `src/components/ui/AvisoClinico.tsx` | El componente. Nuevo |
| Las cinco pantallas clínicas | Lo usan; se borraron las tres copias sueltas |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### Por qué era un componente y no un párrafo más

El texto estaba escrito a mano en tres pantallas, **con tres redacciones
distintas**, y faltaba en dos. Tres copias de un aviso que tiene que decir lo
mismo en todos lados es la forma segura de que un día digan cosas distintas, y
de que la próxima pantalla se olvide de ponerlo.

Ahora hay **una sola copia del texto en todo el código**, comprobado con
`grep`.

> **`src/components/ui/` pasó de cinco archivos a seis.** Los otros son Boton,
> Campo, Tabla, Modal y Chip. La regla que se viene sosteniendo —algo sube
> cuando **dos o más rutas** necesitan lo mismo— acá se cumple de sobra: son
> cinco.

### Por qué no es un cartel de color

Va en todas las pantallas clínicas, y un recuadro rojo repetido cinco veces deja
de leerse a la tercera: se vuelve parte del fondo. Además competiría por
atención con los avisos que **sí** dicen algo de este paciente —la falta de
cobertura de una droga, una interacción encontrada—, que son los que hay que
mirar.

Una línea separadora, texto legible y la frase clave en negrita alcanzan para
que esté presente sin tapar lo que importa.

### El componente acepta texto propio de la pantalla

La ficha del paciente necesita aclarar que la evaluación corre sobre la
medicación vigente. Eso es información **de esa pantalla**, no del aviso, así
que entra como contenido de afuera y no como una variante más del componente:

```tsx
<AvisoClinico>
  La evaluación de interacciones se hace solo sobre la medicación vigente.
</AvisoClinico>
```

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, el aviso aparece en las cinco:

| Pantalla | Estado |
| --- | --- |
| `/pacientes` | Aparece — **antes no estaba** |
| `/pacientes/[id]` | Aparece, con su aclaración propia adelante |
| `/consultas` | Aparece — **antes no estaba** |
| `/consultas/nueva` | Aparece |
| `/consultas/[id]` | Aparece |

Y `grep -rn "criterio profesional" src/` devuelve **un solo archivo**:
`AvisoClinico.tsx`.

Los datos de prueba **se borraron**: 0 pacientes, 0 consultas, los 10
medicamentos del seed y las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **El aviso no está en las pantallas de stock**, y es a propósito: no son
  pantallas clínicas. La 5.19 pide "toda pantalla clínica".
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.19-aviso-clinico
```

### Dónde está el proyecto

```
Fase 5 — módulo clínico ....  20 de 21   (la 5.03 quedó sin efecto)
Fase 6 — cierre ...........    1 de 10
```

### Qué sigue: la fase 6

**Nueve tareas.** Están en orden de dependencia, no de importancia:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **6.06** | L | **Seed definitivo.** Lo más importante que queda |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.03** | L | Pantalla de inicio con tarjetas. Reemplaza la provisoria de la 6.01 |
| **6.04** | M | Manejo de errores global |
| **6.05** | M | Revisión responsive |
| **6.07** | M | `README.md` |
| **6.08** | M | Guion de demostración |
| **6.09** | M | Ensayo en la máquina de la defensa |
| **6.10** | M | Respuestas a las preguntas previsibles |

**La 6.06 es la que no se puede recortar, y conviene hacerla pronto.** Hoy el
catálogo del seed cruza con **una sola** interacción —escitalopram con
haloperidol—, así que cualquier demostración del módulo clínico muestra un único
hallazgo. La decisión `0012` ya fijó qué hay que hacer: elegir el catálogo de
manera que se cruce con la fuente, sin dejar de ser verosímil para una colonia
psiquiátrica. Se midió que **20 drogas tomadas de ONCHigh dan 47 pares**.

La 6.06 además pide un medicamento con **dos lotes de distinto vencimiento**
—para mostrar FEFO repartiendo— y pacientes cuya medicación **efectivamente**
dispare interacciones.

**La 6.03 conviene después de la 6.06**, porque las tarjetas de inicio se ven
vacías sin datos.

**Si trabajan dos en paralelo: 6.06 con 6.02, o 6.06 con 6.04.** Van por
archivos distintos.

### Antes de arrancar, tener en cuenta

- **El aviso clínico va en toda pantalla clínica nueva**, con
  `<AvisoClinico />`. No se copia el texto.
- **Las pantallas consumen la API, no importan el servicio.**
- **"Sin interacciones" y "sin datos" no se pueden ver igual** (decisión
  `0012`).
- **Las interacciones se evalúan sobre la medicación VIGENTE.**
- **`src/components/ui/` tiene seis componentes**: Boton, Campo, Tabla, Modal,
  Chip y AvisoClinico.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`. **Sigue siendo una decisión de equipo
  pendiente**, y con la fase 5 cerrada es un buen momento para mirarla.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.** Vale también para el seed de la 6.06: los
  RxCUI se verifican, no se escriben de memoria (decisión `0008`).
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
