// Identificadores fijos de los usuarios que carga el seed.
//
// POR QUE EXISTE ESTE ARCHIVO
//
// El prototipo no tiene autenticacion —esta fuera del alcance por decision, ver
// docs/CONTEXTO.md seccion 6— pero `MovimientoStock.usuarioId` es obligatorio:
// el historial de movimientos es un libro mayor y cada asiento tiene autor,
// aunque en el prototipo sea siempre el mismo.
//
// La salida acordada es usar un usuario fijo del seed. Ver
// docs/decisiones/0009-usuario-fijo-para-los-movimientos.md
//
// POR QUE LOS ID ESTAN ESCRITOS Y NO GENERADOS
//
// El seed los creaba con `@default(uuid())`, asi que cambiaban en cada corrida.
// Comprobado ejecutandolo dos veces seguidas: los tres id eran distintos. Con
// ids generados, cualquier constante que apunte a uno de ellos se rompe la
// primera vez que alguien vuelve a sembrar, y el error es una violacion de clave
// foranea que no menciona ni al seed ni a la constante.
//
// Por eso los ids viven aca, escritos, y el seed los importa: una sola fuente.
//
// PROVISORIO
//
// `USUARIO_PROVISORIO_ID` se borra cuando entre la autenticacion. Ese dia, el
// usuario de un movimiento sale de la sesion y este archivo deja de tener
// sentido. Es el unico lugar a tocar.

export const USUARIO_ADMIN_ID = "621d699b-6ade-46ea-a03e-a6bd1adecc82";
export const USUARIO_FARMACEUTICO_ID = "2c648904-0b4a-4813-ba22-23ecc7efba78";
export const USUARIO_MEDICO_ID = "373517e7-b057-4e05-887b-0f93f4134bec";

/**
 * Usuario al que se le atribuyen los movimientos de stock mientras no haya
 * autenticacion. Es el farmaceutico, que es quien registra ingresos y egresos
 * en el dominio real.
 *
 * PROVISORIO: se reemplaza por el usuario de la sesion cuando entre la
 * autenticacion.
 */
export const USUARIO_PROVISORIO_ID = USUARIO_FARMACEUTICO_ID;

/**
 * Usuario al que se le atribuyen las consultas de interacciones mientras no
 * haya autenticacion. Es el medico, que es quien consulta en el dominio real.
 *
 * Es una constante aparte y no `USUARIO_PROVISORIO_ID` porque no es el mismo
 * rol: los movimientos de stock los registra el farmaceutico y las consultas
 * las hace el medico. Que en el prototipo las dos sean fijas no las vuelve la
 * misma cosa.
 *
 * PROVISORIO: se reemplaza por el usuario de la sesion cuando entre la
 * autenticacion, o por el selector simulado de la tarea 6.02, lo que llegue
 * primero.
 */
export const USUARIO_CLINICO_PROVISORIO_ID = USUARIO_MEDICO_ID;

export type RolUsuarioSimulado = "ADMINISTRADOR" | "FARMACEUTICO" | "MEDICO";

export type UsuarioSimulado = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuarioSimulado;
  etiquetaRol: string;
  descripcion: string;
};

/**
 * Los tres usuarios del seed disponibles para simulación en la interfaz (tarea 6.02).
 * Reemplazan la autenticación real en el prototipo.
 */
export const USUARIOS_SIMULADOS = [
  {
    id: USUARIO_FARMACEUTICO_ID,
    nombre: "Farm. Pérez",
    email: "farmacia@verifarm.com",
    rol: "FARMACEUTICO",
    etiquetaRol: "Farmacéutico",
    descripcion: "Gestión de stock, lotes, ingresos y dispensación FEFO",
  },
  {
    id: USUARIO_MEDICO_ID,
    nombre: "Dr. House",
    email: "medico@verifarm.com",
    rol: "MEDICO",
    etiquetaRol: "Médico",
    descripcion: "Evaluación clínica de pacientes e interacciones",
  },
  {
    id: USUARIO_ADMIN_ID,
    nombre: "Admin Sistema",
    email: "admin@verifarm.com",
    rol: "ADMINISTRADOR",
    etiquetaRol: "Administrador",
    descripcion: "Gestión del catálogo y configuración general",
  },
] as const satisfies readonly [UsuarioSimulado, ...UsuarioSimulado[]];

export const USUARIO_DEFECTO: UsuarioSimulado = USUARIOS_SIMULADOS[0];
