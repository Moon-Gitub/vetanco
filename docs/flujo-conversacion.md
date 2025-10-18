# Flujo de Conversación del Chatbot - Sistema Vetanco

## Diagrama de Flujo Completo

```
[INICIO]
   ↓
[Mensaje de Bienvenida]
   ↓
[¿Cliente o Colaborador?]
   ├──→ [Cliente] ──────────────┐
   │                             ↓
   └──→ [Colaborador] ──→ [Datos Colaborador]
                           ↓
                    [Datos del Cliente]
                           ↓
                    ┌──────┴──────┐
                    ↓
[Validar Cliente existente]
                    ↓
         [Datos del Producto]
                    ↓
      [Datos del Producto Afectado]
                    ↓
         [Solicitar Adjuntos (opcional)]
                    ↓
        [Descripción del Incidente]
           - ¿Qué sucedió?
           - ¿Dónde ocurrió?
           - ¿Cuándo ocurrió?
           - Observaciones
                    ↓
       [Clasificación Automática]
                    ↓
          [Guardar en Supabase]
                    ↓
        [Generar Número de Caso]
                    ↓
           [Mensaje de Cierre]
                    ↓
                 [FIN]
```

---

## 1. Bienvenida

### Bot dice:

```
Buenos días. Le damos la bienvenida al asistente de Vetanco para la gestión de reclamos, quejas y comentarios.

A continuación, se solicitarán algunos datos necesarios para registrar su caso y asignar un número de identificación.
```

**Nodo**: `SendTextNode`
**Siguiente**: Pregunta tipo de usuario

---

## 2. Identificación del Usuario

### Bot dice:

```
Antes de continuar, necesito saber si usted es el cliente que realiza el reclamo o un colaborador de Vetanco que lo está registrando en nombre del cliente.
```

**Opciones (botones):**
- `Soy el cliente`
- `Soy colaborador de Vetanco`

**Nodo**: `SendTextNode` + `WaitForResponseNode`
**Siguiente**: DecideNode basado en respuesta

---

## 3A. Flujo Cliente Directo

### Bot dice:

```
Por favor, complete los siguientes datos para poder registrar correctamente el reclamo.
```

### 3A.1 Nombre y Apellido

**Bot**: `¿Cuál es su nombre y apellido completo?`

**Usuario**: `Juan Pérez`

**Validación**: No vacío, mínimo 3 caracteres

---

### 3A.2 Dirección Completa

**Bot**: `Necesito su dirección completa. Por favor indique: calle, número, localidad, provincia y código postal.`

**Usuario**: `Av. Rivadavia 1234, Piso 2, CABA, CP 1000`

**Validación**: Debe contener al menos calle y localidad

---

### 3A.3 Teléfono

**Bot**: `¿Cuál es su teléfono de contacto?`

**Usuario**: `11-5555-1234`

**Validación**: Formato telefónico válido

---

### 3A.4 Email (opcional)

**Bot**: `¿Tiene correo electrónico? (Opcional si está usando WhatsApp)`

**Usuario**: `juan@ejemplo.com` o `No tengo`

**Validación**: Si proporcionado, validar formato email

---

### 3A.5 Razón Social y CUIT

**Bot**: `Por favor indique la razón social de su empresa y el CUIT.`

**Usuario**: `Agropecuaria Los Pinos SA, CUIT 30-12345678-9`

**Validación**:
- CUIT: 11 dígitos, formato XX-XXXXXXXX-X
- Razón social: no vacío

**Si CUIT inválido:**
```
El CUIT proporcionado no tiene formato válido.
El formato correcto es: XX-XXXXXXXX-X (11 dígitos).
Por favor, verifique e intente nuevamente.
```

---

### 3A.6 Número de Remito

**Bot**: `¿Tiene el número de remito del pedido?`

**Usuario**: `Remito N° 0001-00012345`

**Validación**: No vacío

---

## 3B. Flujo Colaborador Vetanco

### Bot dice:

```
Por favor, complete sus datos y los del cliente para quien se está realizando el reclamo.
```

### 3B.1 Datos del Colaborador

**Bot**: `Indique su nombre y apellido completo.`

**Usuario**: `María González`

---

**Bot**: `¿Cuál es su cargo o puesto?`

**Usuario**: `Asesora de Ventas`

---

**Bot**: `¿A qué área pertenece? (Ventas / Asistencia Técnica / Administración / Otra)`

**Usuario**: `Ventas`

---

### 3B.2 Datos del Cliente

**Bot**: `Ahora necesito los datos del cliente. ¿Cuál es el nombre y apellido del cliente?`

**Usuario**: `Juan Pérez`

---

**Bot**: `Razón social y CUIT del cliente.`

**Usuario**: `Agropecuaria Los Pinos SA, CUIT 30-12345678-9`

---

**Bot**: `Dirección completa del cliente.`

**Usuario**: `Av. Rivadavia 1234, CABA`

---

**Bot**: `Teléfono de contacto del cliente.`

**Usuario**: `11-5555-1234`

---

**Bot**: `Correo electrónico del cliente.`

**Usuario**: `juan@ejemplo.com`

---

**Bot**: `Número de remito del pedido.`

**Usuario**: `Remito N° 0001-00012345`

---

## 4. Datos del Producto

### Bot dice:

```
Ahora necesito información sobre el producto afectado.
```

### 4.1 Nombre y Presentación

**Bot**: `¿Cuál es el nombre y presentación del producto?`

**Ejemplo**: `Vetancilina 100ml`

**Usuario**: `Vetancilina 100ml`

**Validación**: Buscar en catálogo de productos (opcional)

---

### 4.2 Número de Lote y Vencimiento

**Bot**: `Indique el número de lote y la fecha de vencimiento.`

**Usuario**: `Lote ABC123, vence 12/2026`

**Validación**:
- Lote: alfanumérico
- Fecha: formato válido

---

### 4.3 Estado del Producto

**Bot**: `¿Cuál es el estado del producto?`

**Opciones (botones):**
- `Usado`
- `Sin usar`
- `Envase roto`
- `Envase sano`

**Usuario**: Selecciona opción

---

### 4.4 Cantidad Afectada

**Bot**: `¿Qué cantidad está afectada? Indique número y unidad (kg, litros, unidades, etc.)`

**Usuario**: `10 frascos` o `5 litros`

**Validación**: Extraer número y unidad

---

### 4.5 Adjuntos (opcional)

**Bot**: `¿Tiene fotos, videos o documentos del producto que desee adjuntar? Puede enviarlos ahora o escribir "No" si no tiene.`

**Usuario**: Envía fotos/videos o escribe "No"

**Si envía archivos:**
```
✓ Archivo recibido: foto_producto.jpg
¿Desea enviar más archivos o continuamos? (Más / Continuar)
```

---

## 5. Descripción del Incidente

### Bot dice:

```
Ahora necesito que me describa lo ocurrido con el mayor detalle posible.
```

### 5.1 ¿Qué sucedió?

**Bot**: `Por favor, indique brevemente qué sucedió con el producto.`

**Usuario**: `Al aplicar el producto en 50 bovinos, 3 animales presentaron síntomas de intoxicación a las 6 horas.`

**Validación**: Mínimo 20 caracteres

**Keywords detectados**: `intoxicación`, `síntomas` → Posible RECLAMO CRÍTICO

---

### 5.2 ¿Dónde ocurrió?

**Bot**: `¿Dónde ocurrió el incidente? (Establecimiento, ubicación, etc.)`

**Usuario**: `Establecimiento Las Rosas, partido de Tandil, Buenos Aires`

---

### 5.3 ¿Cuándo ocurrió?

**Bot**: `¿Cuándo ocurrió? Indique fecha y hora aproximada.`

**Usuario**: `Ayer 15/10 a las 14:00 hs` o `Hace 2 días`

**Validación**: Interpretar fecha relativa o absoluta

---

### 5.4 Observaciones Adicionales

**Bot**: `¿Hay algún comentario u observación adicional que considere importante?`

**Usuario**: `Los animales fueron atendidos por veterinario. Adjunto informe.` o `No`

---

### Resumen de Información

**Bot**:

```
Perfecto. He registrado la siguiente información:

Cliente: Juan Pérez (Agropecuaria Los Pinos SA)
Producto: Vetancilina 100ml, Lote ABC123
Estado: Usado
Incidente: Síntomas de intoxicación en bovinos tras aplicación
Ubicación: Establecimiento Las Rosas, Tandil
Fecha: 15/10/2025

¿La información es correcta? (Sí / Modificar)
```

**Si usuario dice "Sí"**: Continuar

**Si usuario dice "Modificar"**: Permitir corrección

---

## 6. Clasificación Automática

**Proceso interno (no visible al usuario):**

```javascript
// Análisis de keywords
const descripcion = "síntomas de intoxicación en bovinos";
const keywordsCritico = ["muerte", "intoxicación", "grave"];

if (keywordsCritico.some(k => descripcion.includes(k))) {
  tipoCaso = "reclamo";
  criticidad = "critico";
} else {
  // Lógica adicional de clasificación
}
```

---

## 7. Registro y Cierre

### Bot dice:

```
El registro de su caso ha sido completado correctamente.

📋 El número asignado es: VET-2025-00123

El equipo de Calidad de Vetanco realizará la investigación correspondiente para brindarle la mejor respuesta posible.

Puede utilizar este número para hacer seguimiento de su caso.

Agradecemos que se haya comunicado con Vetanco. Su aporte es fundamental para mejorar nuestros procesos y para seguir garantizando la calidad de nuestros productos y servicios.

¿Hay algo más en lo que pueda ayudarle?
```

**Opciones:**
- `No, gracias` → Finalizar
- `Sí, tengo otra consulta` → Reiniciar flujo o derivar a humano

---

## Manejo de Errores y Excepciones

### Timeout sin Respuesta

**Después de 5 minutos sin respuesta:**

```
No hemos recibido su respuesta en los últimos minutos.

¿Desea continuar con el registro del caso?
- Continuar
- Cancelar
```

**Si no responde en 3 minutos más**: Guardar progreso parcial y enviar mensaje:

```
Entendemos que puede estar ocupado.

Hemos guardado su progreso. Puede retomar el registro en cualquier momento enviando un mensaje.
```

---

### Respuesta No Entendida

**Si el bot no entiende la respuesta:**

```
Disculpe, no he podido entender su respuesta.

Por favor, reformule o proporcione la información solicitada.
```

---

### Error al Guardar

**Si falla el guardado en Supabase:**

```
Ha ocurrido un error temporal al guardar la información.

Estamos trabajando para resolverlo. Por favor, intente nuevamente en unos minutos.

Su información no se ha perdido y será procesada.
```

---

### Cliente Existente Detectado

**Si se detecta cliente existente por CUIT:**

```
Hemos encontrado que ya está registrado en nuestro sistema con los siguientes datos:

Nombre: Juan Pérez
Empresa: Agropecuaria Los Pinos SA
Teléfono: 11-5555-1234

¿Son correctos estos datos?
- Sí, usar estos datos
- No, actualizar información
```

---

## Variaciones del Flujo

### Flujo Simplificado para Comentarios

Si el bot detecta que es un comentario/consulta simple:

```
Usuario: "¿Cuál es la dosis de Vetancilina para cerdos de 80kg?"

Bot: He identificado que su consulta es sobre información técnica del producto.

¿Desea que lo derive con el área de Asistencia Técnica o prefiere registrar un caso formal?
- Asistencia Técnica
- Registrar caso formal
```

---

### Múltiples Productos Afectados

```
Bot: ¿El incidente afecta a un solo producto o a múltiples productos?
- Un producto
- Múltiples productos

[Si múltiples]:
Bot: Vamos a registrar el primer producto.
Luego le preguntaré por los demás.

[Después de capturar primer producto]:
Bot: Producto 1 registrado. ¿Desea agregar otro producto?
- Sí, agregar otro
- No, continuar
```

---

## Tiempos Estimados

| **Etapa** | **Tiempo Estimado** |
|-----------|---------------------|
| Bienvenida e identificación | 1-2 min |
| Datos del cliente | 3-5 min |
| Datos del producto | 2-3 min |
| Descripción del incidente | 3-5 min |
| Clasificación y cierre | 1 min |
| **TOTAL** | **10-16 min** |

---

## Ejemplos de Conversaciones Completas

### Ejemplo 1: Cliente Directo - Reclamo Crítico

```
[1] Bot: Buenos días. Le damos la bienvenida al asistente de Vetanco...

[2] Bot: ¿Usted es el cliente o un colaborador de Vetanco?
    Usuario: Soy el cliente

[3] Bot: ¿Cuál es su nombre y apellido completo?
    Usuario: Juan Pérez

[4] Bot: Necesito su dirección completa...
    Usuario: Av. Rivadavia 1234, CABA

[5] Bot: ¿Cuál es su teléfono de contacto?
    Usuario: 11-5555-1234

[6] Bot: ¿Tiene correo electrónico?
    Usuario: juan@ejemplo.com

[7] Bot: Razón social y CUIT...
    Usuario: Agropecuaria Los Pinos SA, CUIT 30-12345678-9

[8] Bot: ¿Tiene el número de remito?
    Usuario: Remito 0001-00012345

[9] Bot: Nombre y presentación del producto...
    Usuario: Vetancilina 100ml

[10] Bot: Número de lote y vencimiento...
     Usuario: Lote ABC123, vence 12/2026

[11] Bot: ¿Estado del producto?
     Usuario: [Selecciona "Usado"]

[12] Bot: ¿Cantidad afectada?
     Usuario: 10 frascos

[13] Bot: ¿Tiene fotos o videos?
     Usuario: [Envía 2 fotos]
     Bot: ✓ 2 archivos recibidos

[14] Bot: ¿Qué sucedió?
     Usuario: Al aplicar el producto, 3 bovinos murieron y otros presentan intoxicación

[15] Bot: ¿Dónde ocurrió?
     Usuario: Establecimiento Las Rosas, Tandil

[16] Bot: ¿Cuándo ocurrió?
     Usuario: Ayer a las 14:00 hs

[17] Bot: ¿Observaciones adicionales?
     Usuario: Tengo informe veterinario

[18] Bot: [Muestra resumen]
     ¿Es correcto?
     Usuario: Sí

[19] Bot: El registro ha sido completado.
     Número de caso: VET-2025-00123
     [Mensaje de agradecimiento]
```

---

### Ejemplo 2: Colaborador - Queja

```
[1] Bot: Bienvenida...

[2] Bot: ¿Cliente o colaborador?
    Usuario: Soy colaborador de Vetanco

[3] Bot: Su nombre y apellido...
    Usuario: María González

[4] Bot: ¿Cargo?
    Usuario: Asesora de Ventas

[5] Bot: ¿Área?
    Usuario: Ventas

[6] Bot: Nombre del cliente...
    Usuario: Pedro Martínez

[7-12] [Captura datos del cliente]

[13-17] [Captura datos del producto]

[18] Bot: ¿Qué sucedió?
     Usuario: El cliente se queja de demora en la entrega, llegó 1 día después

[19] Bot: ¿Dónde?
     Usuario: Distribuidora Central, Rosario

[20] Bot: ¿Cuándo?
     Usuario: La semana pasada

[21] Bot: [Clasificación: QUEJA]
     Número de caso: VET-2025-00124
```

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-18
