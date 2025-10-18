# API y Webhooks - Sistema Vetanco

## Base URL

```
Desarrollo: http://localhost:3000
Producción: https://api-vetanco.ejemplo.com
```

## Autenticación

Todas las peticiones requieren API Key en header:

```http
Authorization: Bearer YOUR_API_KEY
```

---

## Webhooks

### POST /webhooks/kapso

Endpoint que recibe eventos de Kapso (WhatsApp).

**Headers:**
```http
Content-Type: application/json
X-Kapso-Signature: sha256_signature
```

**Verificación de Firma:**
```typescript
const signature = request.headers['x-kapso-signature'];
const payload = JSON.stringify(request.body);
const expectedSignature = crypto
  .createHmac('sha256', KAPSO_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

**Eventos Recibidos:**

#### 1. message.received

Mensaje entrante del usuario.

```json
{
  "event": "message.received",
  "timestamp": "2025-10-18T10:30:00Z",
  "data": {
    "message_id": "wamid.xxx",
    "from": "5491155551234",
    "to": "5491144445555",
    "type": "text",
    "content": {
      "text": "Hola, quiero hacer un reclamo"
    },
    "timestamp": 1697623800
  }
}
```

#### 2. message.sent

Mensaje enviado al usuario confirmado.

```json
{
  "event": "message.sent",
  "timestamp": "2025-10-18T10:30:05Z",
  "data": {
    "message_id": "wamid.yyy",
    "to": "5491155551234",
    "status": "sent"
  }
}
```

#### 3. message.delivered

Mensaje entregado al usuario.

```json
{
  "event": "message.delivered",
  "timestamp": "2025-10-18T10:30:10Z",
  "data": {
    "message_id": "wamid.yyy",
    "status": "delivered"
  }
}
```

#### 4. message.read

Mensaje leído por el usuario.

```json
{
  "event": "message.read",
  "timestamp": "2025-10-18T10:30:15Z",
  "data": {
    "message_id": "wamid.yyy",
    "status": "read"
  }
}
```

#### 5. media.received

Archivo multimedia recibido.

```json
{
  "event": "media.received",
  "timestamp": "2025-10-18T10:35:00Z",
  "data": {
    "message_id": "wamid.zzz",
    "from": "5491155551234",
    "type": "image",
    "media": {
      "id": "media_id_123",
      "mime_type": "image/jpeg",
      "url": "https://kapso.ai/media/temp/xxx",
      "size": 524288,
      "filename": "producto_defecto.jpg"
    }
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "received": true
}
```

---

## REST API Endpoints

### Casos

#### GET /api/casos

Obtener lista de casos con filtros.

**Query Parameters:**
- `tipo_caso` (opcional): `reclamo`, `queja`, `comentario`
- `criticidad` (opcional): `critico`, `mayor`, `menor`
- `estado` (opcional): `nuevo`, `en_investigacion`, `resuelto`, `cerrado`
- `fecha_desde` (opcional): ISO date
- `fecha_hasta` (opcional): ISO date
- `cliente_id` (opcional): UUID
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): items por página (default: 20)

**Request:**
```http
GET /api/casos?tipo_caso=reclamo&criticidad=critico&page=1&limit=10
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "numero_caso": "VET-2025-00123",
      "tipo_caso": "reclamo",
      "criticidad": "critico",
      "estado": "en_investigacion",
      "cliente": {
        "nombre": "Juan Pérez",
        "razon_social": "Agropecuaria Los Pinos SA",
        "cuit": "30-12345678-9"
      },
      "producto": {
        "nombre": "Vetancilina 100ml",
        "lote": "ABC123"
      },
      "descripcion_que_sucedio": "Intoxicación en bovinos...",
      "created_at": "2025-10-18T10:00:00Z",
      "updated_at": "2025-10-18T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

---

#### GET /api/casos/:numero_caso

Obtener detalle completo de un caso.

**Request:**
```http
GET /api/casos/VET-2025-00123
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "caso": {
    "id": "uuid-1",
    "numero_caso": "VET-2025-00123",
    "tipo_caso": "reclamo",
    "criticidad": "critico",
    "justificacion": "pendiente_investigacion",
    "estado": "en_investigacion",
    "canal": "whatsapp",
    "cliente": {
      "id": "uuid-cliente",
      "nombre_apellido": "Juan Pérez",
      "razon_social": "Agropecuaria Los Pinos SA",
      "cuit": "30-12345678-9",
      "telefono": "11-5555-1234",
      "email": "juan@ejemplo.com"
    },
    "colaborador_registro": {
      "nombre": "María González",
      "cargo": "Asesora de Ventas"
    },
    "productos_afectados": [
      {
        "nombre_producto": "Vetancilina 100ml",
        "presentacion": "Frasco 100ml",
        "numero_lote": "ABC123",
        "fecha_vencimiento": "2026-12-31",
        "estado_producto": "usado",
        "cantidad_afectada": 10,
        "unidad_medida": "frascos"
      }
    ],
    "descripcion": {
      "que_sucedio": "Al aplicar el producto, 3 bovinos murieron...",
      "donde_ocurrio": "Establecimiento Las Rosas, Tandil",
      "cuando_ocurrio": "2025-10-17T14:00:00Z",
      "descripcion_libre": "Tengo informe veterinario"
    },
    "adjuntos": [
      {
        "tipo": "foto",
        "url": "https://storage.supabase.co/...",
        "nombre": "producto_defecto.jpg"
      }
    ],
    "investigacion": {
      "estado": "en_proceso",
      "investigador": "Dr. Carlos López",
      "fecha_inicio": "2025-10-18T09:00:00Z"
    },
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T15:00:00Z"
  }
}
```

---

#### POST /api/casos

Crear caso manualmente (alternativa al chatbot).

**Request:**
```http
POST /api/casos
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "tipo_usuario_registro": "colaborador_vetanco",
  "colaborador_id": "uuid-colaborador",
  "cliente": {
    "nombre_apellido": "Juan Pérez",
    "razon_social": "Agropecuaria Los Pinos SA",
    "cuit": "30-12345678-9",
    "direccion": "Av. Rivadavia 1234, CABA",
    "telefono": "11-5555-1234",
    "email": "juan@ejemplo.com"
  },
  "producto": {
    "nombre_producto": "Vetancilina 100ml",
    "presentacion": "Frasco",
    "numero_lote": "ABC123",
    "fecha_vencimiento": "2026-12-31",
    "estado_producto": "usado",
    "cantidad_afectada": 10,
    "unidad_medida": "frascos"
  },
  "descripcion": {
    "que_sucedio": "Intoxicación en bovinos",
    "donde_ocurrio": "Establecimiento Las Rosas",
    "cuando_ocurrio": "2025-10-17T14:00:00Z",
    "descripcion_libre": "Informe veterinario adjunto"
  },
  "numero_remito": "0001-00012345",
  "canal": "telefono"
}
```

**Response:**
```json
{
  "status": "success",
  "caso": {
    "id": "uuid-nuevo",
    "numero_caso": "VET-2025-00124",
    "created_at": "2025-10-18T16:00:00Z"
  }
}
```

---

#### PUT /api/casos/:numero_caso/clasificar

Clasificar o re-clasificar un caso manualmente.

**Request:**
```http
PUT /api/casos/VET-2025-00123/clasificar
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "tipo_caso": "reclamo",
  "criticidad": "critico",
  "justificacion": "justificado",
  "motivo": "Análisis de laboratorio confirmó contaminación del lote",
  "evidencias": "Informe Lab-2025-456",
  "clasificado_por": "uuid-colaborador"
}
```

**Response:**
```json
{
  "status": "success",
  "caso": {
    "numero_caso": "VET-2025-00123",
    "tipo_caso": "reclamo",
    "criticidad": "critico",
    "justificacion": "justificado",
    "updated_at": "2025-10-18T17:00:00Z"
  },
  "clasificacion_registrada": {
    "id": "uuid-clasificacion",
    "created_at": "2025-10-18T17:00:00Z"
  }
}
```

---

#### PUT /api/casos/:numero_caso/estado

Cambiar estado de un caso.

**Request:**
```http
PUT /api/casos/VET-2025-00123/estado
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "estado": "resuelto",
  "resolucion": "Se reemplazó el lote completo y se compensó al cliente",
  "acciones_correctivas": "Revisión de proceso de control de calidad",
  "acciones_preventivas": "Implementación de double-check en llenado"
}
```

**Response:**
```json
{
  "status": "success",
  "caso": {
    "numero_caso": "VET-2025-00123",
    "estado": "resuelto",
    "updated_at": "2025-10-18T18:00:00Z"
  }
}
```

---

### Clientes

#### GET /api/clientes

Buscar clientes.

**Query Parameters:**
- `cuit` (opcional)
- `telefono` (opcional)
- `search` (opcional): búsqueda por nombre o razón social

**Request:**
```http
GET /api/clientes?cuit=30-12345678-9
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-cliente",
      "nombre_apellido": "Juan Pérez",
      "razon_social": "Agropecuaria Los Pinos SA",
      "cuit": "30-12345678-9",
      "telefono": "11-5555-1234",
      "total_casos": 5,
      "casos_abiertos": 1
    }
  ]
}
```

---

### Estadísticas

#### GET /api/estadisticas

Obtener estadísticas generales.

**Query Parameters:**
- `fecha_desde` (opcional)
- `fecha_hasta` (opcional)

**Request:**
```http
GET /api/estadisticas?fecha_desde=2025-01-01&fecha_hasta=2025-10-18
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "periodo": {
    "desde": "2025-01-01",
    "hasta": "2025-10-18"
  },
  "totales": {
    "total_casos": 450,
    "reclamos": 280,
    "quejas": 120,
    "comentarios": 50
  },
  "por_criticidad": {
    "critico": 15,
    "mayor": 180,
    "menor": 85
  },
  "por_estado": {
    "nuevo": 45,
    "en_investigacion": 120,
    "resuelto": 200,
    "cerrado": 85
  },
  "tiempo_promedio_resolucion": {
    "critico": 12.5,
    "mayor": 48.3,
    "menor": 96.7
  },
  "productos_con_mas_reclamos": [
    {
      "producto": "Vetancilina 100ml",
      "total_reclamos": 45
    }
  ]
}
```

---

### Investigaciones

#### POST /api/casos/:numero_caso/investigacion

Iniciar investigación de un caso.

**Request:**
```http
POST /api/casos/VET-2025-00123/investigacion
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "investigador_id": "uuid-investigador"
}
```

**Response:**
```json
{
  "status": "success",
  "investigacion": {
    "id": "uuid-investigacion",
    "caso_numero": "VET-2025-00123",
    "investigador": "Dr. Carlos López",
    "fecha_inicio": "2025-10-18T09:00:00Z",
    "estado": "en_proceso"
  }
}
```

---

#### PUT /api/investigaciones/:id

Actualizar progreso de investigación.

**Request:**
```http
PUT /api/investigaciones/uuid-investigacion
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "hallazgos": "Se detectó contaminación en el lote ABC123",
  "evidencia_recolectada": "Muestras enviadas a laboratorio externo",
  "analisis_laboratorio": "Informe Lab-2025-456 confirma contaminación",
  "causa_raiz": "Falla en limpieza de tanque de mezclado",
  "acciones_correctivas": "Limpieza profunda y recalibración de equipos"
}
```

**Response:**
```json
{
  "status": "success",
  "investigacion": {
    "id": "uuid-investigacion",
    "updated_at": "2025-10-18T16:30:00Z"
  }
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - API Key inválida o faltante |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: caso duplicado) |
| 500 | Internal Server Error - Error del servidor |

---

## Rate Limiting

- **Límite**: 100 requests por minuto por API Key
- **Header de respuesta**: `X-RateLimit-Remaining: 95`
- **Si excede**: HTTP 429 Too Many Requests

---

## Webhooks Salientes

El sistema puede enviar webhooks a URLs configuradas cuando ocurren eventos:

### Eventos Disponibles

#### caso.creado

```json
{
  "event": "caso.creado",
  "timestamp": "2025-10-18T10:00:00Z",
  "data": {
    "numero_caso": "VET-2025-00123",
    "tipo_caso": "reclamo",
    "criticidad": "critico"
  }
}
```

#### caso.clasificado

```json
{
  "event": "caso.clasificado",
  "timestamp": "2025-10-18T17:00:00Z",
  "data": {
    "numero_caso": "VET-2025-00123",
    "tipo_caso_anterior": "pendiente_clasificacion",
    "tipo_caso_nuevo": "reclamo",
    "criticidad": "critico",
    "justificacion": "justificado"
  }
}
```

#### caso.resuelto

```json
{
  "event": "caso.resuelto",
  "timestamp": "2025-10-18T18:00:00Z",
  "data": {
    "numero_caso": "VET-2025-00123",
    "resolucion": "Lote reemplazado, cliente compensado"
  }
}
```

---

## SDK / Cliente TypeScript

```typescript
import { VetancoClient } from '@vetanco/sdk';

const client = new VetancoClient({
  apiKey: process.env.VETANCO_API_KEY,
  baseUrl: 'https://api-vetanco.ejemplo.com'
});

// Obtener casos
const casos = await client.casos.list({
  tipo_caso: 'reclamo',
  criticidad: 'critico'
});

// Obtener detalle de caso
const caso = await client.casos.get('VET-2025-00123');

// Clasificar caso
await client.casos.clasificar('VET-2025-00123', {
  tipo_caso: 'reclamo',
  criticidad: 'mayor',
  justificacion: 'justificado',
  motivo: 'Confirmado por laboratorio'
});
```

---

**Versión API**: 1.0.0
**Última actualización**: 2025-10-18
