/**
 * SCHEMAS ZOD - Sistema de Reclamos Vetanco
 * Validación de tipos con Zod para runtime type safety
 */

import { z } from 'zod';
import {
  TipoUsuarioRegistro,
  TipoCaso,
  CriticidadReclamo,
  JustificacionCaso,
  EstadoProducto,
  EstadoCaso,
  CanalComunicacion,
  TipoAdjunto,
  TipoMensaje,
  EstadoInvestigacion
} from './enums';

// ============================================================================
// VALIDADORES PERSONALIZADOS
// ============================================================================

// Validar CUIT argentino (formato: XX-XXXXXXXX-X o XXXXXXXXXXX)
const cuitRegex = /^(\d{2}-?\d{8}-?\d{1})$/;
export const cuitSchema = z.string()
  .regex(cuitRegex, 'CUIT inválido. Formato: XX-XXXXXXXX-X')
  .transform(val => {
    // Normalizar CUIT (agregar guiones si no los tiene)
    const digits = val.replace(/-/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
    }
    return val;
  });

// Validar teléfono argentino
const telefonoRegex = /^(\+?54)?[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{4}$/;
export const telefonoSchema = z.string()
  .regex(telefonoRegex, 'Teléfono inválido');

// Validar email
export const emailSchema = z.string().email('Email inválido');

// ============================================================================
// SCHEMAS DE CLIENTES
// ============================================================================

export const clienteCreateSchema = z.object({
  nombre_apellido: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  razon_social: z.string().min(2, 'Razón social requerida'),
  cuit: cuitSchema,
  direccion_calle: z.string().min(3, 'Dirección requerida'),
  direccion_numero: z.string().optional(),
  direccion_piso: z.string().optional(),
  codigo_postal: z.string().optional(),
  localidad: z.string().min(2, 'Localidad requerida'),
  provincia: z.string().min(2, 'Provincia requerida'),
  telefono: telefonoSchema,
  email: emailSchema.optional(),
  whatsapp_number: z.string().optional(),
  notas: z.string().optional()
});

export const clienteUpdateSchema = clienteCreateSchema.partial();

export const clienteSchema = clienteCreateSchema.extend({
  id: z.string().uuid(),
  activo: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional()
});

// ============================================================================
// SCHEMAS DE COLABORADORES
// ============================================================================

export const colaboradorCreateSchema = z.object({
  nombre_apellido: z.string().min(3),
  email: emailSchema,
  cargo: z.string().min(2),
  area: z.string().optional(),
  telefono: telefonoSchema.optional(),
  whatsapp_number: z.string().optional(),
  puede_clasificar_casos: z.boolean().default(false),
  puede_cerrar_casos: z.boolean().default(false),
  puede_asignar_casos: z.boolean().default(false)
});

export const colaboradorSchema = colaboradorCreateSchema.extend({
  id: z.string().uuid(),
  activo: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});

// ============================================================================
// SCHEMAS DE PRODUCTOS AFECTADOS
// ============================================================================

export const productoAfectadoSchema = z.object({
  nombre_producto: z.string().min(2, 'Nombre de producto requerido'),
  presentacion: z.string().min(2, 'Presentación requerida'),
  numero_lote: z.string().min(1, 'Número de lote requerido'),
  fecha_vencimiento: z.coerce.date(),
  estado_producto: z.nativeEnum(EstadoProducto),
  cantidad_afectada: z.number().int().positive('Cantidad debe ser mayor a 0'),
  unidad_medida: z.string().min(1, 'Unidad de medida requerida'),
  condiciones_almacenamiento: z.string().optional(),
  observaciones: z.string().optional()
});

export const productoAfectadoCreateSchema = productoAfectadoSchema.extend({
  caso_id: z.string().uuid()
});

export const productoAfectadoCompleteSchema = productoAfectadoCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
});

// ============================================================================
// SCHEMAS DE CASOS
// ============================================================================

export const casoCreateSchema = z.object({
  cliente_id: z.string().uuid(),
  colaborador_registro_id: z.string().uuid().optional(),
  tipo_usuario_registro: z.nativeEnum(TipoUsuarioRegistro),
  tipo_caso: z.nativeEnum(TipoCaso).default(TipoCaso.PENDIENTE_CLASIFICACION),
  criticidad: z.nativeEnum(CriticidadReclamo).default(CriticidadReclamo.NO_APLICA),
  justificacion: z.nativeEnum(JustificacionCaso).default(JustificacionCaso.PENDIENTE_INVESTIGACION),
  canal: z.nativeEnum(CanalComunicacion),
  descripcion_que_sucedio: z.string().min(20, 'Descripción debe tener al menos 20 caracteres'),
  descripcion_donde_ocurrio: z.string().optional(),
  descripcion_cuando_ocurrio: z.coerce.date().optional(),
  descripcion_libre: z.string().optional(),
  numero_remito: z.string().min(1, 'Número de remito requerido')
}).refine(
  (data) => {
    // Validar que si es reclamo, debe tener criticidad != NO_APLICA
    if (data.tipo_caso === TipoCaso.RECLAMO) {
      return data.criticidad !== CriticidadReclamo.NO_APLICA;
    }
    // Si no es reclamo, criticidad debe ser NO_APLICA
    return data.criticidad === CriticidadReclamo.NO_APLICA;
  },
  {
    message: 'Criticidad inválida para el tipo de caso',
    path: ['criticidad']
  }
);

export const casoUpdateSchema = casoCreateSchema.partial().extend({
  estado: z.nativeEnum(EstadoCaso).optional(),
  colaborador_asignado_id: z.string().uuid().optional(),
  fecha_inicio_investigacion: z.date().optional(),
  fecha_cierre: z.date().optional(),
  resolucion: z.string().optional(),
  acciones_correctivas: z.string().optional(),
  acciones_preventivas: z.string().optional()
});

export const casoSchema = casoCreateSchema.extend({
  id: z.string().uuid(),
  numero_caso: z.string(),
  estado: z.nativeEnum(EstadoCaso),
  colaborador_asignado_id: z.string().uuid().optional(),
  fecha_inicio_investigacion: z.date().optional(),
  fecha_cierre: z.date().optional(),
  resolucion: z.string().optional(),
  acciones_correctivas: z.string().optional(),
  acciones_preventivas: z.string().optional(),
  requiere_seguimiento: z.boolean(),
  fecha_proximo_seguimiento: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional()
});

// ============================================================================
// SCHEMAS DE ADJUNTOS
// ============================================================================

export const adjuntoSchema = z.object({
  caso_id: z.string().uuid(),
  mensaje_id: z.string().uuid().optional(),
  tipo_adjunto: z.nativeEnum(TipoAdjunto),
  formato: z.string().optional(),
  url_original: z.string().url().optional(),
  url_storage: z.string().url().optional(),
  nombre_archivo: z.string(),
  tamanio_bytes: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  duracion_segundos: z.number().int().optional(),
  resolucion: z.string().optional(),
  descripcion: z.string().optional(),
  procesado: z.boolean().default(false),
  error_descarga: z.boolean().default(false),
  error_detalle: z.string().optional()
});

export const adjuntoCompleteSchema = adjuntoSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
});

// ============================================================================
// SCHEMAS DE MENSAJES
// ============================================================================

export const mensajeSchema = z.object({
  caso_id: z.string().uuid(),
  interaccion_id: z.string().uuid().optional(),
  mensaje_id_externo: z.string().optional(),
  es_entrante: z.boolean(),
  remitente_numero: z.string().optional(),
  destinatario_numero: z.string().optional(),
  tipo_mensaje: z.string(),
  contenido: z.string().optional(),
  contenido_estructurado: z.record(z.any()).optional(),
  entregado: z.boolean().default(false),
  leido: z.boolean().default(false),
  error: z.boolean().default(false),
  error_detalle: z.string().optional(),
  timestamp_envio: z.date().optional(),
  timestamp_entrega: z.date().optional(),
  timestamp_lectura: z.date().optional()
});

export const mensajeCompleteSchema = mensajeSchema.extend({
  id: z.string().uuid(),
  created_at: z.date()
});

// ============================================================================
// SCHEMAS DE INTERACCIONES
// ============================================================================

export const interaccionSchema = z.object({
  caso_id: z.string().uuid(),
  session_id: z.string().optional(),
  flow_id: z.string().optional(),
  tipo_interaccion: z.string(),
  nodo_inicio: z.string().optional(),
  nodo_fin: z.string().optional(),
  duracion_segundos: z.number().int().optional(),
  completada: z.boolean().default(false),
  error_ocurrido: z.boolean().default(false),
  error_detalle: z.string().optional()
});

export const interaccionCompleteSchema = interaccionSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
});

// ============================================================================
// SCHEMAS DE CLASIFICACIONES
// ============================================================================

export const clasificacionSchema = z.object({
  caso_id: z.string().uuid(),
  tipo_caso_anterior: z.nativeEnum(TipoCaso).optional(),
  tipo_caso_nuevo: z.nativeEnum(TipoCaso),
  criticidad_anterior: z.nativeEnum(CriticidadReclamo).optional(),
  criticidad_nueva: z.nativeEnum(CriticidadReclamo),
  justificacion_anterior: z.nativeEnum(JustificacionCaso).optional(),
  justificacion_nueva: z.nativeEnum(JustificacionCaso),
  clasificado_por: z.string().uuid().optional(),
  clasificacion_automatica: z.boolean().default(false),
  motivo: z.string().min(10, 'Motivo debe tener al menos 10 caracteres'),
  evidencias: z.string().optional()
});

export const clasificacionCompleteSchema = clasificacionSchema.extend({
  id: z.string().uuid(),
  created_at: z.date()
});

// ============================================================================
// SCHEMAS DE INVESTIGACIONES
// ============================================================================

export const investigacionCreateSchema = z.object({
  caso_id: z.string().uuid(),
  investigador_id: z.string().uuid().optional(),
  fecha_inicio: z.date(),
  estado: z.string().default('en_proceso')
});

export const investigacionUpdateSchema = z.object({
  fecha_fin: z.date().optional(),
  estado: z.string().optional(),
  hallazgos: z.string().optional(),
  evidencia_recolectada: z.string().optional(),
  analisis_laboratorio: z.string().optional(),
  causa_raiz: z.string().optional(),
  responsable_incidente: z.string().optional(),
  acciones_inmediatas: z.string().optional(),
  acciones_correctivas: z.string().optional(),
  acciones_preventivas: z.string().optional(),
  requiere_seguimiento: z.boolean().optional(),
  fecha_seguimiento: z.date().optional()
});

export const investigacionSchema = investigacionCreateSchema.merge(investigacionUpdateSchema).extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
});

// ============================================================================
// SCHEMAS DE SESSION STATE (Para Kapso Flows)
// ============================================================================

export const sessionStateSchema = z.object({
  // Identificación
  tipoUsuarioRegistro: z.nativeEnum(TipoUsuarioRegistro).optional(),

  // Datos del cliente
  clienteId: z.string().uuid().optional(),
  clienteNombre: z.string().optional(),
  clienteCUIT: z.string().optional(),
  clienteDireccion: z.string().optional(),
  clienteTelefono: z.string().optional(),
  clienteEmail: z.string().optional(),
  clienteRazonSocial: z.string().optional(),

  // Datos del colaborador
  colaboradorId: z.string().uuid().optional(),
  colaboradorNombre: z.string().optional(),
  colaboradorCargo: z.string().optional(),
  colaboradorArea: z.string().optional(),

  // Datos del producto
  productoNombre: z.string().optional(),
  productoPresentacion: z.string().optional(),
  productoLote: z.string().optional(),
  productoVencimiento: z.string().optional(),
  productoEstado: z.nativeEnum(EstadoProducto).optional(),
  productoCantidadAfectada: z.number().optional(),
  productoUnidadMedida: z.string().optional(),

  // Descripción del caso
  numeroRemito: z.string().optional(),
  descripcionQueSucedio: z.string().optional(),
  descripcionDondeOcurrio: z.string().optional(),
  descripcionCuandoOcurrio: z.string().optional(),
  descripcionLibre: z.string().optional(),

  // Adjuntos
  adjuntos: z.array(z.object({
    tipo: z.nativeEnum(TipoAdjunto),
    url: z.string()
  })).optional(),

  // Clasificación
  tipoCaso: z.nativeEnum(TipoCaso).optional(),
  criticidad: z.nativeEnum(CriticidadReclamo).optional(),
  justificacion: z.nativeEnum(JustificacionCaso).optional(),

  // Caso generado
  casoId: z.string().uuid().optional(),
  numeroCaso: z.string().optional()
});

// ============================================================================
// TIPOS TYPESCRIPT INFERIDOS
// ============================================================================

export type Cliente = z.infer<typeof clienteSchema>;
export type ClienteCreate = z.infer<typeof clienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof clienteUpdateSchema>;

export type Colaborador = z.infer<typeof colaboradorSchema>;
export type ColaboradorCreate = z.infer<typeof colaboradorCreateSchema>;

export type ProductoAfectado = z.infer<typeof productoAfectadoCompleteSchema>;
export type ProductoAfectadoCreate = z.infer<typeof productoAfectadoCreateSchema>;

export type Caso = z.infer<typeof casoSchema>;
export type CasoCreate = z.infer<typeof casoCreateSchema>;
export type CasoUpdate = z.infer<typeof casoUpdateSchema>;

export type Adjunto = z.infer<typeof adjuntoCompleteSchema>;
export type AdjuntoCreate = z.infer<typeof adjuntoSchema>;

export type Mensaje = z.infer<typeof mensajeCompleteSchema>;
export type MensajeCreate = z.infer<typeof mensajeSchema>;

export type Interaccion = z.infer<typeof interaccionCompleteSchema>;
export type InteraccionCreate = z.infer<typeof interaccionSchema>;

export type Clasificacion = z.infer<typeof clasificacionCompleteSchema>;
export type ClasificacionCreate = z.infer<typeof clasificacionSchema>;

export type Investigacion = z.infer<typeof investigacionSchema>;
export type InvestigacionCreate = z.infer<typeof investigacionCreateSchema>;
export type InvestigacionUpdate = z.infer<typeof investigacionUpdateSchema>;

export type SessionState = z.infer<typeof sessionStateSchema>;
