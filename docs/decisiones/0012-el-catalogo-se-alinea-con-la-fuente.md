# 0012 — El catálogo se alinea con la fuente de interacciones

**Fecha:** 2026-09-08
**Estado:** vigente

**Cierra la decisión abierta D9.**

## Contexto

Con ONCHigh ya importado —1150 pares en la tabla `Interaccion`— se midió contra
el catálogo real, y el resultado es este:

| | |
|---|---|
| Medicamentos del seed con RxCUI | 10 |
| Presentes en ONCHigh | **4**: fluoxetina, sertralina, escitalopram, haloperidol |
| Ausentes | paracetamol, ibuprofeno, amoxicilina, **clonazepam, diazepam, risperidona** |
| **Interacciones detectables entre los del catálogo** | **1** |

Una. Escitalopram con haloperidol.

El módulo clínico es uno de los dos argumentos centrales del proyecto, y la
tarea 6.06 pide explícitamente "pacientes cuya medicación **efectivamente
dispara interacciones**". Con este catálogo no hay demostración: hay una fila.

## De quién es el problema

**No es de la fuente.** ONCHigh está lleno de psicofármacos: citalopram,
clorpromazina, tioridazina, pimozida, los IMAO (fenelzina, tranilcipromina), los
tricíclicos completos, carbamazepina, metadona, metilfenidato, venlafaxina,
paroxetina, fluvoxamina, nefazodona.

**Es del catálogo.** El seed se armó en la tarea 2.08, antes de que hubiera
fuente de interacciones, y quedó con una mezcla razonable para probar stock
—paracetamol, ibuprofeno, amoxicilina— que no tiene nada que ver con lo que una
lista de interacciones de alta prioridad cubre.

Se midió la alternativa: un catálogo de 20 drogas tomadas de la propia lista da
**47 interacciones detectables**, comprobado contra la base ya cargada.

## Decisión

**El catálogo definitivo se elige de manera que se cruce con la fuente.**

Los medicamentos del seed final tienen que cumplir dos cosas a la vez:

1. **Ser verosímiles para una colonia psiquiátrica.** El caso de estudio es ese;
   un catálogo lleno de antirretrovirales para inflar el número de
   interacciones sería peor que tener una sola.
2. **Estar en la fuente.** Un medicamento que no está en ONCHigh es invisible
   para el módulo clínico, por más sentido clínico que tenga.

**Dónde se hace: en la tarea 6.06**, el seed definitivo, que ya existe y ya pide
exactamente esto para el lado del stock ("un medicamento con dos lotes de
distinto vencimiento"). No se crea una tarea nueva.

**Los diez actuales no se borran necesariamente.** Clonazepam y diazepam no
están en ONCHigh pero son verosímiles y sirven al módulo de stock; pueden
quedarse. Lo que hay que garantizar es que **haya suficientes que sí crucen**.

## Lo que esto deja claro, y conviene decirlo en la defensa

Que un medicamento del catálogo no esté en la fuente **no es un error del
sistema**: es una limitación de cobertura de la fuente, y es visible. El
clonazepam es de los psicofármacos más usados en la institución y ONCHigh no lo
cubre.

De ahí sale una obligación de interfaz: las pantallas de la 5.16 y la 5.18
tienen que distinguir **tres** situaciones, no dos:

| Situación | Qué se muestra |
|---|---|
| Se evaluó y no hay interacciones registradas | "No se encontraron interacciones registradas entre los medicamentos evaluados" |
| El medicamento no tiene `rxcui` | No se pudo evaluar: falta el código |
| Tiene `rxcui` pero la fuente no lo cubre | Se evaluó, pero la fuente no tiene datos de esta droga |

La segunda ya estaba prevista por la decisión `0005`. **La tercera es nueva** y
sale de acá. Confundir "sin interacciones" con "sin datos" en un sistema de
apoyo clínico es exactamente el error que no se puede cometer.

## La 5.03 queda sin efecto

La tarea 5.03 —carga manual de al menos 15 pares— existía como red por si el
mapeo de DrugBank a RxCUI resolvía mal. **Resolvió perfecto: 123 de 123**, así
que la razón por la que existía desapareció.

Además, hacerla bien habría significado sacar quince pares de una fuente
citable, que es la misma fuente, con menos filas. No era un camino alternativo:
era un subconjunto.

**Se deja anotada como sin efecto en el roadmap, no se borra.** Si en algún
momento hiciera falta cargar pares de otra fuente, la tarea está descrita.

## Consecuencias

- **La 6.06 crece de alcance**, y ya era de tamaño L. Ahora incluye elegir el
  catálogo contra la fuente, no solo cargar datos de prueba.
- **La 5.16 y la 5.18 tienen un caso más que contemplar.**
- **La 5.03 no se toma.**
- **Ninguna tarea queda bloqueada.** La 5.04 en adelante no dependen de esto.
