/**
 * VALIDACIÓN SERVICE - Sistema de Reclamos Vetanco
 * Validaciones de negocio y formatos
 */

import { z } from 'zod';

// ============================================================================
// VALIDADORES
// ============================================================================

class ValidacionService {

  /**
   * Valida formato de CUIT argentino
   */
  validarCUIT(cuit: string): { valido: boolean; mensaje?: string; normalizado?: string } {
    // Remover caracteres no numéricos
    const cuitLimpio = cuit.replace(/[^0-9]/g, '');

    // Debe tener 11 dígitos
    if (cuitLimpio.length !== 11) {
      return {
        valido: false,
        mensaje: 'El CUIT debe tener 11 dígitos'
      };
    }

    // Validar dígito verificador
    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuitLimpio[i]!) * multiplicadores[i]!;
    }

    const resto = suma % 11;
    const digitoCalculado = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
    const digitoVerificador = parseInt(cuitLimpio[10]!);

    if (digitoCalculado !== digitoVerificador) {
      return {
        valido: false,
        mensaje: 'El CUIT tiene un dígito verificador inválido'
      };
    }

    // Normalizar con guiones
    const cuitNormalizado = `${cuitLimpio.slice(0, 2)}-${cuitLimpio.slice(2, 10)}-${cuitLimpio.slice(10)}`;

    return {
      valido: true,
      normalizado: cuitNormalizado
    };
  }

  /**
   * Valida formato de teléfono argentino
   */
  validarTelefono(telefono: string): { valido: boolean; mensaje?: string; normalizado?: string } {
    // Remover espacios, guiones y paréntesis
    const telefonoLimpio = telefono.replace(/[\s\-()]/g, '');

    // Debe tener entre 10 y 13 dígitos (con o sin código de país)
    if (telefonoLimpio.length < 10 || telefonoLimpio.length > 13) {
      return {
        valido: false,
        mensaje: 'El teléfono debe tener entre 10 y 13 dígitos'
      };
    }

    // Normalizar formato
    let normalizado = telefonoLimpio;

    // Si empieza con 54 (Argentina), quitar código de país
    if (normalizado.startsWith('54')) {
      normalizado = normalizado.substring(2);
    }

    // Si empieza con 0, quitar
    if (normalizado.startsWith('0')) {
      normalizado = normalizado.substring(1);
    }

    // Debe quedar con 10 dígitos
    if (normalizado.length !== 10) {
      return {
        valido: false,
        mensaje: 'Formato de teléfono inválido'
      };
    }

    // Formatear: XX-XXXX-XXXX
    const telefonoFormateado = `${normalizado.slice(0, 2)}-${normalizado.slice(2, 6)}-${normalizado.slice(6)}`;

    return {
      valido: true,
      normalizado: telefonoFormateado
    };
  }

  /**
   * Valida formato de email
   */
  validarEmail(email: string): { valido: boolean; mensaje?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        valido: false,
        mensaje: 'Formato de email inválido'
      };
    }

    // Validar que no tenga espacios
    if (email.includes(' ')) {
      return {
        valido: false,
        mensaje: 'El email no debe contener espacios'
      };
    }

    return { valido: true };
  }

  /**
   * Valida formato de número de lote
   */
  validarLote(lote: string): { valido: boolean; mensaje?: string } {
    // Lote debe ser alfanumérico
    const loteRegex = /^[A-Za-z0-9]+$/;

    if (!loteRegex.test(lote)) {
      return {
        valido: false,
        mensaje: 'El lote debe ser alfanumérico (letras y números sin espacios)'
      };
    }

    // Debe tener al menos 4 caracteres
    if (lote.length < 4) {
      return {
        valido: false,
        mensaje: 'El lote debe tener al menos 4 caracteres'
      };
    }

    return { valido: true };
  }

  /**
   * Valida fecha de vencimiento
   */
  validarFechaVencimiento(fecha: Date): { valido: boolean; mensaje?: string } {
    const ahora = new Date();

    // La fecha no puede ser muy antigua (más de 10 años atrás)
    const hace10Anios = new Date();
    hace10Anios.setFullYear(ahora.getFullYear() - 10);

    if (fecha < hace10Anios) {
      return {
        valido: false,
        mensaje: 'La fecha de vencimiento parece incorrecta (muy antigua)'
      };
    }

    // La fecha no puede ser más de 10 años en el futuro
    const en10Anios = new Date();
    en10Anios.setFullYear(ahora.getFullYear() + 10);

    if (fecha > en10Anios) {
      return {
        valido: false,
        mensaje: 'La fecha de vencimiento parece incorrecta (muy lejana)'
      };
    }

    return { valido: true };
  }

  /**
   * Parsea fecha flexible (acepta múltiples formatos)
   */
  parsearFecha(fechaStr: string): Date | null {
    // Intentar parsear fecha ISO
    const fechaISO = new Date(fechaStr);
    if (!isNaN(fechaISO.getTime())) {
      return fechaISO;
    }

    // Intentar parsear formato DD/MM/YYYY
    const match1 = fechaStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match1) {
      const [, dia, mes, anio] = match1;
      return new Date(parseInt(anio!), parseInt(mes!) - 1, parseInt(dia!));
    }

    // Intentar parsear formato DD-MM-YYYY
    const match2 = fechaStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (match2) {
      const [, dia, mes, anio] = match2;
      return new Date(parseInt(anio!), parseInt(mes!) - 1, parseInt(dia!));
    }

    // Intentar parsear relativo: "hace X días"
    const matchRelativo = fechaStr.match(/hace\s+(\d+)\s+(día|días|semana|semanas)/i);
    if (matchRelativo) {
      const [, cantidad, unidad] = matchRelativo;
      const ahora = new Date();
      const dias = unidad!.toLowerCase().includes('semana')
        ? parseInt(cantidad!) * 7
        : parseInt(cantidad!);
      ahora.setDate(ahora.getDate() - dias);
      return ahora;
    }

    // Casos especiales
    if (fechaStr.toLowerCase().includes('ayer')) {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return ayer;
    }

    if (fechaStr.toLowerCase().includes('hoy')) {
      return new Date();
    }

    return null;
  }

  /**
   * Valida cantidad
   */
  validarCantidad(cantidad: number): { valido: boolean; mensaje?: string } {
    if (cantidad <= 0) {
      return {
        valido: false,
        mensaje: 'La cantidad debe ser mayor a 0'
      };
    }

    if (!Number.isInteger(cantidad)) {
      return {
        valido: false,
        mensaje: 'La cantidad debe ser un número entero'
      };
    }

    if (cantidad > 1000000) {
      return {
        valido: false,
        mensaje: 'La cantidad parece incorrecta (muy grande)'
      };
    }

    return { valido: true };
  }

  /**
   * Valida longitud mínima de texto
   */
  validarTextoMinimo(texto: string, minimo: number): { valido: boolean; mensaje?: string } {
    if (texto.trim().length < minimo) {
      return {
        valido: false,
        mensaje: `El texto debe tener al menos ${minimo} caracteres`
      };
    }

    return { valido: true };
  }

  /**
   * Limpia y normaliza texto
   */
  normalizarTexto(texto: string): string {
    return texto
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/\n+/g, '\n'); // Múltiples saltos de línea a uno solo
  }

  /**
   * Extrae número de un texto (útil para cantidades)
   */
  extraerNumero(texto: string): number | null {
    const match = texto.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  /**
   * Valida estructura completa de datos de cliente
   */
  validarDatosCliente(datos: {
    nombre_apellido?: string;
    razon_social?: string;
    cuit?: string;
    telefono?: string;
    email?: string;
  }): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombre_apellido || datos.nombre_apellido.length < 3) {
      errores.push('Nombre y apellido requerido (mínimo 3 caracteres)');
    }

    if (!datos.razon_social || datos.razon_social.length < 2) {
      errores.push('Razón social requerida');
    }

    if (!datos.cuit) {
      errores.push('CUIT requerido');
    } else {
      const resultadoCUIT = this.validarCUIT(datos.cuit);
      if (!resultadoCUIT.valido) {
        errores.push(resultadoCUIT.mensaje || 'CUIT inválido');
      }
    }

    if (!datos.telefono) {
      errores.push('Teléfono requerido');
    } else {
      const resultadoTelefono = this.validarTelefono(datos.telefono);
      if (!resultadoTelefono.valido) {
        errores.push(resultadoTelefono.mensaje || 'Teléfono inválido');
      }
    }

    if (datos.email) {
      const resultadoEmail = this.validarEmail(datos.email);
      if (!resultadoEmail.valido) {
        errores.push(resultadoEmail.mensaje || 'Email inválido');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida estructura completa de datos de producto
   */
  validarDatosProducto(datos: {
    nombre_producto?: string;
    numero_lote?: string;
    fecha_vencimiento?: Date;
    cantidad_afectada?: number;
  }): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombre_producto || datos.nombre_producto.length < 2) {
      errores.push('Nombre del producto requerido');
    }

    if (!datos.numero_lote) {
      errores.push('Número de lote requerido');
    } else {
      const resultadoLote = this.validarLote(datos.numero_lote);
      if (!resultadoLote.valido) {
        errores.push(resultadoLote.mensaje || 'Lote inválido');
      }
    }

    if (!datos.fecha_vencimiento) {
      errores.push('Fecha de vencimiento requerida');
    } else {
      const resultadoFecha = this.validarFechaVencimiento(datos.fecha_vencimiento);
      if (!resultadoFecha.valido) {
        errores.push(resultadoFecha.mensaje || 'Fecha inválida');
      }
    }

    if (!datos.cantidad_afectada) {
      errores.push('Cantidad afectada requerida');
    } else {
      const resultadoCantidad = this.validarCantidad(datos.cantidad_afectada);
      if (!resultadoCantidad.valido) {
        errores.push(resultadoCantidad.mensaje || 'Cantidad inválida');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Sanitiza string para evitar SQL injection (aunque Supabase lo maneja)
   */
  sanitizarString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }

  /**
   * Verifica si un archivo es de tipo válido
   */
  validarTipoArchivo(mimeType: string, tiposPermitidos: string[]): boolean {
    return tiposPermitidos.some(tipo => mimeType.includes(tipo));
  }

  /**
   * Valida tamaño de archivo (en bytes)
   */
  validarTamanioArchivo(tamanio: number, maximoMB: number): { valido: boolean; mensaje?: string } {
    const maximoBytes = maximoMB * 1024 * 1024;

    if (tamanio > maximoBytes) {
      return {
        valido: false,
        mensaje: `El archivo es muy grande. Máximo permitido: ${maximoMB}MB`
      };
    }

    return { valido: true };
  }
}

// ============================================================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================================================

export const validacionService = new ValidacionService();
export default validacionService;
