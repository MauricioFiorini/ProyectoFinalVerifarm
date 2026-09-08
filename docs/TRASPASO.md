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
**Rama:** `feat/5.09-servicio-de-consultas` (**sin mergear**)

### Qué se hizo

**La 5.09: `src/services/consultas.ts`.** Con esto **la lógica del módulo
clínico está completa de punta a punta**: se elige un conjunto de medicamentos,
se cruzan contra la fuente, se compone el texto y queda todo guardado.

Lo que falta del módulo son las pantallas y los route handlers, no la lógica.

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md` tiene ahora una sección **"Migraciones pendientes de
aplicar"**, arriba de todo, con una casilla por integrante. **Juan Pablo y Juan
José tienen dos migraciones sin correr.** Sin aplicarlas, `npm run check` falla
con errores de tipo que no mencionan a Prisma por ningún lado.

```bash
npx prisma migrate dev
npm run setup
```

### Qué expone

| Función | Qué hace |
| --- | --- |
| `crearConsulta(input)` | Valida, evalúa, compone y guarda. Devuelve el resultado completo |
| `obtenerConsulta(id)` | Relee una consulta guardada |

`crearConsulta` acepta `medicamentoIds` y, opcionales, `pacienteId` y
`usuarioId`. Sin paciente es la consulta suelta del médico de guardia, que el
esquema ya contemplaba.

### Lo que devuelve, y por qué importa

Cada medicamento de la consulta vuelve con una **`evaluabilidad`**, que es la
distinción de la decisión `0012` hecha dato:

| Valor | Qué significa |
| --- | --- |
| `EVALUADO` | Tiene RxCUI y la fuente lo cubre: se cruzó de verdad |
| `SIN_RXCUI` | No tiene código cargado. No hay por dónde cruzarlo |
| `SIN_COBERTURA` | Tiene código, pero la fuente no trae ningún par con esa droga |

**Las pantallas 5.16 y 5.18 no tienen que deducir nada**: el servicio ya se los
da resuelto. Ese era el punto de toda la insistencia con `rxcuisConCobertura`.

### Cuatro decisiones que conviene conocer

**El texto se compone al guardar, no al mostrar.** Es lo que hace que una
consulta vieja siga diciendo lo mismo aunque cambie la plantilla: **el registro
clínico es lo que se leyó ese día**, no lo que el sistema diría hoy.

**La cobertura, en cambio, se recalcula al releer.** No está guardada, por la
decisión `0014`. O sea que una consulta vieja puede pasar de `SIN_COBERTURA` a
`EVALUADO` si más adelante entra una fuente que cubra esa droga. Es deliberado y
está escrito en la decisión.

**La lectura va afuera de la transacción, a diferencia de la dispensación.** En
stock, `dispensar` replanifica *dentro* de la transacción porque entre calcular
el plan y ejecutarlo puede entrar otro egreso. Acá ese riesgo no existe:
`Interaccion` es dato de referencia que se carga una vez, y los medicamentos
elegidos no cambian mientras se los evalúa. **Es una diferencia deliberada con
el otro módulo, no un olvido.**

**No hay `$transaction` alrededor, y está bien.** Es una sola escritura anidada,
y eso ya es una transacción: Prisma envuelve el `create` con sus anidados. Poner
un `$transaction` alrededor de una única llamada daría a entender que hay más de
una operación de la que preocuparse.

### Un defecto que se evitó, y vale la pena que se sepa

La primera versión devolvía las observaciones **asumiendo que `create` anidado
las trae en el orden en que se las pasó**. En la práctica lo hace, pero no lo
garantiza nada: es el orden de un `RETURNING` de Postgres y basta un plan de
consulta distinto para que cambie.

Si cambiara, la única consecuencia visible sería que las observaciones salen
desordenadas por severidad en la pantalla de resultado. **Silencioso,
intermitente y difícil de reproducir**, que es el peor tipo. Ahora el orden se
impone explícitamente, usando el par de medicamentos como identidad.

### Cómo verificarlo

Script descartable contra la base, **24 casos, todos dan lo esperado**.

| Caso | Qué se probó |
| --- | --- |
| Con hallazgos | guarda los 4 evaluados; encuentra la interacción; **las tres `evaluabilidad` a la vez**; el texto lo compuso el redactor; nombra las drogas correctas |
| **Sin hallazgos** | no encuentra nada pero guarda los evaluados; al releer **se reconstruye la falta de cobertura** |
| Relectura | el texto releído es idéntico al guardado; una consulta inexistente devuelve `null` |
| Sin paciente | se crea igual y queda atribuida al médico del seed |
| Rechazos | un solo medicamento; el mismo dos veces; uno inexistente; paciente inexistente; **uno dado de baja** |
| Nada a medias | una consulta rechazada **no deja fila** |
| Determinismo | el orden de entrada no cambia el resultado |

Para probar `SIN_RXCUI` hizo falta crear un medicamento sin código: los diez del
seed tienen todos el suyo. Se borra al terminar.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La 5.10 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.09-servicio-de-consultas
```

Tiene que listar `src/services/consultas.ts`.

### Qué sigue

**La 5.10: route handlers de pacientes, medicación y consultas.** Es lo único
que separa a la lógica de las pantallas, y de ahí en adelante la fase 5 es toda
interfaz.

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.10** | M | Route handlers de pacientes, medicación y consultas |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

**La 6.02 se volvió más relevante:** `crearConsulta` acepta `usuarioId` y hoy
cae en `USUARIO_CLINICO_PROVISORIO_ID`, el médico del seed. Con el selector, ese
parámetro pasa a tener un valor real sin tocar el servicio.

**Si trabajan dos en paralelo: 5.10 con 6.02, o 5.10 con 6.04.**

### Antes de arrancar, tener en cuenta

- **La 5.10 no repite reglas.** El servicio ya valida todo y lanza
  `ErrorDeNegocio`; el route handler valida la **forma** con Zod y delega. Ver
  `src/lib/respuestaHttp.ts`, que ya mapea los códigos a 409/404/422.
- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial. `listarMedicacionVigente`, no `listarMedicacionDePaciente`.
- **La `evaluabilidad` ya viene resuelta** en el resultado de la consulta. Las
  pantallas no la calculan.
- **El texto de la observación ya está guardado.** No se recompone al mostrar.
- **Ningún dato clínico se inventa.**
- **Todas las interacciones tienen severidad `ALTA`.** La fuente no publica una
  escala. La 5.18 va a mostrar un solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
