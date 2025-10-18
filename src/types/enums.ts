/**
 * ENUMS - Sistema de Reclamos Vetanco
 * Definición de todos los tipos enum utilizados en el sistema
 */

// ============================================================================
// TIPOS DE USUARIO
// ============================================================================

export enum TipoUsuarioRegistro {
  CLIENTE = 'cliente',
  COLABORADOR_VETANCO = 'colaborador_vetanco'
}

// ============================================================================
// TIPOS DE CASO
// ============================================================================

export enum TipoCaso {
  RECLAMO = 'reclamo',
  QUEJA = 'queja',
  COMENTARIO = 'comentario',
  PENDIENTE_CLASIFICACION = 'pendiente_clasificacion'
}

// ============================================================================
// CRITICIDAD DE RECLAMOS
// ============================================================================

export enum CriticidadReclamo {
  CRITICO = 'critico',
  MAYOR = 'mayor',
  MENOR = 'menor',
  NO_APLICA = 'no_aplica'
}

// ============================================================================
// JUSTIFICACIÓN
// ============================================================================

export enum JustificacionCaso {
  JUSTIFICADO = 'justificado',
  NO_JUSTIFICADO = 'no_justificado',
  PENDIENTE_INVESTIGACION = 'pendiente_investigacion'
}

// ============================================================================
// ESTADOS DEL PRODUCTO
// ============================================================================

export enum EstadoProducto {
  USADO = 'usado',
  SIN_USAR = 'sin_usar',
  ENVASE_ROTO = 'envase_roto',
  ENVASE_SANO = 'envase_sano'
}

// ============================================================================
// ESTADOS DEL CASO
// ============================================================================

export enum EstadoCaso {
  NUEVO = 'nuevo',
  EN_INVESTIGACION = 'en_investigacion',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
  CANCELADO = 'cancelado'
}

// ============================================================================
// CANALES DE COMUNICACIÓN
// ============================================================================

export enum CanalComunicacion {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  TELEFONO = 'telefono',
  WEB = 'web',
  PRESENCIAL = 'presencial'
}

// ============================================================================
// TIPOS DE ADJUNTOS
// ============================================================================

export enum TipoAdjunto {
  FOTO = 'foto',
  VIDEO = 'video',
  DOCUMENTO = 'documento',
  AUDIO = 'audio'
}

// ============================================================================
// TIPOS DE MENSAJE
// ============================================================================

export enum TipoMensaje {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  BUTTON_RESPONSE = 'button_response',
  LIST_RESPONSE = 'list_response',
  STICKER = 'sticker'
}

// ============================================================================
// ESTADO DE INVESTIGACIÓN
// ============================================================================

export enum EstadoInvestigacion {
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  SUSPENDIDA = 'suspendida'
}

// ============================================================================
// HELPERS - Conversión de strings a enums
// ============================================================================

export function parseTipoCaso(value: string): TipoCaso | undefined {
  const normalized = value.toLowerCase().trim();
  return Object.values(TipoCaso).find(v => v === normalized);
}

export function parseCriticidad(value: string): CriticidadReclamo | undefined {
  const normalized = value.toLowerCase().trim();
  return Object.values(CriticidadReclamo).find(v => v === normalized);
}

export function parseEstadoProducto(value: string): EstadoProducto | undefined {
  const normalized = value.toLowerCase().trim().replace(/ /g, '_');
  return Object.values(EstadoProducto).find(v => v === normalized);
}

// ============================================================================
// VALIDADORES
// ============================================================================

export function esReclamoValido(tipoCaso: TipoCaso, criticidad: CriticidadReclamo): boolean {
  if (tipoCaso === TipoCaso.RECLAMO) {
    return criticidad !== CriticidadReclamo.NO_APLICA;
  } else {
    return criticidad === CriticidadReclamo.NO_APLICA;
  }
}
