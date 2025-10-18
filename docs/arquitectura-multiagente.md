# Arquitectura Multiagente - Sistema Vetanco

## Índice

1. [Introducción](#introducción)
2. [Principios de Diseño](#principios-de-diseño)
3. [Arquitectura General](#arquitectura-general)
4. [Flow Principal](#flow-principal)
5. [Agentes Especializados](#agentes-especializados)
6. [FunctionNodes](#functionnodes)
7. [Patrones de Diseño Aplicados](#patrones-de-diseño-aplicados)
8. [Flujo de Datos](#flujo-de-datos)
9. [Manejo de Errores](#manejo-de-errores)

---

## Introducción

El sistema de gestión de reclamos de Vetanco está construido siguiendo la arquitectura de flows y agentes de Kapso, aplicando los principios de **simplicidad**, **enrutamiento temprano**, **agentes para inteligencia** y **funciones para datos**.

### Objetivos de la Arquitectura

- **Modularidad**: Cada agente tiene responsabilidad única y bien definida
- **Escalabilidad**: Fácil agregar nuevos agentes o modificar existentes
- **Mantenibilidad**: Código organizado y documentado
- **Trazabilidad**: Registro completo de todas las interacciones
- **Resiliencia**: Manejo robusto de errores con recuperación

---

## Principios de Diseño

### 1. Simplicidad

Flows lineales con decisiones claras. Evitamos ramificaciones complejas.

```
✅ CORRECTO:
Start → Bienvenida → Decide(Cliente/Colaborador) → Identificación → Producto → Descripción → Cierre

❌ INCORRECTO:
Start → (múltiples bifurcaciones) → (bucles complejos) → (decisiones anidadas)
```

### 2. Agentes para Inteligencia

Los AgentNodes manejan conversaciones complejas que requieren contexto y adaptación.

**Ejemplos:**
- Agente de Identificación: maneja preguntas de clarificación sobre datos del cliente
- Agente de Descripción: adapta preguntas según el tipo de producto

### 3. Enrutamiento Temprano

Clasificamos el tipo de usuario (Cliente vs Colaborador) al inicio para adaptar el flujo.

### 4. Funciones para Datos

Los FunctionNodes manejan lógica de negocio, validaciones y persistencia.

**Ejemplos:**
- Validar formato de CUIT
- Guardar caso en Supabase
- Clasificar automáticamente el tipo de caso

---

## Arquitectura General

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    KAPSO WHATSAPP API                        │
│                  (Meta Tech Provider)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   FLOW PRINCIPAL                             │
│                  (Orquestador)                               │
│                                                               │
│  StartNode → SendTextNode → DecideNode → SubFlows           │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Agente  │  │  Agente  │  │  Agente  │  │  Agente  │
   │  Ident. │  │ Producto │  │Descripción│ │  Cierre  │
   └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
        │            │             │             │
        └────────────┴─────────────┴─────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │      FunctionNodes           │
        │  - Validar datos             │
        │  - Clasificar caso           │
        │  - Guardar en Supabase       │
        │  - Generar número único      │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      SUPABASE                │
        │  - PostgreSQL Database       │
        │  - Storage (archivos)        │
        │  - Row Level Security        │
        └──────────────────────────────┘
```

### Capas de la Arquitectura

**Capa 1: Interfaz de Usuario (WhatsApp)**
- Recepción de mensajes del usuario
- Envío de respuestas del sistema
- Manejo de multimedia (fotos, videos, documentos)

**Capa 2: Orchestration Layer (Flow Principal)**
- Control del flujo de conversación
- Enrutamiento entre agentes
- Gestión de estado de la sesión

**Capa 3: Agentes Especializados**
- Agente de Identificación
- Agente de Productos
- Agente de Descripción
- Agente Clasificador
- Agente de Cierre

**Capa 4: Lógica de Negocio (FunctionNodes)**
- Validaciones
- Transformaciones de datos
- Clasificación automática
- Integración con Supabase

**Capa 5: Persistencia (Supabase)**
- Almacenamiento de datos
- Gestión de archivos
- Auditoría y logs

---

## Flow Principal

### Estructura del Main Flow

```typescript
// Pseudocódigo del flow principal
const mainFlow = {
  id: 'main-reclamos-flow',
  name: 'Sistema de Reclamos Vetanco',

  nodes: [
    // 1. Inicio
    {
      type: 'StartNode',
      id: 'start',
      nextNode: 'bienvenida'
    },

    // 2. Mensaje de bienvenida
    {
      type: 'SendTextNode',
      id: 'bienvenida',
      message: 'Buenos días. Le damos la bienvenida al asistente de Vetanco...',
      nextNode: 'pregunta-tipo-usuario'
    },

    // 3. Pregunta: ¿Cliente o Colaborador?
    {
      type: 'SendTextNode',
      id: 'pregunta-tipo-usuario',
      message: '¿Usted es el cliente o un colaborador de Vetanco?',
      buttons: ['Soy el cliente', 'Soy colaborador de Vetanco'],
      nextNode: 'espera-respuesta-tipo'
    },

    // 4. Esperar respuesta
    {
      type: 'WaitForResponseNode',
      id: 'espera-respuesta-tipo',
      timeout: 300, // 5 minutos
      nextNode: 'decide-tipo-usuario'
    },

    // 5. Decisión de enrutamiento
    {
      type: 'DecideNode',
      id: 'decide-tipo-usuario',
      condition: 'response.includes("colaborador")',
      ifTrue: 'identificacion-colaborador',
      ifFalse: 'identificacion-cliente'
    },

    // 6a. Identificación Cliente
    {
      type: 'AgentNode',
      id: 'identificacion-cliente',
      agentConfig: 'identificacion-cliente-agent',
      nextNode: 'guardar-identificacion'
    },

    // 6b. Identificación Colaborador
    {
      type: 'AgentNode',
      id: 'identificacion-colaborador',
      agentConfig: 'identificacion-colaborador-agent',
      nextNode: 'guardar-identificacion'
    },

    // 7. Guardar datos de identificación
    {
      type: 'FunctionNode',
      id: 'guardar-identificacion',
      function: 'validarYGuardarCliente',
      nextNode: 'producto-agent'
    },

    // 8. Capturar datos del producto
    {
      type: 'AgentNode',
      id: 'producto-agent',
      agentConfig: 'producto-agent',
      nextNode: 'guardar-producto'
    },

    // 9. Guardar datos del producto
    {
      type: 'FunctionNode',
      id: 'guardar-producto',
      function: 'guardarProductoAfectado',
      nextNode: 'descripcion-agent'
    },

    // 10. Capturar descripción del incidente
    {
      type: 'AgentNode',
      id: 'descripcion-agent',
      agentConfig: 'descripcion-agent',
      nextNode: 'clasificar-caso'
    },

    // 11. Clasificar caso automáticamente
    {
      type: 'FunctionNode',
      id: 'clasificar-caso',
      function: 'clasificarCasoAutomatico',
      nextNode: 'guardar-caso'
    },

    // 12. Guardar caso completo
    {
      type: 'FunctionNode',
      id: 'guardar-caso',
      function: 'guardarCasoCompleto',
      nextNode: 'generar-numero'
    },

    // 13. Generar número de caso
    {
      type: 'FunctionNode',
      id: 'generar-numero',
      function: 'generarNumeroCaso',
      nextNode: 'cierre'
    },

    // 14. Mensaje de cierre
    {
      type: 'AgentNode',
      id: 'cierre',
      agentConfig: 'cierre-agent',
      nextNode: 'end'
    },

    // 15. Fin
    {
      type: 'EndNode',
      id: 'end'
    }
  ]
};
```

### Gestión de Estado

Cada sesión de conversación mantiene un estado compartido entre todos los nodos:

```typescript
interface SessionState {
  // Identificación
  tipoUsuarioRegistro: 'cliente' | 'colaborador_vetanco';

  // Datos del cliente
  clienteId?: string;
  clienteNombre?: string;
  clienteCUIT?: string;
  clienteDireccion?: string;
  clienteTelefono?: string;
  clienteEmail?: string;

  // Datos del colaborador (si aplica)
  colaboradorId?: string;
  colaboradorNombre?: string;
  colaboradorCargo?: string;
  colaboradorArea?: string;

  // Datos del producto
  productoNombre?: string;
  productoPresentacion?: string;
  productoLote?: string;
  productoVencimiento?: string;
  productoEstado?: 'usado' | 'sin_usar' | 'envase_roto' | 'envase_sano';
  productoCantidadAfectada?: number;

  // Descripción del caso
  numeroRemito?: string;
  descripcionQueSucedio?: string;
  descripcionDondeOcurrio?: string;
  descripcionCuandoOcurrio?: string;
  descripcionLibre?: string;

  // Adjuntos
  adjuntos?: Array<{
    tipo: 'foto' | 'video' | 'documento';
    url: string;
  }>;

  // Clasificación
  tipoCaso?: 'reclamo' | 'queja' | 'comentario';
  criticidad?: 'critico' | 'mayor' | 'menor';

  // Caso generado
  casoId?: string;
  numeroCaso?: string;
}
```

---

## Agentes Especializados

### 1. Agente de Identificación (Cliente)

**Responsabilidad**: Capturar datos completos del cliente que reporta el caso.

**Configuración**:

```typescript
const identificacionClienteAgent = {
  name: 'Agente de Identificación Cliente',

  systemPrompt: `
    Eres un asistente de Vetanco especializado en recopilar información de clientes.

    Tu objetivo es capturar los siguientes datos de forma amigable:
    1. Nombre y Apellido completo
    2. Dirección completa (calle, número, piso, código postal, localidad, provincia)
    3. Teléfono de contacto
    4. Correo electrónico (opcional si el canal es WhatsApp)
    5. Razón social y CUIT
    6. Número de remito del pedido

    Reglas:
    - Haz preguntas una por vez
    - Valida el formato del CUIT (11 dígitos, formato XX-XXXXXXXX-X)
    - Si falta algún dato, pregunta específicamente por él
    - Sé cordial y profesional
    - Si el cliente no tiene algún dato, anota "No proporcionado"
  `,

  tools: [
    {
      name: 'validar_cuit',
      description: 'Valida el formato del CUIT argentino',
      parameters: {
        cuit: 'string'
      }
    },
    {
      name: 'buscar_cliente_existente',
      description: 'Busca si el cliente ya existe en la base de datos',
      parameters: {
        cuit: 'string',
        telefono: 'string'
      }
    }
  ],

  maxTurns: 10,
  timeout: 600 // 10 minutos
};
```

**Ejemplo de Conversación**:

```
Bot: Por favor, indíqueme su nombre y apellido completo.
Cliente: Juan Pérez

Bot: Gracias Juan. Ahora necesito su dirección completa.
     Por favor indique calle, número, localidad y provincia.
Cliente: Av. Rivadavia 1234, CABA

Bot: Perfecto. ¿Cuál es su teléfono de contacto?
Cliente: 11-5555-1234

Bot: Necesito también la razón social de su empresa y el CUIT.
Cliente: Agropecuaria Los Pinos SA, CUIT 30-12345678-9

Bot: Excelente. Por último, ¿tiene el número de remito del pedido?
Cliente: Remito N° 0001-00012345
```

### 2. Agente de Identificación (Colaborador)

**Responsabilidad**: Capturar datos del colaborador Vetanco y del cliente final.

**Configuración**:

```typescript
const identificacionColaboradorAgent = {
  name: 'Agente de Identificación Colaborador',

  systemPrompt: `
    Eres un asistente de Vetanco especializado en ayudar a colaboradores internos.

    Primero captura datos del colaborador:
    1. Nombre y Apellido
    2. Cargo/Puesto
    3. Área (Ventas, Asistencia Técnica, Administración, etc.)

    Luego captura datos del cliente:
    1. Nombre y Apellido del cliente
    2. Razón social y CUIT
    3. Dirección completa
    4. Teléfono de contacto
    5. Correo electrónico
    6. Número de remito

    Reglas:
    - Primero completa TODOS los datos del colaborador
    - Luego pasa a los datos del cliente
    - Valida formatos de CUIT
    - Confirma datos importantes antes de continuar
  `,

  tools: [
    {
      name: 'validar_colaborador',
      description: 'Valida que el colaborador exista en la base de datos',
      parameters: {
        email: 'string',
        nombre: 'string'
      }
    },
    {
      name: 'buscar_cliente_por_cuit',
      description: 'Busca cliente por CUIT',
      parameters: {
        cuit: 'string'
      }
    }
  ],

  maxTurns: 15,
  timeout: 900 // 15 minutos
};
```

### 3. Agente de Productos

**Responsabilidad**: Capturar información detallada del producto afectado.

**Configuración**:

```typescript
const productoAgent = {
  name: 'Agente de Productos',

  systemPrompt: `
    Eres un especialista en productos veterinarios de Vetanco.

    Debes capturar:
    1. Nombre y presentación del producto (ej: "Vetancilina 100ml")
    2. Número de lote
    3. Fecha de vencimiento
    4. Estado del producto: usado / sin usar / envase roto / envase sano
    5. Cantidad afectada (con unidad: kg, litros, unidades, etc.)
    6. Fotos, videos o documentos (opcional)

    Reglas:
    - Valida que el producto exista en catálogo Vetanco
    - Verifica formato de lote (alfanumérico)
    - Fecha de vencimiento debe ser futura o reciente
    - Si hay múltiples productos afectados, captura todos
    - Solicita fotos si el estado es "envase roto" o "usado"
  `,

  tools: [
    {
      name: 'buscar_producto',
      description: 'Busca producto en catálogo Vetanco',
      parameters: {
        nombre: 'string'
      }
    },
    {
      name: 'validar_lote',
      description: 'Valida formato de lote',
      parameters: {
        lote: 'string'
      }
    },
    {
      name: 'verificar_vencimiento',
      description: 'Verifica si fecha de vencimiento es válida',
      parameters: {
        fecha: 'string'
      }
    }
  ],

  acceptsMedia: true, // Acepta fotos y videos
  maxTurns: 12,
  timeout: 600
};
```

### 4. Agente de Descripción

**Responsabilidad**: Obtener descripción detallada del incidente.

**Configuración**:

```typescript
const descripcionAgent = {
  name: 'Agente de Descripción del Incidente',

  systemPrompt: `
    Eres un investigador de calidad de Vetanco especializado en incidentes.

    Debes obtener:
    1. ¿Qué sucedió? (descripción clara del problema)
    2. ¿Dónde ocurrió? (ubicación, establecimiento, etc.)
    3. ¿Cuándo ocurrió? (fecha y hora aproximada)
    4. Comentarios y observaciones adicionales

    Reglas:
    - Haz preguntas abiertas para obtener detalles
    - Solicita información técnica relevante (síntomas en animales, condiciones, etc.)
    - Si es un problema de calidad, pregunta por condiciones de almacenamiento
    - Identifica keywords para pre-clasificación:
      * "riesgo", "salud", "muerte" → CRÍTICO
      * "defecto", "no funciona", "vencido" → MAYOR
      * "duda", "consulta", "sugerencia" → COMENTARIO
    - Resume la información capturada antes de finalizar
  `,

  tools: [
    {
      name: 'extraer_keywords',
      description: 'Extrae keywords para clasificación',
      parameters: {
        descripcion: 'string'
      }
    },
    {
      name: 'calcular_severidad',
      description: 'Calcula severidad basado en descripción',
      parameters: {
        queOcurrio: 'string',
        afectaSalud: 'boolean'
      }
    }
  ],

  maxTurns: 8,
  timeout: 600
};
```

### 5. Agente Clasificador

**Responsabilidad**: Pre-clasificar el caso antes de guardar.

**Configuración**:

```typescript
const clasificadorAgent = {
  name: 'Agente Clasificador',

  systemPrompt: `
    Eres un experto en clasificación de casos de calidad para Vetanco.

    Debes analizar toda la información capturada y pre-clasificar:

    TIPO DE CASO:
    - RECLAMO: Incumplimiento de requerimientos acordados
    - QUEJA: Insatisfacción sin incumplimiento
    - COMENTARIO: Sugerencia o consulta sin incumplimiento

    CRITICIDAD (solo para reclamos):
    - CRÍTICO: Riesgo grave salud animal, continuidad negocio afectada
    - MAYOR: Producto afectado, sin riesgo salud, imagen comprometida
    - MENOR: Sin afectación de producto, negocio o imagen

    KEYWORDS por tipo:
    - Crítico: "muerte", "intoxicación", "salud", "emergencia", "urgente"
    - Mayor: "defecto", "vencido", "no sirve", "contaminado", "roto"
    - Menor: "duda", "consulta", "envase", "etiqueta"
    - Comentario: "sugerencia", "pregunta", "cómo usar", "dosis"
    - Queja: "demora", "atención", "precio", "entrega"

    Clasifica automáticamente pero marca como "pendiente_investigacion"
    la justificación hasta que Calidad investigue.
  `,

  tools: [
    {
      name: 'clasificar_por_keywords',
      description: 'Clasifica basado en palabras clave',
      parameters: {
        descripcion: 'string',
        productoEstado: 'string'
      }
    }
  ],

  maxTurns: 1, // Solo clasificación automática
  timeout: 30
};
```

### 6. Agente de Cierre

**Responsabilidad**: Confirmar registro y proporcionar número de caso.

**Configuración**:

```typescript
const cierreAgent = {
  name: 'Agente de Cierre',

  systemPrompt: `
    Eres el agente final que confirma el registro exitoso del caso.

    Debes:
    1. Agradecer al cliente por reportar
    2. Proporcionar el número de caso generado
    3. Explicar que el equipo de Calidad investigará
    4. Indicar los próximos pasos
    5. Ofrecer canal de seguimiento

    Mensaje formato:
    "El registro de su caso ha sido completado correctamente.
    El número asignado es: {numeroCaso}

    El equipo de Calidad realizará la investigación correspondiente
    para brindarle la mejor respuesta posible.

    Agradecemos que se haya comunicado con Vetanco. Su aporte es
    fundamental para mejorar nuestros procesos y para seguir
    garantizando la calidad de nuestros productos y servicios."

    Sé cordial y profesional.
  `,

  maxTurns: 2,
  timeout: 60
};
```

---

## FunctionNodes

Los FunctionNodes manejan la lógica de negocio y persistencia de datos.

### 1. Validar Cliente

**Archivo**: `src/functions/validar-cliente.ts`

**Responsabilidad**: Validar y normalizar datos del cliente.

```typescript
export async function validarCliente(sessionState: SessionState) {
  // 1. Validar CUIT
  const cuitValido = validarFormatoCUIT(sessionState.clienteCUIT);
  if (!cuitValido) {
    throw new Error('CUIT inválido');
  }

  // 2. Buscar cliente existente
  const clienteExistente = await supabase
    .from('clientes')
    .select('*')
    .eq('cuit', sessionState.clienteCUIT)
    .single();

  // 3. Si existe, actualizar; si no, crear nuevo
  if (clienteExistente.data) {
    sessionState.clienteId = clienteExistente.data.id;
  } else {
    const nuevoCliente = await crearCliente(sessionState);
    sessionState.clienteId = nuevoCliente.id;
  }

  return sessionState;
}
```

### 2. Guardar Caso

**Archivo**: `src/functions/guardar-caso.ts`

**Responsabilidad**: Persistir caso completo en Supabase.

```typescript
export async function guardarCaso(sessionState: SessionState) {
  const { data: caso, error } = await supabase
    .from('casos')
    .insert({
      cliente_id: sessionState.clienteId,
      colaborador_registro_id: sessionState.colaboradorId,
      tipo_usuario_registro: sessionState.tipoUsuarioRegistro,
      tipo_caso: sessionState.tipoCaso || 'pendiente_clasificacion',
      criticidad: sessionState.criticidad || 'no_aplica',
      canal: 'whatsapp',
      descripcion_que_sucedio: sessionState.descripcionQueSucedio,
      descripcion_donde_ocurrio: sessionState.descripcionDondeOcurrio,
      descripcion_cuando_ocurrio: sessionState.descripcionCuandoOcurrio,
      descripcion_libre: sessionState.descripcionLibre,
      numero_remito: sessionState.numeroRemito,
      estado: 'nuevo'
    })
    .select()
    .single();

  if (error) throw error;

  sessionState.casoId = caso.id;
  sessionState.numeroCaso = caso.numero_caso;

  return sessionState;
}
```

### 3. Clasificar Caso Automático

**Archivo**: `src/functions/clasificar-caso.ts`

**Responsabilidad**: Clasificar automáticamente basado en keywords.

```typescript
export function clasificarCasoAutomatico(sessionState: SessionState) {
  const descripcion = sessionState.descripcionQueSucedio?.toLowerCase() || '';
  const estadoProducto = sessionState.productoEstado;

  // Keywords por criticidad
  const keywordsCritico = ['muerte', 'intoxicación', 'salud', 'emergencia', 'grave'];
  const keywordsMayor = ['defecto', 'vencido', 'no sirve', 'contaminado', 'roto'];
  const keywordsComentario = ['sugerencia', 'pregunta', 'cómo', 'dosis', 'consulta'];
  const keywordsQueja = ['demora', 'atención', 'precio', 'servicio'];

  // Clasificar tipo
  if (keywordsComentario.some(k => descripcion.includes(k))) {
    sessionState.tipoCaso = 'comentario';
    sessionState.criticidad = 'no_aplica';
  } else if (keywordsQueja.some(k => descripcion.includes(k)) &&
             estadoProducto === 'sin_usar') {
    sessionState.tipoCaso = 'queja';
    sessionState.criticidad = 'no_aplica';
  } else {
    // Es reclamo, determinar criticidad
    sessionState.tipoCaso = 'reclamo';

    if (keywordsCritico.some(k => descripcion.includes(k))) {
      sessionState.criticidad = 'critico';
    } else if (keywordsMayor.some(k => descripcion.includes(k))) {
      sessionState.criticidad = 'mayor';
    } else {
      sessionState.criticidad = 'menor';
    }
  }

  sessionState.justificacion = 'pendiente_investigacion';

  return sessionState;
}
```

---

## Patrones de Diseño Aplicados

### 1. Patrón: Enrutamiento por Tipo de Usuario

**Problema**: Clientes y colaboradores tienen flujos de captura diferentes.

**Solución**: DecideNode temprano que enruta a agentes especializados.

```
Start → Decide(tipo) → {Cliente: AgentA, Colaborador: AgentB} → Continue
```

### 2. Patrón: Validación en Funciones

**Problema**: Agentes no deben manejar lógica de validación compleja.

**Solución**: AgentNodes capturan, FunctionNodes validan.

```
Agent(captura datos) → Function(valida) → Agent(continúa) o Error(reintenta)
```

### 3. Patrón: Estado Compartido

**Problema**: Múltiples agentes necesitan acceso a datos capturados previamente.

**Solución**: SessionState global accesible por todos los nodos.

### 4. Patrón: Clasificación Automática con Revisión Manual

**Problema**: No todos los casos pueden clasificarse automáticamente con certeza.

**Solución**: Pre-clasificación automática + estado "pendiente_investigacion" + dashboard manual.

---

## Flujo de Datos

### Captura de Datos

```
Usuario (WhatsApp)
  ↓ mensaje
Kapso API
  ↓ webhook
Flow Principal
  ↓ enruta
AgentNode
  ↓ extrae datos
SessionState
  ↓ persiste
FunctionNode
  ↓ guarda
Supabase
```

### Consulta de Datos

```
Dashboard/API
  ↓ query
Supabase (vistas)
  ↓ retorna
Service Layer
  ↓ formatea
Cliente Final
```

---

## Manejo de Errores

### Estrategias de Recuperación

**1. Timeout en Agentes**

Si el usuario no responde en el tiempo configurado:

```typescript
{
  type: 'WaitForResponseNode',
  timeout: 300,
  onTimeout: {
    message: 'No hemos recibido su respuesta. ¿Desea continuar?',
    retries: 2,
    finalAction: 'guardar_parcial'
  }
}
```

**2. Validación Fallida**

Si la validación de FunctionNode falla:

```typescript
try {
  await validarCliente(state);
} catch (error) {
  return {
    success: false,
    message: 'Los datos proporcionados no son válidos. Por favor, revise el CUIT.',
    retryNode: 'identificacion-cliente'
  };
}
```

**3. Error de Supabase**

Si falla la persistencia:

```typescript
try {
  await supabase.from('casos').insert(data);
} catch (error) {
  // Log del error
  await logError(error, sessionState);

  // Notificar al usuario
  await sendMessage('Ha ocurrido un error temporal. Por favor intente nuevamente.');

  // Guardar en cola de reintentos
  await queueRetry(sessionState);
}
```

**4. Error de Red/WhatsApp**

Si falla el envío de mensajes:

```typescript
const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    await kapso.sendMessage(message);
    break;
  } catch (error) {
    attempt++;
    if (attempt === maxRetries) {
      await logCriticalError(error);
      // Enviar alerta a equipo técnico
    }
    await sleep(1000 * attempt); // Backoff exponencial
  }
}
```

### Logging y Auditoría

Todos los eventos se registran en tabla `interacciones`:

```typescript
await supabase.from('interacciones').insert({
  caso_id: sessionState.casoId,
  tipo_interaccion: 'identificacion',
  nodo_inicio: 'identificacion-cliente',
  nodo_fin: 'guardar-identificacion',
  completada: true,
  duracion_segundos: 120
});
```

---

## Conclusión

Esta arquitectura multiagente proporciona:

- **Modularidad**: Cada agente es independiente y reutilizable
- **Escalabilidad**: Fácil agregar nuevos agentes o modificar existentes
- **Mantenibilidad**: Código organizado y bien documentado
- **Resiliencia**: Manejo robusto de errores con recuperación
- **Trazabilidad**: Logging completo de todas las operaciones

El sistema está preparado para crecer y adaptarse a nuevos requisitos de negocio de Vetanco.

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
