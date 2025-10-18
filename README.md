# Sistema de Gestión de Reclamos Vetanco

> Sistema multiagente de WhatsApp para la gestión automatizada de reclamos, quejas y comentarios de clientes de Vetanco S.A., construido con Kapso y Supabase.

## 🎯 Características Principales

- ✅ **Chatbot Conversacional Inteligente** en WhatsApp
- ✅ **Sistema Multiagente** con agentes especializados en Kapso
- ✅ **Clasificación Automática** de casos (Reclamo/Queja/Comentario)
- ✅ **Base de Datos Robusta** en Supabase con 9 tablas
- ✅ **Trazabilidad Completa** de todas las interacciones
- ✅ **API REST** para integraciones
- ✅ **Documentación Completa** en `/docs`

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Cuenta de Supabase** ([supabase.com](https://supabase.com))
- **Cuenta de Kapso** ([kapso.ai](https://kapso.ai))
- **Número de WhatsApp Business**

## 🚀 Instalación Rápida

### 1. Clonar y configurar

```bash
cd version_claude
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Kapso
KAPSO_API_KEY=tu_api_key_aqui
KAPSO_WEBHOOK_SECRET=tu_webhook_secret
KAPSO_PHONE_NUMBER=549XXXXXXXXX

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key

# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
```

### 3. Configurar Base de Datos en Supabase

1. Ir al SQL Editor de Supabase
2. Copiar el contenido de `src/database/schema.sql`
3. Ejecutar el script completo
4. Verificar que se crearon las 9 tablas

### 4. Iniciar servidor en desarrollo

```bash
npm run dev
```

El servidor estará corriendo en [http://localhost:3000](http://localhost:3000)

## 📖 Documentación Completa

Ver la carpeta `/docs` para documentación detallada:

1. **[README.md](./docs/README.md)** - Overview general del proyecto
2. **[arquitectura-multiagente.md](./docs/arquitectura-multiagente.md)** - Diseño de flows y agentes
3. **[schema-database.md](./docs/schema-database.md)** - Documentación del schema SQL
4. **[definiciones-negocio.md](./docs/definiciones-negocio.md)** - Glosario y clasificaciones
5. **[flujo-conversacion.md](./docs/flujo-conversacion.md)** - Flujo del chatbot
6. **[api-endpoints.md](./docs/api-endpoints.md)** - API y webhooks
7. **[configuracion-kapso.md](./docs/configuracion-kapso.md)** - Setup de Kapso
8. **[casos-uso.md](./docs/casos-uso.md)** - Ejemplos prácticos

## 🔧 Configuración de Kapso

### Paso 1: Crear Flows

Sigue las instrucciones en [docs/configuracion-kapso.md](./docs/configuracion-kapso.md) para:

1. Crear el Flow Principal
2. Configurar los 6 Agentes Especializados:
   - Agente de Identificación (Cliente)
   - Agente de Identificación (Colaborador)
   - Agente de Productos
   - Agente de Descripción
   - Agente Clasificador
   - Agente de Cierre

### Paso 2: Configurar FunctionNodes

Las FunctionNodes apuntan a estos endpoints de tu servidor:

- `POST /functions/validar-cliente`
- `POST /functions/guardar-caso`
- `POST /functions/clasificar-caso`

### Paso 3: Configurar Webhook

En el dashboard de Kapso, configurar el webhook:

- **URL**: `https://tu-dominio.com/webhooks/kapso`
- **Secret**: (guardar en `.env` como `KAPSO_WEBHOOK_SECRET`)
- **Eventos**: message.received, message.sent, message.delivered, message.read, media.received

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### Test de Webhook (local)

Usar [ngrok](https://ngrok.com) para exponer tu servidor local:

```bash
ngrok http 3000
```

Copiar la URL de ngrok y configurarla en Kapso como webhook.

### Test completo del chatbot

1. Enviar mensaje de WhatsApp al número configurado
2. Seguir el flujo completo de conversación
3. Verificar que el caso se guarda en Supabase
4. Verificar logs en consola

## 📊 API Endpoints

### Casos

```bash
# Listar casos
GET /api/casos?tipo_caso=reclamo&criticidad=critico

# Obtener caso específico
GET /api/casos/VET-2025-00123

# Clasificar caso manualmente
PUT /api/casos/VET-2025-00123/clasificar

# Cambiar estado
PUT /api/casos/VET-2025-00123/estado
```

### Estadísticas

```bash
# Obtener estadísticas
GET /api/estadisticas?fecha_desde=2025-01-01&fecha_hasta=2025-10-18
```

Ver [docs/api-endpoints.md](./docs/api-endpoints.md) para documentación completa.

## 📁 Estructura del Proyecto

```
version_claude/
├── docs/                    # Documentación completa (8 archivos)
├── src/
│   ├── types/              # TypeScript types y Zod schemas
│   │   ├── enums.ts
│   │   └── schemas.ts
│   ├── services/           # Lógica de negocio
│   │   ├── supabase.service.ts
│   │   ├── clasificacion.service.ts
│   │   └── validacion.service.ts
│   ├── functions/          # FunctionNodes para Kapso
│   │   ├── validar-cliente.ts
│   │   ├── guardar-caso.ts
│   │   ├── clasificar-caso.ts
│   │   └── index.ts
│   ├── database/           # Schema SQL
│   │   └── schema.sql
│   └── index.ts            # Servidor Express principal
├── package.json
├── tsconfig.json
├── .env.example
└── README.md               # Este archivo
```

## 🏭 Despliegue en Producción

### Opción 1: Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Configurar variables de entorno en dashboard Railway

# 5. Deploy
railway up
```

### Opción 2: Render

1. Conectar repositorio en [render.com](https://render.com)
2. Configurar como "Web Service"
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configurar variables de entorno
6. Deploy

### Opción 3: Docker

```bash
# Build
docker build -t vetanco-reclamos .

# Run
docker run -p 3000:3000 --env-file .env vetanco-reclamos
```

## 🔐 Seguridad

- ✅ **Verificación de firma HMAC** en webhooks
- ✅ **Row Level Security (RLS)** en Supabase
- ✅ **Validación con Zod** en todos los inputs
- ✅ **Rate limiting** en API
- ✅ **Helmet** para headers de seguridad
- ✅ **Sanitización** de datos antes de guardar

## 📈 Monitoreo

### Logs

```bash
# Desarrollo
npm run dev

# Producción
npm start | tee -a logs/app.log
```

### Métricas

- Total de casos por tipo
- Tiempo promedio de respuesta
- Casos críticos abiertos
- Tasa de completitud de conversaciones

Ver dashboard en Kapso para métricas de WhatsApp.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Tests
npm test

# Linting
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## 🐛 Troubleshooting

### Problema: Webhook no recibe mensajes

**Solución**:
1. Verificar que la URL sea accesible públicamente (usar ngrok en desarrollo)
2. Verificar firma HMAC en logs
3. Revisar Dashboard de Kapso → Webhooks → Logs

### Problema: Error al conectar con Supabase

**Solución**:
1. Verificar que las URLs y keys en `.env` sean correctas
2. Verificar que el schema SQL se ejecutó correctamente
3. Verificar conexión a internet

### Problema: Flow se queda esperando

**Solución**:
1. Revisar logs del servidor
2. Verificar que los FunctionNodes apunten a las URLs correctas
3. Verificar timeout configurado en Kapso

## 📞 Soporte

Para soporte técnico:

- **Email**: soporte@vetanco.com
- **Documentación**: Ver carpeta `/docs`
- **Issues**: Crear issue en el repositorio

## 🔄 Actualizaciones

### Versión 1.0.0 (Actual)

- ✅ Sistema multiagente completo
- ✅ Clasificación automática
- ✅ API REST completa
- ✅ Documentación completa
- ✅ Base de datos con 9 tablas

### Roadmap

- [ ] Dashboard web para visualización
- [ ] Integración con ERP de Vetanco
- [ ] Notificaciones por email automáticas
- [ ] Agente de voz con Kapso Voice
- [ ] Análisis de sentimiento avanzado
- [ ] Reportes automáticos

## 📄 Licencia

Propiedad de **Vetanco S.A.** - Uso interno exclusivo.

## 👥 Autores

- Sistema desarrollado para Vetanco S.A.
- Tecnología: Kapso + Supabase
- TypeScript + Node.js + Express

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
**Estado**: ✅ Producción Ready

Para más información, consultar la [documentación completa](./docs/README.md).
