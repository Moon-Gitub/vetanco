# Schema de Base de Datos - Sistema Vetanco

## Descripción General

Base de datos PostgreSQL en Supabase con 9 tablas principales diseñadas para registrar y gestionar reclamos, quejas y comentarios con trazabilidad completa.

## Diagrama Relacional

```
┌─────────────────┐
│    clientes     │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      ┌──────────────────────┐
│     casos       │◄────┤ colaboradores_vetanco │
└────────┬────────┘      └──────────────────────┘
         │
         ├──────┬──────┬──────┬─────────────┐
         │      │      │      │             │
      1:N│   1:N│   1:N│   1:N│          1:N│
         ▼      ▼      ▼      ▼             ▼
┌─────────┐ ┌────┐ ┌────┐ ┌────────┐ ┌──────────┐
│productos│ │inter│ │mens│ │adjuntos│ │clasifica │
│afectados│ │accio│ │ajes│ │        │ │ciones    │
└─────────┘ │nes │ └─┬──┘ └────────┘ └──────────┘
            └────┘   │
                     │ 1:N
                     ▼
                ┌──────────┐
                │ adjuntos │
                └──────────┘

┌─────────────────┐
│ investigaciones │ (1:N con casos)
└─────────────────┘
```

## Tablas

### 1. clientes

Almacena información de clientes de Vetanco.

**Campos principales:**
- `id` (UUID, PK)
- `nombre_apellido` (VARCHAR)
- `razon_social` (VARCHAR)
- `cuit` (VARCHAR, UNIQUE)
- `direccion_*` (varios campos)
- `telefono`, `email`, `whatsapp_number`
- `created_at`, `updated_at`

**Índices:**
- `idx_clientes_cuit`
- `idx_clientes_telefono`
- `idx_clientes_whatsapp`

---

### 2. colaboradores_vetanco

Empleados de Vetanco que gestionan casos.

**Campos principales:**
- `id` (UUID, PK)
- `nombre_apellido` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `cargo`, `area` (VARCHAR)
- `puede_clasificar_casos` (BOOLEAN)
- `puede_cerrar_casos` (BOOLEAN)

**Índices:**
- `idx_colaboradores_email`
- `idx_colaboradores_activo`

---

### 3. casos

Tabla principal de reclamos, quejas y comentarios.

**Campos principales:**
- `id` (UUID, PK)
- `numero_caso` (VARCHAR, UNIQUE) - Formato: VET-2025-00001
- `cliente_id` (FK → clientes)
- `colaborador_registro_id` (FK → colaboradores_vetanco)
- `colaborador_asignado_id` (FK → colaboradores_vetanco)
- `tipo_usuario_registro` (ENUM: cliente, colaborador_vetanco)
- `tipo_caso` (ENUM: reclamo, queja, comentario, pendiente_clasificacion)
- `criticidad` (ENUM: critico, mayor, menor, no_aplica)
- `justificacion` (ENUM: justificado, no_justificado, pendiente_investigacion)
- `estado` (ENUM: nuevo, en_investigacion, resuelto, cerrado, cancelado)
- `canal` (ENUM: whatsapp, email, telefono, web, presencial)
- `descripcion_que_sucedio`, `descripcion_donde_ocurrio`, `descripcion_cuando_ocurrio`
- `numero_remito` (VARCHAR)
- `created_at`, `updated_at`

**Constraint:**
```sql
CHECK (
  (tipo_caso = 'reclamo' AND criticidad != 'no_aplica') OR
  (tipo_caso != 'reclamo' AND criticidad = 'no_aplica')
)
```

**Índices:**
- `idx_casos_numero_caso`
- `idx_casos_cliente_id`
- `idx_casos_tipo_caso`
- `idx_casos_estado`
- `idx_casos_criticidad`

---

### 4. productos_afectados

Productos involucrados en cada caso (relación 1:N con casos).

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `nombre_producto`, `presentacion` (VARCHAR)
- `numero_lote`, `fecha_vencimiento`
- `estado_producto` (ENUM: usado, sin_usar, envase_roto, envase_sano)
- `cantidad_afectada` (INTEGER)
- `unidad_medida` (VARCHAR)

**Índices:**
- `idx_productos_caso_id`
- `idx_productos_numero_lote`

---

### 5. interacciones

Log de interacciones del chatbot por caso.

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `session_id`, `flow_id` (VARCHAR)
- `tipo_interaccion` (VARCHAR) - inicio, identificacion, producto, descripcion, cierre
- `nodo_inicio`, `nodo_fin` (VARCHAR)
- `duracion_segundos` (INTEGER)
- `completada`, `error_ocurrido` (BOOLEAN)
- `created_at`

**Índices:**
- `idx_interacciones_caso_id`
- `idx_interacciones_session_id`
- `idx_interacciones_tipo`

---

### 6. mensajes

Mensajes individuales de cada conversación.

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `interaccion_id` (FK → interacciones)
- `mensaje_id_externo` (VARCHAR) - ID de WhatsApp/Kapso
- `es_entrante` (BOOLEAN) - true = del usuario, false = del bot
- `remitente_numero`, `destinatario_numero` (VARCHAR)
- `tipo_mensaje` (VARCHAR) - text, image, video, audio, document, button_response
- `contenido` (TEXT)
- `contenido_estructurado` (JSONB)
- `entregado`, `leido`, `error` (BOOLEAN)
- `timestamp_envio`, `timestamp_entrega`, `timestamp_lectura`

**Índices:**
- `idx_mensajes_caso_id`
- `idx_mensajes_interaccion_id`
- `idx_mensajes_mensaje_id_externo`

---

### 7. adjuntos

Archivos multimedia adjuntos a los casos.

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `mensaje_id` (FK → mensajes)
- `tipo_adjunto` (ENUM: foto, video, documento, audio)
- `formato` (VARCHAR) - jpg, png, mp4, pdf, etc.
- `url_original` (TEXT) - URL temporal de WhatsApp
- `url_storage` (TEXT) - URL permanente en Supabase Storage
- `nombre_archivo` (VARCHAR)
- `tamanio_bytes` (BIGINT)
- `procesado`, `error_descarga` (BOOLEAN)

**Índices:**
- `idx_adjuntos_caso_id`
- `idx_adjuntos_mensaje_id`

---

### 8. clasificaciones

Historial de cambios en la clasificación de casos.

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `tipo_caso_anterior`, `tipo_caso_nuevo` (tipo_caso ENUM)
- `criticidad_anterior`, `criticidad_nueva` (criticidad_reclamo ENUM)
- `justificacion_anterior`, `justificacion_nueva` (justificacion_caso ENUM)
- `clasificado_por` (FK → colaboradores_vetanco)
- `clasificacion_automatica` (BOOLEAN)
- `motivo`, `evidencias` (TEXT)
- `created_at`

**Índices:**
- `idx_clasificaciones_caso_id`
- `idx_clasificaciones_clasificado_por`

---

### 9. investigaciones

Proceso de investigación y resolución de casos.

**Campos principales:**
- `id` (UUID, PK)
- `caso_id` (FK → casos)
- `investigador_id` (FK → colaboradores_vetanco)
- `fecha_inicio`, `fecha_fin` (TIMESTAMP)
- `estado` (VARCHAR) - en_proceso, completada, suspendida
- `hallazgos`, `evidencia_recolectada`, `analisis_laboratorio` (TEXT)
- `causa_raiz`, `responsable_incidente` (TEXT)
- `acciones_inmediatas`, `acciones_correctivas`, `acciones_preventivas` (TEXT)

**Índices:**
- `idx_investigaciones_caso_id`
- `idx_investigaciones_investigador_id`

---

## Triggers y Funciones

### 1. Trigger: update_updated_at_column()

Actualiza automáticamente el campo `updated_at` en todas las tablas relevantes.

```sql
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Trigger: generar_numero_caso()

Genera automáticamente el número de caso único en formato VET-YYYY-NNNNN.

```sql
CREATE TRIGGER trigger_generar_numero_caso
    BEFORE INSERT ON casos
    FOR EACH ROW
    WHEN (NEW.numero_caso IS NULL)
    EXECUTE FUNCTION generar_numero_caso();
```

**Lógica:**
```sql
-- Obtiene contador del año actual
-- Formato: VET-2025-00001, VET-2025-00002, etc.
```

### 3. Trigger: registrar_cambio_clasificacion()

Registra automáticamente en tabla `clasificaciones` cada vez que cambia el tipo, criticidad o justificación de un caso.

```sql
CREATE TRIGGER trigger_registrar_clasificacion
    AFTER UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_cambio_clasificacion();
```

---

## Vistas

### v_casos_completos

Vista desnormalizada con toda la información relevante de un caso.

```sql
CREATE VIEW v_casos_completos AS
SELECT
    c.numero_caso,
    c.tipo_caso,
    c.criticidad,
    c.estado,
    cl.nombre_apellido AS cliente_nombre,
    cl.cuit AS cliente_cuit,
    pa.nombre_producto,
    pa.numero_lote,
    c.descripcion_que_sucedio,
    c.created_at
FROM casos c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN productos_afectados pa ON c.id = pa.caso_id;
```

### v_estadisticas_casos

Vista con estadísticas agregadas de casos.

```sql
CREATE VIEW v_estadisticas_casos AS
SELECT
    tipo_caso,
    criticidad,
    estado,
    COUNT(*) AS total_casos,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS casos_ultimos_30_dias
FROM casos
GROUP BY tipo_caso, criticidad, estado;
```

---

## Row Level Security (RLS)

### Políticas Recomendadas

**Para clientes:**
```sql
-- Clientes solo pueden ver sus propios casos
CREATE POLICY clientes_own_casos ON casos
    FOR SELECT
    USING (auth.uid() = created_by);
```

**Para colaboradores:**
```sql
-- Colaboradores pueden ver todos los casos
CREATE POLICY colaboradores_all_casos ON casos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM colaboradores_vetanco
            WHERE id = auth.uid() AND activo = true
        )
    );
```

---

## Migraciones

### Archivo: src/database/schema.sql

Contiene el DDL completo para crear todas las tablas, tipos, índices, triggers y vistas.

**Ejecución:**
1. Copiar contenido de `schema.sql`
2. Abrir SQL Editor en Supabase Dashboard
3. Pegar y ejecutar el script completo
4. Verificar que todas las tablas se crearon correctamente

---

## Backup y Mantenimiento

### Backup Manual

```bash
pg_dump -h db.supabase.co -U postgres -d vetanco_db > backup_$(date +%Y%m%d).sql
```

### Vacuum y Analyze (periódico)

```sql
VACUUM ANALYZE casos;
VACUUM ANALYZE mensajes;
VACUUM ANALYZE interacciones;
```

### Índices a Monitorear

```sql
-- Ver índices no utilizados
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%pkey%';
```

---

## Consultas Útiles

### Casos por Tipo y Criticidad

```sql
SELECT tipo_caso, criticidad, COUNT(*)
FROM casos
GROUP BY tipo_caso, criticidad
ORDER BY tipo_caso, criticidad;
```

### Casos Críticos Abiertos

```sql
SELECT numero_caso, cliente_id, descripcion_que_sucedio, created_at
FROM casos
WHERE criticidad = 'critico' AND estado IN ('nuevo', 'en_investigacion')
ORDER BY created_at DESC;
```

### Tiempo Promedio de Resolución por Criticidad

```sql
SELECT
    criticidad,
    AVG(EXTRACT(EPOCH FROM (fecha_cierre - created_at)) / 3600) AS horas_promedio
FROM casos
WHERE fecha_cierre IS NOT NULL
GROUP BY criticidad;
```

### Productos con Más Reclamos

```sql
SELECT
    nombre_producto,
    COUNT(*) AS total_reclamos
FROM productos_afectados pa
INNER JOIN casos c ON pa.caso_id = c.id
WHERE c.tipo_caso = 'reclamo'
GROUP BY nombre_producto
ORDER BY total_reclamos DESC
LIMIT 10;
```

---

## Capacidad y Escalabilidad

### Estimaciones de Almacenamiento

**Por caso promedio:**
- Registro en `casos`: ~2 KB
- Mensajes (promedio 20 por caso): ~10 KB
- Interacciones: ~1 KB
- Adjuntos (metadata): ~0.5 KB
- **Total por caso**: ~13.5 KB

**Proyección anual (1000 casos):**
- Almacenamiento en DB: ~13.5 MB
- Archivos multimedia (promedio 2 fotos por caso): ~3-4 GB

### Índices de Performance

Todos los índices necesarios están creados para optimizar:
- Búsquedas por número de caso
- Filtrado por tipo y estado
- Consultas por cliente
- Búsquedas por lote de producto
- Queries de auditoría por fecha

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
**Archivo DDL**: [src/database/schema.sql](../src/database/schema.sql)
