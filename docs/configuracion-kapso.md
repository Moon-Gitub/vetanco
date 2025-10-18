# Configuración de Kapso - Sistema Vetanco

## Prerrequisitos

1. **Cuenta de Kapso**: Registrarse en [https://kapso.ai](https://kapso.ai)
2. **Cuenta Meta Business**: Para WhatsApp Business API
3. **Número de WhatsApp Business**: Número dedicado para el bot
4. **Cuenta Supabase**: Base de datos configurada

---

## Paso 1: Configuración Inicial en Kapso Dashboard

### 1.1 Crear Proyecto

1. Ir a Dashboard de Kapso
2. Click en "New Project"
3. Nombre: `Vetanco Reclamos`
4. Descripción: `Sistema de gestión de reclamos, quejas y comentarios`
5. Click en "Create"

### 1.2 Conectar Número de WhatsApp

1. En el proyecto, ir a "Settings" → "WhatsApp"
2. Click en "Connect WhatsApp Business"
3. Seguir el flujo de autenticación de Meta
4. Seleccionar número de teléfono
5. Confirmar permisos
6. Esperar verificación (2-5 minutos)

### 1.3 Obtener API Key

1. Ir a "Settings" → "API Keys"
2. Click en "Generate New Key"
3. Nombre: `Producción`
4. Copiar API Key y guardar en lugar seguro
5. **Importante**: Esta key solo se muestra una vez

### 1.4 Configurar Webhook

1. Ir a "Settings" → "Webhooks"
2. URL del webhook: `https://tu-dominio.com/webhooks/kapso`
3. Seleccionar eventos:
   - ✅ `message.received`
   - ✅ `message.sent`
   - ✅ `message.delivered`
   - ✅ `message.read`
   - ✅ `media.received`
4. Click en "Generate Secret"
5. Copiar Webhook Secret
6. Click en "Save"

---

## Paso 2: Crear Flows en Kapso

### 2.1 Flow Principal (Main Flow)

1. Ir a "Flows" → "Create New Flow"
2. Nombre: `Main - Reclamos Vetanco`
3. Descripción: `Flow orquestador principal`
4. Click en "Create"

**Configuración del Flow:**

```yaml
id: main-reclamos-flow
name: Main - Reclamos Vetanco
trigger:
  type: message
  condition: "any_message"

nodes:
  - id: start
    type: StartNode

  - id: bienvenida
    type: SendTextNode
    config:
      message: |
        Buenos días. Le damos la bienvenida al asistente de Vetanco para la gestión de reclamos, quejas y comentarios.

        A continuación, se solicitarán algunos datos necesarios para registrar su caso y asignar un número de identificación.
    next: pregunta_tipo_usuario

  - id: pregunta_tipo_usuario
    type: SendTextNode
    config:
      message: "Antes de continuar, necesito saber si usted es el cliente que realiza el reclamo o un colaborador de Vetanco que lo está registrando en nombre del cliente."
      buttons:
        - text: "Soy el cliente"
          id: "cliente"
        - text: "Soy colaborador de Vetanco"
          id: "colaborador"
    next: espera_tipo_usuario

  - id: espera_tipo_usuario
    type: WaitForResponseNode
    config:
      timeout: 300
    next: decide_tipo_usuario

  - id: decide_tipo_usuario
    type: DecideNode
    config:
      condition: "response.button_id === 'colaborador' || response.text.toLowerCase().includes('colaborador')"
      ifTrue: agent_identificacion_colaborador
      ifFalse: agent_identificacion_cliente

  - id: agent_identificacion_cliente
    type: AgentNode
    config:
      agent: identificacion-cliente
    next: function_validar_cliente

  - id: agent_identificacion_colaborador
    type: AgentNode
    config:
      agent: identificacion-colaborador
    next: function_validar_cliente

  - id: function_validar_cliente
    type: FunctionNode
    config:
      function: validarCliente
      url: "https://tu-dominio.com/functions/validar-cliente"
    next: agent_producto

  - id: agent_producto
    type: AgentNode
    config:
      agent: producto
    next: function_guardar_producto

  - id: function_guardar_producto
    type: FunctionNode
    config:
      function: guardarProducto
      url: "https://tu-dominio.com/functions/guardar-producto"
    next: agent_descripcion

  - id: agent_descripcion
    type: AgentNode
    config:
      agent: descripcion
    next: function_clasificar

  - id: function_clasificar
    type: FunctionNode
    config:
      function: clasificarCaso
      url: "https://tu-dominio.com/functions/clasificar-caso"
    next: function_guardar_caso

  - id: function_guardar_caso
    type: FunctionNode
    config:
      function: guardarCaso
      url: "https://tu-dominio.com/functions/guardar-caso"
    next: agent_cierre

  - id: agent_cierre
    type: AgentNode
    config:
      agent: cierre
    next: end

  - id: end
    type: EndNode
```

### 2.2 Crear Agente: Identificación Cliente

1. Ir a "Agents" → "Create Agent"
2. Nombre: `identificacion-cliente`
3. Descripción: `Captura datos del cliente`

**Configuración:**

```yaml
name: Agente de Identificación Cliente
model: gpt-4
temperature: 0.3

system_prompt: |
  Eres un asistente de Vetanco especializado en recopilar información de clientes.

  Tu objetivo es capturar los siguientes datos de forma amigable:
  1. Nombre y Apellido completo
  2. Dirección completa (calle, número, piso, código postal, localidad, provincia)
  3. Teléfono de contacto
  4. Correo electrónico (opcional si el canal es WhatsApp)
  5. Razón social y CUIT
  6. Número de remito del pedido

  Reglas importantes:
  - Haz preguntas una por vez
  - El CUIT debe tener formato XX-XXXXXXXX-X (11 dígitos)
  - Si falta algún dato, pregunta específicamente por él
  - Sé cordial y profesional
  - Confirma los datos antes de finalizar

  Al finalizar, resume todos los datos capturados y pide confirmación.

tools:
  - name: validar_cuit
    description: Valida el formato del CUIT argentino
    parameters:
      type: object
      properties:
        cuit:
          type: string
          description: CUIT a validar
      required: [cuit]

  - name: buscar_cliente
    description: Busca si el cliente ya existe en la base de datos
    parameters:
      type: object
      properties:
        cuit:
          type: string
        telefono:
          type: string
      required: [cuit]

max_turns: 10
timeout: 600

exit_conditions:
  - type: all_data_collected
    required_fields:
      - nombre_apellido
      - direccion
      - telefono
      - razon_social
      - cuit
      - numero_remito
```

### 2.3 Crear Agente: Identificación Colaborador

Similar al anterior pero con dos fases:

```yaml
name: Agente de Identificación Colaborador
model: gpt-4
temperature: 0.3

system_prompt: |
  Eres un asistente de Vetanco que ayuda a colaboradores internos.

  FASE 1: Datos del colaborador
  1. Nombre y Apellido
  2. Cargo/Puesto
  3. Área (Ventas, Asistencia Técnica, Administración, etc.)

  FASE 2: Datos del cliente
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
  - Confirma datos importantes

tools:
  - name: validar_colaborador
    description: Valida que el colaborador exista
  - name: buscar_cliente_por_cuit
    description: Busca cliente por CUIT

max_turns: 15
timeout: 900
```

### 2.4 Crear Agente: Producto

```yaml
name: Agente de Productos
model: gpt-4
temperature: 0.3

system_prompt: |
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
  - Si hay múltiples productos afectados, captura todos
  - Solicita fotos si el estado es "envase roto" o "usado"

  Al finalizar, resume la información y pide confirmación.

tools:
  - name: buscar_producto
    description: Busca producto en catálogo
  - name: validar_lote
    description: Valida formato de lote

accepts_media: true
max_turns: 12
timeout: 600
```

### 2.5 Crear Agente: Descripción

```yaml
name: Agente de Descripción del Incidente
model: gpt-4
temperature: 0.3

system_prompt: |
  Eres un investigador de calidad de Vetanco especializado en incidentes.

  Debes obtener:
  1. ¿Qué sucedió? (descripción clara del problema)
  2. ¿Dónde ocurrió? (ubicación, establecimiento, etc.)
  3. ¿Cuándo ocurrió? (fecha y hora aproximada)
  4. Comentarios y observaciones adicionales

  Reglas:
  - Haz preguntas abiertas para obtener detalles
  - Solicita información técnica relevante
  - Identifica keywords para pre-clasificación:
    * "riesgo", "salud", "muerte" → CRÍTICO
    * "defecto", "no funciona", "vencido" → MAYOR
    * "duda", "consulta", "sugerencia" → COMENTARIO
  - Resume la información antes de finalizar

tools:
  - name: extraer_keywords
    description: Extrae keywords para clasificación
  - name: calcular_severidad
    description: Calcula severidad

max_turns: 8
timeout: 600
```

### 2.6 Crear Agente: Cierre

```yaml
name: Agente de Cierre
model: gpt-4
temperature: 0.3

system_prompt: |
  Eres el agente final que confirma el registro exitoso del caso.

  Debes:
  1. Agradecer al cliente por reportar
  2. Proporcionar el número de caso generado (de session_state.numero_caso)
  3. Explicar que el equipo de Calidad investigará
  4. Indicar los próximos pasos
  5. Ofrecer canal de seguimiento

  Mensaje formato:
  "El registro de su caso ha sido completado correctamente.
  📋 El número asignado es: {numero_caso}

  El equipo de Calidad de Vetanco realizará la investigación correspondiente
  para brindarle la mejor respuesta posible.

  Puede utilizar este número para hacer seguimiento de su caso.

  Agradecemos que se haya comunicado con Vetanco. Su aporte es fundamental
  para mejorar nuestros procesos y para seguir garantizando la calidad
  de nuestros productos y servicios."

  Sé cordial y profesional.

max_turns: 2
timeout: 60
```

---

## Paso 3: Configurar FunctionNodes

Las FunctionNodes llaman a endpoints de tu servidor. Debes configurar las URLs:

### 3.1 En Kapso Dashboard

1. Ir a "Functions"
2. Crear cada función:

**Función: validarCliente**
```yaml
name: validarCliente
url: https://tu-dominio.com/functions/validar-cliente
method: POST
headers:
  Authorization: Bearer YOUR_FUNCTION_SECRET
timeout: 30
```

**Función: guardarProducto**
```yaml
name: guardarProducto
url: https://tu-dominio.com/functions/guardar-producto
method: POST
timeout: 30
```

**Función: clasificarCaso**
```yaml
name: clasificarCaso
url: https://tu-dominio.com/functions/clasificar-caso
method: POST
timeout: 15
```

**Función: guardarCaso**
```yaml
name: guardarCaso
url: https://tu-dominio.com/functions/guardar-caso
method: POST
timeout: 30
```

---

## Paso 4: Variables de Entorno

Crear archivo `.env`:

```bash
# Kapso
KAPSO_API_KEY=your_kapso_api_key_here
KAPSO_WEBHOOK_SECRET=your_webhook_secret_here
KAPSO_PHONE_NUMBER=5491144445555

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Application
NODE_ENV=production
PORT=3000
FUNCTION_SECRET=your_function_secret_here

# URLs
BASE_URL=https://tu-dominio.com
```

---

## Paso 5: Inicializar SDK en Código

```typescript
// src/config/kapso.ts
import { Kapso } from '@kapso/sdk';

export const kapso = new Kapso({
  apiKey: process.env.KAPSO_API_KEY!,
  phoneNumber: process.env.KAPSO_PHONE_NUMBER!
});

// Enviar mensaje
export async function sendMessage(to: string, message: string) {
  return await kapso.messages.send({
    to,
    type: 'text',
    text: { body: message }
  });
}

// Enviar mensaje con botones
export async function sendButtons(to: string, message: string, buttons: Array<{text: string, id: string}>) {
  return await kapso.messages.send({
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: message },
      action: {
        buttons: buttons.map(b => ({
          type: 'reply',
          reply: { id: b.id, title: b.text }
        }))
      }
    }
  });
}
```

---

## Paso 6: Testing

### 6.1 Test en Kapso Simulator

1. Ir a "Flows" → Seleccionar flow principal
2. Click en "Test"
3. Simular conversación completa
4. Verificar que todos los nodos se ejecutan correctamente

### 6.2 Test con Número Real

1. Enviar mensaje WhatsApp al número configurado
2. Seguir el flujo completo
3. Verificar que los datos se guardan en Supabase
4. Revisar logs en Kapso Dashboard

### 6.3 Verificar Webhooks

```bash
# Ver logs de webhooks en tu servidor
tail -f logs/webhooks.log

# O en Kapso Dashboard
# Ir a "Webhooks" → "Logs"
```

---

## Paso 7: Monitoreo y Logs

### 7.1 En Kapso Dashboard

1. Ir a "Monitoring"
2. Ver métricas:
   - Mensajes enviados/recibidos
   - Tasa de éxito
   - Tiempo de respuesta
   - Errores

### 7.2 Configurar Alertas

1. Ir a "Settings" → "Alerts"
2. Configurar alertas para:
   - Tasa de error > 5%
   - Webhook down
   - Flow failure rate > 10%

---

## Troubleshooting

### Problema: Webhook no recibe mensajes

**Solución:**
1. Verificar que URL sea accesible públicamente (usar ngrok en desarrollo)
2. Verificar firma HMAC en código
3. Revisar logs de Kapso Dashboard

### Problema: FunctionNode falla

**Solución:**
1. Verificar que endpoint sea accesible
2. Revisar timeout configurado
3. Verificar headers de autenticación

### Problema: Agente no responde correctamente

**Solución:**
1. Revisar system_prompt
2. Ajustar temperature (0.3 para más precisión)
3. Agregar más ejemplos en el prompt

---

## Mejores Prácticas

1. **Usar variables de entorno** para todas las credenciales
2. **Implementar retry logic** en FunctionNodes
3. **Validar firma HMAC** en todos los webhooks
4. **Log completo** de todas las interacciones
5. **Testing exhaustivo** antes de producción
6. **Monitoreo activo** de métricas
7. **Backup** de configuraciones de flows

---

## Recursos

- [Documentación Kapso](https://docs.kapso.ai)
- [SDK TypeScript](https://github.com/kapso-ai/typescript-sdk)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Supabase Docs](https://supabase.com/docs)

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
