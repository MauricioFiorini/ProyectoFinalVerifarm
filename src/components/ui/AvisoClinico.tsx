// Aviso obligatorio de las pantallas clinicas (tarea 5.19).
//
// POR QUE ES OBLIGATORIO Y POR QUE ES UN COMPONENTE
//
// Verifarm asiste una decision clinica; no la toma. Ninguna pantalla bloquea,
// impide ni recomienda: informan lo que hay cargado. Eso tiene que estar dicho
// donde se lee el dato, no solamente en la documentacion.
//
// Estaba escrito a mano en tres pantallas, con tres redacciones distintas. Tres
// copias de un aviso que tiene que decir lo mismo en todos lados es la forma
// segura de que un dia digan cosas distintas —y de que la cuarta pantalla se
// olvide de ponerlo—. Por eso sube a `src/components/ui/`, donde la regla es
// que algo llega cuando **dos o mas rutas necesitan lo mismo**: acá son cinco.
//
// **Esto lleva `src/components/ui/` de cinco archivos a seis.** Los otros son
// Boton, Campo, Tabla, Modal y Chip.
//
// POR QUE NO ES UN CARTEL DE COLOR
//
// Va en todas las pantallas clinicas, y un recuadro rojo repetido cinco veces
// deja de leerse a la tercera: se vuelve parte del fondo. Ademas competiria por
// atencion con los avisos que SI dicen algo de este paciente —la falta de
// cobertura de una droga, una interaccion encontrada—, que son los que hay que
// mirar.
//
// La linea separadora y el texto legible alcanzan para que este presente sin
// tapar lo que importa.

type Props = {
  /**
   * Texto adicional propio de la pantalla, antes del aviso.
   *
   * La ficha del paciente lo usa para aclarar que la evaluacion corre sobre la
   * medicacion vigente. Es informacion de esa pantalla, no del aviso: por eso
   * entra como texto de afuera y no como una variante mas del componente.
   */
  children?: React.ReactNode;
};

export function AvisoClinico({ children }: Props) {
  return (
    <p className="border-t border-borde pt-4 text-sm text-texto-tenue">
      {children ? <>{children} </> : null}
      El sistema informa lo que hay registrado en su fuente y{" "}
      <strong className="font-medium text-texto">
        no reemplaza el criterio profesional
      </strong>
      .
    </p>
  );
}
