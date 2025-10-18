/**
 * SUPABASE SERVICE - Sistema de Reclamos Vetanco
 * Cliente y operaciones de base de datos con Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Cliente,
  ClienteCreate,
  ClienteUpdate,
  Colaborador,
  ColaboradorCreate,
  Caso,
  CasoCreate,
  CasoUpdate,
  ProductoAfectado,
  ProductoAfectadoCreate,
  Adjunto,
  AdjuntoCreate,
  Mensaje,
  MensajeCreate,
  Interaccion,
  InteraccionCreate,
  Clasificacion,
  ClasificacionCreate,
  Investigacion,
  InvestigacionCreate,
  InvestigacionUpdate
} from '../types/schemas';

// ============================================================================
// CONFIGURACIÓN DEL CLIENTE
// ============================================================================

class SupabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set');
    }

    // Cliente con anon key (para operaciones con RLS)
    this.client = createClient(supabaseUrl, supabaseAnonKey);

    // Cliente con service key (bypass RLS, solo para operaciones administrativas)
    this.serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ============================================================================
  // CLIENTES
  // ============================================================================

  async buscarClientePorCUIT(cuit: string): Promise<Cliente | null> {
    const { data, error } = await this.serviceClient
      .from('clientes')
      .select('*')
      .eq('cuit', cuit)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(`Error buscando cliente: ${error.message}`);
    }

    return data as Cliente;
  }

  async buscarClientePorTelefono(telefono: string): Promise<Cliente | null> {
    const { data, error } = await this.serviceClient
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando cliente: ${error.message}`);
    }

    return data as Cliente;
  }

  async crearCliente(cliente: ClienteCreate): Promise<Cliente> {
    const { data, error } = await this.serviceClient
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando cliente: ${error.message}`);
    }

    return data as Cliente;
  }

  async actualizarCliente(id: string, updates: ClienteUpdate): Promise<Cliente> {
    const { data, error } = await this.serviceClient
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando cliente: ${error.message}`);
    }

    return data as Cliente;
  }

  async obtenerClientePorId(id: string): Promise<Cliente | null> {
    const { data, error } = await this.serviceClient
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo cliente: ${error.message}`);
    }

    return data as Cliente;
  }

  // ============================================================================
  // COLABORADORES
  // ============================================================================

  async buscarColaboradorPorEmail(email: string): Promise<Colaborador | null> {
    const { data, error } = await this.serviceClient
      .from('colaboradores_vetanco')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error buscando colaborador: ${error.message}`);
    }

    return data as Colaborador;
  }

  async crearColaborador(colaborador: ColaboradorCreate): Promise<Colaborador> {
    const { data, error } = await this.serviceClient
      .from('colaboradores_vetanco')
      .insert(colaborador)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando colaborador: ${error.message}`);
    }

    return data as Colaborador;
  }

  async obtenerColaboradorPorId(id: string): Promise<Colaborador | null> {
    const { data, error } = await this.serviceClient
      .from('colaboradores_vetanco')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo colaborador: ${error.message}`);
    }

    return data as Colaborador;
  }

  // ============================================================================
  // CASOS
  // ============================================================================

  async crearCaso(caso: CasoCreate): Promise<Caso> {
    const { data, error } = await this.serviceClient
      .from('casos')
      .insert(caso)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando caso: ${error.message}`);
    }

    return data as Caso;
  }

  async obtenerCasoPorId(id: string): Promise<Caso | null> {
    const { data, error } = await this.serviceClient
      .from('casos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo caso: ${error.message}`);
    }

    return data as Caso;
  }

  async obtenerCasoPorNumero(numeroCaso: string): Promise<Caso | null> {
    const { data, error } = await this.serviceClient
      .from('casos')
      .select('*')
      .eq('numero_caso', numeroCaso)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo caso: ${error.message}`);
    }

    return data as Caso;
  }

  async actualizarCaso(id: string, updates: CasoUpdate): Promise<Caso> {
    const { data, error } = await this.serviceClient
      .from('casos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando caso: ${error.message}`);
    }

    return data as Caso;
  }

  async obtenerCasoCompleto(numeroCaso: string) {
    const { data, error } = await this.serviceClient
      .from('casos')
      .select(`
        *,
        cliente:clientes(*),
        colaborador_registro:colaboradores_vetanco!colaborador_registro_id(*),
        colaborador_asignado:colaboradores_vetanco!colaborador_asignado_id(*),
        productos_afectados(*),
        adjuntos(*),
        interacciones(*),
        clasificaciones(*),
        investigaciones(*)
      `)
      .eq('numero_caso', numeroCaso)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo caso completo: ${error.message}`);
    }

    return data;
  }

  async listarCasos(filtros?: {
    tipo_caso?: string;
    criticidad?: string;
    estado?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    cliente_id?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.serviceClient
      .from('casos')
      .select('*, cliente:clientes(nombre_apellido, razon_social, cuit)', { count: 'exact' });

    if (filtros?.tipo_caso) {
      query = query.eq('tipo_caso', filtros.tipo_caso);
    }
    if (filtros?.criticidad) {
      query = query.eq('criticidad', filtros.criticidad);
    }
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros?.fecha_desde) {
      query = query.gte('created_at', filtros.fecha_desde.toISOString());
    }
    if (filtros?.fecha_hasta) {
      query = query.lte('created_at', filtros.fecha_hasta.toISOString());
    }
    if (filtros?.cliente_id) {
      query = query.eq('cliente_id', filtros.cliente_id);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filtros?.offset || 0, (filtros?.offset || 0) + (filtros?.limit || 20) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error listando casos: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0
    };
  }

  // ============================================================================
  // PRODUCTOS AFECTADOS
  // ============================================================================

  async crearProductoAfectado(producto: ProductoAfectadoCreate): Promise<ProductoAfectado> {
    const { data, error } = await this.serviceClient
      .from('productos_afectados')
      .insert(producto)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando producto afectado: ${error.message}`);
    }

    return data as ProductoAfectado;
  }

  async obtenerProductosPorCaso(casoId: string): Promise<ProductoAfectado[]> {
    const { data, error } = await this.serviceClient
      .from('productos_afectados')
      .select('*')
      .eq('caso_id', casoId);

    if (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }

    return (data || []) as ProductoAfectado[];
  }

  // ============================================================================
  // ADJUNTOS
  // ============================================================================

  async crearAdjunto(adjunto: AdjuntoCreate): Promise<Adjunto> {
    const { data, error } = await this.serviceClient
      .from('adjuntos')
      .insert(adjunto)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando adjunto: ${error.message}`);
    }

    return data as Adjunto;
  }

  async obtenerAdjuntosPorCaso(casoId: string): Promise<Adjunto[]> {
    const { data, error } = await this.serviceClient
      .from('adjuntos')
      .select('*')
      .eq('caso_id', casoId);

    if (error) {
      throw new Error(`Error obteniendo adjuntos: ${error.message}`);
    }

    return (data || []) as Adjunto[];
  }

  async actualizarAdjunto(id: string, updates: Partial<Adjunto>): Promise<Adjunto> {
    const { data, error } = await this.serviceClient
      .from('adjuntos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando adjunto: ${error.message}`);
    }

    return data as Adjunto;
  }

  // ============================================================================
  // MENSAJES
  // ============================================================================

  async crearMensaje(mensaje: MensajeCreate): Promise<Mensaje> {
    const { data, error } = await this.serviceClient
      .from('mensajes')
      .insert(mensaje)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando mensaje: ${error.message}`);
    }

    return data as Mensaje;
  }

  async obtenerMensajesPorCaso(casoId: string): Promise<Mensaje[]> {
    const { data, error } = await this.serviceClient
      .from('mensajes')
      .select('*')
      .eq('caso_id', casoId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo mensajes: ${error.message}`);
    }

    return (data || []) as Mensaje[];
  }

  async actualizarMensaje(id: string, updates: Partial<Mensaje>): Promise<Mensaje> {
    const { data, error } = await this.serviceClient
      .from('mensajes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando mensaje: ${error.message}`);
    }

    return data as Mensaje;
  }

  // ============================================================================
  // INTERACCIONES
  // ============================================================================

  async crearInteraccion(interaccion: InteraccionCreate): Promise<Interaccion> {
    const { data, error } = await this.serviceClient
      .from('interacciones')
      .insert(interaccion)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando interacción: ${error.message}`);
    }

    return data as Interaccion;
  }

  async actualizarInteraccion(id: string, updates: Partial<Interaccion>): Promise<Interaccion> {
    const { data, error } = await this.serviceClient
      .from('interacciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando interacción: ${error.message}`);
    }

    return data as Interaccion;
  }

  async obtenerInteraccionesPorCaso(casoId: string): Promise<Interaccion[]> {
    const { data, error } = await this.serviceClient
      .from('interacciones')
      .select('*')
      .eq('caso_id', casoId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo interacciones: ${error.message}`);
    }

    return (data || []) as Interaccion[];
  }

  // ============================================================================
  // CLASIFICACIONES
  // ============================================================================

  async crearClasificacion(clasificacion: ClasificacionCreate): Promise<Clasificacion> {
    const { data, error } = await this.serviceClient
      .from('clasificaciones')
      .insert(clasificacion)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando clasificación: ${error.message}`);
    }

    return data as Clasificacion;
  }

  async obtenerClasificacionesPorCaso(casoId: string): Promise<Clasificacion[]> {
    const { data, error } = await this.serviceClient
      .from('clasificaciones')
      .select('*')
      .eq('caso_id', casoId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo clasificaciones: ${error.message}`);
    }

    return (data || []) as Clasificacion[];
  }

  // ============================================================================
  // INVESTIGACIONES
  // ============================================================================

  async crearInvestigacion(investigacion: InvestigacionCreate): Promise<Investigacion> {
    const { data, error } = await this.serviceClient
      .from('investigaciones')
      .insert(investigacion)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando investigación: ${error.message}`);
    }

    return data as Investigacion;
  }

  async actualizarInvestigacion(id: string, updates: InvestigacionUpdate): Promise<Investigacion> {
    const { data, error } = await this.serviceClient
      .from('investigaciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando investigación: ${error.message}`);
    }

    return data as Investigacion;
  }

  async obtenerInvestigacionPorCaso(casoId: string): Promise<Investigacion | null> {
    const { data, error } = await this.serviceClient
      .from('investigaciones')
      .select('*')
      .eq('caso_id', casoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error obteniendo investigación: ${error.message}`);
    }

    return data as Investigacion;
  }

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  async obtenerEstadisticas(fechaDesde?: Date, fechaHasta?: Date) {
    let query = this.serviceClient
      .from('casos')
      .select('tipo_caso, criticidad, estado', { count: 'exact' });

    if (fechaDesde) {
      query = query.gte('created_at', fechaDesde.toISOString());
    }
    if (fechaHasta) {
      query = query.lte('created_at', fechaHasta.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }

    return {
      total: count || 0,
      casos: data || []
    };
  }

  // ============================================================================
  // STORAGE (para archivos multimedia)
  // ============================================================================

  async subirArchivo(bucket: string, path: string, file: Buffer, contentType: string): Promise<string> {
    const { data, error } = await this.serviceClient
      .storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false
      });

    if (error) {
      throw new Error(`Error subiendo archivo: ${error.message}`);
    }

    // Obtener URL pública
    const { data: publicUrlData } = this.serviceClient
      .storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  async descargarArchivo(url: string): Promise<Buffer> {
    // Extraer bucket y path de la URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucket = pathParts[pathParts.indexOf('storage') + 2];
    const path = pathParts.slice(pathParts.indexOf('storage') + 3).join('/');

    const { data, error } = await this.serviceClient
      .storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Error descargando archivo: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }
}

// ============================================================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================================================

export const supabaseService = new SupabaseService();
export default supabaseService;
