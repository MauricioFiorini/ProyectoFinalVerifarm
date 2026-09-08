# 0014 — La consulta guarda lo que evaluó, no solo lo que encontró

**Fecha:** 2026-09-08
**Estado:** vigente

**Cierra la decisión abierta D10.**

## Contexto

`ConsultaInteraccion` salió de la tarea 2.02 con cuatro cosas: paciente
(opcional), usuario (opcional), fecha y las observaciones. **Ninguna relación
con los medicamentos que se evaluaron.**

Eso quiere decir que de una consulta solo sobrevive lo que **dio positivo**. Los
medicamentos que se revisaron y no dispararon nada no dejan rastro.

Se detectó escribiendo la tarea 5.07, antes de empezar la 5.09.

## Por qué no se puede dejar así

**Una consulta sin hallazgos queda vacía.** Se evalúan clonazepam y paracetamol,
ninguno de los dos está en ONCHigh, el resultado es cero interacciones y la fila
guardada dice: usuario, fecha, y nada. En la pantalla `/consultas` (5.20) eso se
lee como "consulta del 08/09 — sin observaciones", y no hay forma de saber sin
observaciones **de qué**. La fila dice que alguien consultó, no qué consultó.

**Y lo más grave: rompe la distinción que el sistema no puede perder.** Todo el
módulo clínico está construido alrededor de que *"no hay interacciones"* y *"no
tengo datos de esta droga"* son cosas distintas. Para eso existe
`rxcuisConCobertura` (5.06) y por eso la 5.18 tiene que mostrar, al lado del
estado vacío, los medicamentos evaluados que la fuente no cubre.

En el momento de la pantalla esa lista está en memoria y el aviso sale bien.
**Pero al reabrir la consulta guardada no hay de dónde sacarla**, así que el
registro histórico diría "no se encontraron interacciones" a secas. Eso es
exactamente la lectura peligrosa: convierte "no había contra qué revisar" en
"revisado y limpio".

**Para la defensa también importa.** Un sistema de apoyo clínico que no puede
decir qué revisó es difícil de sostener, y es una pregunta previsible.

## Decisión

**Se agrega `MedicamentoEvaluado`**, una tabla de unión entre
`ConsultaInteraccion` y `Medicamento`. Migración
`20260908220554_la_consulta_guarda_lo_evaluado`.

```prisma
model MedicamentoEvaluado {
  id            String @id @default(uuid())
  consultaId    String
  medicamentoId String
  createdAt     DateTime @default(now())

  @@unique([consultaId, medicamentoId])
  @@index([medicamentoId])
}
```

### Por qué explícita y no implícita

Prisma sabe crear la tabla de unión solo, con una relación muchos-a-muchos y sin
declarar ningún modelo. Se escribió a mano igual, por dos razones:

1. **Una tabla que Prisma genera por su cuenta no aparece en `schema.prisma`.**
   El modelo de datos es lo que se defiende, y un objeto que existe en la base y
   no en el archivo que la describe es un agujero en esa explicación.
2. **Hay una regla que conviene declarar.** El `@@unique` deja escrito que el
   mismo medicamento no se evalúa dos veces en la misma consulta. El servicio ya
   lo garantiza con `validarMedicamentosDeConsulta` (5.07), pero la base no
   tiene por qué depender de que nadie se saltee esa función.

### Lo que NO se agregó, y es a propósito

**No se guarda si el medicamento tenía cobertura al momento de la consulta.**
Sería más fiel a la historia —si mañana cambia la fuente, una consulta vieja
cambiaría de significado—, pero es una columna que ninguna tarea pide y que
resuelve un problema que el prototipo no tiene: los datos de `Interaccion` se
cargan una sola vez.

La cobertura se recalcula con `rxcuisConCobertura` a partir de los medicamentos
guardados, y eso alcanza. Si el equipo quisiera congelarla, la tabla ya existe y
sumar la columna es una migración chica.

**Tampoco se guarda el RxCUI del momento**, por lo mismo.

## Consecuencias

- **Los tres tienen que aplicar la migración**, con `npx prisma migrate dev` y
  después `npm run setup`.
- **La migración solo crea una tabla.** No toca ninguna existente, así que no
  hay riesgo de perder datos ni de que pida resetear.
- **La 5.09 tiene que crear las filas de `MedicamentoEvaluado` dentro de la
  misma transacción** que la consulta y sus observaciones. Una consulta guardada
  sin su lista de evaluados es el problema de esta decisión otra vez.
- **La 5.18 y la 5.20 pasan a poder reconstruirse desde la base**, sin depender
  de lo que haya quedado en memoria.
- **La 5.09 guarda TODOS los medicamentos evaluados**, tengan `rxcui` o no. Un
  medicamento sin código también se evaluó: lo que no se pudo es cruzarlo, y esa
  es información que la pantalla tiene que dar (decisión `0005`).
