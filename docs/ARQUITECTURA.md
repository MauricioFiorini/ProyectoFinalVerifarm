# VERIFARM — Cómo está construido el programa

Guía para los tres integrantes. Contesta las preguntas que aparecen cuando uno
vuelve al proyecto después de unos días: **qué tecnología hace qué, por qué está
esa y no otra, y quién le habla a quién adentro del programa.**

No reemplaza a los otros documentos, los ordena:

- `docs/CONTEXTO.md` — **qué** es el proyecto y para quién.
- `docs/ROADMAP.md` — **qué falta** y quién está en cada cosa.
- `docs/CONVENCIONES.md` — **cómo se trabaja** (ramas, commits, invariantes).
- `docs/decisiones/` — **por qué** se resolvió cada cosa así.
- **Este archivo** — **cómo funciona por dentro** lo que ya está construido.

Ubicación en el repo: `docs/ARQUITECTURA.md`

---

## 1. Lo primero: qué existe hoy y qué todavía no

La confusión más común es mezclar lo que está escrito con lo que está planeado.
Al **2026-09-01**, esto es lo que hay:

| Existe | No existe todavía |
|---|---|
| Proyecto Next.js que compila y levanta | Cualquier pantalla propia (la home es la de ejemplo) |
| PostgreSQL 16 en Docker, con migración inicial aplicada | Segunda migración (tarea 2.10) |
| Los 10 modelos de datos y 4 enums | Datos definitivos (el seed es provisorio) |
| `src/lib/db.ts` — el cliente de base de datos | Cualquier route handler (`src/app/api/`) |
| `src/services/medicamentos.ts` — un servicio | El resto de los servicios |
| Paleta y tipografía en `globals.css` | Los componentes de `src/components/ui/` |

**Zod está en el stack declarado pero todavía no está instalado.** Entra con la
tarea 3.02, que es la primera que lo necesita.

---

## 2. El programa en una frase

Una sola aplicación Next.js que sirve **las pantallas y la API** desde el mismo
proceso, hablando con **una base PostgreSQL** que corre en Docker.

No hay backend separado. No hay microservicios. Para un prototipo que tres
personas tienen que poder levantar en su máquina y defender en una mesa, cada
pieza extra es una pieza más que puede fallar el día de la defensa.

---

## 3. Las tres capas: quién le habla a quién

Esta es la parte que más se olvida, así que va con dibujo. **Las flechas van
siempre para abajo.** Ninguna capa llama a la de arriba.

```
   ┌──────────────────────────────────────────────────────────┐
   │  NAVEGADOR                                               │
   └────────────────────────┬─────────────────────────────────┘
                            │  el usuario hace clic
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │  src/app/**/page.tsx          PANTALLAS (React)          │
   │                                                          │
   │  Dibujan. Manejan el estado de la interfaz.              │
   │  NO saben que existe Prisma ni la base de datos.         │
   └────────────────────────┬─────────────────────────────────┘
                            │  fetch("/api/medicamentos")
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │  src/app/api/**/route.ts      ROUTE HANDLERS             │
   │                                                          │
   │  Reciben el HTTP. Validan la entrada (Zod).              │
   │  Delegan y traducen el resultado a una respuesta.        │
   │  NO tienen reglas de negocio adentro.                    │
   └────────────────────────┬─────────────────────────────────┘
                            │  await crearMedicamento(datos)
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │  src/services/*.ts            LÓGICA DE NEGOCIO          │
   │                                                          │
   │  Acá viven TODAS las reglas: FEFO, saldos, unicidad,     │
   │  detección de interacciones.                             │
   │  NO saben que existe HTTP. No ven `Request` ni           │
   │  `Response`. Son funciones que reciben y devuelven       │
   │  datos.                                                  │
   └────────────────────────┬─────────────────────────────────┘
                            │  db.medicamento.findMany(...)
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │  src/lib/db.ts                ACCESO A DATOS             │
   │                                                          │
   │  El cliente Prisma, uno solo para toda la aplicación.    │
   └────────────────────────┬─────────────────────────────────┘
                            │  SQL
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │  PostgreSQL 16 en Docker      localhost:5433             │
   └──────────────────────────────────────────────────────────┘
```

### Por qué esta separación, y no todo junto

**Una regla de negocio se escribe una sola vez.** El cálculo del saldo de un lote
es el mismo si lo pide la pantalla de stock, la de dispensación o el seed. Si
viviera en el route handler, habría que repetirlo en cada endpoint que lo
necesite, y el día que cambie habría que acordarse de todos.

**Para probar FEFO no hace falta levantar nada.** El motor de la tarea 4.07 es
una función pura: recibe una lista de lotes y devuelve un plan. Como no sabe de
HTTP ni de base de datos, se puede verificar a mano con datos inventados. Eso
importa **mucho** acá, porque el prototipo no lleva pruebas automatizadas y esa
verificación manual es la única red.

### La regla práctica

> Si estás por escribir un `if` con una regla del dominio dentro de un
> `route.ts` o de un `.tsx`, está mal. Va en `src/services/`.

Si una pantalla necesita lógica, **importa el servicio**; nunca reescribe la
regla.

### Route Handlers, no Server Actions

Es una regla del proyecto (`docs/CONVENCIONES.md` sección 8). Un route handler es
un endpoint HTTP explícito, con su URL y su método, que se puede abrir en el
navegador y probar suelto. Las Server Actions difuminan el borde entre pantalla y
servidor, que es justamente el borde que estas tres capas quieren mantener
visible.

---

## 4. Un recorrido completo, de punta a punta

Alta de un medicamento, que es lo que van a construir en la fase 3. Sirve de
molde para todo lo demás.

**1. La pantalla** — `src/app/medicamentos/page.tsx`

El usuario completa el modal y aprieta "Guardar". El componente hace:

```ts
await fetch("/api/medicamentos", {
  method: "POST",
  body: JSON.stringify({ nombre, unidad, stockMinimo }),
});
```

La pantalla no sabe si del otro lado hay Prisma, PostgreSQL o un archivo de
texto.

**2. El route handler** — `src/app/api/medicamentos/route.ts`

```ts
export async function POST(request: Request) {
  const cuerpo = await request.json();
  const datos = esquemaMedicamento.parse(cuerpo);   // Zod: valida la forma
  const medicamento = await crearMedicamento(datos); // delega
  return Response.json(medicamento, { status: 201 });
}
```

Tres líneas y ninguna regla de negocio. Valida que lo que llegó tenga la forma
correcta, llama al servicio, y arma la respuesta.

**3. El servicio** — `src/services/medicamentos.ts`

Acá sí hay reglas. Este archivo ya existe, y hace esto:

```ts
export async function crearMedicamento(data: CrearMedicamentoInput) {
  const existente = await db.medicamento.findFirst({
    where: { nombre: { equals: data.nombre, mode: "insensitive" } },
  });
  if (existente) throw new Error(`El medicamento ... ya existe`);
  return db.medicamento.create({ data: { ... } });
}
```

"No puede haber dos medicamentos con el mismo nombre, sin importar mayúsculas"
**es una regla del dominio**, y por eso vive acá y no en el handler.

**4. El acceso a datos** — `src/lib/db.ts`

`db.medicamento.create(...)` termina en SQL contra PostgreSQL.

### La diferencia entre validar y aplicar una regla

Se confunde seguido:

| | Dónde | Ejemplo |
|---|---|---|
| **Validación de entrada** | Route handler, con Zod | "`nombre` es un texto no vacío", "`stockMinimo` es un entero ≥ 0" |
| **Regla de negocio** | Servicio | "no puede haber dos medicamentos con el mismo nombre", "un egreso no puede dejar el lote en negativo" |

La primera pregunta *¿esto tiene la forma correcta?* y se contesta mirando el
JSON. La segunda pregunta *¿esto es válido en este dominio, con estos datos?* y
casi siempre necesita ir a la base.

---

## 5. El stack, pieza por pieza

Cada una está por un motivo. Ninguna se agrega "porque sí": el stack está cerrado
y agregar algo tiene un procedimiento, en `docs/decisiones/0003`.

| Pieza | Versión | Qué hace | Por qué está |
|---|---|---|---|
| **Next.js** (App Router) | 16.3.3 | Sirve las pantallas **y** la API desde un solo proceso | Un prototipo con backend separado son dos cosas que levantar y dos que pueden fallar en la defensa |
| **React** | 19.2.8 | Los componentes de las pantallas | Viene con Next |
| **TypeScript** | 5.9.3 | Tipos en todo el código | Los errores aparecen al escribir, no en la demostración. **Sin `any`**: si aparece uno, falta modelar algo |
| **PostgreSQL** | 16, en Docker | La base de datos | En Docker para que las tres máquinas tengan **la misma versión**. Sin Docker, uno tiene la 14, otro la 18, y las diferencias aparecen tarde |
| **Prisma** | **7.10.0 exacta** | Traduce entre TypeScript y SQL, y versiona los cambios de esquema en migraciones | Los tipos salen del esquema: si renombrás un campo, el compilador te muestra todos los lugares a corregir |
| **`pg` + `@prisma/adapter-pg`** | 8.x / 7.10.0 | El driver que abre la conexión real | **Prisma 7 no conecta sin adaptador.** No es opcional. Ver `decisiones/0004` |
| **Tailwind** | 4.3.3 | Los estilos, como clases en el HTML | Sin bibliotecas de componentes: todo lo que se ve lo escribimos nosotros y lo podemos explicar |
| **Zod** | *sin instalar* | Validará la entrada de la API | Entra con la tarea 3.02 |
| **`tsx`** | 4.23.13 | Ejecuta TypeScript directo, sin compilar | Es lo que corre `prisma/seed.ts` |
| **`dotenv`** | 17.x | Lee el archivo `.env` | Prisma 7 ya no lo carga solo |
| **ESLint + Prettier** | 9.x / 3.9.6 | Reglas y formato | `npm run check` corre los dos y tiene que dar 0 |

### Dos cosas del stack que confunden seguido

**Prisma queda clavado en 7.10.0, sin `^`.** El tag `latest` de npm apunta hoy a
`8.0.0-rc.12`, que es un *release candidate*. Si alguien corre
`npm install prisma@latest`, se trae una versión inestable y rompe la base del
resto. Por eso también el comando de instalación es **`npm ci`** y no
`npm install`: el lock manda (`decisiones/0002`).

**La URL de la base NO está en `schema.prisma`.** Cambió en Prisma 7: vive en
`prisma.config.ts`, que la lee de `DATABASE_URL`. Casi toda la documentación que
se encuentra buscando describe Prisma 6 y dice lo contrario.

---

## 6. El modelo de datos

Diez modelos y cuatro enums. Lo importante es que **son dos módulos que se tocan
en un solo punto**.

```
        ┌─────────────── MÓDULO DE STOCK ───────────────┐
        │                                               │
        │   Lote ──────────< MovimientoStock >───── Usuario
        │     │              (INGRESO/EGRESO)           │
        │     │                                         │
        └─────┼─────────────────────────────────────────┘
              │
         Medicamento   ← el punto de contacto
              │
        ┌─────┼─────────── MÓDULO CLÍNICO ──────────────┐
        │     │                                         │
        │  MedicacionVigente ──── Paciente              │
        │                            │                  │
        │                    ConsultaInteraccion        │
        │                            │                  │
        │                  ObservacionInteraccion       │
        │                                               │
        │  Interaccion  (rxcui1, rxcui2, severidad)     │
        │       ↑ NO tiene relación con Medicamento:    │
        │         se cruza por RxCUI                    │
        └───────────────────────────────────────────────┘
```

**Es la misma droga la que se controla en inventario y la que se evalúa por
interacciones.** No son dos sistemas pegados: es uno con dos salidas.

### Las entidades, en una línea cada una

| Modelo | Qué representa |
|---|---|
| `Medicamento` | Un principio activo. **Sin dosis en el nombre** (`decisiones/0006`) |
| `Lote` | Una entrada de medicación con su número y su vencimiento |
| `MovimientoStock` | Un asiento: entró o salió tanta cantidad de tal lote. **Inmutable** |
| `Paciente` | Solo un seudónimo. **Nunca** nombre, documento ni fecha de nacimiento |
| `MedicacionVigente` | Qué toma un paciente hoy |
| `ConsultaInteraccion` | Una evaluación puntual de un conjunto de fármacos |
| `ObservacionInteraccion` | Lo que el sistema le muestra al médico |
| `Interaccion` | Un par de drogas que interactúan, **por RxCUI** |
| `Usuario` | Quién registra los movimientos |
| `RegistroAuditoria` | Existe en el modelo pero **no se usa en el prototipo** |

Enums: `TipoUsuario`, `TipoMovimiento` (INGRESO/EGRESO), `UnidadMedida` y
`Severidad` (ALTA/MEDIA/BAJA). **`Severidad` es la única escala de gravedad**: no
se crea otra.

### El `rxcui` es el puente

Se pregunta seguido para qué sirve, así que va explícito: `Interaccion` guarda
`rxcui1` y `rxcui2` y **no tiene ninguna relación con `Medicamento`**. No hay
`medicamentoId` por ningún lado.

Eso significa que **el `rxcui` es el único camino** entre el catálogo y la tabla
de interacciones. Un medicamento sin `rxcui` no existe para el módulo clínico.

No alcanzaría con cruzar por nombre: los pares vienen de una fuente externa que
nombra las drogas a su manera, y `"Fluoxetina"`, `"fluoxetina"` y `"Fluoxetine"`
son tres cadenas distintas y una sola droga. Un cruce fallido es **una
interacción no detectada**, que es el peor error posible acá.

El campo es **opcional** (`decisiones/0005`), y el motivo es el modo de falla: un
`rxcui` ausente se ve y se avisa; uno inventado no se ve y da un resultado falso.

---

## 7. Las cinco reglas que no se rompen

Están en `docs/CONVENCIONES.md` sección 7. Se repiten acá porque son las que
explican por qué el código está escrito así:

1. **Los saldos no se guardan, se calculan.** El disponible de un lote es
   ingresos menos egresos. **No crear una columna de saldo.** Sería una segunda
   fuente de verdad, y en algún momento las dos dirían cosas distintas.
2. **El historial de movimientos es inmutable.** No se edita ni se borra un
   movimiento. La interfaz ni siquiera ofrece esas acciones.
3. **La dispensación es FEFO, no FIFO.** Sale primero el que **vence** antes, no
   el que entró antes. Es lo que evita el desperdicio, y es medio proyecto.
4. **El paciente no tiene datos identificatorios.** Solo un seudónimo.
5. **El sistema asiste, no decide.** Ante una interacción se informa; no se
   bloquea nada. El criterio es del profesional.

Y una sexta, de método: **una consulta de interacciones necesita al menos dos
medicamentos.** Con uno solo no hay nada que cruzar.

---

## 8. Los comandos, y qué hace cada uno

```bash
docker compose up -d      # levanta PostgreSQL. Docker Desktop tiene que estar abierto
npm ci                    # instala EXACTAMENTE lo que dice el lock. No usar npm install
npm run setup             # verifica el .env y genera el cliente Prisma
npm run dev               # servidor de desarrollo en localhost:3000
npm run check             # tsc + eslint + prettier. Tiene que dar 0 antes de commitear
npx prisma migrate dev    # aplica las migraciones pendientes a tu base
npx prisma db seed        # carga los datos de prueba
npx prisma studio         # ver y editar los datos a mano, en el navegador
```

**El orden en una máquina nueva:** crear el `.env`, `npm ci`, `npm run setup`,
`docker compose up -d`, `npx prisma migrate dev`, `npm run dev`.

### Tres trampas que ya nos costaron tiempo

- **El puerto es 5433, no 5432.** Si tenés PostgreSQL instalado en Windows, con
  el 5432 Prisma se conecta **al tuyo** y responde `Authentication failed`
  contra una base que no es la del proyecto.
- **`npm run check` falla si `.next/` quedó de un build viejo**, con un error
  (`Type 'Route' does not satisfy the constraint 'never'`) que apunta a un
  archivo generado y no a tu código. Se arregla con `rm -rf .next`.
- **El `.env` no está en el repositorio y hace falta.** Sin él, Prisma corta con
  `PrismaConfigEnvError`.

La lista completa está en `docs/CONVENCIONES.md` sección 14.

---

## 9. Cómo no marearse

El proyecto cambió varias veces, y va a volver a cambiar. Lo que evita perderse
es saber **dónde se contesta cada pregunta**:

| Si te preguntás... | Mirá |
|---|---|
| ¿Qué hago ahora? | `docs/ROADMAP.md`, tabla "En curso ahora" |
| ¿Cómo quedó lo último que se hizo? | `docs/TRASPASO.md` |
| ¿Por qué esto está así y no de la otra forma? | `docs/decisiones/` |
| ¿Dónde va este código que estoy por escribir? | Este archivo, sección 3 |
| ¿Esto está dentro del alcance? | `docs/CONTEXTO.md` sección 6 |
| ¿Cómo se llama la rama, el commit? | `docs/CONVENCIONES.md` |

**Dos reglas que ahorran tardes enteras:**

**Decidido no es hecho.** Que una decisión esté escrita en `docs/decisiones/` no
significa que el código ya la refleje. Hoy mismo: el `rxcui` está decidido como
opcional y en `schema.prisma` sigue siendo obligatorio, porque falta la
migración de la tarea 2.10.

**Si la documentación y el código se contradicen, no elijas: preguntá.** Una de
las dos está mal, y adivinar cuál es lo que genera el trabajo que después hay que
desandar.

---

## 10. Lo que el programa NO hace, a propósito

Sin autenticación ni roles · sin recetas ni posología · sin nombres comerciales
ni ANMAT · sin proveedores ni órdenes de compra · sin destino del egreso · sin
análisis predictivo · sin auditoría implementada · sin pruebas automatizadas ·
sin consulta a RxNorm en vivo.

**Cada una de esas ausencias es una decisión con justificación escrita**, no un
olvido. Están en `docs/ROADMAP_PRODUCTO.md`, y hay que poder sostenerlas en la
defensa: la tarea 6.10 es justamente preparar esas respuestas.

Si ves algo que "obviamente falta", lo más probable es que esté en esa lista.
Mirala antes de construirlo.
