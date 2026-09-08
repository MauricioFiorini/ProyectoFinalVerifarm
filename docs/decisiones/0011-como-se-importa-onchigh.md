# 0011 — Cómo se importa ONCHigh, y qué no trae la fuente

**Fecha:** 2026-09-08
**Estado:** vigente

**Es la ejecución de la decisión `0010`, no la reemplaza.** La `0010` eligió la
fuente; esta dice qué salió cuando se la fue a buscar y cómo se resolvió cada
cosa que la fuente no da.

## Lo que se encontró

La decisión `0010` anticipaba tres trabajos: obtener los archivos, mapear
DrugBank a RxCUI y redactar las descripciones de severidad. El riesgo grande era
el mapeo. **Resultó al revés.**

**El mapeo no es un riesgo: resuelve completo.** RxNav acepta
`idtype=DRUGBANK`, y las 123 drogas del conjunto mapean a un RxCUI. 118 dan
nivel ingrediente en el primer código; las otras 5 lo dan en el segundo que
devuelve la misma consulta.

**Lo que la fuente no trae es la severidad y la descripción.** Verificado por
tres caminos independientes, porque es una ausencia y las ausencias se
confirman, no se suponen:

1. La planilla original tiene cuatro columnas —clase y droga del objeto, clase y
   droga del precipitante— y ninguna es severidad.
2. El script de carga del propio proyecto de origen
   (`scripts/load-ONC-HighPriority-DDIs.py`) lee exactamente esos cuatro campos.
3. En el conjunto combinado del repositorio, las 4031 filas de ONC tienen
   `effectConcept = None`.

## Decisiones

### Todas las filas entran con severidad `ALTA`

ONCHigh **es** una lista de interacciones de alta prioridad: esa es su
definición, no una interpretación nuestra. Como no publica una escala interna,
graduar las filas sería inventar la graduación, y `docs/REGLAS_IA.md` sección 5
lo prohíbe.

**Consecuencia que hay que asumir:** la tarea 5.18 pide las observaciones
"ordenadas por severidad, con color según ese valor" y con esta fuente hay una
sola categoría. La pantalla se construye igual —el campo existe y otra fuente
podría traer grados— pero en la demostración todo va a salir en el mismo color.
**Decirlo es mejor que fabricar tres niveles para que la pantalla se vea más
linda.**

### La descripción se compone con la clase, que sí es dato de la fuente

La planilla organiza las interacciones por **pares de clases**: cada entrada
numerada cruza una clase de fármaco afectado con una de fármaco desencadenante,
y lista los miembros de cada una. Eso es información publicada, y es lo que
permite decir algo verdadero de cada par sin inventar el efecto clínico.

La descripción queda así:

> Par de alta prioridad de la lista ONC: inhibidores selectivos de la
> recaptación de serotonina (ISRS) (fármaco afectado) con inhibidores de la
> monoaminooxidasa (IMAO) (fármaco desencadenante). Entrada #8 de la lista.

**No dice qué le pasa al paciente.** No dice "riesgo de síndrome
serotoninérgico" ni ninguna otra consecuencia clínica, porque la fuente no lo
dice. Dice de qué clases se trata y en qué entrada de la lista está, que es lo
que se puede sostener.

Los nombres de clase se tradujeron al español con una tabla explícita en el
generador, y **el original en inglés queda guardado en cada fila** del JSON para
que la traducción se pueda auditar sin volver a los archivos.

### El bloque de QT se describe aparte

La entrada #21 es "QT prolonging agents × QT prolonging agents" y en la planilla
no lista sus drogas: salen del archivo de CredibleMeds que está en la misma
carpeta. Son **780 de los 1150 pares**, o sea la mayor parte del conjunto. Su
descripción lo dice y cita esa lista.

### El par se ordena siempre igual, y hay una sola función que lo decide

`Interaccion` tiene `@@unique([rxcui1, rxcui2])` y una interacción no tiene
dirección. Si una fila entra como (A, B) y otra como (B, A), la unicidad no las
ve duplicadas y la tabla guarda la misma interacción dos veces. Peor: el motor
(5.06) buscaría por un orden y no encontraría la fila cargada con el otro, y
**una interacción no detectada es el peor error que puede cometer este
sistema**.

Por eso existe `src/lib/rxcui.ts` con `ordenarParRxcui`. **Todo lo que escriba o
consulte `Interaccion` tiene que pasar por ahí.** El esquema ya lo pedía en un
comentario; ahora es una función que se puede usar.

De los 1930 pares del archivo quedan **1150** después de ordenar y deduplicar:
la fuente trae cada par en las dos direcciones.

### Correcciones de mapeo, una por una

Cinco identificadores devolvían un código que no era de ingrediente (un producto
de liberación prolongada, un nombre comercial). Se tomó el de ingrediente, que
es lo que fija la decisión `0008`.

**Y una corrección discutible, que se deja anotada porque lo es.** El crosswalk
de RxNav manda `DB00182` —"Amphetamine" en el archivo— al RxCUI 3288, que es
**dextro**anfetamina: el mismo al que manda `DB01576`, "Dextroamphetamine". Las
dos drogas colapsarían en un solo concepto. Como la lista de origen las enumera
por separado, se usa 725 ("amphetamine", nivel ingrediente, verificado) para la
primera. **Si el equipo prefiere respetar el crosswalk tal como viene, se borra
una línea del generador y las dos vuelven a ser 3288.**

## Erratas de la fuente, que no se corrigen

La planilla original tiene cinco nombres que no resuelven en RxNorm:
`Lisdexamefetamine`, `Esmoprazole`, `Voreconazole`, `Moclobamide` y `NSAID`.
Los cuatro primeros son errores de tipeo; el quinto es una etiqueta de clase
puesta donde va una droga.

**No se corrigieron.** La lista de pares que se importa es el CSV ya mapeado a
DrugBank, no la planilla; la planilla se usa solo para saber a qué clase
pertenece cada par. El único efecto es que **cinco pares quedan sin clase**
—los de atazanavir con inductores de CYP3A4, por la errata de `NSAID`— y su
descripción lo dice explícitamente en vez de inventarles una.

Inferir que donde dice `NSAID` iba "Atazanavir" es razonable y probablemente
cierto, pero es una inferencia nuestra sobre datos clínicos. Cinco filas de 1150
no justifican empezar a completar la fuente.

## Cómo se rehace

`prisma/datos/generar-onchigh.mjs` está versionado con las instrucciones en su
cabecera. Necesita el paquete `xlsx`, que **no es dependencia del proyecto** y no
hay que agregarla: el script corre en una carpeta aparte y lo único que vuelve
al repositorio es su salida.

El JSON está en `.prettierignore`: el formato lo decide el generador, y
reformatearlo haría ilegible el diff de una regeneración.

## Consecuencias

- **La tabla `Interaccion` tiene datos y la 5.06 se puede escribir.**
- **El motor de la 5.06 tiene que usar `ordenarParRxcui`.** No hay una segunda
  forma válida de ordenar el par.
- **La 5.18 va a mostrar una sola severidad.** Está previsto, no es un defecto.
- **Hay que poder decir en la defensa de dónde salió cada fila.** Cada una trae
  su `fuente`, y el JSON guarda además la entrada de la lista y los nombres
  originales.
- **La vigencia se declara:** archivos de 2017, extracción original de 2014.
- **Esto no alcanza para que la demostración muestre algo.** Ver la decisión
  `0012`.
