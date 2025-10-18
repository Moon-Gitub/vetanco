/**
 * FUNCTION: Guardar Caso
 * Guarda el caso completo en Supabase con todos sus datos relacionados
 */

import { supabaseService } from '../services/supabase.service';
import { SessionState } from '../types/schemas';
import { TipoUsuarioRegistro, CanalComunicacion } from '../types/enums';
import type { CasoCreate, ProductoAfectadoCreate } from '../types/schemas';

export interface GuardarCasoInput {
  sessionState: SessionState;
}

export interface GuardarCasoOutput {
  success: boolean;
  casoId?: string;
  numeroCaso?: string;
  mensaje?: string;
  sessionState: SessionState;
}

/**
 * Función principal: Guardar caso completo
 */
export async function guardarCaso(input: GuardarCasoInput): Promise<GuardarCasoOutput> {
  const { sessionState } = input;

  try {
    // ========================================================================
    // 1. VALIDAR DATOS MÍNIMOS REQUERIDOS
    // ========================================================================

    if (!sessionState.clienteId) {
      return {
        success: false,
        mensaje: 'ID de cliente requerido',
        sessionState
      };
    }

    if (!sessionState.descripcionQueSucedio) {
      return {
        success: false,
        mensaje: 'Descripción del incidente requerida',
        sessionState
      };
    }

    if (!sessionState.numeroRemito) {
      return {
        success: false,
        mensaje: 'Número de remito requerido',
        sessionState
      };
    }

    // ========================================================================
    // 2. PREPARAR DATOS DEL CASO
    // ========================================================================

    const casoData: CasoCreate = {
      cliente_id: sessionState.clienteId,
      colaborador_registro_id: sessionState.colaboradorId,
      tipo_usuario_registro: sessionState.tipoUsuarioRegistro || TipoUsuarioRegistro.CLIENTE,
      tipo_caso: sessionState.tipoCaso!,
      criticidad: sessionState.criticidad!,
      justificacion: sessionState.justificacion!,
      canal: CanalComunicacion.WHATSAPP,
      descripcion_que_sucedio: sessionState.descripcionQueSucedio,
      descripcion_donde_ocurrio: sessionState.descripcionDondeOcurrio,
      descripcion_cuando_ocurrio: sessionState.descripcionCuandoOcurrio
        ? new Date(sessionState.descripcionCuandoOcurrio)
        : undefined,
      descripcion_libre: sessionState.descripcionLibre,
      numero_remito: sessionState.numeroRemito
    };

    // ========================================================================
    // 3. CREAR CASO EN SUPABASE
    // ========================================================================

    const casoCreado = await supabaseService.crearCaso(casoData);

    // Actualizar sessionState
    sessionState.casoId = casoCreado.id;
    sessionState.numeroCaso = casoCreado.numero_caso;

    // ========================================================================
    // 4. CREAR PRODUCTO AFECTADO
    // ========================================================================

    if (sessionState.productoNombre && sessionState.productoLote) {
      const productoData: ProductoAfectadoCreate = {
        caso_id: casoCreado.id,
        nombre_producto: sessionState.productoNombre,
        presentacion: sessionState.productoPresentacion || '',
        numero_lote: sessionState.productoLote,
        fecha_vencimiento: sessionState.productoVencimiento
          ? new Date(sessionState.productoVencimiento)
          : new Date(),
        estado_producto: sessionState.productoEstado!,
        cantidad_afectada: sessionState.productoCantidadAfectada || 1,
        unidad_medida: sessionState.productoUnidadMedida || 'unidades'
      };

      await supabaseService.crearProductoAfectado(productoData);
    }

    // ========================================================================
    // 5. GUARDAR ADJUNTOS (si hay)
    // ========================================================================

    if (sessionState.adjuntos && sessionState.adjuntos.length > 0) {
      for (const adjunto of sessionState.adjuntos) {
        await supabaseService.crearAdjunto({
          caso_id: casoCreado.id,
          tipo_adjunto: adjunto.tipo,
          url_original: adjunto.url,
          nombre_archivo: `adjunto_${Date.now()}`,
          procesado: false
        });
      }
    }

    return {
      success: true,
      casoId: casoCreado.id,
      numeroCaso: casoCreado.numero_caso,
      mensaje: `Caso ${casoCreado.numero_caso} creado exitosamente`,
      sessionState
    };

  } catch (error) {
    console.error('Error en guardarCaso:', error);

    return {
      success: false,
      mensaje: `Error al guardar caso: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      sessionState
    };
  }
}

/**
 * Endpoint handler para llamadas HTTP desde Kapso
 */
export async function guardarCasoHandler(req: any, res: any) {
  try {
    const input: GuardarCasoInput = req.body;

    if (!input.sessionState) {
      return res.status(400).json({
        error: 'sessionState requerido'
      });
    }

    const resultado = await guardarCaso(input);

    return res.status(resultado.success ? 200 : 400).json(resultado);

  } catch (error) {
    console.error('Error en guardarCasoHandler:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
}
