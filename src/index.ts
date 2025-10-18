/**
 * VETANCO RECLAMOS SYSTEM - Main Entry Point
 * Sistema multiagente de gestión de reclamos con Kapso y Supabase
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// Services
import { supabaseService } from './services/supabase.service';
import { clasificacionService } from './services/clasificacion.service';

// Functions
import {
  validarClienteHandler,
  guardarCasoHandler,
  clasificarCasoHandler
} from './functions';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARES
// ============================================================================

// Seguridad
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde'
});
app.use('/api/', limiter);

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// WEBHOOK SIGNATURE VALIDATION
// ============================================================================

function verificarFirmaKapso(req: Request): boolean {
  if (process.env.DISABLE_WEBHOOK_SIGNATURE_VERIFICATION === 'true') {
    return true;
  }

  const signature = req.headers['x-kapso-signature'] as string;
  const secret = process.env.KAPSO_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// ============================================================================
// WEBHOOKS - KAPSO
// ============================================================================

app.post('/webhooks/kapso', async (req: Request, res: Response) => {
  try {
    // Verificar firma
    if (!verificarFirmaKapso(req)) {
      console.error('Firma de webhook inválida');
      return res.status(401).json({ error: 'Firma inválida' });
    }

    const { event, data, timestamp } = req.body;

    console.log(`[WEBHOOK] Evento recibido: ${event}`, { timestamp });

    // Procesar evento según tipo
    switch (event) {
      case 'message.received':
        await procesarMensajeRecibido(data);
        break;

      case 'message.sent':
        await procesarMensajeEnviado(data);
        break;

      case 'message.delivered':
        await procesarMensajeEntregado(data);
        break;

      case 'message.read':
        await procesarMensajeLeido(data);
        break;

      case 'media.received':
        await procesarMediaRecibido(data);
        break;

      default:
        console.log(`Evento no manejado: ${event}`);
    }

    // Responder rápido
    res.json({ status: 'ok', received: true });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ============================================================================
// PROCESADORES DE EVENTOS WEBHOOK
// ============================================================================

async function procesarMensajeRecibido(data: any) {
  console.log('[WEBHOOK] Mensaje recibido:', data.message_id);

  // TODO: Aquí podrías guardar el mensaje en la BD
  // await supabaseService.crearMensaje({...});
}

async function procesarMensajeEnviado(data: any) {
  console.log('[WEBHOOK] Mensaje enviado:', data.message_id);
}

async function procesarMensajeEntregado(data: any) {
  console.log('[WEBHOOK] Mensaje entregado:', data.message_id);

  // TODO: Actualizar estado del mensaje
  // await supabaseService.actualizarMensaje(data.message_id, { entregado: true });
}

async function procesarMensajeLeido(data: any) {
  console.log('[WEBHOOK] Mensaje leído:', data.message_id);

  // TODO: Actualizar estado del mensaje
  // await supabaseService.actualizarMensaje(data.message_id, { leido: true });
}

async function procesarMediaRecibido(data: any) {
  console.log('[WEBHOOK] Media recibido:', data.media.id);

  // TODO: Descargar y guardar en Supabase Storage
  // const buffer = await descargarArchivo(data.media.url);
  // const url = await supabaseService.subirArchivo('adjuntos', path, buffer, data.media.mime_type);
}

// ============================================================================
// API ENDPOINTS - FUNCTIONS (Para Kapso FunctionNodes)
// ============================================================================

app.post('/functions/validar-cliente', validarClienteHandler);
app.post('/functions/guardar-caso', guardarCasoHandler);
app.post('/functions/clasificar-caso', clasificarCasoHandler);

// ============================================================================
// API ENDPOINTS - CASOS
// ============================================================================

// Listar casos
app.get('/api/casos', async (req: Request, res: Response) => {
  try {
    const { tipo_caso, criticidad, estado, fecha_desde, fecha_hasta, cliente_id, page = '1', limit = '20' } = req.query;

    const resultado = await supabaseService.listarCasos({
      tipo_caso: tipo_caso as string,
      criticidad: criticidad as string,
      estado: estado as string,
      fecha_desde: fecha_desde ? new Date(fecha_desde as string) : undefined,
      fecha_hasta: fecha_hasta ? new Date(fecha_hasta as string) : undefined,
      cliente_id: cliente_id as string,
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string)
    });

    res.json({
      data: resultado.data,
      pagination: {
        total: resultado.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total_pages: Math.ceil(resultado.total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error listando casos:', error);
    res.status(500).json({ error: 'Error al listar casos' });
  }
});

// Obtener caso por número
app.get('/api/casos/:numero_caso', async (req: Request, res: Response) => {
  try {
    const { numero_caso } = req.params;

    const caso = await supabaseService.obtenerCasoCompleto(numero_caso);

    if (!caso) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    res.json({ caso });

  } catch (error) {
    console.error('Error obteniendo caso:', error);
    res.status(500).json({ error: 'Error al obtener caso' });
  }
});

// Clasificar caso manualmente
app.put('/api/casos/:numero_caso/clasificar', async (req: Request, res: Response) => {
  try {
    const { numero_caso } = req.params;
    const { tipo_caso, criticidad, justificacion, motivo, clasificado_por } = req.body;

    const caso = await supabaseService.obtenerCasoPorNumero(numero_caso);

    if (!caso) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    // Actualizar caso
    const casoActualizado = await supabaseService.actualizarCaso(caso.id, {
      tipo_caso,
      criticidad,
      justificacion
    });

    // Registrar clasificación
    await supabaseService.crearClasificacion({
      caso_id: caso.id,
      tipo_caso_anterior: caso.tipo_caso,
      tipo_caso_nuevo: tipo_caso,
      criticidad_anterior: caso.criticidad,
      criticidad_nueva: criticidad,
      justificacion_anterior: caso.justificacion,
      justificacion_nueva: justificacion,
      clasificado_por,
      clasificacion_automatica: false,
      motivo
    });

    res.json({
      status: 'success',
      caso: casoActualizado
    });

  } catch (error) {
    console.error('Error clasificando caso:', error);
    res.status(500).json({ error: 'Error al clasificar caso' });
  }
});

// Cambiar estado de caso
app.put('/api/casos/:numero_caso/estado', async (req: Request, res: Response) => {
  try {
    const { numero_caso } = req.params;
    const { estado, resolucion, acciones_correctivas, acciones_preventivas } = req.body;

    const caso = await supabaseService.obtenerCasoPorNumero(numero_caso);

    if (!caso) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const casoActualizado = await supabaseService.actualizarCaso(caso.id, {
      estado,
      resolucion,
      acciones_correctivas,
      acciones_preventivas,
      fecha_cierre: estado === 'cerrado' ? new Date() : undefined
    });

    res.json({
      status: 'success',
      caso: casoActualizado
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// ============================================================================
// API ENDPOINTS - ESTADÍSTICAS
// ============================================================================

app.get('/api/estadisticas', async (req: Request, res: Response) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const estadisticas = await supabaseService.obtenerEstadisticas(
      fecha_desde ? new Date(fecha_desde as string) : undefined,
      fecha_hasta ? new Date(fecha_hasta as string) : undefined
    );

    // Procesar estadísticas
    const porTipo: Record<string, number> = {};
    const porCriticidad: Record<string, number> = {};
    const porEstado: Record<string, number> = {};

    estadisticas.casos.forEach((caso: any) => {
      porTipo[caso.tipo_caso] = (porTipo[caso.tipo_caso] || 0) + 1;
      porCriticidad[caso.criticidad] = (porCriticidad[caso.criticidad] || 0) + 1;
      porEstado[caso.estado] = (porEstado[caso.estado] || 0) + 1;
    });

    res.json({
      periodo: {
        desde: fecha_desde || 'inicio',
        hasta: fecha_hasta || 'ahora'
      },
      totales: {
        total_casos: estadisticas.total
      },
      por_tipo: porTipo,
      por_criticidad: porCriticidad,
      por_estado: porEstado
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 VETANCO RECLAMOS SYSTEM');
  console.log('='.repeat(70));
  console.log(`🌍 Entorno: ${NODE_ENV}`);
  console.log(`📡 Servidor corriendo en puerto: ${PORT}`);
  console.log(`🔗 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log('='.repeat(70));
  console.log('✅ Sistema listo para recibir peticiones');
  console.log('='.repeat(70));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});
