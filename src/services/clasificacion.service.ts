/**
 * CLASIFICACIÓN SERVICE - Sistema de Reclamos Vetanco
 * Lógica de clasificación automática de casos basada en keywords y reglas de negocio
 */

import { TipoCaso, CriticidadReclamo, JustificacionCaso, EstadoProducto } from '../types/enums';
import type { SessionState } from '../types/schemas';

// ============================================================================
// KEYWORDS POR TIPO Y CRITICIDAD
// ============================================================================

const KEYWORDS_CRITICO = [
  'muerte',
  'muerto',
  'murió',
  'murieron',
  'fallecido',
  'intoxicación',
  'intoxicado',
  'tóxico',
  'toxicidad',
  'veneno',
  'envenenamiento',
  'grave',
  'gravísimo',
  'crítico',
  'emergencia',
  'urgente',
  'urgencia',
  'salud',
  'riesgo',
  'peligro',
  'peligroso',
  'hospitalizado',
  'veterinario urgente'
];

const KEYWORDS_MAYOR = [
  'defecto',
  'defectuoso',
  'vencido',
  'expirado',
  'contaminado',
  'contaminación',
  'roto',
  'dañado',
  'no sirve',
  'no funciona',
  'ineficaz',
  'sin efecto',
  'malo',
  'mal estado',
  'deteriorado',
  'alterado',
  'anormal',
  'extraño',
  'sospechoso',
  'incorrecto',
  'incompleto',
  'faltante',
  'diferente',
  'cambiado',
  'problema serio'
];

const KEYWORDS_MENOR = [
  'envase',
  'empaque',
  'embalaje',
  'caja',
  'etiqueta',
  'estético',
  'estética',
  'apariencia',
  'externo',
  'externa',
  'mínimo',
  'pequeño',
  'leve',
  'levemente',
  'abolladura',
  'rayado',
  'manchado'
];

const KEYWORDS_COMENTARIO = [
  'consulta',
  'pregunta',
  'duda',
  'dosis',
  'dosificación',
  'cómo usar',
  'cómo aplicar',
  'modo de uso',
  'instrucciones',
  'indicaciones',
  'sugerencia',
  'recomendación',
  'información',
  'datos',
  'asesoramiento',
  'orientación',
  'compatibilidad',
  'compatible',
  'puedo usar',
  'se puede',
  'está bien',
  'cuánto',
  'cuándo',
  'cada cuánto'
];

const KEYWORDS_QUEJA = [
  'demora',
  'demoró',
  'tardó',
  'lento',
  'atención',
  'servicio',
  'trato',
  'precio',
  'caro',
  'costoso',
  'valor',
  'entrega',
  'envío',
  'transporte',
  'logística',
  'pedido',
  'orden',
  'factura',
  'cobraron',
  'esperando',
  'espero',
  'todavía no'
];

// ============================================================================
// INTERFAZ DE RESULTADO
// ============================================================================

export interface ClasificacionResult {
  tipoCaso: TipoCaso;
  criticidad: CriticidadReclamo;
  justificacion: JustificacionCaso;
  confianza: number; // 0-1
  razonamiento: string;
  keywordsEncontrados: string[];
}

// ============================================================================
// SERVICIO DE CLASIFICACIÓN
// ============================================================================

class ClasificacionService {

  /**
   * Clasifica un caso automáticamente basándose en la información capturada
   */
  clasificarCaso(sessionState: SessionState): ClasificacionResult {
    const descripcion = (sessionState.descripcionQueSucedio || '').toLowerCase();
    const estadoProducto = sessionState.productoEstado;
    const descripcionLibre = (sessionState.descripcionLibre || '').toLowerCase();

    // Combinar todas las descripciones para análisis
    const textoCompleto = `${descripcion} ${descripcionLibre}`;

    // Buscar keywords
    const keywordsCritico = this.encontrarKeywords(textoCompleto, KEYWORDS_CRITICO);
    const keywordsMayor = this.encontrarKeywords(textoCompleto, KEYWORDS_MAYOR);
    const keywordsMenor = this.encontrarKeywords(textoCompleto, KEYWORDS_MENOR);
    const keywordsComentario = this.encontrarKeywords(textoCompleto, KEYWORDS_COMENTARIO);
    const keywordsQueja = this.encontrarKeywords(textoCompleto, KEYWORDS_QUEJA);

    // ========================================================================
    // CLASIFICACIÓN POR CRITICIDAD (SI ES RECLAMO)
    // ========================================================================

    // CRÍTICO: Si hay keywords críticos O producto usado con keywords de problema grave
    if (keywordsCritico.length > 0) {
      return {
        tipoCaso: TipoCaso.RECLAMO,
        criticidad: CriticidadReclamo.CRITICO,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.95,
        razonamiento: 'Detectadas palabras clave que indican riesgo grave para la salud animal',
        keywordsEncontrados: keywordsCritico
      };
    }

    // MAYOR: Si hay keywords mayores O producto con defecto evidente
    if (keywordsMayor.length > 0 ||
        estadoProducto === EstadoProducto.ENVASE_ROTO ||
        estadoProducto === EstadoProducto.USADO && descripcion.includes('problema')) {
      return {
        tipoCaso: TipoCaso.RECLAMO,
        criticidad: CriticidadReclamo.MAYOR,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.85,
        razonamiento: 'Detectado defecto en producto o incumplimiento significativo',
        keywordsEncontrados: keywordsMayor
      };
    }

    // COMENTARIO: Si predominan keywords de consulta
    if (keywordsComentario.length >= 2 && estadoProducto === EstadoProducto.SIN_USAR) {
      return {
        tipoCaso: TipoCaso.COMENTARIO,
        criticidad: CriticidadReclamo.NO_APLICA,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.80,
        razonamiento: 'Detectada consulta técnica o solicitud de información',
        keywordsEncontrados: keywordsComentario
      };
    }

    // QUEJA: Si hay keywords de queja y producto sin usar
    if (keywordsQueja.length > 0 &&
        estadoProducto === EstadoProducto.SIN_USAR &&
        keywordsMayor.length === 0) {
      return {
        tipoCaso: TipoCaso.QUEJA,
        criticidad: CriticidadReclamo.NO_APLICA,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.75,
        razonamiento: 'Detectada insatisfacción sin incumplimiento evidente del producto',
        keywordsEncontrados: keywordsQueja
      };
    }

    // MENOR: Si solo hay keywords menores
    if (keywordsMenor.length > 0 && keywordsMayor.length === 0 && keywordsCritico.length === 0) {
      return {
        tipoCaso: TipoCaso.RECLAMO,
        criticidad: CriticidadReclamo.MENOR,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.70,
        razonamiento: 'Detectado problema menor que no afecta funcionalidad del producto',
        keywordsEncontrados: keywordsMenor
      };
    }

    // ========================================================================
    // CLASIFICACIÓN POR DEFECTO
    // ========================================================================

    // Si el producto está usado, probablemente sea reclamo
    if (estadoProducto === EstadoProducto.USADO) {
      return {
        tipoCaso: TipoCaso.RECLAMO,
        criticidad: CriticidadReclamo.MAYOR,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.60,
        razonamiento: 'Producto usado reportado con incidente, clasificado como reclamo por defecto',
        keywordsEncontrados: []
      };
    }

    // Si el envase está roto, es reclamo mayor
    if (estadoProducto && (estadoProducto as any) === EstadoProducto.ENVASE_ROTO) {
      return {
        tipoCaso: TipoCaso.RECLAMO,
        criticidad: CriticidadReclamo.MAYOR,
        justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
        confianza: 0.75,
        razonamiento: 'Envase roto puede comprometer integridad del producto',
        keywordsEncontrados: ['envase roto']
      };
    }

    // Por defecto: pendiente de clasificación manual
    return {
      tipoCaso: TipoCaso.PENDIENTE_CLASIFICACION,
      criticidad: CriticidadReclamo.NO_APLICA,
      justificacion: JustificacionCaso.PENDIENTE_INVESTIGACION,
      confianza: 0.40,
      razonamiento: 'No se pudo clasificar automáticamente, requiere revisión manual',
      keywordsEncontrados: []
    };
  }

  /**
   * Encuentra keywords en un texto
   */
  private encontrarKeywords(texto: string, keywords: string[]): string[] {
    const encontrados: string[] = [];

    for (const keyword of keywords) {
      if (texto.includes(keyword)) {
        encontrados.push(keyword);
      }
    }

    return encontrados;
  }

  /**
   * Valida si una clasificación es coherente con las reglas de negocio
   */
  validarClasificacion(tipoCaso: TipoCaso, criticidad: CriticidadReclamo): boolean {
    // Regla: Solo los reclamos tienen criticidad != NO_APLICA
    if (tipoCaso === TipoCaso.RECLAMO) {
      return criticidad !== CriticidadReclamo.NO_APLICA;
    } else {
      return criticidad === CriticidadReclamo.NO_APLICA;
    }
  }

  /**
   * Determina el SLA (tiempo de respuesta) según el tipo y criticidad
   */
  obtenerSLA(tipoCaso: TipoCaso, criticidad: CriticidadReclamo): number {
    // Retorna horas
    if (tipoCaso === TipoCaso.RECLAMO) {
      switch (criticidad) {
        case CriticidadReclamo.CRITICO:
          return 4; // 4 horas
        case CriticidadReclamo.MAYOR:
          return 48; // 48 horas
        case CriticidadReclamo.MENOR:
          return 168; // 7 días
        default:
          return 48;
      }
    } else if (tipoCaso === TipoCaso.QUEJA) {
      return 48; // 48 horas
    } else if (tipoCaso === TipoCaso.COMENTARIO) {
      return 2; // 2 horas
    } else {
      return 24; // 24 horas por defecto
    }
  }

  /**
   * Determina si el caso requiere notificación inmediata
   */
  requiereNotificacionInmediata(tipoCaso: TipoCaso, criticidad: CriticidadReclamo): boolean {
    return tipoCaso === TipoCaso.RECLAMO && criticidad === CriticidadReclamo.CRITICO;
  }

  /**
   * Genera un resumen de la clasificación para el usuario
   */
  generarResumenClasificacion(resultado: ClasificacionResult): string {
    const { tipoCaso, criticidad, razonamiento } = resultado;

    let resumen = '';

    switch (tipoCaso) {
      case TipoCaso.RECLAMO:
        resumen = `Su caso ha sido clasificado como RECLAMO`;
        if (criticidad === CriticidadReclamo.CRITICO) {
          resumen += ' CRÍTICO.\n\n⚠️ Debido a la gravedad reportada, este caso será tratado con máxima prioridad.\nUn especialista se comunicará con usted en las próximas 4 horas.';
        } else if (criticidad === CriticidadReclamo.MAYOR) {
          resumen += ' MAYOR.\n\nEl equipo de Calidad investigará el caso y se comunicará en las próximas 48 horas.';
        } else if (criticidad === CriticidadReclamo.MENOR) {
          resumen += ' MENOR.\n\nEl caso será evaluado por el área de Calidad en los próximos 7 días.';
        }
        break;

      case TipoCaso.QUEJA:
        resumen = 'Su caso ha sido registrado como QUEJA.\n\nRevisaremos su inquietud y nos comunicaremos en las próximas 48 horas.';
        break;

      case TipoCaso.COMENTARIO:
        resumen = 'Su consulta ha sido registrada como COMENTARIO.\n\nUn especialista de Asistencia Técnica le responderá en las próximas 2 horas.';
        break;

      default:
        resumen = 'Su caso ha sido registrado y será evaluado por nuestro equipo para determinar la clasificación correspondiente.';
    }

    return resumen;
  }

  /**
   * Analiza sentimiento básico del texto (positivo/negativo/neutral)
   */
  analizarSentimiento(texto: string): 'positivo' | 'negativo' | 'neutral' {
    const textoLower = texto.toLowerCase();

    const palabrasNegativas = [
      'mal', 'malo', 'mala', 'pésimo', 'terrible', 'horrible', 'deficiente',
      'problema', 'falla', 'error', 'incorrecto', 'inaceptable', 'insatisfecho',
      'decepcionado', 'molesto', 'enojado', 'frustrado'
    ];

    const palabrasPositivas = [
      'bien', 'bueno', 'buena', 'excelente', 'correcto', 'satisfecho',
      'contento', 'agradecido', 'perfecto', 'funciona'
    ];

    let scoreNegativo = 0;
    let scorePositivo = 0;

    for (const palabra of palabrasNegativas) {
      if (textoLower.includes(palabra)) scoreNegativo++;
    }

    for (const palabra of palabrasPositivas) {
      if (textoLower.includes(palabra)) scorePositivo++;
    }

    if (scoreNegativo > scorePositivo + 1) return 'negativo';
    if (scorePositivo > scoreNegativo + 1) return 'positivo';
    return 'neutral';
  }

  /**
   * Calcula score de urgencia (0-100)
   */
  calcularScoreUrgencia(resultado: ClasificacionResult): number {
    let score = 0;

    // Por tipo de caso
    if (resultado.tipoCaso === TipoCaso.RECLAMO) {
      score += 40;
    } else if (resultado.tipoCaso === TipoCaso.QUEJA) {
      score += 20;
    } else {
      score += 10;
    }

    // Por criticidad
    if (resultado.criticidad === CriticidadReclamo.CRITICO) {
      score += 50;
    } else if (resultado.criticidad === CriticidadReclamo.MAYOR) {
      score += 30;
    } else if (resultado.criticidad === CriticidadReclamo.MENOR) {
      score += 10;
    }

    // Por confianza de la clasificación
    score += resultado.confianza * 10;

    return Math.min(100, Math.round(score));
  }
}

// ============================================================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================================================

export const clasificacionService = new ClasificacionService();
export default clasificacionService;
