import { respuestaDeError } from "@/lib/respuestaHttp";
import {
  obtenerStockBajo,
  obtenerVencimientosProximos,
} from "@/services/stock";
import { obtenerConsultasDelDia } from "@/services/consultas";

// Endpoint de metricas de la pantalla de inicio (tarea 6.03).
//
// Consolida en una unica llamada HTTP los tres indicadores requeridos para el
// tablero de inicio: medicamentos que requieren reposicion urgente por estar
// bajo su stock minimo, lotes con vencimiento proximo dentro de los 30 dias, y
// las consultas de interacciones realizadas en el dia de hoy.
//
// Las pantallas consumen la API y no importan servicios directamente,
// respetando la arquitectura de la aplicacion (docs/ARQUITECTURA.md seccion 3).

export async function GET() {
  try {
    const [stockBajo, vencimientosProximos, consultasDelDia] =
      await Promise.all([
        obtenerStockBajo(),
        obtenerVencimientosProximos(30),
        obtenerConsultasDelDia(),
      ]);

    return Response.json({
      stockBajo,
      vencimientosProximos,
      consultasDelDia,
    });
  } catch (error) {
    return respuestaDeError(error, "GET /api/inicio");
  }
}
