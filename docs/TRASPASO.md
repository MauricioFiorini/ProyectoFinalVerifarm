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
**Rama:** `feat/5.12-modal-de-alta-de-paciente` (**sin mergear**)

### Qué se hizo

**La 5.12: el modal de alta de paciente.** Con esto **se pueden dar de alta
pacientes desde la interfaz**, y el botón que la 5.11 había dejado deshabilitado
quedó habilitado.

| Archivo | Qué |
| --- | --- |
| `src/app/pacientes/ModalNuevoPaciente.tsx` | El modal. Nuevo |
| `src/app/pacientes/ListaPacientes.tsx` | **Modificado**: el botón abre el modal |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### Un campo, y una nota que no es relleno

El formulario pide el seudónimo y nada más. Eso, a quien no conozca el proyecto,
se le lee como un formulario a medio hacer: falta el nombre, falta el documento,
falta la fecha de nacimiento.

Por eso el modal lleva una nota visible, y **no es un disclaimer decorativo: es
lo que convierte una ausencia en una decisión.** Dice que el sistema no guarda
esos datos, que no hay ningún campo donde cargarlos, que el vínculo con la
persona vive fuera del sistema, y cita la Ley 25.326 art. 8.

Es la misma idea que la leyenda del encabezado de la pantalla, pero en el
momento en que más se nota el hueco: cuando alguien está por cargar a alguien.

### Los errores los pinta el servidor, no se duplican en el cliente

El modal manda lo que la persona escribió y muestra lo que el servidor conteste.
Que el seudónimo no se repita, que tenga un largo mínimo y que no sea un DNI son
reglas del servicio (5.01), y repetirlas acá garantiza que en algún momento
digan cosas distintas.

Los tres rechazos se comprobaron **en el navegador**, y los tres aparecen debajo
del campo, en rojo, con el mensaje que escribió el servicio:

| Se escribió | Respuesta | Lo que se ve |
| --- | --- | --- |
| `38123456` | 422 | "El seudonimo no puede ser un numero de documento. Usa un codigo interno, por ejemplo PAC-001." |
| `ab` | 422 | "El seudonimo tiene que tener al menos 3 caracteres." |
| `pac-001` con `PAC-001` ya cargado | 409 | "Ya hay un paciente con el seudonimo «pac-001»." |

**El último es el que vale la pena mirar:** se escribió en minúscula y el
sistema lo detectó igual. Es la comparación insensible a mayúsculas de la 5.01
funcionando de punta a punta, desde la pantalla hasta la base.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en `/pacientes`:

| Qué | Resultado |
| --- | --- |
| Clic en "Nuevo paciente" | Abre el modal |
| Foco al abrir | Cae en el campo Seudónimo, **no en la cruz de cerrar** |
| Los tres rechazos | Debajo del campo, con el mensaje del servidor |
| Tocar el campo tras un error | El error desaparece |
| Alta válida | Cierra el modal y **la tabla se refresca sola** con el paciente nuevo |
| Escape | Cierra el modal |

Los 422 y el 409 aparecen en la consola del navegador como "Failed to load
resource": **es el navegador registrando respuestas HTTP que no son 2xx**, no un
error de la aplicación. Son exactamente los tres que se dispararon a propósito.

El paciente de prueba **se borró al terminar**: la base quedó con 0 pacientes.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La fila del paciente no lleva a ningún lado.** La ficha es la 5.13, y ahí la
  tabla necesita un botón "Ver ficha" por fila.
- **No hay baja de paciente.** `Paciente` tiene `activo` pero ningún endpoint lo
  apaga. Ninguna tarea lo pide todavía.
- **No hay listado de consultas.** `GET /api/consultas` devuelve una por id. La
  5.20 va a necesitar una `listarConsultas` en `src/services/consultas.ts`.
- **La 5.13 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.12-modal-de-alta-de-paciente
```

### Qué sigue

**La 5.13: la ficha del paciente**, `/pacientes/[id]`. Es la pantalla más densa
del módulo y de ella cuelgan la 5.14 y la 5.15.

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.13** | M | Ficha del paciente: medicación vigente con fecha de inicio y estado |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

**Si trabajan dos en paralelo: 5.13 con 6.02, o 5.13 con 6.04.**

**Lo que la 5.13 tiene que resolver, y está en su fila del roadmap:**

1. **Marca la cobertura por fila** con `rxcuisConCobertura`. El medicamento que
   la fuente no cubre se señala: *"sin datos"* no es *"sin interacciones"*.
2. Pide la medicación con **`incluirNoVigentes=true`**, porque la ficha muestra
   también lo suspendido con su motivo. El resto del sistema usa el defecto.
3. Los estados vienen calculados en la respuesta: `VIGENTE`, `SUSPENDIDA`,
   `FINALIZADA`. No se derivan en la pantalla.
4. El modelo a copiar para la pantalla de detalle es
   `src/app/stock/[medicamentoId]/`, que ya resuelve el encabezado con el nombre
   y el "volver".

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta. El servidor ya manda el mensaje escrito para una persona, con el
  campo al que corresponde.
- **`incluirNoVigentes` es `false` por defecto** en `GET /api/medicacion`. Para
  evaluar interacciones no se toca; para la ficha se pide en `true`.
- **La `evaluabilidad` ya viene resuelta** en la respuesta de la consulta:
  `EVALUADO`, `SIN_RXCUI` o `SIN_COBERTURA`. La 5.13, la 5.16 y la 5.18 tienen
  que mostrarla.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`. Las nuevas siguen el mismo patrón.
- **Los cuatro componentes de `src/components/ui/` son los únicos que hay.**
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
