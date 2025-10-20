/**
 * FUNCTION: Guardar Interacción
 * Registra una interacción del chatbot con el cliente
 */

import { supabaseService } from '../services/supabase.service';
import { SessionState, InteraccionCreate } from '../types/schemas';

export interface GuardarInteraccionInput {
  sessionState: SessionState;
  session_id?: string;
  flow_id?: string;
  tipo_interaccion: string; // inicio, identificacion, producto, descripcion, cierre
  nodo_inicio?: string;
  nodo_fin?: string;
  duracion_segundos?: number;
  completada?: boolean;
  error_ocurrido?: boolean;
  error_detalle?: string;
}

export interface GuardarInteraccionOutput {
  success: boolean;
  interaccionId?: string;
  mensaje?: string;
  sessionState: SessionState;
}

/**
 * Función principal: Guardar interacción del chatbot
 */
export async function guardarInteraccion(
  input: GuardarInteraccionInput
): Promise<GuardarInteraccionOutput> {
  const { sessionState, ...interaccionData } = input;

  try {
    // ========================================================================
    // 1. VALIDAR DATOS MÍNIMOS REQUERIDOS
    // ========================================================================

    if (!sessionState.casoId) {
      return {
        success: false,
        mensaje: 'ID de caso requerido para registrar interacción',
        sessionState
      };
    }

    if (!interaccionData.tipo_interaccion) {
      return {
        success: false,
        mensaje: 'Tipo de interacción requerido',
        sessionState
      };
    }

    // ========================================================================
    // 2. PREPARAR DATOS DE LA INTERACCIÓN
    // ========================================================================

    const interaccion: InteraccionCreate = {
      caso_id: sessionState.casoId,
      session_id: interaccionData.session_id,
      flow_id: interaccionData.flow_id,
      tipo_interaccion: interaccionData.tipo_interaccion,
      nodo_inicio: interaccionData.nodo_inicio,
      nodo_fin: interaccionData.nodo_fin,
      duracion_segundos: interaccionData.duracion_segundos,
      completada: interaccionData.completada ?? false,
      error_ocurrido: interaccionData.error_ocurrido ?? false,
      error_detalle: interaccionData.error_detalle
    };

    // ========================================================================
    // 3. CREAR INTERACCIÓN EN SUPABASE
    // ========================================================================

    const interaccionCreada = await supabaseService.crearInteraccion(interaccion);

    console.log('✅ Interacción registrada:', {
      id: interaccionCreada.id,
      tipo: interaccionCreada.tipo_interaccion,
      completada: interaccionCreada.completada
    });

    return {
      success: true,
      interaccionId: interaccionCreada.id,
      mensaje: `Interacción ${interaccionData.tipo_interaccion} registrada exitosamente`,
      sessionState
    };

  } catch (error) {
    console.error('Error en guardarInteraccion:', error);

    return {
      success: false,
      mensaje: `Error al guardar interacción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      sessionState
    };
  }
}

/**
 * Endpoint handler para llamadas HTTP desde Kapso
 */
export async function guardarInteraccionHandler(req: any, res: any) {
  try {
    console.log('='.repeat(70));
    console.log('📝 GUARDAR INTERACCIÓN HANDLER');
    console.log('='.repeat(70));
    console.log('Body RAW:', JSON.stringify(req.body, null, 2));

    let sessionState: SessionState;
    let interaccionData: any = {};

    // Aceptar múltiples formatos
    if (req.body.sessionState && typeof req.body.sessionState === 'object') {
      sessionState = req.body.sessionState;
      // Los datos de la interacción pueden venir fuera del sessionState
      interaccionData = { ...req.body };
      delete interaccionData.sessionState;
    } else if (req.body && Object.keys(req.body).length > 0) {
      // Separar sessionState de datos de interacción
      const { casoId, ...resto } = req.body;
      sessionState = { casoId } as SessionState;
      interaccionData = resto;
    } else {
      console.error('❌ ERROR: No se encontraron datos');
      return res.status(400).json({
        error: 'Datos requeridos'
      });
    }

    console.log('📦 SessionState procesado:', JSON.stringify(sessionState, null, 2));
    console.log('📊 Datos interacción:', JSON.stringify(interaccionData, null, 2));

    const input: GuardarInteraccionInput = { sessionState, ...interaccionData };
    const resultado = await guardarInteraccion(input);

    console.log('✅ Resultado:', JSON.stringify(resultado, null, 2));

    return res.status(resultado.success ? 200 : 400).json(resultado);

  } catch (error) {
    console.error('Error en guardarInteraccionHandler:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
}