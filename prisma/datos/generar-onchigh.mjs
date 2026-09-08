// Generador del archivo de interacciones ONCHigh (tarea 5.02).
//
// ESTE SCRIPT NO ES PARTE DE LA APLICACION Y NO CORRE EN CADA SEED.
//
// Se corrio una vez, el 2026-09-08, y lo que quedo versionado es su salida:
// `prisma/datos/onchigh.json`. El script queda en el repositorio para que la
// procedencia del dato sea reproducible y no haya que creerle a nadie.
//
// Necesita los tres archivos de origen y el paquete `xlsx`, que NO es una
// dependencia del proyecto y no hay que agregarla. Para volver a correrlo, en
// una carpeta aparte:
//
//   npm install xlsx
//   curl -sLO "https://raw.githubusercontent.com/dbmi-pitt/public-PDDI-analysis/master/PDDI-Datasets/ONC-High-Priority/ONC_High_Priority_Mapped.csv"
//   curl -sL -o "ONC_High_Priority_List.xls" "https://raw.githubusercontent.com/dbmi-pitt/public-PDDI-analysis/master/PDDI-Datasets/ONC-High-Priority/ONC%20High%20Priority%20List.xls"
//   curl -sL -o "CredibleMeds_QT.xlsx" "https://raw.githubusercontent.com/dbmi-pitt/public-PDDI-analysis/master/PDDI-Datasets/ONC-High-Priority/CredibleMeds%20QTDrugs%20-%20Known%20TdP%20risk%20List.xlsx"
//   node generar-onchigh.mjs
//
// Ademas consulta RxNav en vivo para traducir identificadores a RxCUI. Eso NO
// contradice que RxNorm en vivo este fuera del alcance (docs/CONTEXTO.md
// seccion 6): esa regla es sobre la aplicacion en ejecucion. Aca es una
// conversion hecha una sola vez, igual que la verificacion de la tarea 2.11.
//
// El detalle de lo que decide este script esta en
// docs/decisiones/0011-como-se-importa-onchigh.md

import fs from "node:fs";
import XLSX from "xlsx";

const FUENTE =
  "ONC High Priority List (Phansalkar et al., JAMIA 2012), via dbmi-pitt/public-PDDI-analysis";

// --- Correcciones de mapeo, una por una y con motivo ------------------------
//
// Para cinco identificadores RxNav devuelve mas de un RxCUI y el primero no es
// el ingrediente. Se toma el de nivel ingrediente, que es lo que fija la
// decision 0008.
const RXCUI_DE_INGREDIENTE = {
  DB00559: "75207", // devolvia 1468845 "bosentan anhydrous" (PIN)
  DB00514: "3289", //  devolvia 236146 "dextromethorphan polistirex" (PIN)
  DB00852: "8896", //  devolvia 407885 "pseudoephedrine polistirex" (PIN)
  DB00196: "4450", //  devolvia 202813 "Diflucan" (BN, nombre comercial)
  DB00191: "8152", //  devolvia 221138 "phentermine resin" (PIN)

  // CORRECCION DE OTRO TIPO, y la unica discutible del archivo.
  //
  // El crosswalk de RxNav manda DB00182 ("Amphetamine" en el CSV) al RxCUI
  // 3288, que es DEXTROanfetamina: el mismo al que manda DB01576
  // ("Dextroamphetamine"). Las dos drogas colapsarian en un solo concepto.
  //
  // La lista de origen las enumera por separado, o sea que las trata como
  // distintas. 725 es "amphetamine" a nivel ingrediente, verificado contra
  // RxNorm. Se usa 725 para respetar esa distincion.
  //
  // Si al equipo le parece que hay que respetar el crosswalk tal como viene,
  // se borra esta linea y las dos vuelven a ser 3288.
  DB00182: "725",
};

// Nombres de clase de la lista, traducidos. El original en ingles queda en el
// campo `origen` de cada fila del JSON, para que la traduccion se pueda
// auditar sin volver a los archivos.
const CLASES = {
  "Amphetamine derivatives": "derivados anfetaminicos",
  MAOI: "inhibidores de la monoaminooxidasa (IMAO)",
  "MAO inhibitors": "inhibidores de la monoaminooxidasa (IMAO)",
  "Monoamine oxidase (MAO) inhibitors":
    "inhibidores de la monoaminooxidasa (IMAO)",
  "Proton Pump Inhibitors": "inhibidores de la bomba de protones",
  SSRIs: "inhibidores selectivos de la recaptacion de serotonina (ISRS)",
  "Narcotic analgesics": "analgesicos narcoticos",
  "Tricyclic antidepressants (TCAs)": "antidepresivos triciclicos",
  "QT prolonging agents": "agentes que prolongan el intervalo QT",
  "Specific CYP1A2 inhibitors": "inhibidores especificos de CYP1A2",
  "CYP 1A2 inhibitors": "inhibidores de CYP1A2",
  "Protease inhibitors": "inhibidores de proteasa",
  "Strong CYP3A4 inducers": "inductores potentes de CYP3A4",
  "HMG Co-A reductase inhibitors":
    "inhibidores de la HMG-CoA reductasa (estatinas)",
  "Ergot alkaloids and derivatives": "alcaloides del ergot y derivados",
  Triptans: "triptanes",
  "CYP3A4 Inhibitors / Protease Inhibitors":
    "inhibidores de CYP3A4 (inhibidores de proteasa)",
  "CYP3A4 inhibitors / Protease inhibitors":
    "inhibidores de CYP3A4 (inhibidores de proteasa)",
  "CYP3A4 Inhibitors / Macrolides": "inhibidores de CYP3A4 (macrolidos)",
  "CYP3A4 inhibitors / Macrolides": "inhibidores de CYP3A4 (macrolidos)",
  "CYP3A4 Inhibitors / Azoles": "inhibidores de CYP3A4 (azoles)",
  "CYP3A4 inhibitors / Azoles": "inhibidores de CYP3A4 (azoles)",
  "CYP3A4 inhibitors / Indinavir": "inhibidores de CYP3A4 (indinavir)",
};

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function rxcuiDeDrugbank(db) {
  if (RXCUI_DE_INGREDIENTE[db]) return RXCUI_DE_INGREDIENTE[db];
  const r = await fetch(
    `https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=DRUGBANK&id=${db}`,
  );
  return (await r.json())?.idGroup?.rxnormId?.[0] ?? null;
}

const COMILLAS = /[‘’']/g;

async function rxcuiDeNombre(nombre) {
  const limpio = nombre.replace(COMILLAS, "").trim();
  for (const search of [0, 1]) {
    const r = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(limpio)}&search=${search}`,
    );
    const id = (await r.json())?.idGroup?.rxnormId?.[0];
    if (id) return id;
  }
  return null;
}

/** El par se ordena SIEMPRE igual; si no, (A,B) y (B,A) entran las dos. */
function ordenar(a, b) {
  return a < b ? [a, b] : [b, a];
}

function leerBloques() {
  const wb = XLSX.readFile("ONC_High_Priority_List.xls");
  const filas = XLSX.utils.sheet_to_json(wb.Sheets["Revised Table 2"], {
    header: 1,
    defval: "",
  });
  const bloques = [];
  let b = null;
  for (const f of filas.slice(1)) {
    const [num, oc, od, pc, pd] = [0, 1, 2, 3, 4].map((i) =>
      String(f[i] ?? "")
        .trim()
        .replace(/\s+/g, " "),
    );
    if (num !== "") {
      b = { num, claseObjeto: oc, drogasObjeto: [], grupos: [] };
      bloques.push(b);
    }
    if (!b) continue;
    if (oc && !b.claseObjeto) b.claseObjeto = oc;
    if (od) b.drogasObjeto.push(od);
    if (pc) b.grupos.push({ clase: pc, drogas: [] });
    if (pd) {
      if (b.grupos.length === 0) b.grupos.push({ clase: "", drogas: [] });
      b.grupos.at(-1).drogas.push(pd);
    }
  }
  return bloques;
}

function describir(claseObjeto, clasePrecipitante, numero) {
  const ref = numero ? ` Entrada #${numero} de la lista.` : "";
  if (claseObjeto === "QT prolonging agents") {
    return (
      "Ambos farmacos prolongan el intervalo QT. Par de alta prioridad de la " +
      "lista ONC; las drogas provienen de la lista de riesgo conocido de " +
      "torsades de pointes de CredibleMeds."
    );
  }
  const o = CLASES[claseObjeto] ?? claseObjeto;
  const p = CLASES[clasePrecipitante] ?? clasePrecipitante;
  if (o && p) {
    return `Par de alta prioridad de la lista ONC: ${o} (farmaco afectado) con ${p} (farmaco desencadenante).${ref}`;
  }
  if (p) {
    return `Par de alta prioridad de la lista ONC. El farmaco desencadenante pertenece a: ${p}.${ref}`;
  }
  if (o) {
    return `Par de alta prioridad de la lista ONC. El farmaco afectado pertenece a: ${o}.${ref}`;
  }
  return "Par de alta prioridad de la lista ONC. La fuente no publica la clase ni el efecto clinico de esta entrada.";
}

async function main() {
  const bloques = leerBloques();

  const nombres = new Set();
  for (const b of bloques) {
    for (const o of b.drogasObjeto) nombres.add(o);
    for (const g of b.grupos) for (const p of g.drogas) nombres.add(p);
  }
  const wbQt = XLSX.readFile("CredibleMeds_QT.xlsx");
  const filasQt = XLSX.utils.sheet_to_json(wbQt.Sheets[wbQt.SheetNames[0]], {
    header: 1,
    defval: "",
  });
  const nombresQt = filasQt
    .slice(1)
    .map((f) => String(f[0]).trim())
    .filter(Boolean);
  for (const n of nombresQt) nombres.add(n);

  console.log(`Resolviendo ${nombres.size} nombres contra RxNav...`);
  const porNombre = {};
  const noResuelven = [];
  for (const n of nombres) {
    porNombre[n] = await rxcuiDeNombre(n);
    if (!porNombre[n]) noResuelven.push(n);
    await espera(60);
  }
  if (noResuelven.length) {
    console.log(
      `  ${noResuelven.length} sin resolver (erratas de la planilla original): ${noResuelven.join(", ")}`,
    );
  }

  const clasePorPar = new Map();
  for (const b of bloques) {
    for (const g of b.grupos) {
      for (const o of b.drogasObjeto) {
        const ro = porNombre[o];
        if (!ro) continue;
        for (const p of g.drogas) {
          const rp = porNombre[p];
          if (!rp) continue;
          clasePorPar.set(`${ro}|${rp}`, {
            num: b.num,
            co: b.claseObjeto,
            cp: g.clase,
          });
        }
      }
    }
  }
  const rxcuisQt = new Set(nombresQt.map((n) => porNombre[n]).filter(Boolean));

  const csv = fs
    .readFileSync("ONC_High_Priority_Mapped.csv", "utf8")
    .replace(/^﻿/, "");
  const lineas = csv.split(/\r?\n/).filter((l) => l.trim());
  console.log(`Mapeando ${lineas.length} pares a RxCUI...`);

  const cache = new Map();
  const salida = new Map();
  let sinClase = 0;
  for (const l of lineas) {
    const [nombreObj, dbObj, nombrePre, dbPre] = l.split("$");
    for (const db of [dbObj, dbPre]) {
      if (!cache.has(db)) {
        cache.set(db, await rxcuiDeDrugbank(db));
        await espera(60);
      }
    }
    const ro = cache.get(dbObj);
    const rp = cache.get(dbPre);
    if (!ro || !rp) {
      console.log(`  SIN RXCUI: ${nombreObj} / ${nombrePre}`);
      continue;
    }
    // Un par consigo mismo no es una interaccion. Aparece porque la expansion
    // de "QT x QT" cruza la lista contra si misma.
    if (ro === rp) continue;

    const info =
      clasePorPar.get(`${ro}|${rp}`) ??
      clasePorPar.get(`${rp}|${ro}`) ??
      (rxcuisQt.has(ro) && rxcuisQt.has(rp)
        ? { num: "21", co: "QT prolonging agents", cp: "QT prolonging agents" }
        : null);
    if (!info) sinClase++;

    const [rxcui1, rxcui2] = ordenar(ro, rp);
    const clave = `${rxcui1}|${rxcui2}`;
    // El CSV trae cada par en las dos direcciones. Al ordenar, la segunda vez
    // es la misma fila; se queda la primera que llego.
    if (salida.has(clave)) continue;
    salida.set(clave, {
      rxcui1,
      rxcui2,
      severidad: "ALTA",
      descripcion: describir(info?.co ?? "", info?.cp ?? "", info?.num),
      fuente: FUENTE,
      // Trazabilidad. No lo lee la aplicacion, lo lee una persona.
      origen: {
        entrada: info?.num ?? null,
        objeto: nombreObj,
        precipitante: nombrePre,
        claseObjetoOriginal: info?.co ?? null,
        clasePrecipitanteOriginal: info?.cp ?? null,
      },
    });
  }

  const filas = [...salida.values()].sort(
    (a, b) =>
      a.rxcui1.localeCompare(b.rxcui1) || a.rxcui2.localeCompare(b.rxcui2),
  );
  fs.writeFileSync(
    "onchigh.json",
    JSON.stringify(
      {
        generado: "2026-09-08",
        fuente: FUENTE,
        vigencia:
          "Archivos del repositorio de 2017; la extraccion original de la lista es de 2014.",
        paresEnElArchivoOriginal: lineas.length,
        paresUnicos: filas.length,
        interacciones: filas,
      },
      null,
      2,
    ),
  );
  console.log(`\npares en el archivo: ${lineas.length}`);
  console.log(`pares unicos:        ${filas.length}`);
  console.log(`sin clase:           ${sinClase}`);
}

void main();
