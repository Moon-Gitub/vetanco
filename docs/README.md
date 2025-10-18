# Sistema de Gestión de Reclamos Vetanco

Sistema multiagente de WhatsApp para la gestión automatizada de reclamos, quejas y comentarios de clientes de Vetanco S.A., construido con Kapso y Supabase.

## Descripción General

Este sistema permite a clientes y colaboradores de Vetanco registrar y gestionar casos de reclamos, quejas y comentarios a través de WhatsApp de forma automatizada, utilizando un sistema de agentes inteligentes que guía el proceso de captura de información y clasificación.

## Características Principales

- **Registro Automatizado**: Chatbot conversacional que guía al usuario paso a paso
- **Multiagente Inteligente**: Sistema de agentes especializados en Kapso para diferentes etapas del proceso
- **Clasificación Automática**: Pre-clasificación de casos según keywords y patrones
- **Trazabilidad Completa**: Registro detallado de todas las interacciones y mensajes
- **Base de Datos Robusta**: Schema escalable en Supabase con 9 tablas relacionadas
- **Multi-usuario**: Soporta registro directo por clientes o a través de colaboradores Vetanco
- **Adjuntos Multimedia**: Capacidad de recibir y almacenar fotos, videos y documentos
- **Números de Caso Únicos**: Generación automática en formato VET-YYYY-NNNNN

## Stack Tecnológico

- **Backend**: Node.js + TypeScript
- **Framework de Flows**: Kapso (WhatsApp Cloud API oficial Meta Tech Provider)
- **Base de Datos**: Supabase (PostgreSQL)
- **Validación**: Zod
- **API**: Express.js
- **Storage**: Supabase Storage para archivos multimedia

## Arquitectura del Sistema

### Componentes Principales

1. **Flow Orquestador Principal**: Gestiona el flujo completo de la conversación
2. **Agente de Identificación**: Captura datos del cliente o colaborador
3. **Agente de Productos**: Recopila información del producto afectado
4. **Agente de Descripción**: Obtiene detalles del incidente (qué, dónde, cuándo)
5. **Agente Clasificador**: Pre-clasifica el caso automáticamente
6. **Agente de Cierre**: Confirma registro y proporciona número de caso

### Flujo de Conversación

```
Inicio
  ↓
Bienvenida
  ↓
Identificación (¿Cliente o Colaborador?)
  ↓
Captura de Datos Personales
  ↓
Datos del Producto Afectado
  ↓
Descripción del Incidente
  ↓
Clasificación Automática
  ↓
Registro en Base de Datos
  ↓
Cierre con Número de Caso
```

## Estructura del Proyecto

```
version_claude/
├── docs/                                    # Documentación completa
│   ├── README.md                           # Este archivo
│   ├── arquitectura-multiagente.md         # Diseño de flows y agentes
│   ├── schema-database.md                  # Documentación del schema
│   ├── definiciones-negocio.md             # Glosario y clasificaciones
│   ├── flujo-conversacion.md               # Flujo detallado del chatbot
│   ├── api-endpoints.md                    # API y webhooks
│   ├── configuracion-kapso.md              # Setup de Kapso
│   └── casos-uso.md                        # Ejemplos y escenarios
├── src/
│   ├── flows/                              # Definiciones de flows Kapso
│   │   ├── main-flow.ts                   # Flow principal orquestador
│   │   ├── identificacion-flow.ts         # Sub-flow identificación
│   │   ├── producto-flow.ts               # Sub-flow productos
│   │   └── descripcion-flow.ts            # Sub-flow descripción
│   ├── agents/                             # Configuración de agentes
│   │   ├── identificacion-agent.ts        # Agente identificación
│   │   ├── producto-agent.ts              # Agente productos
│   │   ├── descripcion-agent.ts           # Agente descripción
│   │   └── clasificador-agent.ts          # Agente clasificador
│   ├── functions/                          # FunctionNodes personalizados
│   │   ├── validar-cliente.ts             # Validación de datos cliente
│   │   ├── guardar-caso.ts                # Persistencia en Supabase
│   │   ├── clasificar-caso.ts             # Lógica de clasificación
│   │   └── generar-numero-caso.ts         # Generación de ID único
│   ├── database/                           # Base de datos
│   │   ├── schema.sql                     # Schema completo Supabase
│   │   └── migrations/                    # Migraciones SQL
│   ├── services/                           # Lógica de negocio
│   │   ├── clasificacion.service.ts       # Servicio clasificación
│   │   ├── validacion.service.ts          # Servicio validación
│   │   └── supabase.service.ts            # Cliente Supabase
│   ├── types/                              # TypeScript types y schemas
│   │   ├── caso.types.ts                  # Types de casos
│   │   ├── cliente.types.ts               # Types de clientes
│   │   └── producto.types.ts              # Types de productos
│   ├── webhooks/                           # Webhooks de Kapso
│   │   └── kapso-webhook.ts               # Handler de eventos
│   └── utils/                              # Utilidades
│       └── helpers.ts                      # Funciones auxiliares
├── package.json                            # Dependencias
├── tsconfig.json                           # Configuración TypeScript
└── .env.example                            # Variables de entorno

```

## Requisitos Previos

- Node.js >= 18.x
- npm o yarn
- Cuenta de Supabase
- Cuenta de Kapso (Meta Tech Provider)
- Número de WhatsApp Business

## Instalación

### 1. Clonar el repositorio

```bash
cd version_claude
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y completar las credenciales:

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Kapso
KAPSO_API_KEY=your_kapso_api_key
KAPSO_WEBHOOK_SECRET=your_kapso_webhook_secret
KAPSO_PHONE_NUMBER=your_whatsapp_number

# Application
NODE_ENV=development
PORT=3000
```

### 4. Configurar Base de Datos

Ejecutar el schema SQL en Supabase:

```bash
# Copiar el contenido de src/database/schema.sql
# y ejecutarlo en el SQL Editor de Supabase
```

### 5. Configurar Flows en Kapso

Seguir la guía en [configuracion-kapso.md](./configuracion-kapso.md)

### 6. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Uso

### Para Clientes

1. Enviar mensaje de WhatsApp al número configurado
2. Seguir las instrucciones del chatbot
3. Proporcionar datos solicitados paso a paso
4. Recibir número de caso para seguimiento

### Para Colaboradores Vetanco

1. Enviar mensaje de WhatsApp al número configurado
2. Seleccionar opción "Soy colaborador de Vetanco"
3. Proporcionar datos propios y del cliente
4. Completar información del reclamo
5. Recibir número de caso para seguimiento interno

## Tipos de Casos

### Reclamo
Expresión de insatisfacción que incurre en incumplimiento de requerimientos acordados.

**Criticidad:**
- **Crítico**: Riesgo grave en salud animal, continuidad del negocio afectada
- **Mayor**: Producto afectado sin riesgo de salud, imagen comprometida
- **Menor**: Sin afectación de producto, negocio o imagen

### Queja
Expresión de insatisfacción sin incumplimiento de requerimientos acordados.

### Comentario
Expresión o sugerencia sin potencial incumplimiento, puede requerir asistencia técnica.

## Base de Datos

El sistema utiliza 9 tablas principales en Supabase:

1. **clientes**: Información de clientes
2. **colaboradores_vetanco**: Datos de colaboradores internos
3. **casos**: Registro maestro de reclamos/quejas/comentarios
4. **productos_afectados**: Productos involucrados en cada caso
5. **interacciones**: Log de interacciones del chatbot
6. **mensajes**: Mensajes individuales de conversaciones
7. **adjuntos**: Archivos multimedia adjuntos
8. **clasificaciones**: Historial de cambios de clasificación
9. **investigaciones**: Proceso de investigación y resolución

Ver detalles completos en [schema-database.md](./schema-database.md)

## API y Webhooks

### Endpoints Principales

- `POST /webhooks/kapso` - Recibe eventos de Kapso (mensajes, estados)
- `GET /casos/:numero_caso` - Consulta información de un caso
- `POST /casos/:numero_caso/clasificar` - Clasifica un caso manualmente
- `GET /estadisticas` - Obtiene estadísticas de casos

Ver documentación completa en [api-endpoints.md](./api-endpoints.md)

## Seguridad

- Validación de webhooks con HMAC signature
- Row Level Security (RLS) en Supabase
- Validación de inputs con Zod
- Sanitización de datos antes de almacenar
- Logs de auditoría en todas las operaciones

## Monitoreo y Logs

- Todas las interacciones se registran en tabla `interacciones`
- Mensajes individuales en tabla `mensajes`
- Errores capturados con contexto completo
- Métricas de tiempo de respuesta por agente

## Testing

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## Deployment

### Opción 1: Railway / Render

```bash
# Conectar repositorio
# Configurar variables de entorno
# Deploy automático desde main branch
```

### Opción 2: Docker

```bash
docker build -t vetanco-reclamos .
docker run -p 3000:3000 --env-file .env vetanco-reclamos
```

### Opción 3: Vercel / Netlify Functions

Configurar como serverless functions para webhooks.

## Troubleshooting

### Problema: Webhook no recibe mensajes

**Solución**: Verificar que la URL del webhook esté correctamente configurada en Kapso y que el servidor sea accesible públicamente.

### Problema: Error al guardar en Supabase

**Solución**: Verificar políticas RLS y que el service key tenga permisos correctos.

### Problema: Flow se queda esperando respuesta

**Solución**: Revisar configuración de WaitForResponseNode y timeout settings.

## Contribución

1. Fork del repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Mantenimiento

### Actualización de Clasificaciones

Editar el archivo `src/services/clasificacion.service.ts` para ajustar keywords y lógica de clasificación automática.

### Agregar Nuevos Campos al Chatbot

1. Actualizar schema en `src/database/schema.sql`
2. Agregar validación en `src/types/`
3. Modificar flow correspondiente en `src/flows/`
4. Actualizar agente en `src/agents/`

### Mantenimiento de Base de Datos

```bash
# Backup manual
pg_dump -h db.supabase.co -U postgres vetanco_db > backup.sql

# Restaurar
psql -h db.supabase.co -U postgres vetanco_db < backup.sql
```

## Roadmap

- [ ] Dashboard web para visualización de casos
- [ ] Integración con sistema ERP de Vetanco
- [ ] Notificaciones automáticas por email
- [ ] Agente de voz con Kapso Voice
- [ ] Análisis de sentimiento en descripción de casos
- [ ] Reportes automáticos por tipo de producto
- [ ] API pública para integraciones

## Soporte

Para soporte técnico, contactar a:
- Email: soporte@vetanco.com
- Documentación: Ver carpeta `/docs`
- Issues: GitHub Issues del repositorio

## Licencia

Propiedad de Vetanco S.A. - Uso interno exclusivo.

## Autores

- Sistema desarrollado para Vetanco S.A.
- Tecnología: Kapso + Supabase
- Fecha: Octubre 2025

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
