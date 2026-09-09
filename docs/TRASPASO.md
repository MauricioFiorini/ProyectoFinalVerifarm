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
**Rama:** `feat/5.16-pantalla-de-consulta` (**sin mergear**)

### Qué se hizo

**La 5.16: la pantalla de consulta**, en `/consultas/nueva`. **El recorrido
completo del módulo clínico ya funciona**: se eligen medicamentos, se evalúan y
la consulta queda guardada.

| Archivo | Qué |
| --- | --- |
| `src/app/consultas/nueva/page.tsx` | El encabezado |
| `src/app/consultas/nueva/NuevaConsulta.tsx` | La pantalla |
| `src/app/consultas/[id]/page.tsx` | **Provisoria**, ver abajo |
| `src/services/medicamentos.ts` | `conCobertura()` |
| `src/types/medicamento.ts` | El parámetro `conCobertura` |
| `src/app/api/medicamentos/route.ts` | `GET …?conCobertura=true` |
| `src/app/pacientes/[id]/MedicacionDelPaciente.tsx` | "Evaluar interacciones" ya es un enlace |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### La marca de cobertura va antes de evaluar, no después

Es lo que pide la tarea y es el punto de la pantalla. Cada droga elegida dice,
en la misma lista, si el sistema la va a poder cruzar:

| Caso | Lo que se lee |
| --- | --- |
| `EVALUADO` | Nada. El caso corriente no se etiqueta |
| `SIN_COBERTURA` | "la fuente no tiene datos de esta droga" |
| `SIN_RXCUI` | "no se puede evaluar: falta el código" |

Y arriba del botón, cuando hay alguna:

> **2 de los medicamentos elegidos no se van a poder cruzar.** El resultado no va
> a decir nada sobre esas drogas, ni siquiera que estén bien.

Esa última frase es la que importa. Sin ella, alguien puede leer "no se
encontraron interacciones" creyendo que se revisó todo.

### `GET /api/medicamentos?conCobertura=true`

Es nuevo, y es **opcional a propósito**: calcularla cuesta una consulta más y la
pantalla del catálogo no la necesita. Mismo criterio que `incluirNoVigentes` en
la medicación: el que la quiere, la pide.

### La pantalla de resultado es provisoria

`/consultas/[id]` existe pero **no es la 5.18**: muestra que la consulta se
guardó y su identificador, y dice en pantalla qué tarea la reemplaza.

Está para que el recorrido no termine en un 404. Es el mismo criterio de la
pantalla de inicio provisoria de la 6.01. **La consulta ya queda guardada con
todo** —sus medicamentos evaluados y sus observaciones—; lo único que falta es
mostrarlas.

### Por qué este buscador no es el mismo componente que el de la 5.14

Aquel elige **una** droga y la deja fija con un botón "Cambiar". Este agrega a
una lista, excluye las ya elegidas y muestra la cobertura.

Lo único que comparten de verdad es el pedido con espera —unas quince líneas—, y
un componente cuyas props tuvieran que cubrir los dos comportamientos sería más
difícil de leer que los dos por separado. **La regla sigue en pie:** algo sube a
`src/components/ui/` cuando dos rutas necesitan **lo mismo**. Estas necesitan
cosas parecidas, que no es igual.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en `/consultas/nueva`:

| Qué | Resultado |
| --- | --- |
| Sin medicamentos | Botón deshabilitado, "Elegí 2 medicamentos para evaluar." |
| Con uno | Deshabilitado, "Falta 1 medicamento más." |
| Escitalopram | Sin marca |
| Clonazepam | "la fuente no tiene datos de esta droga" |
| Una droga sin RxCUI | "no se puede evaluar: falta el código" |
| Con dos sin cobertura | El aviso amarillo, con el conteo |
| Buscar una ya elegida | Aparece en gris, **"Ya está en la lista"**, no clicable |
| Buscar un paciente | Lista los seudónimos; al elegirlo queda fijado con "Quitar" |
| Evaluar | Guarda y **lleva a `/consultas/[id]`** |
| 375 px | Entra bien: es un formulario, no una tabla |

Lo que quedó **guardado** en la consulta de prueba, leído después por la API:

```
medicamentos evaluados:
  Escitalopram      EVALUADO
  Clonazepam        SIN_COBERTURA
  PRUEBA-Zopiclona  SIN_RXCUI
  Haloperidol       EVALUADO
observaciones: 1
  Escitalopram + Haloperidol: interaccion de severidad alta.
```

**Los cuatro se guardaron, no solo los dos que cruzaron.** Es lo que cerró la
decisión `0014` y lo que le va a permitir a la 5.18 reconstruir el aviso al
reabrir la consulta.

Los datos de prueba **se borraron**: 0 pacientes, 0 consultas, los 10
medicamentos del seed y las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La pantalla de resultado es la 5.18**, y es lo que sigue.
- **No hay precarga del paciente**: al entrar desde la ficha, la pantalla se
  abre vacía. Es la **5.17**.
- **"Consultas" sigue pendiente en la barra lateral**, porque `/consultas` —el
  listado— es la 5.20. Hoy a `/consultas/nueva` se llega desde la ficha de un
  paciente o escribiendo la URL.
- **El buscador no navega con flechas.** Los resultados son botones y se llega
  con Tab.
- **La 5.17 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.16-pantalla-de-consulta
```

### Qué sigue

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.18** | L | Pantalla de resultado: observaciones por severidad, y los sin cobertura |
| **5.17** | M | Precarga: al elegir un paciente vienen sus medicamentos vigentes |
| **6.02** | M | Selector de usuario simulado |
| **6.04** | M | Manejo de errores global |

**La 5.18 primero**, porque reemplaza una pantalla provisoria que hoy está en el
recorrido. Después la 5.17, que es comodidad.

**Lo que la 5.18 tiene que resolver, y está en su fila del roadmap:**

1. Observaciones **ordenadas por severidad**, con color según ese valor. Hoy
   todas son `ALTA`: va a salir un solo color y está asumido (decisión `0011`).
2. Estado vacío: **"No se encontraron interacciones registradas entre los
   medicamentos evaluados"**.
3. **Ese texto no aparece nunca solo.** Al lado va la lista de los evaluados que
   la fuente no cubre, bajo **"Sin datos en la fuente: no se pudo revisar esta
   droga"** — y va **también cuando sí hay interacciones**.
4. Todo lo necesario ya viene de `GET /api/consultas?id=…`: los medicamentos con
   su `evaluabilidad` y las observaciones con su texto ya compuesto.

**Para la 5.17:** la ficha ya enlaza a `/consultas/nueva`. Alcanza con pasarle
`?pacienteId=…` y que la pantalla, al arrancar con ese parámetro, pida
`GET /api/medicacion?pacienteId=…` **sin** `incluirNoVigentes` —una droga
suspendida ya no la toma— y precargue esos medicamentos.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Lo único que decide el
  cliente es si el formulario está completo.
- **La `evaluabilidad` viene resuelta del servidor**, en la medicación, en el
  catálogo con `conCobertura=true` y en el resultado de una consulta.
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip. Algo sube ahí cuando **dos** rutas necesitan lo mismo.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
