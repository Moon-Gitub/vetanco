/**
 * FUNCTION: Validar Cliente
 * Valida datos del cliente y busca si ya existe en la base de datos
 */

import { supabaseService } from '../services/supabase.service';
import { validacionService } from '../services/validacion.service';
import { SessionState } from '../types/schemas';
import { clienteCreateSchema } from '../types/schemas';

export interface ValidarClienteInput {
  sessionState: SessionState;
}

export interface ValidarClienteOutput {
  success: boolean;
  clienteId?: string;
  clienteExistente: boolean;
  mensaje?: string;
  errores?: string[];
  sessionState: SessionState;
}

/**
 * Función principal: Validar y crear/actualizar cliente
 */
export async function validarCliente(input: ValidarClienteInput): Promise<ValidarClienteOutput> {
  const { sessionState } = input;

  try {
    // ========================================================================
    // 1. VALIDAR DATOS REQUERIDOS
    // ========================================================================

    const datosCliente = {
      nombre_apellido: sessionState.clienteNombre,
      razon_social: sessionState.clienteRazonSocial,
      cuit: sessionState.clienteCUIT,
      telefono: sessionState.clienteTelefono,
      email: sessionState.clienteEmail
    };

    const validacion = validacionService.validarDatosCliente(datosCliente);

    if (!validacion.valido) {
      return {
        success: false,
        clienteExistente: false,
        errores: validacion.errores,
        mensaje: 'Datos de cliente inválidos:\n' + validacion.errores.join('\n'),
        sessionState
      };
    }

    // ========================================================================
    // 2. NORMALIZAR DATOS
    // ========================================================================

    const cuitValidado = validacionService.validarCUIT(sessionState.clienteCUIT!);
    const telefonoValidado = validacionService.validarTelefono(sessionState.clienteTelefono!);

    const cuitNormalizado = cuitValidado.normalizado!;
    const telefonoNormalizado = telefonoValidado.normalizado!;

    // ========================================================================
    // 3. BUSCAR CLIENTE EXISTENTE
    // ========================================================================

    let clienteExistente = await supabaseService.buscarClientePorCUIT(cuitNormalizado);

    if (clienteExistente) {
      // Cliente ya existe, actualizar sessionState con su ID
      sessionState.clienteId = clienteExistente.id;

      return {
        success: true,
        clienteId: clienteExistente.id,
        clienteExistente: true,
        mensaje: 'Cliente encontrado en el sistema',
        sessionState
      };
    }

    // ========================================================================
    // 4. CREAR NUEVO CLIENTE
    // ========================================================================

    // Parsear dirección (formato simple)
    const direccionCompleta = sessionState.clienteDireccion || '';
    const partesDir = direccionCompleta.split(',').map(p => p.trim());

    const nuevoClienteData = {
      nombre_apellido: validacionService.normalizarTexto(sessionState.clienteNombre!),
      razon_social: validacionService.normalizarTexto(sessionState.clienteRazonSocial!),
      cuit: cuitNormalizado,
      direccion_calle: partesDir[0] || direccionCompleta,
      direccion_numero: partesDir[1] || '',
      localidad: partesDir[partesDir.length - 2] || 'No especificado',
      provincia: partesDir[partesDir.length - 1] || 'No especificado',
      telefono: telefonoNormalizado,
      email: sessionState.clienteEmail,
      whatsapp_number: sessionState.clienteTelefono, // Asumimos que el tel es WhatsApp
      activo: true
    };

    // Validar con schema Zod
    const parseResult = clienteCreateSchema.safeParse(nuevoClienteData);

    if (!parseResult.success) {
      const erroresZod = parseResult.error.errors.map(e => e.message);
      return {
        success: false,
        clienteExistente: false,
        errores: erroresZod,
        mensaje: 'Error en validación de datos:\n' + erroresZod.join('\n'),
        sessionState
      };
    }

    const nuevoCliente = await supabaseService.crearCliente(parseResult.data);

    // Actualizar sessionState
    sessionState.clienteId = nuevoCliente.id;

    return {
      success: true,
      clienteId: nuevoCliente.id,
      clienteExistente: false,
      mensaje: 'Cliente creado exitosamente',
      sessionState
    };

  } catch (error) {
    console.error('Error en validarCliente:', error);

    return {
      success: false,
      clienteExistente: false,
      mensaje: `Error al procesar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      sessionState
    };
  }
}

/**
 * Endpoint handler para llamadas HTTP desde Kapso
 */
export async function validarClienteHandler(req: any, res: any) {
  try {
    const input: ValidarClienteInput = req.body;

    // Validar que venga el sessionState
    if (!input.sessionState) {
      return res.status(400).json({
        error: 'sessionState requerido'
      });
    }

    const resultado = await validarCliente(input);

    return res.status(resultado.success ? 200 : 400).json(resultado);

  } catch (error) {
    console.error('Error en validarClienteHandler:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
}
