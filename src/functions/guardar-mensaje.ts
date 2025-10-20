/**
 * FUNCTION: Guardar Mensaje
 * Registra un mensaje individual de la conversación WhatsApp/Kapso
 */

import { supabaseService } from '../services/supabase.service';
import { SessionState, MensajeCreate } from '../types/schemas';

export interface GuardarMensajeInput {
  sessionState: SessionState;
  interaccion_id?: string;
  mensaje_id_externo?: string; // ID de WhatsApp/Kapso
  es_entrante: boolean; // true = del usuario, false = del bot
  remitente_numero?: string;
  destinatario_numero?: string;
  tipo_mensaje: string; // text, image, video, audio, document, button_response
  contenido?: string;
  contenido_estructurado?: Record<string, any>;
  entregado?: boolean;
  leido?: boolean;
  error?: boolean;
  error_detalle?: string;
  timestamp_envio?: Date;
  timestamp_entrega?: Date;
  timestamp_lectura?: Date;
}

export interface GuardarMensajeOutput {
  success: boolean;
  mensajeId?: string;
  mensaje?: string;
  sessionState: SessionState;
}

/**
 * Función principal: Guardar mensaje de conversación
 */
export async function guardarMensaje(
  input: GuardarMensajeInput
): Promise<GuardarMensajeOutput> {
  const { sessionState, ...mensajeData } = input;

  try {
    // ========================================================================
    // 1. VALIDAR DATOS MÍNIMOS REQUERIDOS
    // ========================================================================

    if (!sessionState.casoId) {
      return {
        success: false,
        mensaje: 'ID de caso requerido para registrar mensaje',
        sessionState
      };
    }

    if (mensajeData.es_entrante === undefined) {
      return {
        success: false,
        mensaje: 'Campo es_entrante requerido',
        sessionState
      };
    }

    if (!mensajeData.tipo_mensaje) {
      return {
        success: false,
        mensaje: 'Tipo de mensaje requerido',
        sessionState
      };
    }

    // ========================================================================
    // 2. PREPARAR DATOS DEL MENSAJE
    // ========================================================================

    const mensaje: MensajeCreate = {
      caso_id: sessionState.casoId,
      interaccion_id: mensajeData.interaccion_id,
      mensaje_id_externo: mensajeData.mensaje_id_externo,
      es_entrante: mensajeData.es_entrante,
      remitente_numero: mensajeData.remitente_numero,
      destinatario_numero: mensajeData.destinatario_numero,
      tipo_mensaje: mensajeData.tipo_mensaje,
      contenido: mensajeData.contenido,
      contenido_estructurado: mensajeData.contenido_estructurado,
      entregado: mensajeData.entregado ?? false,
      leido: mensajeData.leido ?? false,
      error: mensajeData.error ?? false,
      error_detalle: mensajeData.error_detalle,
      timestamp_envio: mensajeData.timestamp_envio,
      timestamp_entrega: mensajeData.timestamp_entrega,
      timestamp_lectura: mensajeData.timestamp_lectura
    };

    // ========================================================================
    // 3. CREAR MENSAJE EN SUPABASE
    // ========================================================================

    const mensajeCreado = await supabaseService.crearMensaje(mensaje);

    console.log('✅ Mensaje registrado:', {
      id: mensajeCreado.id,
      tipo: mensajeCreado.tipo_mensaje,
      es_entrante: mensajeCreado.es_entrante,
      contenido: mensajeCreado.contenido?.substring(0, 50) + '...'
    });

    return {
      success: true,
      mensajeId: mensajeCreado.id,
      mensaje: `Mensaje ${mensajeData.tipo_mensaje} registrado exitosamente`,
      sessionState
    };

  } catch (error) {
    console.error('Error en guardarMensaje:', error);

    return {
      success: false,
      mensaje: `Error al guardar mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      sessionState
    };
  }
}

/**
 * Endpoint handler para llamadas HTTP desde Kapso
 */
export async function guardarMensajeHandler(req: any, res: any) {
  try {
    console.log('='.repeat(70));
    console.log('💬 GUARDAR MENSAJE HANDLER');
    console.log('='.repeat(70));
    console.log('Body RAW:', JSON.stringify(req.body, null, 2));

    let sessionState: SessionState;
    let mensajeData: any = {};

    // Aceptar múltiples formatos
    if (req.body.sessionState && typeof req.body.sessionState === 'object') {
      sessionState = req.body.sessionState;
      // Los datos del mensaje pueden venir fuera del sessionState
      mensajeData = { ...req.body };
      delete mensajeData.sessionState;
    } else if (req.body && Object.keys(req.body).length > 0) {
      // Separar sessionState de datos de mensaje
      const { casoId, ...resto } = req.body;
      sessionState = { casoId } as SessionState;
      mensajeData = resto;
    } else {
      console.error('❌ ERROR: No se encontraron datos');
      return res.status(400).json({
        error: 'Datos requeridos'
      });
    }

    console.log('📦 SessionState procesado:', JSON.stringify(sessionState, null, 2));
    console.log('💬 Datos mensaje:', JSON.stringify(mensajeData, null, 2));

    const input: GuardarMensajeInput = { sessionState, ...mensajeData };
    const resultado = await guardarMensaje(input);

    console.log('✅ Resultado:', JSON.stringify(resultado, null, 2));

    return res.status(resultado.success ? 200 : 400).json(resultado);

  } catch (error) {
    console.error('Error en guardarMensajeHandler:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
}