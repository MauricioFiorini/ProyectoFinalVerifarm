# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `main` (las dos tareas son documentación y van directo, según
convenciones).

# La fase 6 está cerrada. El prototipo está completo.

**10 de 10.** Con esto quedan cerradas las seis fases: el alcance del prototipo
está terminado.

```
Fase 0 — entorno ...........   9 de  9   ✅
Fase 1 — andamiaje .........  15 de 15   ✅
Fase 2 — modelo de datos ...  11 de 11   ✅
Fase 3 — catálogo ..........   8 de  8   ✅
Fase 4 — stock y FEFO ......  17 de 17   ✅
Fase 5 — módulo clínico ....  20 de 21   ✅ (la 5.03 quedó sin efecto)
Fase 6 — cierre ............  10 de 10   ✅
```

## Lo que se hizo en este bloque

| Tarea | Qué dejó |
| --- | --- |
| 6.09 | Ensayo completo con base desde cero. Guion corregido y registro del ensayo al final de `docs/GUION_DEMOSTRACION.md`. |
| 6.10 | `docs/PREGUNTAS_PREVISIBLES.md`: doce preguntas con respuesta corta, la fuente que la respalda y la repregunta que sigue. |

## La 6.09 — el ensayo

Se corrió la demostración entera contra el sistema, con la base cargada desde
cero y a 1366×768, la resolución de la notebook de la defensa.

**Lo sustantivo funciona.** El reparto FEFO de 50 ampollas de Haloperidol dejó
los lotes en 0 y 70 como promete el guion; el par Sertralina + Tranilcipromina
se detecta con severidad alta; el contraste de `PAC-103` distingue "sin datos"
de "sin interacciones"; y el rol elegido en el selector queda asentado en el
libro mayor —verificado dispensando como Dr. House y leyendo el asiento—.

**El guion, en cambio, tenía doce afirmaciones que no coincidían con la
pantalla.** Están corregidas. Las tres que más costaban:

1. **`npm run setup` no resetea la base**, solo regenera el cliente de Prisma.
   Estaba escrito como el comando de emergencia durante la defensa: si algo
   fallaba, el rescate no rescataba. **El comando correcto es
   `npx prisma db seed`**, que sí limpia todas las tablas antes de cargar.
2. **La observación no menciona síndrome serotoninérgico ni crisis
   hipertensiva.** El guion se lo atribuía a la pantalla. ONCHigh no publica
   descripciones (decisión `0011`) y el sistema no las inventa.
3. **Los usuarios se llaman "Farm. Pérez" y "Dr. House"**, no "Ana Clara
   Benítez" ni "Gregory House".

El resto: no existe el botón "Guardar consulta" (evaluar guarda), el botón es
"Dispensar" y su modal no tiene campo de motivo, las filas de las tablas no son
clickeables, la columna de la ficha dice "Se evalúa", el texto del aviso clínico
citado no era el real, y las consultas del día son 2, no 3.

**El ensayo además agregó** tres momentos que el guion se salteaba y que son de
lo mejor que tiene la demostración: el **plan de egreso visible antes de
confirmar**, con el reparto y la razón escrita; la **advertencia de cobertura
antes de evaluar** en `PAC-103`; y el **asiento del libro mayor** con usuario y
hora.

## La 6.10 — las preguntas del jurado

`docs/PREGUNTAS_PREVISIBLES.md`. Las cinco que pedía la tarea —receta,
proveedor, API en vivo, auditoría, validación médica— con tratamiento completo,
más siete que salen naturalmente después: la severidad única, la verificación de
los RxCUI, la concurrencia sobre saldos, la falta de pruebas, el stock en cero,
el login y el texto generado.

Cada una trae **el documento que la respalda**, para que ninguna respuesta sea
una opinión improvisada en la defensa.

**Dos advertencias quedaron escritas ahí y conviene leerlas antes de la
defensa:**

- **La auditoría es la más delicada de las cinco.** Es la única donde el modelo
  de datos promete algo que el sistema no cumple, y el jurado puede verlo en el
  diagrama. La tabla existe y está vacía. Hay que decirlo.
- **No hay que dejar que "está en el roadmap del producto" sirva para todo.** Si
  algo se dejó afuera por tiempo, se dice así. El jurado distingue una decisión
  de alcance de una tarea que no se hizo.

## Tres cosas anotadas para corregir, que no toqué

Son de otras tareas y no las metí de prepo. **Las tres son errores de hecho en
documentos que el jurado puede leer.**

1. **`docs/ROADMAP_PRODUCTO.md`, tarea P.3.01** dice *"Los campos ya están en
   `ObservacionInteraccion`"* y **no están**: el modelo tiene `consultaId`, los
   dos medicamentos, `severidad`, `descripcion` y `createdAt`, nada más. Está
   avisado dentro de `PREGUNTAS_PREVISIBLES.md` para que nadie lo afirme en la
   defensa.
2. **`docs/ROADMAP_PRODUCTO.md`, encabezado de P.6** dice *"En el prototipo son
   15 pares cargados a mano (tarea 5.03)"*. Quedó viejo: la 5.03 no se hizo y
   hoy son **1150 pares importados** de ONCHigh.
3. **No hay ningún paciente que muestre "sin interacciones" con cobertura
   real.** `PAC-104` es Amoxicilina + Paracetamol y **las dos tienen cero
   cobertura en la fuente**, así que da "sin datos", igual que `PAC-103`. De los
   tres estados posibles del módulo, la demostración muestra dos. Para el
   tercero sirve **Carbamazepina + Fluoxetina**, verificado contra la base; hoy
   se arma a mano desde `/consultas/nueva`.

Relacionado con la tercera: **16 de los 25 medicamentos están en cero**, así que
`/stock` se lee como un sistema sin cargar. Hay respuesta preparada en el guion,
pero se resuelve mejor en el seed.

## Cómo levantarlo

```bash
docker compose up -d
npx prisma db seed
npm run dev
```

`npm run check` da 0. La base queda con 25 medicamentos, 10 lotes, 4 pacientes,
2 consultas y las 1150 interacciones.

**Ojo con el selector de rol.** Se guarda en el `localStorage` del navegador y
**no lo resetea ni el seed ni `npm run setup`**: si el ensayo anterior terminó
como Dr. House, la próxima corrida arranca como Dr. House. Se corrige a mano
desde la barra superior.

## Qué queda

**Del roadmap del prototipo, nada.** Lo que sigue es la defensa.

Antes de esa fecha conviene: **ensayar el guion en voz alta y con cronómetro**
—el ensayo de la 6.09 verificó que el sistema hace lo que el guion dice, no que
entre en cinco minutos—, y **repartir `docs/PREGUNTAS_PREVISIBLES.md`** para que
los tres respondan lo mismo.

## Lo que sigue abierto de antes

**El parche del `setTimeout`.** Todas las pantallas cargan datos con
`setTimeout(…, 0)` dentro de un `useEffect`, para que la regla
`react-hooks/set-state-in-effect` no rechace la llamada. **La regla tiene razón**
y el timeout no lo arregla, solo lo esconde. Está documentado en
`src/app/stock/TablaDeStock.tsx` desde la fase 4. Es deuda conocida, no un
bloqueo.

**La D8 sigue abierta** desde el 2026-09-01: si se sostiene la regla de "código
va en rama y otro le pasa el ojo" o se cambia el documento.

## Si alguien vuelve a tocar código

- **El aviso clínico va en toda pantalla clínica nueva**, con
  `<AvisoClinico />`. No se copia el texto.
- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta; lo único que decide el cliente es si el formulario está completo.
- **Las interacciones se evalúan sobre la medicación VIGENTE.**
- **La `evaluabilidad` viene resuelta del servidor.**
- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`.
- **`src/components/ui/` tiene siete componentes**: Boton, Campo, Tabla, Modal,
  Chip, AvisoClinico y ErrorSeccion. Algo sube ahí cuando **dos o más rutas**
  necesitan lo mismo.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.** Vale también para lo que se le atribuye a
  la pantalla en el guion: es donde falló su primera versión.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

## Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
