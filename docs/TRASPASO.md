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
**Rama:** `feat/5.15-suspender-medicacion` (**sin mergear**)

### Qué se hizo

**La 5.15: suspender una medicación desde la ficha.** Con esto **la ficha del
paciente queda completa**: se puede ver, agregar y suspender.

| Archivo | Qué |
| --- | --- |
| `src/app/pacientes/[id]/ModalSuspender.tsx` | El modal. Nuevo |
| `src/app/pacientes/[id]/MedicacionDelPaciente.tsx` | **Modificado**: columna de acciones |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### El botón solo va en las filas vigentes

Una medicación ya suspendida no se vuelve a suspender: el servicio lo rechaza
con un 422. **Un botón que siempre falla es peor que no tenerlo**, así que en
esas filas la celda queda vacía.

### El motivo es obligatorio, y no es burocracia

Es lo único que distingue una **suspensión** de una **finalización**. El estado
no se guarda, se deriva de que haya fecha de fin y de que haya motivo (decisión
`0013`). Sin motivo, el sistema no puede decir si la droga se cortó por una
razón clínica o si el tratamiento llegó a su término.

El largo mínimo lo comprueba el servicio, no el formulario.

### El modal dice qué va a pasar, antes de que pase

Lleva una nota visible: la medicación **no se borra**, queda en el historial con
su motivo, y **deja de participar de la evaluación de interacciones**. Eso
último es lo que más importa y lo que menos se deduce: suspender cambia qué
evalúa el sistema.

El botón es de variante **crítica**, no primaria. No es la acción corriente de
la pantalla.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en la ficha de un paciente con tres
drogas vigentes:

| Qué | Resultado |
| --- | --- |
| El botón | Aparece en las tres filas vigentes |
| Motivo "no" | **422** debajo del campo: "…tiene que tener al menos 4 caracteres." |
| Motivo válido | Cierra, y la ficha pasa a "2 drogas vigentes · 1 en el historial" |
| La suspendida | Baja al final, con su motivo y la fecha, y **sin botón** |
| **Volver a agregar la misma droga** | **Entra como tramo nuevo** |

Ese último es el que vale la pena mirar. Después de suspender Haloperidol y
volver a agregarlo, la ficha muestra:

```
Haloperidol   09/09/2026   Vigente      Se evalúa              [Suspender]
Clonazepam    20/08/2026   Vigente      Sin datos en la fuente [Suspender]
Escitalopram  01/08/2026   Vigente      Se evalúa              [Suspender]
Haloperidol   10/08/2026   Suspendida   Se evalúa
              Prolongacion del QT junto con escitalopram · 09/09/2026
```

**Dos filas de la misma droga, y el motivo de la suspensión anterior intacto.**
Eso es lo que destrabó sacar el `@@unique([pacienteId, medicamentoId])` en la
5.04, ahora funcionando de punta a punta desde la interfaz.

Los datos de prueba **se borraron**: 0 pacientes, los 10 medicamentos del seed y
las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **No se puede elegir la fecha de suspensión.** El servicio la acepta —y
  valida que no sea futura ni anterior al inicio—, pero el modal no la ofrece: la
  tarea pide el motivo. Se carga con el momento de la suspensión. Si hiciera
  falta registrar una suspensión de la semana pasada, es un `Campo` más.
- **"Evaluar interacciones" sigue deshabilitado**: es la 5.16.
- **En 375 px la tabla de la ficha ya necesita bastante desplazamiento
  horizontal**, y con la columna de acciones quedan fuera de vista tanto
  "Interacciones" como "Suspender". Es la **6.05**, pero conviene mirarlo ahí en
  serio: en esta pantalla esas dos columnas son lo importante.
- **No hay listado de consultas.** `GET /api/consultas` devuelve una por id. La
  5.20 va a necesitar una `listarConsultas` en `src/services/consultas.ts`.
- **La 5.16 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.15-suspender-medicacion
```

### Qué sigue

**La 5.16: la pantalla de consulta**, `/consultas/nueva`. Es de tamaño **L** y
abre el último tramo del módulo: 5.17, 5.18, 5.19 y 5.20 cuelgan de ella.

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.16** | L | `/consultas/nueva`: paciente opcional y medicamentos a evaluar |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

**Lo que la 5.16 tiene que resolver:**

1. **El botón "Evaluar interacciones" deshabilitado con menos de dos.** El
   servicio también lo rechaza (422), pero el botón no debería llegar a
   mandarlo.
2. **Usa `rxcuisConCobertura`** sobre los elegidos: al armar la lista ya se
   avisa cuál no se va a poder cruzar. La respuesta de `POST /api/consultas` trae
   la `evaluabilidad` de cada uno resuelta.
3. **El paciente es opcional**: sin paciente es la consulta suelta del médico de
   guardia, y el endpoint ya lo soporta.
4. **El selector de medicamentos elige varios.** El de la 5.14 elige uno solo y
   está dentro de `ModalAgregarMedicacion.tsx`. Si al escribir este resulta ser
   el mismo widget, **ahí sube a `src/components/ui/`**; si no, se escribe
   aparte. La regla es que sube cuando dos rutas lo necesitan.

Desde la ficha, ese botón tendría que llevar a `/consultas/nueva` con el
paciente ya elegido, que es la **5.17**.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta. Lo único que decide el cliente es si el formulario está completo.
- **`incluirNoVigentes` es `false` por defecto** en `GET /api/medicacion`. Para
  precargar la medicación de un paciente en una consulta **no se toca**: una
  droga suspendida ya no la toma.
- **La `evaluabilidad` viene resuelta del servidor.** Las pantallas no la
  calculan.
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip. Algo sube ahí cuando **dos** rutas lo necesitan, no antes.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **Todas las interacciones tienen severidad `ALTA`.** La 5.18 va a mostrar un
  solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
