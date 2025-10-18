# 🚀 GUÍA COMPLETA DE DEPLOY - Docker + Dokploy + Kapso

**Sistema de Reclamos Vetanco**

Esta guía te llevará paso a paso desde cero hasta tener el sistema funcionando en producción.

---

## 📋 ÍNDICE

1. [Preparar tu VPS](#parte-1-preparar-tu-vps)
2. [Instalar Dokploy](#parte-2-instalar-dokploy)
3. [Configurar Supabase](#parte-3-configurar-supabase)
4. [Deploy con Dokploy](#parte-4-deploy-con-dokploy)
5. [Configurar Kapso](#parte-5-configurar-kapso)
6. [Testing Final](#parte-6-testing-final)
7. [Troubleshooting](#troubleshooting)

---

## PARTE 1: PREPARAR TU VPS

### Paso 1.1: Requisitos del VPS

**Especificaciones mínimas:**
- RAM: 2GB (recomendado 4GB)
- CPU: 2 cores
- Disco: 20GB
- Sistema: Ubuntu 20.04 o 22.04 LTS

### Paso 1.2: Conectar al VPS

```bash
ssh root@tu-ip-vps

# O si tienes usuario:
ssh tu-usuario@tu-ip-vps
```

### Paso 1.3: Actualizar el sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar utilidades básicas
sudo apt install -y curl wget git
```

### Paso 1.4: Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

---

## PARTE 2: INSTALAR DOKPLOY

### Paso 2.1: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar instalación
docker --version

# Agregar usuario a grupo docker (opcional, si no eres root)
sudo usermod -aG docker $USER
newgrp docker
```

### Paso 2.2: Instalar Dokploy

```bash
# Instalar Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# Esto instalará:
# - Dokploy Dashboard
# - Traefik (reverse proxy)
# - PostgreSQL (para Dokploy)
```

**⏱️ Espera 2-3 minutos mientras instala...**

### Paso 2.3: Acceder a Dokploy Dashboard

```bash
# Una vez instalado, verás un mensaje como:
# ✅ Dokploy instalado exitosamente
# 🌐 Dashboard: http://tu-ip-vps:3000
# 👤 Usuario: admin
# 🔑 Contraseña: [contraseña generada]
```

**Acceder al dashboard:**
1. Abre navegador: `http://tu-ip-vps:3000`
2. Login con usuario y contraseña proporcionados
3. **IMPORTANTE**: Cambia la contraseña inmediatamente

### Paso 2.4: Configurar Dominio (Opcional pero recomendado)

Si tienes un dominio (ej: `api.vetanco.com`):

1. En tu proveedor de DNS, crea un registro A:
   ```
   Tipo: A
   Host: api
   Value: tu-ip-vps
   TTL: 3600
   ```

2. Espera propagación DNS (5-30 minutos)

3. Verifica:
   ```bash
   ping api.vetanco.com
   # Debe responder con tu IP
   ```

---

## PARTE 3: CONFIGURAR SUPABASE

### Paso 3.1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Sign up con GitHub o email
4. Verifica tu email

### Paso 3.2: Crear Proyecto

1. Click en "New Project"
2. Completa:
   - **Name**: `vetanco-reclamos`
   - **Database Password**: (genera una segura y guárdala)
   - **Region**: Selecciona más cercana (ej: South America)
   - **Pricing Plan**: Free (o Pro si necesitas más)
3. Click "Create new project"

**⏱️ Espera 2-3 minutos mientras se crea...**

### Paso 3.3: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) → **API**
2. Copia y guarda:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (click "Reveal" para ver)
   ```

**🔒 IMPORTANTE**: El `service_role key` es sensible, NO lo compartas.

### Paso 3.4: Ejecutar Schema SQL

1. Ve a **SQL Editor** (icono de base de datos)
2. Click en "+ New query"
3. Copia TODO el contenido del archivo:
   ```
   src/database/schema.sql
   ```
4. Pega en el editor
5. Click en "Run" (▶️)

**✅ Verifica que diga:** "Success. No rows returned"

### Paso 3.5: Verificar Tablas Creadas

1. Ve a **Table Editor** (icono de tabla)
2. Deberías ver 9 tablas:
   - clientes
   - colaboradores_vetanco
   - casos
   - productos_afectados
   - interacciones
   - mensajes
   - adjuntos
   - clasificaciones
   - investigaciones

**✅ Si ves las 9 tablas, ¡perfecto!**

### Paso 3.6: Configurar Storage (para adjuntos)

1. Ve a **Storage** (icono carpeta)
2. Click "Create a new bucket"
3. Name: `adjuntos`
4. Public: ❌ (No, debe ser privado)
5. Click "Create bucket"

---

## PARTE 4: DEPLOY CON DOKPLOY

### Paso 4.1: Preparar Código Localmente

En tu máquina local:

```bash
# Navega al proyecto
cd /home/cluna/Documentos/5-IA/5-Freelance/Vetanco/version_claude

# Inicializar Git (si no está)
git init
git add .
git commit -m "Initial commit - Sistema Reclamos Vetanco"
```

### Paso 4.2: Opción A - Deploy desde GitHub

#### Subir a GitHub:

```bash
# Crear repo en GitHub.com primero, luego:
git remote add origin https://github.com/tu-usuario/vetanco-reclamos.git
git branch -M main
git push -u origin main
```

#### En Dokploy Dashboard:

1. Click "Create Application"
2. Selecciona "Git Repository"
3. Completa:
   - **Repository URL**: `https://github.com/tu-usuario/vetanco-reclamos.git`
   - **Branch**: `main`
   - **Application Name**: `vetanco-reclamos`
   - **Build Type**: `Dockerfile`

### Paso 4.3: Opción B - Deploy desde Docker Compose (MÁS FÁCIL)

En Dokploy Dashboard:

1. Click "Create Application"
2. Selecciona "Docker Compose"
3. Completa:
   - **Application Name**: `vetanco-reclamos`
   - **Compose File**: Pega el contenido de `docker-compose.yml`

### Paso 4.4: Configurar Variables de Entorno

En Dokploy, ve a tu aplicación → **Environment Variables**:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# Kapso (lo configuraremos después)
KAPSO_API_KEY=pendiente
KAPSO_WEBHOOK_SECRET=pendiente
KAPSO_PHONE_NUMBER=pendiente

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://api.tu-dominio.com
FUNCTION_SECRET=genera_un_secreto_random_32_caracteres
CORS_ORIGINS=https://dashboard.vetanco.com,https://kapso.ai

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generar FUNCTION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 4.5: Configurar Dominio y SSL

En Dokploy:

1. Ve a tu aplicación → **Domains**
2. Click "Add Domain"
3. Ingresa: `api.tu-dominio.com`
4. Habilita "Enable SSL" (Let's Encrypt automático)
5. Click "Save"

**⏱️ Espera 1-2 minutos para que se genere el certificado SSL**

### Paso 4.6: Build y Deploy

1. Click en "Deploy" (botón azul grande)
2. Verás logs en tiempo real
3. Espera a que termine (2-5 minutos)

**✅ Verifica que diga:** "Deployment successful"

### Paso 4.7: Verificar que Funciona

```bash
# Desde tu terminal local:
curl https://api.tu-dominio.com/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "environment": "production",
  "version": "1.0.0"
}
```

**✅ Si ves esto, tu servidor está funcionando!**

---

## PARTE 5: CONFIGURAR KAPSO

### Paso 5.1: Crear Cuenta en Kapso

1. Ve a [https://kapso.ai](https://kapso.ai)
2. Click "Sign Up"
3. Completa registro
4. Verifica email

### Paso 5.2: Crear Proyecto

1. Click "New Project"
2. Name: `Vetanco Reclamos`
3. Click "Create"

### Paso 5.3: Conectar WhatsApp Business

1. Ve a **Settings** → **WhatsApp**
2. Click "Connect WhatsApp Business"
3. Sigue el flujo de Meta:
   - Login con Facebook
   - Selecciona Business Account
   - Selecciona número de teléfono
   - Acepta permisos
4. Espera verificación (2-5 minutos)

**✅ Cuando esté conectado verás:** "WhatsApp connected"

### Paso 5.4: Obtener Credenciales de Kapso

1. Ve a **Settings** → **API Keys**
2. Click "Generate New Key"
3. Name: `Producción`
4. Copia el API Key (solo se muestra una vez)

5. Ve a **Settings** → **Webhooks**
6. Click "Generate Secret"
7. Copia el Webhook Secret

### Paso 5.5: Actualizar Variables en Dokploy

Vuelve a Dokploy → Tu aplicación → Environment Variables:

```bash
KAPSO_API_KEY=la_api_key_que_copiaste
KAPSO_WEBHOOK_SECRET=el_webhook_secret
KAPSO_PHONE_NUMBER=549XXXXXXXXX  # Tu número de WhatsApp (con código país)
```

Click "Save" y "Redeploy"

### Paso 5.6: Configurar Webhook en Kapso

En Kapso Dashboard:

1. Ve a **Settings** → **Webhooks**
2. **URL**: `https://api.tu-dominio.com/webhooks/kapso`
3. **Events**: Selecciona todos:
   - ✅ message.received
   - ✅ message.sent
   - ✅ message.delivered
   - ✅ message.read
   - ✅ media.received
4. Click "Save"
5. Click "Test" para verificar

**✅ Debe decir:** "Webhook test successful"

### Paso 5.7: Crear Flow Principal

1. Ve a **Flows** → **Create New Flow**
2. Name: `Main - Reclamos Vetanco`
3. Copia la configuración de: `src/flows/main-flow-config.json`

**O créalo manualmente:**

#### Nodos del Flow:

```
1. StartNode
   ↓
2. SendTextNode (Bienvenida)
   Message: "Buenos días. Le damos la bienvenida..."
   ↓
3. SendTextNode (Pregunta tipo usuario)
   Message: "¿Usted es el cliente o un colaborador?"
   Buttons: ["Soy el cliente", "Soy colaborador de Vetanco"]
   ↓
4. WaitForResponseNode (timeout: 300s)
   ↓
5. DecideNode
   Condition: response.includes("colaborador")
   ifTrue → AgentNode(colaborador)
   ifFalse → AgentNode(cliente)
   ↓
6. FunctionNode (validar-cliente)
   URL: https://api.tu-dominio.com/functions/validar-cliente
   ↓
7. AgentNode (producto)
   ↓
8. AgentNode (descripcion)
   ↓
9. FunctionNode (clasificar-caso)
   URL: https://api.tu-dominio.com/functions/clasificar-caso
   ↓
10. FunctionNode (guardar-caso)
    URL: https://api.tu-dominio.com/functions/guardar-caso
    ↓
11. AgentNode (cierre)
    ↓
12. EndNode
```

### Paso 5.8: Crear Agentes

#### Agente 1: Identificación Cliente

1. Ve a **Agents** → **Create Agent**
2. Name: `identificacion-cliente`
3. Model: `gpt-4`
4. Temperature: `0.3`
5. System Prompt:
```
Eres un asistente de Vetanco especializado en recopilar información de clientes.

Tu objetivo es capturar los siguientes datos:
1. Nombre y Apellido completo
2. Dirección completa (calle, número, localidad, provincia)
3. Teléfono de contacto
4. Correo electrónico (opcional si canal es WhatsApp)
5. Razón social y CUIT
6. Número de remito del pedido

Reglas:
- Haz preguntas una por vez
- El CUIT debe tener formato XX-XXXXXXXX-X (11 dígitos)
- Si falta algún dato, pregunta específicamente por él
- Sé cordial y profesional
- Confirma los datos antes de finalizar
```

6. Max Turns: `10`
7. Timeout: `600`
8. Click "Create"

#### Agente 2: Identificación Colaborador

Similar al anterior pero adapta el prompt:
```
Eres un asistente de Vetanco que ayuda a colaboradores internos.

Primero captura datos del colaborador:
1. Nombre y Apellido
2. Cargo/Puesto
3. Área (Ventas, Asistencia Técnica, etc.)

Luego captura datos del cliente:
[... mismos datos que agente cliente ...]
```

#### Agente 3: Producto

```
Eres un especialista en productos veterinarios de Vetanco.

Debes capturar:
1. Nombre y presentación del producto
2. Número de lote
3. Fecha de vencimiento
4. Estado: usado / sin usar / envase roto / envase sano
5. Cantidad afectada (número y unidad)
6. Fotos o videos (opcional)

Reglas:
- Valida que el producto exista en catálogo
- Solicita fotos si el estado es "envase roto" o "usado"
- Confirma datos antes de continuar
```

**Habilita:** "Accepts Media" ✅

#### Agente 4: Descripción

```
Eres un investigador de calidad de Vetanco.

Debes obtener:
1. ¿Qué sucedió? (descripción clara)
2. ¿Dónde ocurrió? (ubicación)
3. ¿Cuándo ocurrió? (fecha y hora)
4. Observaciones adicionales

Reglas:
- Haz preguntas abiertas para obtener detalles
- Identifica keywords críticos: "muerte", "intoxicación", "grave"
- Resume la información antes de finalizar
```

#### Agente 5: Cierre

```
Eres el agente que confirma el registro exitoso.

Mensaje:
"El registro de su caso ha sido completado correctamente.
📋 El número asignado es: {{numeroCaso}}

El equipo de Calidad realizará la investigación correspondiente.

Agradecemos que se haya comunicado con Vetanco."

Variables disponibles:
- {{numeroCaso}}: del sessionState
```

### Paso 5.9: Vincular FunctionNodes

Para cada FunctionNode en el flow:

1. Click en el nodo
2. **Function URL**: `https://api.tu-dominio.com/functions/[nombre]`
3. **Method**: `POST`
4. **Headers**:
   ```
   Content-Type: application/json
   Authorization: Bearer {{FUNCTION_SECRET}}
   ```
5. **Timeout**: `30` segundos
6. Click "Save"

### Paso 5.10: Activar Flow

1. Ve a tu flow
2. Click en "Activate" o "Publish"
3. Selecciona "Set as default flow"
4. Click "Confirm"

**✅ Flow activado y listo!**

---

## PARTE 6: TESTING FINAL

### Paso 6.1: Test de Health Check

```bash
curl https://api.tu-dominio.com/health
```

**Debe responder:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production",
  "version": "1.0.0"
}
```

### Paso 6.2: Test de Webhook

```bash
curl -X POST https://api.tu-dominio.com/webhooks/kapso \
  -H "Content-Type: application/json" \
  -H "X-Kapso-Signature: test" \
  -d '{"event":"test","data":{}}'
```

### Paso 6.3: Test Completo con WhatsApp

1. **Desde tu celular**, envía mensaje de WhatsApp al número configurado:
   ```
   Hola
   ```

2. **Debe responder:**
   ```
   Buenos días. Le damos la bienvenida al asistente
   de Vetanco para la gestión de reclamos...
   ```

3. **Sigue el flujo completo:**
   - Selecciona "Soy el cliente"
   - Proporciona todos los datos
   - Completa hasta el final

4. **Al finalizar debe decir:**
   ```
   El número asignado es: VET-2025-00001
   ```

### Paso 6.4: Verificar en Supabase

1. Ve a Supabase Dashboard
2. Table Editor → `casos`
3. Deberías ver tu caso recién creado

**✅ Si aparece, TODO FUNCIONA!**

### Paso 6.5: Test de API

```bash
# Listar casos
curl https://api.tu-dominio.com/api/casos

# Obtener caso específico
curl https://api.tu-dominio.com/api/casos/VET-2025-00001
```

---

## TROUBLESHOOTING

### ❌ Error: "Connection refused" en health check

**Problema:** El contenedor no está corriendo.

**Solución:**
```bash
# En Dokploy, ve a tu app → Logs
# Busca errores

# O conecta por SSH a tu VPS:
docker ps
docker logs vetanco-reclamos-api
```

### ❌ Error: "Webhook signature invalid"

**Problema:** El WEBHOOK_SECRET no coincide.

**Solución:**
1. Verifica que `KAPSO_WEBHOOK_SECRET` en Dokploy sea exactamente el mismo que en Kapso
2. Redeploy la aplicación

### ❌ Error: "Cannot connect to Supabase"

**Problema:** Credenciales incorrectas o red bloqueada.

**Solución:**
1. Verifica las 3 variables de Supabase
2. Asegúrate de que la URL no tenga espacios ni caracteres extra
3. Verifica que el service_role key sea el correcto

### ❌ Error: "FunctionNode timeout"

**Problema:** Tu servidor tarda mucho en responder.

**Solución:**
1. Aumenta timeout en Kapso a 60 segundos
2. Verifica logs del servidor:
   ```bash
   docker logs -f vetanco-reclamos-api
   ```
3. Revisa que la URL sea accesible:
   ```bash
   curl https://api.tu-dominio.com/functions/validar-cliente
   ```

### ❌ Error: "Flow no responde"

**Problema:** Flow no está activado o hay error en configuración.

**Solución:**
1. Ve a Kapso → Flows
2. Verifica que esté "Active" (verde)
3. Ve a "Test" y prueba el flow manualmente
4. Revisa logs en Kapso Dashboard → Monitoring

### ❌ Bot no responde en WhatsApp

**Problema:** WhatsApp desconectado o webhook no configurado.

**Solución:**
1. Kapso → Settings → WhatsApp
2. Verifica estado "Connected" (verde)
3. Si está desconectado, click "Reconnect"
4. Verifica webhook URL sea correcta

---

## 📊 CHECKLIST FINAL

Marca ✅ cuando completes cada paso:

### VPS y Dokploy
- [ ] VPS actualizado y firewall configurado
- [ ] Docker instalado
- [ ] Dokploy instalado y accesible
- [ ] Dominio configurado (opcional)

### Supabase
- [ ] Proyecto creado en Supabase
- [ ] Schema SQL ejecutado correctamente
- [ ] 9 tablas visibles en Table Editor
- [ ] Bucket "adjuntos" creado
- [ ] Credenciales copiadas

### Deploy
- [ ] Código en GitHub o listo para deploy
- [ ] Aplicación creada en Dokploy
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Health check respondiendo OK

### Kapso
- [ ] Cuenta creada en Kapso
- [ ] WhatsApp Business conectado
- [ ] API Key generada
- [ ] Webhook Secret generado
- [ ] Webhook configurado y testeado
- [ ] Flow principal creado
- [ ] 5 agentes creados y configurados
- [ ] FunctionNodes vinculados
- [ ] Flow activado

### Testing
- [ ] Test de health check OK
- [ ] Test de webhook OK
- [ ] Test completo con WhatsApp OK
- [ ] Caso visible en Supabase
- [ ] API REST respondiendo

**✅ Si todos están marcados: ¡SISTEMA EN PRODUCCIÓN!**

---

## 🎉 FELICITACIONES

Tu sistema está **100% funcional en producción**.

### Próximos Pasos:

1. **Monitoreo**:
   - Revisa logs diariamente
   - Monitorea uso de Supabase
   - Revisa estadísticas en Kapso

2. **Backups**:
   - Configura backups automáticos en Supabase
   - Exporta configuración de flows de Kapso

3. **Escalamiento**:
   - Si crece el tráfico, aumenta recursos del VPS
   - Considera plan Pro de Supabase si necesitas más storage

4. **Dashboard** (opcional):
   - Crea un dashboard web para visualizar casos
   - Conecta con la API REST

---

## 📞 Soporte

Si tienes problemas:

1. **Logs de Dokploy**: Busca errores ahí primero
2. **Logs de Kapso**: Dashboard → Monitoring → Logs
3. **Supabase Logs**: Dashboard → Logs
4. **Documentación del proyecto**: Ver carpeta `/docs`

---

**Versión**: 1.0.0
**Última actualización**: 18 de Octubre de 2025
**Tiempo estimado de setup**: 2-3 horas
