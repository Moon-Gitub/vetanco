# Casos de Uso - Sistema Vetanco

## Índice

1. [Caso 1: Reclamo Crítico - Cliente Directo](#caso-1-reclamo-crítico---cliente-directo)
2. [Caso 2: Reclamo Mayor - Colaborador](#caso-2-reclamo-mayor---colaborador)
3. [Caso 3: Queja - Demora en Entrega](#caso-3-queja---demora-en-entrega)
4. [Caso 4: Comentario - Consulta Técnica](#caso-4-comentario---consulta-técnica)
5. [Caso 5: Reclamo con Múltiples Productos](#caso-5-reclamo-con-múltiples-productos)
6. [Caso 6: Cliente Existente](#caso-6-cliente-existente)
7. [Escenarios de Error](#escenarios-de-error)

---

## Caso 1: Reclamo Crítico - Cliente Directo

### Contexto

Cliente reporta intoxicación animal grave tras uso de producto.

### Flujo Completo

```
[Usuario envía mensaje inicial]
Usuario: Hola, tengo un problema grave con un producto

Bot: Buenos días. Le damos la bienvenida al asistente de Vetanco...

Bot: ¿Usted es el cliente o un colaborador de Vetanco?
[Botones: "Soy el cliente" | "Soy colaborador de Vetanco"]

Usuario: [Click en "Soy el cliente"]

Bot: Por favor, complete los siguientes datos...
     ¿Cuál es su nombre y apellido completo?

Usuario: Roberto Fernández

Bot: Necesito su dirección completa...

Usuario: Ruta 3 Km 245, Establecimiento San Jorge, Partido de Junín, Buenos Aires, CP 6000

Bot: ¿Cuál es su teléfono de contacto?

Usuario: 236-4567890

Bot: ¿Tiene correo electrónico?

Usuario: roberto@sanjorge.com.ar

Bot: Por favor indique la razón social de su empresa y el CUIT.

Usuario: Establecimiento San Jorge SRL, CUIT 30-67890123-4

Bot: ¿Tiene el número de remito del pedido?

Usuario: Sí, remito 0005-00003456

Bot: Perfecto. Ahora necesito información sobre el producto afectado.
     ¿Cuál es el nombre y presentación del producto?

Usuario: Vetancilina Inyectable 500ml

Bot: Indique el número de lote y fecha de vencimiento.

Usuario: Lote VET20251015, vence 10/2026

Bot: ¿Cuál es el estado del producto?
[Botones: "Usado" | "Sin usar" | "Envase roto" | "Envase sano"]

Usuario: [Click en "Usado"]

Bot: ¿Qué cantidad está afectada?

Usuario: 5 frascos de 500ml

Bot: ¿Tiene fotos, videos o documentos del producto?

Usuario: Sí, tengo fotos
[Usuario envía 3 fotos]

Bot: ✓ 3 archivos recibidos
     ¿Desea enviar más archivos o continuamos?

Usuario: Continuar

Bot: Ahora necesito que describa lo ocurrido.
     Por favor, indique brevemente qué sucedió con el producto.

Usuario: Apliqué el producto a 80 bovinos de engorde siguiendo las indicaciones.
A las 6 horas, 5 animales presentaron síntomas graves de intoxicación: temblores,
salivación excesiva, dificultad respiratoria. 2 animales murieron esa misma noche.
Los demás están en tratamiento veterinario.

Bot: ¿Dónde ocurrió el incidente?

Usuario: En los corrales del sector norte del establecimiento San Jorge

Bot: ¿Cuándo ocurrió? Indique fecha y hora aproximada.

Usuario: Ayer 17 de octubre a las 8:00 am apliqué el producto. Los síntomas
aparecieron a las 14:00 hs.

Bot: ¿Hay algún comentario u observación adicional?

Usuario: Tengo informe del veterinario actuante. Todos los animales están bajo
el mismo manejo, misma alimentación. Solo cambia que este lote es nuevo,
el anterior no tuvo problemas.

Bot: Perfecto. He registrado la siguiente información:

     Cliente: Roberto Fernández (Establecimiento San Jorge SRL)
     Producto: Vetancilina Inyectable 500ml, Lote VET20251015
     Estado: Usado (5 frascos)
     Incidente: Intoxicación grave en bovinos, 2 muertes
     Ubicación: Establecimiento San Jorge, Junín
     Fecha: 17/10/2025 08:00 hs

     ¿La información es correcta?
     [Botones: "Sí" | "Modificar"]

Usuario: Sí

Bot: El registro de su caso ha sido completado correctamente.

     📋 El número asignado es: VET-2025-00125

     ⚠️ Debido a la criticidad reportada, este caso ha sido marcado como URGENTE
     y el equipo de Calidad ha sido notificado inmediatamente.

     Un especialista se comunicará con usted en las próximas 4 horas para coordinar
     las acciones necesarias.

     Por favor, conserve:
     - Los frascos utilizados (incluso vacíos)
     - Los frascos sin usar del mismo lote
     - Todas las evidencias relacionadas

     Agradecemos que se haya comunicado con Vetanco. Su caso será tratado con
     la máxima prioridad.

     ¿Hay algo más en lo que pueda ayudarle?

Usuario: No, gracias

Bot: Quedamos a su disposición. Cualquier consulta adicional sobre el caso
     VET-2025-00125, no dude en contactarnos.
```

### Datos Guardados en Supabase

**Tabla: casos**
```sql
numero_caso: VET-2025-00125
tipo_caso: reclamo
criticidad: critico
justificacion: pendiente_investigacion
estado: nuevo
canal: whatsapp
descripcion_que_sucedio: "Apliqué el producto a 80 bovinos... 2 animales murieron"
descripcion_cuando_ocurrio: 2025-10-17 08:00:00
```

**Tabla: clientes**
```sql
nombre_apellido: Roberto Fernández
razon_social: Establecimiento San Jorge SRL
cuit: 30-67890123-4
direccion: Ruta 3 Km 245, Junín, Buenos Aires
```

**Tabla: productos_afectados**
```sql
nombre_producto: Vetancilina Inyectable 500ml
numero_lote: VET20251015
estado_producto: usado
cantidad_afectada: 5
```

**Tabla: adjuntos**
```sql
3 registros con tipo: foto
```

### Acciones Automáticas del Sistema

1. **Clasificación automática**: `critico` detectado por keywords "muerte", "intoxicación"
2. **Notificación inmediata** vía email/SMS al Gerente de Calidad
3. **Alerta en dashboard** para casos críticos
4. **SLA tracking**: Timer de 4 horas para primera respuesta

---

## Caso 2: Reclamo Mayor - Colaborador

### Contexto

Colaborador de Ventas registra reclamo de cliente por envase roto.

### Flujo Resumido

```
Usuario (Colaborador): Hola, necesito registrar un reclamo de un cliente

Bot: Bienvenida...

Bot: ¿Cliente o colaborador?
Usuario: Soy colaborador de Vetanco

Bot: Indique su nombre y apellido.
Usuario: Laura Martínez

Bot: ¿Cargo?
Usuario: Ejecutiva de Ventas

Bot: ¿Área?
Usuario: Ventas Zona Norte

Bot: Nombre del cliente...
Usuario: José González

Bot: Razón social y CUIT...
Usuario: Veterinaria El Trébol SA, CUIT 30-55555555-5

[... Captura resto de datos del cliente ...]

Bot: Nombre y presentación del producto...
Usuario: Vetancilina Spray 200ml

Bot: Lote y vencimiento...
Usuario: Lote VET20250920, vence 09/2027

Bot: ¿Estado del producto?
Usuario: Envase roto

Bot: ¿Cantidad afectada?
Usuario: 15 unidades

Usuario: [Envía fotos de los envases rotos]

Bot: ¿Qué sucedió?
Usuario: El cliente recibió el pedido y 15 frascos llegaron con el envase roto.
         Parece que hubo mal manejo en el transporte.

Bot: ¿Dónde ocurrió?
Usuario: Veterinaria El Trébol, San Isidro

Bot: ¿Cuándo?
Usuario: Hoy por la mañana, hace 2 horas

[... Confirmación ...]

Bot: Número de caso: VET-2025-00126
     Clasificación: RECLAMO MAYOR
     El área de Logística ha sido notificada para coordinación de reposición.
```

### Clasificación

- **Tipo**: Reclamo
- **Criticidad**: Mayor (producto afectado, pero sin uso ni riesgo)
- **Justificación**: Pendiente investigación
- **Acción inmediata**: Notificar a Logística para reposición

---

## Caso 3: Queja - Demora en Entrega

### Flujo Resumido

```
Usuario: Buenos días, quiero hacer un reclamo por demora

Bot: Bienvenida...

[... Captura de datos cliente ...]

Bot: ¿Qué sucedió?
Usuario: Hice un pedido hace 10 días y todavía no llegó. Prometieron 7 días.

Bot: ¿Dónde debía llegar?
Usuario: A mi veterinaria en Mar del Plata

Bot: ¿Cuándo hizo el pedido?
Usuario: El 8 de octubre

Bot: ¿Observaciones?
Usuario: Necesito el producto urgente, tengo clientes esperando

[... Confirmación ...]

Bot: Número de caso: VET-2025-00127
```

### Investigación Posterior

```
El sistema verifica en base de datos:
- Fecha pedido: 08/10/2025
- Plazo acordado: 7-10 días hábiles
- Fecha actual: 18/10/2025 (8 días hábiles)

Conclusión: Plazo aún dentro del rango acordado
Reclasificación: De "reclamo" a "queja"
Justificación: No justificado (dentro de plazo acordado)

Acción: Comunicar al cliente los plazos correctos y
        ofrecer tracking del envío.
```

---

## Caso 4: Comentario - Consulta Técnica

### Flujo Simplificado

```
Usuario: Hola, tengo una duda sobre dosificación

Bot: Bienvenida...

Bot: He identificado que su consulta parece ser sobre información técnica.
     ¿Desea que lo derive con Asistencia Técnica o prefiere registrar un caso formal?
     [Botones: "Asistencia Técnica" | "Registrar caso"]

Usuario: Asistencia Técnica

Bot: Perfecto. Para poder ayudarlo mejor, necesito algunos datos básicos.
     ¿Su nombre?

Usuario: Mario López

Bot: ¿Su consulta es para uso profesional o personal?
Usuario: Soy veterinario

Bot: ¿Sobre qué producto tiene la consulta?
Usuario: Vetancilina Inyectable

Bot: Por favor, describa su consulta.
Usuario: ¿Cuál es la dosis correcta para cerdos de 80kg?

Bot: Excelente. He registrado su consulta como COMENTARIO.
     Número: VET-2025-00128

     Un especialista de Asistencia Técnica le responderá por este mismo medio
     en las próximas 2 horas.
```

### Clasificación

- **Tipo**: Comentario
- **Criticidad**: No aplica
- **Requiere**: Respuesta de Asistencia Técnica
- **SLA**: 2 horas para respuesta

---

## Caso 5: Reclamo con Múltiples Productos

### Flujo

```
[... Captura de datos iniciales ...]

Bot: ¿El incidente afecta a un solo producto o múltiples?
     [Botones: "Un producto" | "Múltiples productos"]

Usuario: Múltiples productos

Bot: Entendido. Vamos a registrar cada producto por separado.

     PRODUCTO 1:
     Nombre y presentación...

Usuario: Vetancilina Spray 200ml

Bot: Lote y vencimiento...
Usuario: Lote ABC001, vence 12/2026

[... Captura resto de datos producto 1 ...]

Bot: ✓ Producto 1 registrado: Vetancilina Spray 200ml

     ¿Desea agregar otro producto?
     [Botones: "Sí, agregar otro" | "No, continuar"]

Usuario: Sí, agregar otro

Bot: PRODUCTO 2:
     Nombre y presentación...

Usuario: Vetancilina Inyectable 500ml

[... Captura producto 2 ...]

Bot: ✓ Producto 2 registrado
     ¿Agregar otro?

Usuario: No, continuar

Bot: Perfecto. 2 productos registrados.
     Ahora, describa qué sucedió...

[... Continúa con descripción del incidente ...]
```

### Datos en Supabase

**Tabla: productos_afectados**
```sql
-- Dos registros con el mismo caso_id
caso_id: uuid-caso-129
producto 1: Vetancilina Spray 200ml, Lote ABC001
producto 2: Vetancilina Inyectable 500ml, Lote XYZ789
```

---

## Caso 6: Cliente Existente

### Flujo con Detección

```
Bot: Razón social y CUIT...
Usuario: Agropecuaria Los Pinos SA, CUIT 30-12345678-9

[Sistema busca en BD y encuentra cliente existente]

Bot: 🔍 Hemos encontrado que ya está registrado con los siguientes datos:

     Nombre: Juan Pérez
     Empresa: Agropecuaria Los Pinos SA
     CUIT: 30-12345678-9
     Dirección: Av. Rivadavia 1234, CABA
     Teléfono: 11-5555-1234
     Email: juan@ejemplo.com

     ¿Son correctos estos datos?
     [Botones: "Sí, usar estos datos" | "No, actualizar"]

Usuario: Sí, usar estos datos

Bot: Perfecto. Continuamos con los datos del producto...

[Sistema usa cliente_id existente, ahorra tiempo de captura]
```

---

## Escenarios de Error

### Error 1: Timeout sin Respuesta

```
[Usuario no responde durante 5 minutos]

Bot: No hemos recibido su respuesta en los últimos minutos.

     ¿Desea continuar con el registro del caso?
     [Botones: "Continuar" | "Cancelar"]

[Si no responde en 3 minutos más]

Bot: Entendemos que puede estar ocupado.

     Hemos guardado su progreso. Puede retomar el registro en cualquier
     momento enviando un mensaje.

     Datos guardados:
     - Nombre: Roberto Fernández
     - Empresa: Establecimiento San Jorge

     Estado: Registro pausado
```

### Error 2: CUIT Inválido

```
Usuario: Mi CUIT es 1234567890

Bot: ❌ El CUIT proporcionado no tiene formato válido.

     El formato correcto es: XX-XXXXXXXX-X (11 dígitos)
     Ejemplo: 30-12345678-9

     Por favor, verifique e intente nuevamente.

Usuario: 30-12345678-9

Bot: ✓ CUIT válido. Continuamos...
```

### Error 3: Producto No Encontrado

```
Usuario: Vetancimax Ultra Plus Mega

Bot: 🔍 No encontramos ese producto en nuestro catálogo.

     ¿Podría verificar el nombre? Algunos productos comunes:
     - Vetancilina Inyectable
     - Vetancilina Spray
     - Vetanmax Plus
     - Vetandex 500

     O escriba el nombre como aparece en el envase.

Usuario: Ah sí, es Vetancilina Inyectable

Bot: ✓ Producto encontrado. Continuamos...
```

### Error 4: Fecha Inválida

```
Usuario: Pasó hace mucho

Bot: Para registrar correctamente el caso necesito una fecha aproximada.

     Puede indicar:
     - Fecha exacta: "15 de octubre"
     - Relativa: "hace 3 días", "la semana pasada", "ayer"

     ¿Cuándo ocurrió aproximadamente?

Usuario: Hace 2 semanas

Bot: ✓ Registrado: Aproximadamente 04/10/2025
```

---

## Métricas de Casos

### Tiempos Promedio por Tipo

| Tipo | Tiempo Chatbot | SLA Primera Respuesta |
|------|----------------|------------------------|
| Crítico | 12-15 min | 4 horas |
| Mayor | 10-12 min | 48 horas |
| Menor | 8-10 min | 7 días |
| Queja | 8-10 min | 48 horas |
| Comentario | 5-7 min | 2 horas |

### Tasa de Completitud

- **Casos completos**: 92%
- **Casos abandonados**: 5%
- **Casos con errores**: 3%

---

## Casos Especiales

### Caso: Cliente Sin Remito

```
Bot: ¿Tiene el número de remito?
Usuario: No, no lo encuentro

Bot: Entendido. ¿Tiene la fecha aproximada de compra o algún número de pedido?
Usuario: Compré hace 1 mes en la sucursal de Rosario

Bot: Perfecto. Registraré: "Compra aprox 18/09/2025 - Sucursal Rosario - Sin remito"

     El equipo de Administración buscará el registro de la compra.
```

### Caso: Múltiples Lotes Afectados

```
Usuario: Tengo 3 lotes distintos con el mismo problema

Bot: Entendido. Por favor indique los 3 números de lote separados por comas.
Usuario: ABC123, ABC124, ABC125

Bot: ✓ Registrados 3 lotes:
     - ABC123
     - ABC124
     - ABC125

     Todos del mismo producto: Vetancilina Inyectable
```

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
