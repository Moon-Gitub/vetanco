# 🚀 DEPLOY DIRECTO - Ya tienes Dokploy corriendo

**Tu setup:**
- ✅ Dokploy: `dokploy.aiporvos.com`
- ✅ VPS funcionando
- ✅ Docker instalado

**Empezamos desde aquí →**

---

## 🎯 PASO 1: CONFIGURAR SUPABASE (20 min)

### 1.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Login o Sign Up
3. Click "New Project"
4. Completa:
   - **Name**: `vetanco-reclamos`
   - **Database Password**: (genera una fuerte y **guárdala**)
   - **Region**: `South America (São Paulo)` (más cercano)
   - **Plan**: Free
5. Click "Create new project"

⏱️ **Espera 2-3 minutos...**

### 1.2 Copiar Credenciales

Una vez creado, ve a **Settings** → **API**:

```bash
# Copia estos 3 valores:
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (click "Reveal")
```

**📝 Guárdalos en un archivo temporal:**

```bash
# Abre un editor de texto y pega:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### 1.3 Ejecutar Schema SQL

1. En Supabase, ve a **SQL Editor** (ícono de base de datos)
2. Click "+ New query"
3. Abre el archivo en tu proyecto:
   ```
   version_claude/src/database/schema.sql
   ```
4. Copia **TODO** el contenido
5. Pégalo en el SQL Editor
6. Click "Run" (▶️)

**✅ Debe decir:** "Success. No rows returned"

### 1.4 Verificar Tablas

Ve a **Table Editor** → Deberías ver **9 tablas**:
- ✅ clientes
- ✅ colaboradores_vetanco
- ✅ casos
- ✅ productos_afectados
- ✅ interacciones
- ✅ mensajes
- ✅ adjuntos
- ✅ clasificaciones
- ✅ investigaciones

### 1.5 Crear Bucket para Adjuntos

1. Ve a **Storage**
2. Click "Create a new bucket"
3. Name: `adjuntos`
4. Public: ❌ **NO** (debe ser privado)
5. Click "Create bucket"

**✅ Supabase listo!**

---

## 🐳 PASO 2: SUBIR PROYECTO A GITHUB (10 min)

### 2.1 Inicializar Git (si no lo has hecho)

```bash
cd /home/cluna/Documentos/5-IA/5-Freelance/Vetanco/version_claude

# Verificar si ya está inicializado
git status

# Si no está, inicializar:
git init
git add .
git commit -m "Initial commit - Sistema Reclamos Vetanco"
```

### 2.2 Crear Repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Repository name: `vetanco-reclamos`
3. Description: `Sistema de gestión de reclamos con Kapso y Supabase`
4. **Private** ✅ (recomendado para producción)
5. Click "Create repository"

### 2.3 Subir Código

```bash
# Conectar con GitHub (copia los comandos que GitHub te muestra):
git remote add origin https://github.com/TU-USUARIO/vetanco-reclamos.git
git branch -M main
git push -u origin main
```

**✅ Código en GitHub!**

---

## 🚀 PASO 3: DEPLOY EN DOKPLOY (15 min)

### 3.1 Acceder a Dokploy

1. Abre: `https://dokploy.aiporvos.com`
2. Login con tus credenciales

### 3.2 Crear Nueva Aplicación

1. Click "**Create Application**" o "**New Project**"
2. Selecciona "**GitHub**" como source
3. Completa:

```
Repository: selecciona "vetanco-reclamos"
Branch: main
Application Name: vetanco-reclamos-api
Build Type: Dockerfile
```

4. Click "Create"

### 3.3 Configurar Variables de Entorno

En tu aplicación → **Environment** o **Environment Variables**:

```bash
# === SUPABASE ===
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# === KAPSO (pondremos valores reales después) ===
KAPSO_API_KEY=temporal
KAPSO_WEBHOOK_SECRET=temporal
KAPSO_PHONE_NUMBER=5491155551234

# === APPLICATION ===
NODE_ENV=production
PORT=3000
BASE_URL=https://vetanco.aiporvos.com
FUNCTION_SECRET=GENERA_ESTE_SECRETO
CORS_ORIGINS=https://dashboard.vetanco.com,https://kapso.ai

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Generar FUNCTION_SECRET:

Abre terminal local y ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y pégalo en `FUNCTION_SECRET`.

### 3.4 Configurar Dominio

1. En tu aplicación → **Domains**
2. Click "**Add Domain**"
3. Ingresa: `vetanco.aiporvos.com`
4. **Enable SSL**: ✅ SÍ
5. Click "**Save**"

⏱️ **Espera 1-2 minutos para SSL...**

### 3.5 Deploy

1. Click "**Deploy**" (botón grande azul/verde)
2. Verás logs en tiempo real
3. **Espera a que termine** (2-5 minutos)

Deberías ver al final:
```
✅ Build successful
✅ Deployment successful
```

### 3.6 Verificar que Funciona

Abre una terminal y ejecuta:

```bash
curl https://vetanco.aiporvos.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "environment": "production",
  "version": "1.0.0"
}
```

**✅ Si ves esto, tu servidor está funcionando!**

---

## 📱 PASO 4: CONFIGURAR KAPSO (30 min)

### 4.1 Crear Cuenta en Kapso

1. Ve a [https://kapso.ai](https://kapso.ai)
2. Click "Sign Up"
3. Completa registro
4. Verifica email

### 4.2 Crear Proyecto

1. Click "New Project"
2. Name: `Vetanco Reclamos`
3. Click "Create"

### 4.3 Conectar WhatsApp Business

1. Ve a **Settings** → **WhatsApp**
2. Click "**Connect WhatsApp Business**"
3. Login con Facebook
4. Selecciona tu Business Account
5. Selecciona número de teléfono
6. Acepta permisos
7. ⏱️ Espera verificación (2-5 min)

**✅ Debe decir:** "WhatsApp connected"

### 4.4 Obtener API Key y Webhook Secret

#### API Key:
1. Ve a **Settings** → **API Keys**
2. Click "**Generate New Key**"
3. Name: `Producción`
4. **Copia el API Key** (solo se muestra una vez)
5. Guárdalo: `KAPSO_API_KEY=xxxxx`

#### Webhook Secret:
1. Ve a **Settings** → **Webhooks**
2. Click "**Generate Secret**"
3. **Copia el Webhook Secret**
4. Guárdalo: `KAPSO_WEBHOOK_SECRET=xxxxx`

### 4.5 Actualizar Variables en Dokploy

Vuelve a Dokploy → Tu aplicación → Environment Variables:

**Actualiza estas 3 variables:**
```bash
KAPSO_API_KEY=el_api_key_real_que_copiaste
KAPSO_WEBHOOK_SECRET=el_webhook_secret_real
KAPSO_PHONE_NUMBER=549XXXXXXXXX  # Tu número con código país
```

Click "**Save**"

**IMPORTANTE:** Click "**Redeploy**" para que tome los cambios.

### 4.6 Configurar Webhook en Kapso

En Kapso Dashboard:

1. Ve a **Settings** → **Webhooks**
2. **Webhook URL**: `https://vetanco.aiporvos.com/webhooks/kapso`
3. Selecciona **Events** (todos):
   - ✅ message.received
   - ✅ message.sent
   - ✅ message.delivered
   - ✅ message.read
   - ✅ media.received
4. Click "**Save**"
5. Click "**Test Webhook**"

**✅ Debe decir:** "Webhook test successful" ✅

---

## 🎨 PASO 5: CREAR FLOW Y AGENTES (40 min)

### 5.1 Crear Flow Principal

1. Ve a **Flows** → **Create New Flow**
2. Name: `Main - Reclamos Vetanco`
3. Description: `Flow principal del sistema de reclamos`

### 5.2 Agregar Nodos del Flow

Agrega estos nodos **en orden**:

#### **Nodo 1: Start**
- Type: `StartNode`
- ID: `start`

#### **Nodo 2: Bienvenida**
- Type: `SendTextNode`
- ID: `bienvenida`
- Message:
```
Buenos días. Le damos la bienvenida al asistente de Vetanco para la gestión de reclamos, quejas y comentarios.

A continuación, se solicitarán algunos datos necesarios para registrar su caso y asignar un número de identificación.
```

#### **Nodo 3: Pregunta Tipo Usuario**
- Type: `SendTextNode`
- ID: `pregunta_tipo_usuario`
- Message:
```
Antes de continuar, necesito saber si usted es el cliente que realiza el reclamo o un colaborador de Vetanco que lo está registrando en nombre del cliente.
```
- Buttons:
  - Button 1: Text: `Soy el cliente`, ID: `cliente`
  - Button 2: Text: `Soy colaborador de Vetanco`, ID: `colaborador`

#### **Nodo 4: Wait For Response**
- Type: `WaitForResponseNode`
- ID: `espera_tipo_usuario`
- Timeout: `300` (5 minutos)

#### **Nodo 5: Decide**
- Type: `DecideNode`
- ID: `decide_tipo_usuario`
- Condition: `response.button_id === 'colaborador' || response.text.toLowerCase().includes('colaborador')`
- If True → `agent_identificacion_colaborador`
- If False → `agent_identificacion_cliente`

#### **Nodo 6: Agente Cliente**
- Type: `AgentNode`
- ID: `agent_identificacion_cliente`
- Agent: `identificacion-cliente` (crearemos después)
- Next → `function_validar_cliente`

#### **Nodo 7: Agente Colaborador**
- Type: `AgentNode`
- ID: `agent_identificacion_colaborador`
- Agent: `identificacion-colaborador` (crearemos después)
- Next → `function_validar_cliente`

#### **Nodo 8: Function Validar Cliente**
- Type: `FunctionNode`
- ID: `function_validar_cliente`
- Function Name: `validarCliente`
- URL: `https://vetanco.aiporvos.com/functions/validar-cliente`
- Method: `POST`
- Timeout: `30` segundos
- Next → `agent_producto`

#### **Nodo 9: Agente Producto**
- Type: `AgentNode`
- ID: `agent_producto`
- Agent: `producto` (crearemos después)
- Next → `agent_descripcion`

#### **Nodo 10: Agente Descripción**
- Type: `AgentNode`
- ID: `agent_descripcion`
- Agent: `descripcion` (crearemos después)
- Next → `function_clasificar`

#### **Nodo 11: Function Clasificar**
- Type: `FunctionNode`
- ID: `function_clasificar`
- Function Name: `clasificarCaso`
- URL: `https://vetanco.aiporvos.com/functions/clasificar-caso`
- Method: `POST`
- Timeout: `15` segundos
- Next → `function_guardar_caso`

#### **Nodo 12: Function Guardar Caso**
- Type: `FunctionNode`
- ID: `function_guardar_caso`
- Function Name: `guardarCaso`
- URL: `https://vetanco.aiporvos.com/functions/guardar-caso`
- Method: `POST`
- Timeout: `30` segundos
- Next → `agent_cierre`

#### **Nodo 13: Agente Cierre**
- Type: `AgentNode`
- ID: `agent_cierre`
- Agent: `cierre` (crearemos después)
- Next → `end`

#### **Nodo 14: End**
- Type: `EndNode`
- ID: `end`

### 5.3 Crear Agentes

Ve a **Agents** → **Create Agent**

#### **AGENTE 1: identificacion-cliente**

```yaml
Name: identificacion-cliente
Model: gpt-4
Temperature: 0.3
Max Turns: 10
Timeout: 600 (segundos)

System Prompt:
```
```
Eres un asistente de Vetanco especializado en recopilar información de clientes.

Tu objetivo es capturar los siguientes datos de forma amigable:
1. Nombre y Apellido completo
2. Dirección completa (calle, número, localidad, provincia)
3. Teléfono de contacto
4. Correo electrónico (opcional si el canal es WhatsApp)
5. Razón social y CUIT
6. Número de remito del pedido

Reglas:
- Haz preguntas una por vez
- El CUIT debe tener formato XX-XXXXXXXX-X (11 dígitos)
- Si falta algún dato, pregunta específicamente por él
- Sé cordial y profesional
- Confirma los datos antes de finalizar

Al finalizar, resume todos los datos capturados y pide confirmación.
```

#### **AGENTE 2: identificacion-colaborador**

```yaml
Name: identificacion-colaborador
Model: gpt-4
Temperature: 0.3
Max Turns: 15
Timeout: 900

System Prompt:
```
```
Eres un asistente de Vetanco que ayuda a colaboradores internos a registrar casos.

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
- Valida formatos de CUIT (XX-XXXXXXXX-X)
- Confirma datos importantes antes de continuar
```

#### **AGENTE 3: producto**

```yaml
Name: producto
Model: gpt-4
Temperature: 0.3
Max Turns: 12
Timeout: 600
Accepts Media: ✅ SÍ (importante!)

System Prompt:
```
```
Eres un especialista en productos veterinarios de Vetanco.

Debes capturar:
1. Nombre y presentación del producto (ej: "Vetancilina 100ml")
2. Número de lote
3. Fecha de vencimiento
4. Estado del producto: usado / sin usar / envase roto / envase sano
5. Cantidad afectada (número y unidad: kg, litros, unidades, etc.)
6. Fotos, videos o documentos (opcional)

Reglas:
- Valida que el producto exista en catálogo Vetanco
- Verifica formato de lote (alfanumérico)
- Si hay múltiples productos afectados, captura todos
- Solicita fotos si el estado es "envase roto" o "usado"
- Confirma datos antes de finalizar
```

#### **AGENTE 4: descripcion**

```yaml
Name: descripcion
Model: gpt-4
Temperature: 0.3
Max Turns: 8
Timeout: 600

System Prompt:
```
```
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
```

#### **AGENTE 5: cierre**

```yaml
Name: cierre
Model: gpt-4
Temperature: 0.3
Max Turns: 2
Timeout: 60

System Prompt:
```
```
Eres el agente final que confirma el registro exitoso del caso.

Debes:
1. Agradecer al cliente por reportar
2. Proporcionar el número de caso generado (de sessionState.numeroCaso)
3. Explicar que el equipo de Calidad investigará
4. Indicar los próximos pasos

Formato del mensaje:
"El registro de su caso ha sido completado correctamente.

📋 El número asignado es: {numeroCaso}

El equipo de Calidad de Vetanco realizará la investigación correspondiente para brindarle la mejor respuesta posible.

Puede utilizar este número para hacer seguimiento de su caso.

Agradecemos que se haya comunicado con Vetanco. Su aporte es fundamental para mejorar nuestros procesos y para seguir garantizando la calidad de nuestros productos y servicios."

Sé cordial y profesional.
```

### 5.4 Publicar Flow

1. Ve a tu flow → Click "**Publish**"
2. Selecciona "**Set as default flow**"
3. Click "**Activate**"

**✅ Flow publicado y activo!**

---

## 🧪 PASO 6: TESTING COMPLETO (15 min)

### 6.1 Test de Servidor

```bash
# Health check
curl https://vetanco.aiporvos.com/health

# Debe responder:
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 6.2 Test de Webhook

```bash
curl -X POST https://vetanco.aiporvos.com/webhooks/kapso \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{}}'

# Debe responder:
{
  "status": "ok",
  "received": true
}
```

### 6.3 Test con WhatsApp (EL IMPORTANTE)

1. **Desde tu celular**, envía un mensaje de WhatsApp al número configurado:
   ```
   Hola
   ```

2. **Debe responder en segundos:**
   ```
   Buenos días. Le damos la bienvenida al asistente
   de Vetanco para la gestión de reclamos...
   ```

3. **Sigue el flujo completo:**
   - Selecciona "Soy el cliente"
   - Proporciona todos los datos que pida
   - Completa hasta recibir el número de caso

4. **Al final debe decir:**
   ```
   📋 El número asignado es: VET-2025-00001
   ```

### 6.4 Verificar en Supabase

1. Ve a Supabase Dashboard
2. **Table Editor** → Tabla `casos`
3. **Deberías ver tu caso recién creado** con todos los datos

**✅ Si aparece ahí: ¡TODO FUNCIONA PERFECTAMENTE!**

### 6.5 Test de API

```bash
# Listar casos
curl https://vetanco.aiporvos.com/api/casos

# Obtener caso específico
curl https://vetanco.aiporvos.com/api/casos/VET-2025-00001
```

---

## 🎉 ¡LISTO! SISTEMA EN PRODUCCIÓN

### URLs Importantes (Guárdalas):

```
✅ API: https://vetanco.aiporvos.com
✅ Dokploy: https://dokploy.aiporvos.com
✅ Supabase: https://app.supabase.com/project/TU_PROYECTO
✅ Kapso: https://dashboard.kapso.ai
```

### Próximos Pasos:

1. **Monitorea logs** en Dokploy para verificar que no haya errores
2. **Prueba diferentes escenarios**: cliente, colaborador, reclamos críticos
3. **Revisa Supabase** regularmente para ver los casos que llegan
4. **Comparte el número de WhatsApp** con tu equipo para pruebas internas

---

## 🆘 Troubleshooting Rápido

### ❌ Bot no responde en WhatsApp

**Solución:**
1. Kapso → Settings → WhatsApp → Verifica estado "Connected"
2. Kapso → Settings → Webhooks → Test webhook
3. Dokploy → Logs → Busca errores

### ❌ Error en FunctionNode

**Solución:**
1. Verifica que las URLs sean correctas (https://vetanco.aiporvos.com/functions/...)
2. Dokploy → Logs → Busca errores en las llamadas
3. Verifica que `FUNCTION_SECRET` esté configurado

### ❌ No guarda en Supabase

**Solución:**
1. Verifica las 3 variables de Supabase en Dokploy
2. Supabase → Logs → Busca errores de conexión
3. Verifica que el schema SQL se haya ejecutado correctamente

---

## 📞 Ver Logs en Tiempo Real

```bash
# Conecta a tu VPS
ssh tu-usuario@aiporvos.com

# Ver logs del contenedor
docker logs -f vetanco-reclamos-api

# Ver últimas 100 líneas
docker logs --tail 100 vetanco-reclamos-api
```

---

**¡Felicitaciones! Tu sistema está funcionando en producción.** 🎊

**Tiempo total**: ~2 horas

**Documentación completa**: Ver carpeta `/docs` del proyecto
