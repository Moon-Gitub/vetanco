# CONFIGURACIÓN COMPLETA DE KAPSO - AGENTES Y PROMPTS

**Sistema de Reclamos Vetanco**
Versión: 1.0
Fecha: 2025-10-19

---

## 📋 ESTRUCTURA DEL FLOW

```
START
  ↓
[AgentNode] Agente Bienvenida
  ↓
[AgentNode] Agente Identificación Cliente
  ↓
[FunctionNode] Validar Cliente (llama a tu servidor)
  ↓
[AgentNode] Agente Información Producto
  ↓
[AgentNode] Agente Descripción Incidente
  ↓
[FunctionNode] Clasificar Caso (llama a tu servidor)
  ↓
[DecideNode] ¿Es reclamo crítico?
  ├─ SÍ → [AgentNode] Notificación Urgente
  └─ NO → [AgentNode] Confirmación Normal
  ↓
[FunctionNode] Guardar Caso (llama a tu servidor)
  ↓
[AgentNode] Agente Despedida
  ↓
END
```

---

## 🤖 AGENTE 1: BIENVENIDA E INICIO

### Configuración:
- **Nombre:** `Agente Bienvenida`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente virtual de Vetanco S.A., empresa líder en productos veterinarios de Argentina.

Tu rol es dar la bienvenida cordial y profesional a clientes que se contactan para reportar reclamos, quejas o comentarios sobre nuestros productos.

INSTRUCCIONES:
- Saluda cordialmente
- Preséntate como asistente de Vetanco
- Explica brevemente que vas a ayudarlos a registrar su caso
- Pregunta en qué puedes ayudarlos hoy
- Mantén un tono empático y profesional

NO pidas información todavía, solo da la bienvenida.
```

### Variables de SessionState:
- **Captura:** Ninguna
- **Lee:** Ninguna

### Ejemplo de salida esperada:
```
¡Hola! Bienvenido/a a Vetanco S.A.

Soy tu asistente virtual y estoy aquí para ayudarte a registrar tu reclamo, queja o comentario sobre nuestros productos.

¿En qué puedo ayudarte hoy?
```

---

## 🤖 AGENTE 2: IDENTIFICACIÓN DEL CLIENTE

### Configuración:
- **Nombre:** `Agente Identificacion`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco encargado de identificar al cliente.

INFORMACIÓN QUE DEBES CAPTURAR:
1. Nombre y Apellido (persona que reporta)
2. Razón Social (nombre de la empresa/establecimiento)
3. CUIT (11 dígitos, formato: XX-XXXXXXXX-X)
4. Dirección completa:
   - Calle y número
   - Piso/Departamento (si aplica)
   - Localidad
   - Provincia
   - Código Postal
5. Teléfono de contacto
6. Email (opcional)

INSTRUCCIONES:
- Pide los datos de forma natural y ordenada
- Si el cliente ya es conocido, solo confirma CUIT y nombre
- Valida que el CUIT tenga 11 dígitos
- Sé paciente si el cliente no tiene algún dato a mano
- Confirma los datos antes de continuar

VARIABLES A GUARDAR EN SESSION STATE:
- clienteNombreApellido
- clienteRazonSocial
- clienteCUIT
- clienteDireccionCalle
- clienteDireccionNumero
- clienteDireccionPiso
- clienteLocalidad
- clienteProvincia
- clienteCodigoPostal
- clienteTelefono
- clienteEmail

Cuando tengas todos los datos obligatorios, confirma con el cliente y finaliza la conversación diciendo "Datos confirmados".
```

### Variables de SessionState:

**Captura:**
- `clienteNombreApellido` (string) - Nombre completo del contacto
- `clienteRazonSocial` (string) - Nombre de la empresa/establecimiento
- `clienteCUIT` (string) - CUIT de 11 dígitos
- `clienteDireccionCalle` (string) - Calle
- `clienteDireccionNumero` (string) - Número
- `clienteDireccionPiso` (string, opcional) - Piso/Depto
- `clienteLocalidad` (string) - Localidad
- `clienteProvincia` (string) - Provincia
- `clienteCodigoPostal` (string) - Código postal
- `clienteTelefono` (string) - Teléfono
- `clienteEmail` (string, opcional) - Email

**Lee:** Ninguna

### Validaciones importantes:
- CUIT debe tener exactamente 11 dígitos
- Todos los campos son obligatorios excepto email y piso

---

## 🔧 FUNCTIONNODE 1: VALIDAR CLIENTE

### Configuración:
- **Nombre:** `Validar Cliente`
- **Tipo:** FunctionNode
- **URL:** `https://vetanco.aiporvos.com/functions/validar-cliente`
- **Method:** POST
- **Timeout:** 10 segundos

### Headers:
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON):
```json
{
  "sessionState": "{{sessionState}}"
}
```

### Respuesta esperada:
```json
{
  "success": true,
  "clienteId": "uuid-del-cliente",
  "clienteExistente": true,
  "mensaje": "Cliente encontrado en la base de datos",
  "sessionState": {
    "clienteId": "uuid-del-cliente",
    ...
  }
}
```

### Variables que retorna:
- `clienteId` (string, UUID) - ID del cliente en la base de datos
- `clienteExistente` (boolean) - true si ya existía, false si se creó nuevo
- `mensaje` (string) - Mensaje de confirmación

### Qué hace esta función:
1. Busca el cliente por CUIT en Supabase
2. Si existe, retorna sus datos
3. Si no existe, crea un nuevo cliente
4. Actualiza el sessionState con el clienteId

---

## 🤖 AGENTE 3: INFORMACIÓN DEL PRODUCTO

### Configuración:
- **Nombre:** `Agente Producto`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco encargado de capturar información del producto afectado.

INFORMACIÓN QUE DEBES CAPTURAR:
1. Nombre del producto (marca y tipo)
2. Presentación (ej: "Frasco 500ml", "Bolsa 25kg", etc.)
3. Número de lote (impreso en el envase)
4. Fecha de vencimiento
5. Estado del producto:
   - USADO o SIN_USAR
   - ENVASE_ROTO o ENVASE_SANO
6. Cantidad afectada (número y unidad: kg, litros, frascos, etc.)
7. Condiciones de almacenamiento (dónde y cómo se guardó)
8. Número de remito de compra

INSTRUCCIONES:
- Pide la información de forma clara y ordenada
- Si el cliente tiene varios productos afectados, registra el principal primero
- Ayuda al cliente a encontrar el número de lote (ubicación típica en envases)
- Sé específico con las opciones de estado (usado/sin usar, envase roto/sano)

VARIABLES A GUARDAR EN SESSION STATE:
- productoNombre
- productoPresentacion
- productoLote
- productoFechaVencimiento
- productoEstado (formato: "usado,envase_sano" o combinación)
- productoCantidad
- productoUnidad
- productoCondicionesAlmacenamiento
- numeroRemito

Cuando tengas toda la información, confirma con el cliente y di "Información del producto registrada".
```

### Variables de SessionState:

**Captura:**
- `productoNombre` (string) - Nombre del producto
- `productoPresentacion` (string) - Presentación (ej: "500ml", "25kg")
- `productoLote` (string) - Número de lote
- `productoFechaVencimiento` (date) - Fecha de vencimiento
- `productoEstado` (string) - Estado: "usado/sin_usar" + "envase_roto/envase_sano"
- `productoCantidad` (number) - Cantidad afectada
- `productoUnidad` (string) - Unidad (kg, litros, frascos, etc.)
- `productoCondicionesAlmacenamiento` (string) - Cómo se almacenó
- `numeroRemito` (string) - Número de remito

**Lee:**
- `clienteNombreApellido` (para personalizar)

### Valores válidos para productoEstado:
- "usado" o "sin_usar"
- "envase_roto" o "envase_sano"
- Formato combinado: "usado,envase_sano" o "sin_usar,envase_roto"

---

## 🤖 AGENTE 4: DESCRIPCIÓN DEL INCIDENTE

### Configuración:
- **Nombre:** `Agente Descripcion`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco encargado de capturar los detalles del incidente.

INFORMACIÓN QUE DEBES CAPTURAR:
1. ¿QUÉ SUCEDIÓ? (descripción detallada del problema o incidente)
2. ¿DÓNDE OCURRIÓ? (ubicación: campo, galpón, corral, etc.)
3. ¿CUÁNDO OCURRIÓ? (fecha y hora aproximada)
4. Descripción libre adicional (cualquier otro detalle relevante)

INSTRUCCIONES:
- Haz preguntas abiertas para que el cliente explique con detalle
- Para QUÉ SUCEDIÓ, pide mínimo 20 caracteres de descripción
- Sé empático si reportan problemas graves
- Anota textualmente lo que el cliente diga (es evidencia)
- Si mencionan síntomas, muertes, o problemas graves, regístralos con exactitud

PALABRAS CLAVE IMPORTANTES A DETECTAR:
- Críticas: muerte, murió, intoxicación, tóxico, grave, emergencia
- Mayores: defecto, vencido, contaminado, roto, no funciona
- Quejas: demora, atención, facturación, precio
- Comentarios: consulta, pregunta, duda, cómo usar

VARIABLES A GUARDAR EN SESSION STATE:
- descripcionQueSucedio (OBLIGATORIO, mínimo 20 caracteres)
- descripcionDondeOcurrio
- descripcionCuandoOcurrio (formato fecha/hora)
- descripcionLibre

Cuando tengas la descripción completa, di "Descripción del incidente registrada".
```

### Variables de SessionState:

**Captura:**
- `descripcionQueSucedio` (string, min 20 chars) - ¿Qué pasó?
- `descripcionDondeOcurrio` (string, opcional) - ¿Dónde?
- `descripcionCuandoOcurrio` (datetime, opcional) - ¿Cuándo?
- `descripcionLibre` (string, opcional) - Detalles adicionales

**Lee:**
- `productoNombre` (para contextualizar)
- `clienteNombreApellido` (para personalizar)

### Keywords críticos que debe detectar:
**Críticos:** muerte, murió, muerto, intoxicación, tóxico, grave, emergencia, urgente
**Mayores:** defecto, vencido, contaminado, roto, dañado, no funciona
**Quejas:** demora, mal servicio, atención, precio, facturación
**Comentarios:** consulta, pregunta, duda, información, cómo usar

---

## 🔧 FUNCTIONNODE 2: CLASIFICAR CASO

### Configuración:
- **Nombre:** `Clasificar Caso`
- **Tipo:** FunctionNode
- **URL:** `https://vetanco.aiporvos.com/functions/clasificar-caso`
- **Method:** POST
- **Timeout:** 10 segundos

### Headers:
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON):
```json
{
  "sessionState": "{{sessionState}}"
}
```

### Respuesta esperada:
```json
{
  "success": true,
  "tipoCaso": "reclamo",
  "criticidad": "critico",
  "confianza": 0.95,
  "razonamiento": "Detectadas palabras clave que indican riesgo grave para la salud animal",
  "keywordsEncontrados": ["muerte", "intoxicación"],
  "sessionState": {
    "tipoCaso": "reclamo",
    "criticidad": "critico",
    ...
  }
}
```

### Variables que retorna:
- `tipoCaso` (string) - Valores: "reclamo", "queja", "comentario", "pendiente_clasificacion"
- `criticidad` (string) - Valores: "critico", "mayor", "menor", "no_aplica"
- `confianza` (number 0-1) - Nivel de confianza en la clasificación
- `razonamiento` (string) - Explicación de por qué se clasificó así
- `keywordsEncontrados` (array) - Keywords detectados

### Qué hace esta función:
1. Analiza la descripción del incidente
2. Detecta keywords críticos, mayores, de quejas o comentarios
3. Considera el estado del producto
4. Clasifica automáticamente el caso
5. Retorna la clasificación con nivel de confianza

### Clasificación automática:
- **CRÍTICO**: muerte, intoxicación, emergencia, peligro grave
- **MAYOR**: producto vencido, defectuoso, contaminado, envase roto
- **MENOR**: producto usado con problema leve
- **QUEJA**: servicio, atención, facturación, demora
- **COMENTARIO**: consulta, pregunta, duda

---

## 🔀 DECIDENODE: ¿ES RECLAMO CRÍTICO?

### Configuración:
- **Nombre:** `Decision Criticidad`
- **Tipo:** DecideNode

### Condición:
```javascript
sessionState.tipoCaso === 'reclamo' && sessionState.criticidad === 'critico'
```

### Rutas:
- **SI (true):** → Agente Notificación Urgente
- **NO (false):** → Agente Confirmación Normal

### Variables que evalúa:
- `tipoCaso` (debe ser "reclamo")
- `criticidad` (debe ser "critico")

---

## 🤖 AGENTE 5A: NOTIFICACIÓN URGENTE (Solo casos críticos)

### Configuración:
- **Nombre:** `Agente Notificacion Urgente`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco especializado en casos CRÍTICOS.

El cliente ha reportado un incidente GRAVE que requiere atención urgente.

INSTRUCCIONES:
- Reconoce la gravedad del caso
- Tranquiliza al cliente indicando que su caso es PRIORITARIO
- Informa que el equipo de calidad se contactará en las próximas 2 HORAS
- Si hay animales afectados, recomienda consultar con veterinario
- Mantén un tono empático, profesional y tranquilizador
- NO minimices la situación

INFORMACIÓN DISPONIBLE:
- Tipo de caso: {{tipoCaso}}
- Criticidad: {{criticidad}}

Finaliza diciendo "Procederé a registrar su caso crítico de inmediato".
```

### Variables de SessionState:

**Lee:**
- `tipoCaso`
- `criticidad`
- `descripcionQueSucedio`
- `clienteNombreApellido`

**Captura:** Ninguna

---

## 🤖 AGENTE 5B: CONFIRMACIÓN NORMAL (Casos no críticos)

### Configuración:
- **Nombre:** `Agente Confirmacion Normal`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco encargado de confirmar el registro del caso.

INSTRUCCIONES:
- Agradece al cliente por reportar el caso
- Confirma que procederás a registrarlo
- Según el tipo de caso, informa los tiempos:
  * RECLAMO MAYOR: "Nuestro equipo se contactará en 24 horas"
  * RECLAMO MENOR: "Procesaremos su caso en 48 horas"
  * QUEJA: "Evaluaremos su reporte y tomaremos medidas"
  * COMENTARIO: "Agradecemos su consulta/comentario"
- Mantén un tono profesional y empático

INFORMACIÓN DISPONIBLE:
- Tipo de caso: {{tipoCaso}}
- Criticidad: {{criticidad}}

Finaliza diciendo "Procederé a registrar su caso".
```

### Variables de SessionState:

**Lee:**
- `tipoCaso`
- `criticidad`
- `clienteNombreApellido`

**Captura:** Ninguna

---

## 🔧 FUNCTIONNODE 3: GUARDAR CASO

### Configuración:
- **Nombre:** `Guardar Caso`
- **Tipo:** FunctionNode
- **URL:** `https://vetanco.aiporvos.com/functions/guardar-caso`
- **Method:** POST
- **Timeout:** 15 segundos

### Headers:
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON):
```json
{
  "sessionState": "{{sessionState}}"
}
```

### Respuesta esperada:
```json
{
  "success": true,
  "numeroCaso": "VET-2025-00001",
  "casoId": "uuid-del-caso",
  "mensaje": "Caso registrado exitosamente",
  "sessionState": {
    "numeroCaso": "VET-2025-00001",
    "casoId": "uuid-del-caso",
    ...
  }
}
```

### Variables que retorna:
- `numeroCaso` (string) - Número único del caso (formato: VET-YYYY-NNNNN)
- `casoId` (string, UUID) - ID del caso en la base de datos
- `mensaje` (string) - Confirmación

### Qué hace esta función:
1. Crea el registro del caso en la tabla `casos`
2. Crea el registro del producto en `productos_afectados`
3. Guarda todos los mensajes en `mensajes`
4. Guarda adjuntos si los hay en `adjuntos`
5. Registra la clasificación en `clasificaciones`
6. Genera el número de caso único automáticamente
7. Retorna el número de caso para mostrárselo al cliente

### Datos que guarda:
- Cliente (ya validado anteriormente)
- Producto afectado (nombre, lote, vencimiento, estado, cantidad)
- Caso (tipo, criticidad, justificación, descripciones)
- Conversación completa (todos los mensajes)
- Clasificación automática

---

## 🤖 AGENTE 6: DESPEDIDA Y ENTREGA DE NÚMERO DE CASO

### Configuración:
- **Nombre:** `Agente Despedida`
- **Tipo:** AgentNode
- **Modelo:** GPT-4 (recomendado)

### Prompt del Sistema:
```
Eres un asistente de Vetanco encargado de confirmar el registro del caso y despedir al cliente.

INSTRUCCIONES:
- Informa al cliente que su caso fue registrado exitosamente
- Proporciona el NÚMERO DE CASO (está en sessionState.numeroCaso)
- Explica los próximos pasos según la criticidad:
  * CRÍTICO: "Nuestro equipo de calidad se contactará en las próximas 2 horas"
  * MAYOR: "Nuestro equipo se contactará en las próximas 24 horas"
  * MENOR: "Procesaremos su caso en las próximas 48 horas"
  * QUEJA: "Hemos registrado su reporte y lo evaluaremos"
  * COMENTARIO: "Agradecemos su consulta/comentario"
- Agradece por contactarse con Vetanco
- Ofrece ayuda adicional si la necesita
- Despídete cordialmente

TONO:
- Empático y profesional
- Tranquilizador si el caso es grave
- Agradecido por la confianza del cliente

INFORMACIÓN DISPONIBLE:
- Número de caso: {{numeroCaso}}
- Tipo de caso: {{tipoCaso}}
- Criticidad: {{criticidad}}

Finaliza diciendo "Caso {{numeroCaso}} registrado. ¡Que tenga un buen día!"
```

### Variables de SessionState:

**Lee:**
- `numeroCaso` (IMPORTANTE: mostrarlo al cliente)
- `tipoCaso`
- `criticidad`
- `clienteNombreApellido`

**Captura:** Ninguna

### Ejemplo de respuesta esperada:
```
¡Perfecto, [Nombre]!

Su caso ha sido registrado exitosamente con el número: VET-2025-00001

Dado que se trata de un reclamo crítico, nuestro equipo de calidad se contactará con usted en las próximas 2 horas para dar seguimiento al caso.

Por favor, conserve este número de caso para futuras consultas.

¿Hay algo más en lo que pueda ayudarlo?

Caso VET-2025-00001 registrado. ¡Que tenga un buen día!
```

---

## 📊 VARIABLES DE SESSION STATE - RESUMEN COMPLETO

### Variables de Cliente:
```javascript
{
  "clienteNombreApellido": "string",
  "clienteRazonSocial": "string",
  "clienteCUIT": "string (11 dígitos)",
  "clienteDireccionCalle": "string",
  "clienteDireccionNumero": "string",
  "clienteDireccionPiso": "string (opcional)",
  "clienteLocalidad": "string",
  "clienteProvincia": "string",
  "clienteCodigoPostal": "string",
  "clienteTelefono": "string",
  "clienteEmail": "string (opcional)",
  "clienteId": "UUID (generado por función)"
}
```

### Variables de Producto:
```javascript
{
  "productoNombre": "string",
  "productoPresentacion": "string",
  "productoLote": "string",
  "productoFechaVencimiento": "date",
  "productoEstado": "string (usado/sin_usar,envase_roto/envase_sano)",
  "productoCantidad": "number",
  "productoUnidad": "string",
  "productoCondicionesAlmacenamiento": "string",
  "numeroRemito": "string"
}
```

### Variables de Descripción:
```javascript
{
  "descripcionQueSucedio": "string (min 20 chars)",
  "descripcionDondeOcurrio": "string (opcional)",
  "descripcionCuandoOcurrio": "datetime (opcional)",
  "descripcionLibre": "string (opcional)"
}
```

### Variables de Clasificación (generadas por funciones):
```javascript
{
  "tipoCaso": "reclamo | queja | comentario | pendiente_clasificacion",
  "criticidad": "critico | mayor | menor | no_aplica",
  "confianza": "number (0-1)",
  "razonamiento": "string",
  "keywordsEncontrados": "array"
}
```

### Variables de Resultado (generadas por funciones):
```javascript
{
  "clienteId": "UUID",
  "clienteExistente": "boolean",
  "casoId": "UUID",
  "numeroCaso": "string (VET-YYYY-NNNNN)"
}
```

---

## 🔗 ENDPOINTS DEL SERVIDOR

### Base URL:
```
https://vetanco.aiporvos.com
```

### Endpoints disponibles:

**1. Webhook (recibe eventos de Kapso):**
```
POST /webhooks/kapso
```

**2. Funciones (llamadas desde FunctionNodes):**
```
POST /functions/validar-cliente
POST /functions/clasificar-caso
POST /functions/guardar-caso
```

**3. API REST (consultas):**
```
GET  /api/casos
GET  /api/casos/:id
POST /api/casos
PUT  /api/casos/:id

GET  /api/clientes
GET  /api/clientes/:id
POST /api/clientes

GET  /api/productos
GET  /api/investigaciones
```

**4. Health Check:**
```
GET /health
```

---

## ⚙️ CONFIGURACIÓN DE KAPSO

### Credenciales necesarias:
```bash
KAPSO_API_KEY=tu_api_key_aqui
KAPSO_WEBHOOK_SECRET=tu_webhook_secret_aqui
KAPSO_PHONE_NUMBER=549XXXXXXXXX
```

### Webhook Configuration en Kapso:
- **Webhook URL:** `https://vetanco.aiporvos.com/webhooks/kapso`
- **Events:** Seleccionar todos
  - message.received
  - message.sent
  - session.started
  - session.ended
  - media.received

### Flow Configuration:
- **Name:** Reclamos Vetanco
- **Description:** Sistema de gestión de reclamos, quejas y comentarios
- **Trigger:** WhatsApp message received
- **Language:** Spanish (es)
- **Default Agent Model:** GPT-4

---

## 🎯 FLUJO DE PRUEBA

### Caso de prueba 1: Reclamo Crítico
```
Usuario: Hola
Bot: [Bienvenida]

Usuario: Tengo un problema grave con un producto
Bot: [Pide identificación]

Usuario: Juan Pérez, Establecimiento Los Alamos, CUIT 20-12345678-9,
        Calle Falsa 123, Luján, Buenos Aires, CP 6700, Tel 2323-456789

Bot: [Confirma datos] → [Llama a validar-cliente] → [Pide info producto]

Usuario: Producto Vetanco Antiparasitario 500ml, lote ABC123,
        vencimiento 2025-12-31, envase sano, usado, 2 frascos

Bot: [Registra producto] → [Pide descripción]

Usuario: Murieron 3 vacas después de aplicar el producto esta mañana
Bot: [Registra descripción] → [Llama a clasificar-caso]
     → Detecta "murieron" → Clasifica como CRÍTICO
     → [Mensaje urgente] → [Llama a guardar-caso]
     → [Despedida con número VET-2025-00001]
```

### Caso de prueba 2: Queja
```
Usuario: Hola, quiero hacer una queja
Bot: [Similar flujo...]
Usuario: El producto llegó con demora de 2 semanas
Bot: [Clasifica como QUEJA] → [Confirmación normal] → [Número de caso]
```

### Caso de prueba 3: Comentario
```
Usuario: Hola, tengo una consulta
Bot: [Similar flujo...]
Usuario: ¿Cómo se usa el antiparasitario en terneros?
Bot: [Clasifica como COMENTARIO] → [Confirmación] → [Número de caso]
```

---

## 📝 NOTAS IMPORTANTES

### Para Agentes GPT-4:
- Todos los agentes usan GPT-4 para mejor comprensión del lenguaje natural
- Temperatura recomendada: 0.7 (balance entre creatividad y precisión)
- Max tokens: 500 por respuesta (suficiente para conversación fluida)

### Para FunctionNodes:
- Timeout: 10-15 segundos (dar tiempo a operaciones de BD)
- Retry: 1 intento (si falla, notificar al usuario)
- Error handling: Mostrar mensaje amigable al cliente

### Para SessionState:
- Todas las variables se mantienen durante toda la sesión
- Se envían completas en cada llamada a FunctionNodes
- Se persisten en la base de datos al final

### Seguridad:
- Webhook signature verification activada
- HTTPS obligatorio en todos los endpoints
- Validación de datos en servidor con Zod schemas
- CORS configurado solo para dominios autorizados

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### En Kapso:
- [ ] Cuenta creada y verificada
- [ ] WhatsApp Business conectado
- [ ] API Key obtenida
- [ ] Webhook Secret obtenido
- [ ] Webhook URL configurada
- [ ] Flow "Reclamos Vetanco" creado
- [ ] 6 AgentNodes creados con prompts
- [ ] 3 FunctionNodes creados con URLs
- [ ] 1 DecideNode configurado
- [ ] Nodos conectados en orden correcto
- [ ] Variables de SessionState mapeadas
- [ ] Flow activado y publicado

### En Dokploy:
- [ ] Variables KAPSO_* actualizadas
- [ ] Redeploy exitoso
- [ ] Servidor corriendo (status: Running)
- [ ] Endpoint /webhooks/kapso respondiendo

### En Supabase:
- [ ] Tablas creadas
- [ ] Triggers funcionando
- [ ] Storage bucket configurado
- [ ] Conexión verificada

### Testing:
- [ ] Caso crítico probado
- [ ] Caso mayor probado
- [ ] Queja probada
- [ ] Comentario probado
- [ ] Datos guardados en Supabase
- [ ] Números de caso generándose correctamente

---

## 🆘 TROUBLESHOOTING

### Si los FunctionNodes fallan:
1. Verificar que el servidor esté corriendo en Dokploy
2. Verificar logs en Dokploy → Runtime Logs
3. Probar endpoints manualmente con Postman
4. Verificar que las variables SUPABASE_* estén correctas

### Si el Webhook no recibe mensajes:
1. Verificar que la URL esté configurada en Kapso
2. Verificar que KAPSO_WEBHOOK_SECRET sea el correcto
3. Revisar logs del servidor para ver si llegan las peticiones
4. Temporalmente deshabilitar verificación de firma para debugging

### Si la clasificación no funciona:
1. Verificar que las descripciones tengan mínimo 20 caracteres
2. Revisar keywords en clasificacion.service.ts
3. Verificar logs de la función /functions/clasificar-caso

---

**Documento creado:** 2025-10-19
**Versión:** 1.0
**Autor:** Sistema de Reclamos Vetanco
**Contacto:** vetanco@vetanco.com
