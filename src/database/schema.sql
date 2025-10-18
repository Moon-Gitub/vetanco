-- ============================================================================
-- SCHEMA DE BASE DE DATOS SUPABASE PARA SISTEMA DE RECLAMOS VETANCO
-- ============================================================================
-- Versión: 1.0
-- Fecha: 2025-10-18
-- Descripción: Schema completo para gestión de reclamos, quejas y comentarios
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TIPOS ENUM
-- ============================================================================

-- Tipo de usuario que registra el caso
CREATE TYPE tipo_usuario_registro AS ENUM ('cliente', 'colaborador_vetanco');

-- Tipo de caso
CREATE TYPE tipo_caso AS ENUM ('reclamo', 'queja', 'comentario', 'pendiente_clasificacion');

-- Criticidad del reclamo
CREATE TYPE criticidad_reclamo AS ENUM ('critico', 'mayor', 'menor', 'no_aplica');

-- Justificación del caso
CREATE TYPE justificacion_caso AS ENUM ('justificado', 'no_justificado', 'pendiente_investigacion');

-- Estado del producto
CREATE TYPE estado_producto AS ENUM ('usado', 'sin_usar', 'envase_roto', 'envase_sano');

-- Estado del caso
CREATE TYPE estado_caso AS ENUM ('nuevo', 'en_investigacion', 'resuelto', 'cerrado', 'cancelado');

-- Canal de comunicación
CREATE TYPE canal_comunicacion AS ENUM ('whatsapp', 'email', 'telefono', 'web', 'presencial');

-- Tipo de adjunto
CREATE TYPE tipo_adjunto AS ENUM ('foto', 'video', 'documento', 'audio');

-- ============================================================================
-- TABLA: clientes
-- ============================================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_apellido VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    cuit VARCHAR(13) NOT NULL UNIQUE,
    direccion_calle VARCHAR(255) NOT NULL,
    direccion_numero VARCHAR(50),
    direccion_piso VARCHAR(50),
    codigo_postal VARCHAR(10),
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    whatsapp_number VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    notas TEXT,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Índices para clientes
CREATE INDEX idx_clientes_cuit ON clientes(cuit);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_whatsapp ON clientes(whatsapp_number);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- ============================================================================
-- TABLA: colaboradores_vetanco
-- ============================================================================
CREATE TABLE colaboradores_vetanco (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    telefono VARCHAR(50),
    whatsapp_number VARCHAR(50),
    activo BOOLEAN DEFAULT true,

    -- Permisos y roles
    puede_clasificar_casos BOOLEAN DEFAULT false,
    puede_cerrar_casos BOOLEAN DEFAULT false,
    puede_asignar_casos BOOLEAN DEFAULT false,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para colaboradores
CREATE INDEX idx_colaboradores_email ON colaboradores_vetanco(email);
CREATE INDEX idx_colaboradores_activo ON colaboradores_vetanco(activo);

-- ============================================================================
-- TABLA: casos
-- ============================================================================
CREATE TABLE casos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_caso VARCHAR(50) UNIQUE NOT NULL, -- Formato: VET-2025-00001

    -- Relaciones
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    colaborador_registro_id UUID REFERENCES colaboradores_vetanco(id),
    colaborador_asignado_id UUID REFERENCES colaboradores_vetanco(id),

    -- Tipo de registro
    tipo_usuario_registro tipo_usuario_registro NOT NULL,

    -- Clasificación del caso
    tipo_caso tipo_caso DEFAULT 'pendiente_clasificacion',
    criticidad criticidad_reclamo DEFAULT 'no_aplica',
    justificacion justificacion_caso DEFAULT 'pendiente_investigacion',
    estado estado_caso DEFAULT 'nuevo',

    -- Canal de comunicación
    canal canal_comunicacion NOT NULL,

    -- Descripción del caso
    descripcion_que_sucedio TEXT NOT NULL,
    descripcion_donde_ocurrio TEXT,
    descripcion_cuando_ocurrio TIMESTAMP WITH TIME ZONE,
    descripcion_libre TEXT,

    -- Número de remito
    numero_remito VARCHAR(100) NOT NULL,

    -- Investigación y resolución
    fecha_inicio_investigacion TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    resolucion TEXT,
    acciones_correctivas TEXT,
    acciones_preventivas TEXT,

    -- Seguimiento
    requiere_seguimiento BOOLEAN DEFAULT false,
    fecha_proximo_seguimiento TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT chk_criticidad_solo_en_reclamo CHECK (
        (tipo_caso = 'reclamo' AND criticidad != 'no_aplica') OR
        (tipo_caso != 'reclamo' AND criticidad = 'no_aplica')
    )
);

-- Índices para casos
CREATE INDEX idx_casos_numero_caso ON casos(numero_caso);
CREATE INDEX idx_casos_cliente_id ON casos(cliente_id);
CREATE INDEX idx_casos_tipo_caso ON casos(tipo_caso);
CREATE INDEX idx_casos_estado ON casos(estado);
CREATE INDEX idx_casos_fecha_creacion ON casos(created_at);
CREATE INDEX idx_casos_colaborador_asignado ON casos(colaborador_asignado_id);
CREATE INDEX idx_casos_criticidad ON casos(criticidad);

-- ============================================================================
-- TABLA: productos_afectados
-- ============================================================================
CREATE TABLE productos_afectados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,

    -- Datos del producto
    nombre_producto VARCHAR(255) NOT NULL,
    presentacion VARCHAR(255) NOT NULL,
    numero_lote VARCHAR(100) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado_producto estado_producto NOT NULL,

    -- Cantidades
    cantidad_afectada INTEGER NOT NULL CHECK (cantidad_afectada > 0),
    unidad_medida VARCHAR(50) NOT NULL, -- kg, litros, unidades, etc.

    -- Datos adicionales
    condiciones_almacenamiento TEXT,
    observaciones TEXT,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos afectados
CREATE INDEX idx_productos_caso_id ON productos_afectados(caso_id);
CREATE INDEX idx_productos_numero_lote ON productos_afectados(numero_lote);
CREATE INDEX idx_productos_fecha_vencimiento ON productos_afectados(fecha_vencimiento);

-- ============================================================================
-- TABLA: interacciones
-- ============================================================================
CREATE TABLE interacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,

    -- Identificación de la sesión
    session_id VARCHAR(255),
    flow_id VARCHAR(255),

    -- Tipo de interacción
    tipo_interaccion VARCHAR(100) NOT NULL, -- inicio, identificacion, producto, descripcion, cierre

    -- Detalles de la interacción
    nodo_inicio VARCHAR(255),
    nodo_fin VARCHAR(255),
    duracion_segundos INTEGER,

    -- Estado
    completada BOOLEAN DEFAULT false,
    error_ocurrido BOOLEAN DEFAULT false,
    error_detalle TEXT,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para interacciones
CREATE INDEX idx_interacciones_caso_id ON interacciones(caso_id);
CREATE INDEX idx_interacciones_session_id ON interacciones(session_id);
CREATE INDEX idx_interacciones_tipo ON interacciones(tipo_interaccion);
CREATE INDEX idx_interacciones_fecha ON interacciones(created_at);

-- ============================================================================
-- TABLA: mensajes
-- ============================================================================
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
    interaccion_id UUID REFERENCES interacciones(id) ON DELETE SET NULL,

    -- Identificación del mensaje
    mensaje_id_externo VARCHAR(255), -- ID de WhatsApp/Kapso

    -- Dirección del mensaje
    es_entrante BOOLEAN NOT NULL, -- true = del usuario, false = del bot

    -- Remitente y destinatario
    remitente_numero VARCHAR(50),
    destinatario_numero VARCHAR(50),

    -- Contenido
    tipo_mensaje VARCHAR(50) NOT NULL, -- text, image, video, audio, document, button_response, etc.
    contenido TEXT,
    contenido_estructurado JSONB, -- Para mensajes complejos (botones, listas, etc.)

    -- Estado del mensaje
    entregado BOOLEAN DEFAULT false,
    leido BOOLEAN DEFAULT false,
    error BOOLEAN DEFAULT false,
    error_detalle TEXT,

    -- Timestamps
    timestamp_envio TIMESTAMP WITH TIME ZONE,
    timestamp_entrega TIMESTAMP WITH TIME ZONE,
    timestamp_lectura TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mensajes
CREATE INDEX idx_mensajes_caso_id ON mensajes(caso_id);
CREATE INDEX idx_mensajes_interaccion_id ON mensajes(interaccion_id);
CREATE INDEX idx_mensajes_mensaje_id_externo ON mensajes(mensaje_id_externo);
CREATE INDEX idx_mensajes_es_entrante ON mensajes(es_entrante);
CREATE INDEX idx_mensajes_fecha ON mensajes(created_at);

-- ============================================================================
-- TABLA: adjuntos
-- ============================================================================
CREATE TABLE adjuntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
    mensaje_id UUID REFERENCES mensajes(id) ON DELETE SET NULL,

    -- Tipo y formato
    tipo_adjunto tipo_adjunto NOT NULL,
    formato VARCHAR(50), -- jpg, png, mp4, pdf, etc.

    -- Almacenamiento
    url_original TEXT, -- URL de WhatsApp/Kapso (temporal)
    url_storage TEXT, -- URL de Supabase Storage (permanente)
    nombre_archivo VARCHAR(255) NOT NULL,
    tamanio_bytes BIGINT,

    -- Metadatos del archivo
    mime_type VARCHAR(100),
    duracion_segundos INTEGER, -- Para videos y audios
    resolucion VARCHAR(50), -- Para imágenes y videos (ej: "1920x1080")

    -- Descripción opcional
    descripcion TEXT,

    -- Estado de procesamiento
    procesado BOOLEAN DEFAULT false,
    error_descarga BOOLEAN DEFAULT false,
    error_detalle TEXT,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para adjuntos
CREATE INDEX idx_adjuntos_caso_id ON adjuntos(caso_id);
CREATE INDEX idx_adjuntos_mensaje_id ON adjuntos(mensaje_id);
CREATE INDEX idx_adjuntos_tipo ON adjuntos(tipo_adjunto);

-- ============================================================================
-- TABLA: clasificaciones
-- ============================================================================
CREATE TABLE clasificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,

    -- Clasificación anterior y nueva
    tipo_caso_anterior tipo_caso,
    tipo_caso_nuevo tipo_caso NOT NULL,
    criticidad_anterior criticidad_reclamo,
    criticidad_nueva criticidad_reclamo NOT NULL,
    justificacion_anterior justificacion_caso,
    justificacion_nueva justificacion_caso NOT NULL,

    -- Responsable de la clasificación
    clasificado_por UUID REFERENCES colaboradores_vetanco(id),
    clasificacion_automatica BOOLEAN DEFAULT false,

    -- Justificación de la clasificación
    motivo TEXT NOT NULL,
    evidencias TEXT,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clasificaciones
CREATE INDEX idx_clasificaciones_caso_id ON clasificaciones(caso_id);
CREATE INDEX idx_clasificaciones_clasificado_por ON clasificaciones(clasificado_por);
CREATE INDEX idx_clasificaciones_fecha ON clasificaciones(created_at);

-- ============================================================================
-- TABLA: investigaciones
-- ============================================================================
CREATE TABLE investigaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,

    -- Responsable
    investigador_id UUID REFERENCES colaboradores_vetanco(id),

    -- Proceso de investigación
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50) DEFAULT 'en_proceso', -- en_proceso, completada, suspendida

    -- Hallazgos
    hallazgos TEXT,
    evidencia_recolectada TEXT,
    analisis_laboratorio TEXT,

    -- Conclusiones
    causa_raiz TEXT,
    responsable_incidente TEXT,

    -- Acciones
    acciones_inmediatas TEXT,
    acciones_correctivas TEXT,
    acciones_preventivas TEXT,

    -- Seguimiento
    requiere_seguimiento BOOLEAN DEFAULT false,
    fecha_seguimiento TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para investigaciones
CREATE INDEX idx_investigaciones_caso_id ON investigaciones(caso_id);
CREATE INDEX idx_investigaciones_investigador_id ON investigaciones(investigador_id);
CREATE INDEX idx_investigaciones_estado ON investigaciones(estado);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores_vetanco
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_casos_updated_at BEFORE UPDATE ON casos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos_afectados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interacciones_updated_at BEFORE UPDATE ON interacciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adjuntos_updated_at BEFORE UPDATE ON adjuntos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigaciones_updated_at BEFORE UPDATE ON investigaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Función para generar número de caso único
-- ============================================================================
CREATE OR REPLACE FUNCTION generar_numero_caso()
RETURNS TRIGGER AS $$
DECLARE
    anio INTEGER;
    contador INTEGER;
    nuevo_numero VARCHAR(50);
BEGIN
    -- Obtener el año actual
    anio := EXTRACT(YEAR FROM NOW());

    -- Obtener el contador de casos del año actual
    SELECT COUNT(*) + 1 INTO contador
    FROM casos
    WHERE EXTRACT(YEAR FROM created_at) = anio;

    -- Generar el número con formato VET-YYYY-NNNNN
    nuevo_numero := 'VET-' || anio::TEXT || '-' || LPAD(contador::TEXT, 5, '0');

    -- Asignar el número al nuevo caso
    NEW.numero_caso := nuevo_numero;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de caso automáticamente
CREATE TRIGGER trigger_generar_numero_caso
    BEFORE INSERT ON casos
    FOR EACH ROW
    WHEN (NEW.numero_caso IS NULL)
    EXECUTE FUNCTION generar_numero_caso();

-- ============================================================================
-- Función para registrar cambios de clasificación
-- ============================================================================
CREATE OR REPLACE FUNCTION registrar_cambio_clasificacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si hay cambio en la clasificación
    IF (OLD.tipo_caso IS DISTINCT FROM NEW.tipo_caso) OR
       (OLD.criticidad IS DISTINCT FROM NEW.criticidad) OR
       (OLD.justificacion IS DISTINCT FROM NEW.justificacion) THEN

        INSERT INTO clasificaciones (
            caso_id,
            tipo_caso_anterior,
            tipo_caso_nuevo,
            criticidad_anterior,
            criticidad_nueva,
            justificacion_anterior,
            justificacion_nueva,
            clasificado_por,
            motivo
        ) VALUES (
            NEW.id,
            OLD.tipo_caso,
            NEW.tipo_caso,
            OLD.criticidad,
            NEW.criticidad,
            OLD.justificacion,
            NEW.justificacion,
            NEW.updated_by,
            'Cambio registrado automáticamente'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios de clasificación
CREATE TRIGGER trigger_registrar_clasificacion
    AFTER UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_cambio_clasificacion();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de casos completos con información relacionada
CREATE OR REPLACE VIEW v_casos_completos AS
SELECT
    c.id,
    c.numero_caso,
    c.tipo_caso,
    c.criticidad,
    c.justificacion,
    c.estado,
    c.canal,

    -- Cliente
    cl.nombre_apellido AS cliente_nombre,
    cl.razon_social AS cliente_razon_social,
    cl.cuit AS cliente_cuit,
    cl.telefono AS cliente_telefono,

    -- Colaborador que registró
    cr.nombre_apellido AS colaborador_registro_nombre,
    cr.area AS colaborador_registro_area,

    -- Colaborador asignado
    ca.nombre_apellido AS colaborador_asignado_nombre,
    ca.area AS colaborador_asignado_area,

    -- Producto
    pa.nombre_producto,
    pa.numero_lote,
    pa.fecha_vencimiento,

    -- Descripción
    c.descripcion_que_sucedio,
    c.descripcion_donde_ocurrio,
    c.descripcion_cuando_ocurrio,

    -- Timestamps
    c.created_at,
    c.updated_at,
    c.fecha_cierre

FROM casos c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN colaboradores_vetanco cr ON c.colaborador_registro_id = cr.id
LEFT JOIN colaboradores_vetanco ca ON c.colaborador_asignado_id = ca.id
LEFT JOIN productos_afectados pa ON c.id = pa.caso_id;

-- Vista de estadísticas de casos
CREATE OR REPLACE VIEW v_estadisticas_casos AS
SELECT
    tipo_caso,
    criticidad,
    estado,
    COUNT(*) AS total_casos,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS casos_ultimos_30_dias,
    COUNT(CASE WHEN estado = 'nuevo' THEN 1 END) AS casos_nuevos,
    COUNT(CASE WHEN estado = 'en_investigacion' THEN 1 END) AS casos_en_investigacion,
    COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS casos_resueltos
FROM casos
GROUP BY tipo_caso, criticidad, estado;

-- ============================================================================
-- COMENTARIOS EN TABLAS
-- ============================================================================

COMMENT ON TABLE clientes IS 'Información de clientes que reportan casos';
COMMENT ON TABLE colaboradores_vetanco IS 'Colaboradores de Vetanco que gestionan casos';
COMMENT ON TABLE casos IS 'Registro maestro de reclamos, quejas y comentarios';
COMMENT ON TABLE productos_afectados IS 'Productos involucrados en cada caso';
COMMENT ON TABLE interacciones IS 'Log de interacciones del chatbot por caso';
COMMENT ON TABLE mensajes IS 'Mensajes individuales de cada conversación';
COMMENT ON TABLE adjuntos IS 'Archivos multimedia adjuntos a los casos';
COMMENT ON TABLE clasificaciones IS 'Historial de cambios en la clasificación de casos';
COMMENT ON TABLE investigaciones IS 'Proceso de investigación y resolución de casos';

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTAR EN PRODUCCIÓN)
-- ============================================================================

-- Insertar colaborador de ejemplo
INSERT INTO colaboradores_vetanco (nombre_apellido, email, cargo, area, puede_clasificar_casos, puede_cerrar_casos)
VALUES ('Admin Vetanco', 'admin@vetanco.com', 'Gerente de Calidad', 'Calidad', true, true);

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
