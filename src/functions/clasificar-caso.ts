/**
 * FUNCTION: Clasificar Caso
 * Clasifica automáticamente el caso basándose en keywords y reglas de negocio
 */

import { clasificacionService } from '../services/clasificacion.service';
import { SessionState } from '../types/schemas';
import { JustificacionCaso } from '../types/enums';

export interface ClasificarCasoInput {
  sessionState: SessionState;
}

export interface ClasificarCasoOutput {
  success: boolean;
  tipoCaso?: string;
  criticidad?: string;
  justificacion?: string;
  confianza?: number;
  razonamiento?: string;
  mensaje?: string;
  sessionState: SessionState;
}

/**
 * Función principal: Clasificar caso automáticamente
 */
export async function clasificarCaso(input: ClasificarCasoInput): Promise<ClasificarCasoOutput> {
  const { sessionState } = input;

  try {
    // ========================================================================
    // 1. CLASIFICAR CON EL SERVICIO
    // ========================================================================

    const resultado = clasificacionService.clasificarCaso(sessionState);

    // ========================================================================
    // 2. ACTUALIZAR SESSION STATE
    // ========================================================================

    sessionState.tipoCaso = resultado.tipoCaso;
    sessionState.criticidad = resultado.criticidad;
    sessionState.justificacion = resultado.justificacion;

    // ========================================================================
    // 3. GENERAR RESUMEN PARA EL USUARIO
    // ========================================================================

    const resumenClasificacion = clasificacionService.generarResumenClasificacion(resultado);

    return {
      success: true,
      tipoCaso: resultado.tipoCaso,
      criticidad: resultado.criticidad,
      justificacion: resultado.justificacion,
      confianza: resultado.confianza,
      razonamiento: resultado.razonamiento,
      mensaje: resumenClasificacion,
      sessionState
    };

  } catch (error) {
    console.error('Error en clasificarCaso:', error);

    // En caso de error, clasificar como pendiente
    sessionState.tipoCaso = undefined;
    sessionState.criticidad = undefined;
    sessionState.justificacion = JustificacionCaso.PENDIENTE_INVESTIGACION;

    return {
      success: false,
      mensaje: 'No se pudo clasificar automáticamente. El caso será revisado manualmente.',
      sessionState
    };
  }
}

/**
 * Endpoint handler para llamadas HTTP desde Kapso
 */
export async function clasificarCasoHandler(req: any, res: any) {
  try {
    console.log('='.repeat(70));
    console.log('🔍 CLASIFICAR CASO HANDLER');
    console.log('='.repeat(70));
    console.log('Body RAW:', JSON.stringify(req.body, null, 2));

    let sessionState: SessionState;

    // Aceptar múltiples formatos (igual que validar-cliente)
    if (req.body.sessionState && typeof req.body.sessionState === 'object') {
      sessionState = req.body.sessionState;
    } else if (req.body && Object.keys(req.body).length > 0) {
      sessionState = req.body;
    } else {
      console.error('❌ ERROR: No se encontraron datos');
      return res.status(400).json({
        error: 'sessionState requerido'
      });
    }

    console.log('📦 SessionState procesado:', JSON.stringify(sessionState, null, 2));

    const input: ClasificarCasoInput = { sessionState };
    const resultado = await clasificarCaso(input);

    console.log('✅ Resultado:', JSON.stringify(resultado, null, 2));

    return res.status(resultado.success ? 200 : 400).json(resultado);

  } catch (error) {
    console.error('Error en clasificarCasoHandler:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
}
