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
**Rama:** `feat/5.14-modal-de-alta-de-medicacion` (**sin mergear**)

### Qué se hizo

**La 5.14: el modal para agregar medicación a un paciente.** Habilita el primer
botón de la ficha.

| Archivo | Qué |
| --- | --- |
| `src/app/pacientes/[id]/ModalAgregarMedicacion.tsx` | El modal. Nuevo |
| `src/app/pacientes/[id]/MedicacionDelPaciente.tsx` | **Modificado**: el botón abre el modal |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### El selector con buscador se escribió acá, no en `ui/`

`CampoSelector` es un `<select>`, y con un catálogo que va a crecer un `<select>`
sin buscador se vuelve inutilizable. Hacía falta un buscador con lista de
resultados.

**No se hizo un componente compartido**, y es la regla que quedó escrita al mudar
`Chip` en la 5.13: algo sube a `src/components/ui/` cuando **dos** rutas
distintas lo necesitan. Hoy lo necesita una sola.

La 5.16 también elige medicamentos, pero elige **varios a la vez**, que es otro
widget. Si al escribirla resulta ser el mismo, ahí sube. Mudarlo después cuesta
menos que mantener una abstracción que sirve para un solo caso.

### Detalles que importan

**El buscador muestra el RxCUI de cada resultado**, y un chip "Sin RxCUI" cuando
no lo tiene. **Al elegir uno sin código aparece una nota**: *"Se puede agregar
igual, pero no va a participar de la evaluación de interacciones."*

No lo bloquea. Es la misma línea que todo el módulo: el sistema informa, no
decide. Un paciente puede estar tomando una droga que el sistema no sabe cruzar,
y esconderla sería peor que cargarla con la advertencia.

**El botón "Agregar" está deshabilitado hasta elegir una droga.** Es lo único
que el cliente decide por su cuenta, y no es una regla del dominio: es que el
formulario está incompleto.

**La fecha viene con hoy puesto**, que es lo que va a ser casi siempre. Mismo
criterio que el modal de ingreso de lote (4.13).

**Con una droga ya elegida el buscador deja de pedir.** La lista está oculta:
seguir consultando serían viajes por un resultado que nadie va a ver.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en la ficha de un paciente:

| Qué | Resultado |
| --- | --- |
| Escribir "clona" | Lista **Clonazepam** con su RxCUI 2598 |
| Elegirlo | Queda fijado, con botón "Cambiar", y "Agregar" se habilita |
| Agregar | Cierra el modal y **la ficha se refresca**: "2 drogas vigentes" |
| El agregado | Aparece marcado **"Sin datos en la fuente"** |
| Agregar la misma otra vez | **409** debajo del campo: "El paciente ya tiene Clonazepam en su medicacion vigente." |
| Fecha 01/01/2099 | **422** debajo de la fecha: "La fecha de inicio no puede ser futura." |
| Buscar una droga sin RxCUI | Chip "Sin RxCUI" en la lista, y la nota al elegirla |
| Buscar algo que no existe | "No hay medicamentos que coincidan con «…»" |

Los 409 y 422 aparecen en la consola del navegador como "Failed to load
resource": es el navegador registrando respuestas que no son 2xx, no un error de
la aplicación.

Los datos de prueba **se borraron**: 0 pacientes, los 10 medicamentos del seed y
las 1150 interacciones.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **No hay botón "Suspender" por fila**: es la 5.15, tamaño S, y cierra la ficha.
- **"Evaluar interacciones" sigue deshabilitado**: es la 5.16.
- **El selector no navega con flechas.** Los resultados son botones y se llega
  con Tab, que alcanza; una lista con `aria-activedescendant` y manejo de teclas
  es más de lo que esta pantalla necesita hoy. Si en la 5.16 aparece el mismo
  widget con más peso, conviene mirarlo ahí.
- **La 5.15 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.14-modal-de-alta-de-medicacion
```

### Qué sigue

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.15** | S | Botón "Suspender" por fila, con modal que pide motivo obligatorio |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

**La 5.15 cierra la ficha del paciente.** Después sigue la **5.16**, la pantalla
de consulta, que es de tamaño L y abre el último tramo del módulo.

**Para la 5.15:** el endpoint ya existe y está probado —`PATCH /api/medicacion`
con `medicacionId` y `motivo`—, devuelve 422 si el motivo tiene menos de 4
caracteres y 422 si la medicación ya está suspendida. El botón solo va en las
filas **vigentes**: una suspendida no se vuelve a suspender.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta. Lo único que decide el cliente es si el formulario está completo.
- **`incluirNoVigentes` es `false` por defecto** en `GET /api/medicacion`. La
  ficha lo pide en `true`.
- **La `evaluabilidad` viene resuelta del servidor.** Las pantallas no la
  calculan.
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip. Algo sube ahí cuando **dos** rutas lo necesitan, no antes.
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
