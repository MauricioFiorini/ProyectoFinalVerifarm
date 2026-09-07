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
