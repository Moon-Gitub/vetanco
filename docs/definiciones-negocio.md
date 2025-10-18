# Definiciones de Negocio - Sistema de Reclamos Vetanco

## Índice

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Tipos de Casos](#tipos-de-casos)
3. [Criticidad de Reclamos](#criticidad-de-reclamos)
4. [Justificación de Casos](#justificación-de-casos)
5. [Estados del Producto](#estados-del-producto)
6. [Estados del Caso](#estados-del-caso)
7. [Ejemplos Prácticos](#ejemplos-prácticos)
8. [Matriz de Decisión](#matriz-de-decisión)
9. [Flujo de Clasificación](#flujo-de-clasificación)

---

## Conceptos Fundamentales

### Caso

Registro de cualquier expresión de insatisfacción, sugerencia o consulta proveniente de un cliente de Vetanco S.A. Puede ser clasificado como **reclamo**, **queja** o **comentario**.

### Cliente

Persona física o jurídica que adquiere productos de Vetanco S.A. Puede ser:
- **Cliente directo**: Reporta el caso personalmente
- **Cliente representado**: El caso es reportado por un colaborador de Vetanco en su nombre

### Colaborador Vetanco

Empleado de Vetanco S.A. que registra un caso en nombre de un cliente. Puede pertenecer a áreas como:
- Ventas
- Asistencia Técnica
- Administración
- Calidad
- Logística

---

## Tipos de Casos

### 1. Reclamo

**Definición Oficial**:
> Toda expresión de insatisfacción de un cliente que incurre en un **incumplimiento por parte de Vetanco** a los requerimientos acordados con el cliente; ya sea en el producto o en el servicio.

**Características**:
- Implica incumplimiento de lo acordado
- Puede afectar producto o servicio
- Requiere investigación formal
- Puede ser confirmado o no confirmado tras investigación
- Tiene niveles de criticidad (Crítico, Mayor, Menor)

**Ejemplos**:
- Producto vencido o en mal estado
- Producto no cumple especificaciones técnicas
- Cantidad incorrecta en el envío
- Producto contaminado o defectuoso
- Envase roto que compromete el producto
- Eficacia del producto comprometida

**Keywords comunes**:
`defecto`, `vencido`, `contaminado`, `roto`, `no funciona`, `no sirve`, `malo`, `incorrecto`, `incompleto`

---

### 2. Queja

**Definición Oficial**:
> Se considera como tal a toda expresión de insatisfacción cuando el evento (Reclamo inicial) **no implica un incumplimiento** de requerimientos acordados con el cliente.

**Características**:
- No hay incumplimiento de lo acordado
- Puede referirse a expectativas no explícitas
- Puede convertirse en oportunidad de mejora
- No requiere acciones correctivas obligatorias
- No tiene niveles de criticidad

**Ejemplos**:
- Demora en la entrega dentro de plazos acordados
- Insatisfacción con la atención recibida
- Precio considerado elevado
- Preferencia por otro formato de producto (sin defecto)
- Sugerencia de cambio en el empaque (sin fallo)

**Keywords comunes**:
`demora`, `atención`, `precio`, `caro`, `servicio`, `expectativa`, `preferiría`, `mejor sería`

---

### 3. Comentario

**Definición Oficial**:
> Se considera como tal a toda aquella expresión o sugerencia por parte de un cliente que **no implique un potencial incumplimiento** por parte de Vetanco S.A. Algunos comentarios pueden implicar la intervención de personal de Vetanco para dar **Asistencia Técnica**.

**Características**:
- No implica incumplimiento
- Puede ser consulta, sugerencia o solicitud de información
- Puede requerir asistencia técnica
- No genera investigación de calidad
- Puede generar oportunidad comercial

**Ejemplos**:
- Consulta sobre dosis correcta
- Pregunta sobre modo de aplicación
- Solicitud de información técnica del producto
- Sugerencia de nuevo producto o presentación
- Consulta sobre compatibilidad con otros productos
- Pedido de asesoramiento veterinario

**Keywords comunes**:
`consulta`, `pregunta`, `cómo`, `dosis`, `aplicación`, `sugerencia`, `información`, `compatibilidad`, `usar`

---

## Criticidad de Reclamos

La criticidad **solo aplica a reclamos confirmados**, no a quejas ni comentarios.

### Reclamo CRÍTICO

**Definición**:
> La pureza, identidad, seguridad o eficacia del producto puede estar **gravemente afectada** y causar un **riesgo en la salud del animal**. La **continuidad del negocio puede verse afectada**.

**Características**:
- Riesgo grave para la salud animal
- Potencial pérdida de vidas animales
- Impacto severo en continuidad del negocio del cliente
- Puede generar acciones legales
- Requiere respuesta inmediata (< 24 horas)
- Investigación prioritaria

**Ejemplos**:
- Producto contaminado que causó intoxicación en animales
- Muerte de animales tras uso del producto
- Producto con componente tóxico no declarado
- Contaminación cruzada con sustancias peligrosas
- Producto adulterado o falsificado
- Lote completo con defecto grave que afecta eficacia

**Keywords**:
`muerte`, `muerto`, `intoxicación`, `tóxico`, `grave`, `salud`, `emergencia`, `urgente`, `crítico`, `peligro`

**Acciones Inmediatas**:
1. Notificación inmediata al equipo de Calidad
2. Bloqueo preventivo del lote afectado
3. Investigación en < 24 horas
4. Contacto directo con cliente
5. Evaluación de recall del producto

---

### Reclamo MAYOR

**Definición**:
> La pureza, identidad, seguridad o eficacia del producto puede estar **afectada**, pero esto **no implica un riesgo para la salud del animal**. La continuidad del negocio no puede verse afectada pero la **imagen de Vetanco puede estar comprometida**.

**Características**:
- Producto afectado sin riesgo de salud
- Impacto en imagen de marca
- Puede afectar confianza del cliente
- Requiere investigación formal
- Respuesta en 48-72 horas

**Ejemplos**:
- Envase roto que compromete esterilidad pero sin efecto en animales
- Producto con apariencia anormal (color, olor) pero sin toxicidad
- Etiquetado incorrecto o ilegible
- Producto fuera de especificación técnica (pero funcional)
- Fecha de vencimiento incorrecta en etiqueta
- Cantidad menor a la declarada
- Problema de solubilidad o consistencia

**Keywords**:
`defecto`, `roto`, `mal estado`, `no cumple`, `incorrecto`, `falla`, `problema`, `defectuoso`, `apariencia`

**Acciones**:
1. Registro en sistema en < 4 horas
2. Investigación en 48-72 horas
3. Análisis de lote
4. Respuesta formal al cliente
5. Acciones correctivas si aplica

---

### Reclamo MENOR

**Definición**:
> La pureza, identidad, seguridad o eficacia del producto **no puede estar afectada**. La continuidad del negocio no puede verse afectada ni la imagen de Vetanco puede estar comprometida.

**Características**:
- Producto íntegro y funcional
- No afecta salud, negocio o imagen
- Puede referirse a aspectos menores
- Investigación de rutina
- Respuesta en 5-7 días

**Ejemplos**:
- Envase con pequeña abolladura sin afectar contenido
- Etiqueta con mínimas irregularidades estéticas
- Empaque externo dañado (producto intacto)
- Diferencia mínima en color/textura (dentro de tolerancia)
- Solicitud de información de lote (sin problema aparente)

**Keywords**:
`envase`, `empaque`, `estético`, `externo`, `mínimo`, `pequeño`, `leve`

**Acciones**:
1. Registro en sistema en 24 horas
2. Investigación de rutina
3. Respuesta en 5-7 días
4. Puede no requerir acciones correctivas

---

## Justificación de Casos

### Justificado (Genuino, Confirmado)

**Definición**:
> Cuando la investigación **demuestra y evidencia** el evento/falla/defecto reclamado.

**Características**:
- Investigación confirma el problema reportado
- Evidencia documental o de laboratorio
- Incumplimiento real demostrado
- Requiere acciones correctivas y preventivas
- Se registra en sistema de calidad

**Proceso**:
1. Investigación formal
2. Análisis de lote (si aplica)
3. Recolección de evidencias
4. Informe de conclusiones
5. Determinación de causa raíz
6. Plan de acciones correctivas
7. Plan de acciones preventivas

---

### No Justificado (Injustificado, No Genuino, No Confirmado)

**Definición**:
> Cuando la investigación **demuestra y evidencia** que NO existe el evento/falla/defecto reclamado.

**Características**:
- Investigación descarta el problema reportado
- Producto cumple especificaciones
- Puede deberse a mal uso o malentendido
- No requiere acciones correctivas sobre el producto
- Puede requerir capacitación del cliente

**Causas Comunes**:
- Mal uso del producto
- Almacenamiento incorrecto por parte del cliente
- Expectativas incorrectas
- Falta de información técnica
- Problema no relacionado al producto
- Error en la interpretación

**Acciones**:
1. Informe de investigación
2. Comunicación al cliente explicando hallazgos
3. Capacitación/asistencia técnica si es necesario
4. Registro para análisis de tendencias

---

### Pendiente de Investigación

**Definición**:
> Estado inicial de todos los casos antes de que el área de Calidad complete la investigación.

**Características**:
- Estado default al crear el caso
- Clasificación automática es tentativa
- Requiere validación por personal de Calidad
- Puede cambiar de tipo o criticidad tras investigación

---

## Estados del Producto

### Usado

Producto que ya fue aplicado/utilizado parcial o totalmente antes de detectar el problema.

**Implicaciones**:
- Puede haber impacto en animales
- Requiere seguimiento de resultados
- Mayor prioridad en investigación

### Sin Usar

Producto que no ha sido aplicado/utilizado cuando se detecta el problema.

**Implicaciones**:
- No hay impacto en animales
- Permite análisis del producto original
- Puede devolver producto para análisis

### Envase Roto

Envase primario o secundario con daño físico visible.

**Implicaciones**:
- Puede comprometer esterilidad
- Puede afectar estabilidad del producto
- Requiere evaluación de integridad del contenido
- Importante determinar cuándo ocurrió el daño

### Envase Sano

Envase sin daños aparentes.

**Implicaciones**:
- Problema probablemente en el contenido
- Descarta problemas de transporte/manipulación
- Enfoca investigación en proceso productivo

---

## Estados del Caso

### Nuevo

Caso recién registrado en el sistema. Aún no ha sido asignado para investigación.

### En Investigación

Caso asignado a un investigador del área de Calidad. En proceso de análisis.

### Resuelto

Investigación completada, con conclusiones y acciones definidas. Esperando cierre formal.

### Cerrado

Caso completamente finalizado con comunicación al cliente y acciones implementadas.

### Cancelado

Caso que no procede (duplicado, error, retractación del cliente, etc.).

---

## Ejemplos Prácticos

### Ejemplo 1: Reclamo Crítico Justificado

**Reporte del Cliente**:
"Aplicamos el antiparasitario Vetancilina lote ABC123 en 50 bovinos y 3 animales murieron a las 6 horas. Los demás presentan síntomas de intoxicación."

**Clasificación Inicial**:
- Tipo: Reclamo
- Criticidad: Crítico
- Justificación: Pendiente investigación

**Investigación**:
- Análisis de lote: contaminación con componente no autorizado
- Análisis de animales: confirma intoxicación

**Clasificación Final**:
- Tipo: Reclamo
- Criticidad: Crítico
- Justificación: Justificado

**Acciones**:
- Retiro inmediato del lote
- Compensación al cliente
- Investigación de causa raíz en producción
- Acciones correctivas en proceso
- Notificación a autoridades sanitarias

---

### Ejemplo 2: Queja No Justificada

**Reporte del Cliente**:
"El producto llegó 2 días después de lo que esperaba. Es inaceptable."

**Clasificación Inicial**:
- Tipo: Queja
- Criticidad: No aplica
- Justificación: Pendiente investigación

**Investigación**:
- Revisión de orden de compra: plazo de entrega era 5-7 días
- Producto entregado en día 6
- Dentro del plazo acordado

**Clasificación Final**:
- Tipo: Queja
- Criticidad: No aplica
- Justificación: No justificado

**Acciones**:
- Comunicación al cliente explicando plazos
- Registro para análisis de expectativas
- Posible mejora en comunicación de plazos

---

### Ejemplo 3: Comentario (Asistencia Técnica)

**Reporte del Cliente**:
"¿Cuál es la dosis correcta de Vetancilina para cerdos de 80kg?"

**Clasificación**:
- Tipo: Comentario
- Criticidad: No aplica
- Justificación: No aplica

**Acciones**:
- Asistencia técnica proporciona información
- Registro de consulta
- No requiere investigación de calidad

---

### Ejemplo 4: Reclamo Mayor Justificado

**Reporte del Cliente**:
"Recibimos 10 frascos de Vetancilina 100ml pero todos tienen solo 85ml. Hicimos la medición."

**Clasificación Inicial**:
- Tipo: Reclamo
- Criticidad: Mayor
- Justificación: Pendiente investigación

**Investigación**:
- Análisis de lote: confirma subvolumen en lote completo
- Falla en calibración de llenadora

**Clasificación Final**:
- Tipo: Reclamo
- Criticidad: Mayor
- Justificación: Justificado

**Acciones**:
- Reposición de producto
- Retención de lote
- Calibración de equipo
- Acciones correctivas en proceso de llenado

---

## Matriz de Decisión

### Tabla de Clasificación

| **Descripción del Caso** | **Tipo** | **Criticidad** | **Justificación** |
|---------------------------|----------|----------------|-------------------|
| Muerte de animales tras uso | Reclamo | Crítico | Pendiente → Confirmar |
| Intoxicación animal confirmada | Reclamo | Crítico | Justificado |
| Producto contaminado (sin uso aún) | Reclamo | Mayor | Pendiente → Confirmar |
| Envase roto, producto expuesto | Reclamo | Mayor | Pendiente → Confirmar |
| Cantidad incorrecta | Reclamo | Mayor | Pendiente → Confirmar |
| Envase abollado (producto OK) | Reclamo | Menor | Pendiente → Confirmar |
| Demora en entrega (fuera de plazo) | Reclamo | Menor | Pendiente → Confirmar |
| Demora en entrega (dentro de plazo) | Queja | No aplica | No justificado |
| Insatisfacción con atención | Queja | No aplica | No aplica |
| Consulta sobre dosis | Comentario | No aplica | No aplica |
| Sugerencia de nuevo producto | Comentario | No aplica | No aplica |

---

## Flujo de Clasificación

### Paso 1: Clasificación Automática (Chatbot)

```
Análisis de keywords en descripción
  ↓
¿Contiene keywords críticos?
  SÍ → Pre-clasificar como RECLAMO CRÍTICO
  NO → Continuar
  ↓
¿Contiene keywords de reclamo?
  SÍ → Pre-clasificar como RECLAMO MAYOR/MENOR
  NO → Continuar
  ↓
¿Contiene keywords de queja?
  SÍ → Pre-clasificar como QUEJA
  NO → Pre-clasificar como COMENTARIO
  ↓
Justificación = PENDIENTE_INVESTIGACION
```

### Paso 2: Revisión Manual (Área de Calidad)

```
Personal de Calidad revisa caso
  ↓
Asigna investigador
  ↓
Investigador analiza evidencias
  ↓
Determina si es justificado o no
  ↓
Ajusta tipo y criticidad si es necesario
  ↓
Marca justificación como JUSTIFICADO o NO_JUSTIFICADO
  ↓
Genera informe de investigación
```

---

## Reglas de Negocio

### Regla 1: Criticidad solo en Reclamos

```sql
CHECK (
  (tipo_caso = 'reclamo' AND criticidad IN ('critico', 'mayor', 'menor')) OR
  (tipo_caso != 'reclamo' AND criticidad = 'no_aplica')
)
```

### Regla 2: Justificación inicial

Todos los casos inician con `justificacion = 'pendiente_investigacion'`, excepto comentarios que pueden ser `no_aplica`.

### Regla 3: Escalamiento por Criticidad

- **Crítico**: Notificación inmediata a Gerente de Calidad
- **Mayor**: Notificación a Jefe de Calidad en < 4 horas
- **Menor**: Asignación normal de casos

### Regla 4: Cambios de Clasificación

Todo cambio en tipo, criticidad o justificación debe:
1. Registrarse en tabla `clasificaciones`
2. Incluir motivo del cambio
3. Incluir responsable del cambio
4. Mantener historial completo

---

## Glosario

**Caso**: Registro de reclamo, queja o comentario

**Cliente**: Persona o empresa que reporta el caso

**Colaborador**: Empleado de Vetanco que gestiona casos

**Lote**: Número de identificación de producción del producto

**Remito**: Comprobante de entrega del producto

**Investigación**: Proceso formal de análisis del caso

**Acción Correctiva**: Medida para eliminar causa del problema

**Acción Preventiva**: Medida para evitar recurrencia

**Causa Raíz**: Origen fundamental del problema

**Evidencia**: Documentación que respalda la investigación

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
**Referencia**: Documentación interna Vetanco S.A.
