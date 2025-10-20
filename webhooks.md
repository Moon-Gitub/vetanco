# Configuración de Webhooks en Kapso - Vetanco

## Configuración de Webhooks - Paso a Paso

### 1️⃣ WEBHOOK: Validar Cliente

**URL:** `https://vetanco.aiporvos.com/functions/validar-cliente`

**HTTP Method:** `POST`

**Headers:**
```json
{"Content-Type":"application/json"}
```

**Save Response To:** `cliente_response`

**Request Body:**
```json
{
  "clienteRazonSocial": "${clienteRazonSocial}",
  "clienteCUIT": "${clienteCUIT}",
  "clienteTelefono": "${clienteTelefono}",
  "clienteEmail": "${clienteEmail}",
  "clienteDireccion": "${clienteDireccion}"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "clienteId": "uuid-aqui",
  "clienteExistente": false,
  "mensaje": "Cliente creado exitosamente",
  "sessionState": {...}
}
```

---

### 2️⃣ WEBHOOK: Clasificar Caso

**URL:** `https://vetanco.aiporvos.com/functions/clasificar-caso`

**HTTP Method:** `POST`

**Headers:**
```json
{"Content-Type":"application/json"}
```

**Save Response To:** `clasificacion_response`

**Request Body:**
```json
{
  "clienteId": "${cliente_response.clienteId}",
  "descripcionQueSucedio": "${descripcionQueSucedio}",
  "descripcionDondeOcurrio": "${descripcionDondeOcurrio}",
  "descripcionCuandoOcurrio": "${descripcionCuandoOcurrio}",
  "descripcionLibre": "${descripcionLibre}",
  "productoNombre": "${productoNombre}"
}
```

**Nota importante:** Usa `${cliente_response.clienteId}` para obtener el ID del cliente del webhook anterior (Kapso usa sintaxis `${}`).

**Respuesta esperada:**
```json
{
  "success": true,
  "tipoCaso": "PRODUCTO",
  "criticidad": "CRITICO",
  "justificacion": "Contiene keywords críticas: muerte",
  "sessionState": {...}
}
```

---

### 3️⃣ WEBHOOK: Guardar Caso

**URL:** `https://vetanco.aiporvos.com/functions/guardar-caso`

**HTTP Method:** `POST`

**Headers:**
```json
{"Content-Type":"application/json"}
```

**Save Response To:** `caso_response`

**Request Body:**
```json
{
  "clienteId": "${cliente_response.clienteId}",
  "tipoCaso": "${clasificacion_response.tipoCaso}",
  "criticidad": "${clasificacion_response.criticidad}",
  "justificacion": "${clasificacion_response.justificacion}",
  "descripcionQueSucedio": "${descripcionQueSucedio}",
  "descripcionDondeOcurrio": "${descripcionDondeOcurrio}",
  "descripcionCuandoOcurrio": "${descripcionCuandoOcurrio}",
  "descripcionLibre": "${descripcionLibre}",
  "numeroRemito": "${numeroRemito}",
  "productoNombre": "${productoNombre}",
  "productoLote": "${productoLote}",
  "productoPresentacion": "${productoPresentacion}",
  "productoVencimiento": "${productoVencimiento}",
  "productoEstado": "${productoEstado}",
  "productoCantidadAfectada": "${productoCantidadAfectada}",
  "productoUnidadMedida": "${productoUnidadMedida}"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "casoId": "uuid-caso",
  "numeroCaso": "VET-2025-00042",
  "mensaje": "Caso VET-2025-00042 creado exitosamente",
  "sessionState": {...}
}
```

---

## 📋 Resumen de Variables entre Webhooks

| Webhook Origen | Variable a Guardar | Webhook Destino | Cómo Usarla |
|----------------|-------------------|-----------------|-------------|
| validar-cliente | `clienteId` | clasificar-caso | `${cliente_response.clienteId}` |
| validar-cliente | `clienteId` | guardar-caso | `${cliente_response.clienteId}` |
| clasificar-caso | `tipoCaso` | guardar-caso | `${clasificacion_response.tipoCaso}` |
| clasificar-caso | `criticidad` | guardar-caso | `${clasificacion_response.criticidad}` |
| clasificar-caso | `justificacion` | guardar-caso | `${clasificacion_response.justificacion}` |
| guardar-caso | `numeroCaso` | mensaje final | `${caso_response.numeroCaso}` |

---

## 🎯 Mensaje Final al Usuario

En el agente de cierre, puedes usar:

```
¡Perfecto! Tu caso ha sido registrado exitosamente.

📋 Número de caso: ${caso_response.numeroCaso}
⚠️ Criticidad: ${clasificacion_response.criticidad}
📞 Te contactaremos pronto al ${clienteTelefono}

Gracias por comunicarte con Vetanco.
```

---

## 🔧 Configuración General

**Servidor Backend:** `https://vetanco.aiporvos.com`

**Headers comunes a todos los webhooks:**
```json
{"Content-Type":"application/json"}
```

**Verificación de firma:** Deshabilitada (`DISABLE_WEBHOOK_SIGNATURE_VERIFICATION=true`)

---

## 📊 Tablas de Supabase - Relación con Webhooks

**Referencia**: Ver schema completo en [docs/schema-database.md](docs/schema-database.md)

| Tabla | Webhook | Estado | Propósito según schema oficial |
|-------|---------|--------|-------------------------------|
| `clientes` | **validar-cliente** | ✅ En uso | Clientes de Vetanco: nombre_apellido, razon_social, **cuit** (UNIQUE), telefono, email, whatsapp_number, direccion. Se busca/crea por CUIT |
| `casos` | **guardar-caso** | ✅ En uso | Tabla principal reclamos/quejas/comentarios. **numero_caso** auto-generado (VET-YYYY-NNNNN). Campos: cliente_id, tipo_caso, criticidad, justificacion, estado, canal, descripciones, numero_remito |
| `productos_afectados` | **guardar-caso** | ✅ En uso | Productos del caso (1:N). nombre_producto, presentacion, numero_lote, fecha_vencimiento, **estado_producto** (ENUM: usado, sin_usar, envase_roto, envase_sano), cantidad_afectada |
| `adjuntos` | **guardar-caso** | ✅ En uso | Multimedia: **tipo_adjunto** (ENUM: foto, video, documento, audio), url_original (WhatsApp temporal), url_storage (Supabase permanente), procesado |
| `colaboradores_vetanco` | Manual | ⚠️ No webhooks | Empleados Vetanco: nombre, email (UNIQUE), cargo, area, puede_clasificar_casos, puede_cerrar_casos. Gestión manual |
| `clasificaciones` | **Trigger automático** | 🤖 Automático | **Historial de cambios** de clasificación. Se llena por trigger `registrar_cambio_clasificacion()` cuando cambia tipo_caso/criticidad/justificacion en casos |
| `interacciones` | - | ❌ Pendiente | Log de interacciones chatbot: session_id, flow_id, tipo_interaccion, nodo_inicio/fin, duracion_segundos, completada. **No implementado** |
| `mensajes` | - | ❌ Pendiente | Mensajes individuales: mensaje_id_externo (WhatsApp/Kapso), es_entrante, tipo_mensaje, contenido, contenido_estructurado (JSONB). **No implementado** |
| `investigaciones` | - | ❌ Pendiente | Investigación casos críticos: investigador_id, hallazgos, evidencia, analisis_laboratorio, causa_raiz, acciones_correctivas. **No implementado** |
| `v_casos_completos` | - | 📊 Vista | Vista SQL desnormalizada: casos JOIN clientes JOIN productos_afectados. **Solo lectura** |
| `v_estadisticas_casos` | - | 📊 Vista | Estadísticas agregadas: COUNT por tipo_caso, criticidad, estado. **Solo lectura** |

---

## 🔄 Flujo de Datos: Webhooks → Tablas

### Webhook 1: validar-cliente
```
ENTRADA (desde Kapso)
  ├── clienteRazonSocial
  ├── clienteCUIT
  ├── clienteTelefono
  ├── clienteEmail
  └── clienteDireccion

PROCESO
  ├── Busca cliente por CUIT
  └── Si no existe → Crea nuevo cliente

TABLA AFECTADA: clientes
  └── INSERT (si es nuevo) o SELECT (si existe)

SALIDA (response)
  ├── clienteId ────────────┐
  ├── clienteExistente      │
  └── mensaje               │
                            │
                            └──> Pasa a clasificar-caso
```

### Webhook 2: clasificar-caso
```
ENTRADA (desde Kapso + webhook anterior)
  ├── clienteId (de cliente_response)
  ├── descripcionQueSucedio
  ├── descripcionDondeOcurrio
  ├── descripcionCuandoOcurrio
  ├── descripcionLibre
  └── productoNombre

PROCESO
  ├── Analiza keywords en las descripciones
  └── Clasifica caso (tipoCaso, criticidad)

TABLA AFECTADA: ninguna
  └── Solo procesa y clasifica, NO guarda en DB

SALIDA (response)
  ├── tipoCaso ─────────────┐
  ├── criticidad            │
  ├── justificacion         │
  └── razonamiento          │
                            │
                            └──> Pasa a guardar-caso
```

### Webhook 3: guardar-caso
```
ENTRADA (desde Kapso + webhooks anteriores)
  ├── clienteId (de cliente_response)
  ├── tipoCaso (de clasificacion_response)
  ├── criticidad (de clasificacion_response)
  ├── justificacion (de clasificacion_response)
  ├── descripcionQueSucedio
  ├── descripcionDondeOcurrio
  ├── descripcionCuandoOcurrio
  ├── descripcionLibre
  ├── numeroRemito
  ├── productoNombre
  ├── productoLote
  ├── productoPresentacion
  ├── productoVencimiento
  ├── productoEstado
  ├── productoCantidadAfectada
  └── productoUnidadMedida

PROCESO
  1. Crea caso en tabla casos
  2. Genera numero_caso automático
  3. Si hay datos de producto → Crea en productos_afectados
  4. Si hay adjuntos → Crea en adjuntos

TABLAS AFECTADAS:
  ├── casos (INSERT obligatorio)
  │   └── Genera numero_caso: VET-YYYY-NNNNN
  │
  ├── productos_afectados (INSERT condicional)
  │   └── Solo si productoNombre y productoLote existen
  │
  └── adjuntos (INSERT condicional)
      └── Solo si sessionState.adjuntos tiene elementos

SALIDA (response)
  ├── casoId
  ├── numeroCaso ───────────┐
  └── mensaje              │
                           │
                           └──> Se muestra al usuario en mensaje final
```

---

## 📝 Ejemplo de Inserción Completa

### Caso de Uso: "Rasgadura en embalaje de ALBENDAZOL"

#### 1. validar-cliente ejecuta
```sql
INSERT INTO clientes (razon_social, cuit, telefono, email, direccion)
VALUES ('Veterinaria San Martín', '30-12345678-9', '11-4313-8999', 'info@vetsanmartin.com', 'Av. San Martín 1234');

-- Retorna: clienteId = "abc-123-def"
```

#### 2. clasificar-caso ejecuta
```
NO EJECUTA SQL
Solo analiza y retorna:
  - tipoCaso: "reclamo"
  - criticidad: "menor"
  - justificacion: "pendiente_investigacion"
```

#### 3. guardar-caso ejecuta
```sql
-- Paso 1: Crear caso
INSERT INTO casos (
  cliente_id,
  tipo_caso,
  criticidad,
  justificacion,
  canal,
  descripcion_que_sucedio,
  descripcion_donde_ocurrio,
  descripcion_cuando_ocurrio,
  numero_remito
) VALUES (
  'abc-123-def',
  'reclamo',
  'menor',
  'pendiente_investigacion',
  'whatsapp',
  'Rasgadura lateral en embalaje',
  'Depósito principal',
  '2025-08-06 12:00:00',
  'REM-LP-2025-055'
);

-- Retorna: casoId = "xyz-789-uvw", numeroCaso = "VET-2025-00042"

-- Paso 2: Crear producto afectado (si hay datos)
INSERT INTO productos_afectados (
  caso_id,
  nombre_producto,
  presentacion,
  numero_lote,
  fecha_vencimiento,
  estado_producto,
  cantidad_afectada,
  unidad_medida
) VALUES (
  'xyz-789-uvw',
  'ALBENDAZOL® VETANCO',
  'Bolsa 10 kg',
  'AL-2504P',
  '2026-12-31',
  'sin_usar,envase_roto',
  1,
  'unidades'
);

-- Paso 3: Crear adjuntos (si hay)
-- En este caso no había adjuntos, no se ejecuta
```

---

## ⚠️ Puntos Importantes

1. **Save Response To** es crucial - define el nombre de la variable donde se guardan las respuestas
2. **Kapso usa sintaxis `${}`** para variables, NO `{{}}` (sintaxis de Mustache)
3. Variables de sessionState: `${nombreVariable}`
4. Variables de respuestas de webhooks: `${nombre_response.campo}`
5. Los webhooks deben ejecutarse en orden: validar-cliente → clasificar-caso → guardar-caso
6. El `clienteId` del primer webhook debe propagarse a los siguientes
7. Los datos de clasificación deben pasarse al webhook de guardar-caso
8. El `numeroCaso` final debe mostrarse al usuario en el mensaje de cierre9. **guardar-interaccion** y **guardar-mensaje** son OPCIONALES - solo para analytics avanzados
10. La tabla **investigaciones** se gestiona manualmente por colaboradores, no desde Kapso

---

## 📡 Funciones Opcionales para Analytics

### 4️⃣ Guardar Interacción

**URL:** `https://vetanco.aiporvos.com/functions/guardar-interaccion`

**Propósito:** Registrar cada interacción del usuario con el chatbot para análisis de experiencia.

**Request Body ejemplo:**
```json
{
  "casoId": "${caso_response.casoId}",
  "session_id": "${sessionId}",
  "tipo_interaccion": "cierre",
  "completada": true
}
```

### 5️⃣ Guardar Mensaje

**URL:** `https://vetanco.aiporvos.com/functions/guardar-mensaje`

**Propósito:** Registrar cada mensaje individual para historial completo de conversación.

**Request Body ejemplo:**
```json
{
  "casoId": "${caso_response.casoId}",
  "es_entrante": true,
  "tipo_mensaje": "text",
  "contenido": "${messageText}"
}
```

**Nota:** Estas funciones son opcionales. El flujo principal funciona sin ellas.
