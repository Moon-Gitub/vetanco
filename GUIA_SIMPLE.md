# 📘 GUÍA SIMPLE - ¿Cómo Funciona el Sistema?

> Explicación fácil de entender para personas no técnicas

---

## 🎯 Explicación Simple del Sistema

Este sistema tiene **3 partes principales** que trabajan juntas como un equipo:

### 📱 **KAPSO** - El Cerebro del Chatbot de WhatsApp

**¿Qué es?**
Kapso es la plataforma que maneja toda la conversación de WhatsApp con tus clientes.

**¿Qué hace?**
- ✅ Recibe mensajes de WhatsApp de los clientes
- ✅ Ejecuta los FLOWS (conversaciones automatizadas paso a paso)
- ✅ Coordina los AGENTES (asistentes virtuales especializados)
- ✅ Envía respuestas automáticas a los clientes
- ✅ Llama a tus funciones cuando necesita hacer algo con datos

**🎭 Analogía:**
Kapso es como un **director de orquesta** que coordina toda la conversación.

**💭 Piénsalo así:**
Es como el recepcionista de Vetanco que habla con los clientes, les hace preguntas, y cuando necesita algo (validar un dato, guardar información), le pide ayuda a tu servidor.

---

### 🗄️ **SUPABASE** - La Base de Datos (El Archivo)

**¿Qué es?**
Supabase es donde se guardan TODOS los datos del sistema.

**¿Qué guarda?**
- 👤 **Clientes** (nombre, CUIT, dirección, teléfono)
- 📋 **Casos** (reclamos, quejas, comentarios)
- 📦 **Productos** (lotes, vencimientos, cantidades)
- 💬 **Mensajes** (toda la conversación)
- 📎 **Adjuntos** (fotos, videos que envía el cliente)
- 📊 **Investigaciones** (resolución de casos)
- 📈 **Clasificaciones** (historial de cambios)

**🎭 Analogía:**
Supabase es como un **archivo gigante** con carpetas organizadas donde se guardan todos los papeles.

**💭 Piénsalo así:**
Es como el archivo de la oficina donde guardas todas las fichas de clientes, todos los reclamos, fotos, documentos, etc. Pero digital y mucho más rápido.

---

### 💻 **TU SERVIDOR** - El Intermediario (El Empleado)

**¿Qué es?**
Es tu aplicación Node.js que corre en tu servidor (la carpeta `version_claude`).

**¿Qué hace?**
- ✅ Recibe llamadas de Kapso cuando necesita validar datos o guardar algo
- ✅ Se comunica con Supabase para leer/guardar información
- ✅ Ejecuta la lógica de negocio:
  - Valida CUIT (formato correcto, dígito verificador)
  - Valida teléfonos y emails
  - Clasifica casos automáticamente (crítico, mayor, menor)
  - Busca si un cliente ya existe
- ✅ Responde a Kapso con resultados

**🎭 Analogía:**
Tu servidor es como un **empleado administrativo** que recibe pedidos de Kapso, busca/guarda cosas en Supabase, y hace los cálculos o validaciones necesarias.

**💭 Piénsalo así:**
Es como el empleado que:
- Recibe una solicitud: "Necesito validar este CUIT"
- Hace el trabajo: Verifica el formato, busca en el archivo (Supabase)
- Responde: "CUIT válido, cliente encontrado con ID 123"

---

## 🔄 ¿Cómo Trabajan Juntos? - Flujo Completo

```
CLIENTE → WhatsApp → KAPSO → TU SERVIDOR → SUPABASE
   ↑                           ↓               ↓
   └──────────────────────────┘ (respuesta)   (datos guardados)
```

### 📖 Ejemplo Paso a Paso: Cliente Reporta un Reclamo

#### **PASO 1: Cliente inicia conversación**

```
Cliente envía: "Hola, quiero hacer un reclamo"
```

#### **PASO 2: KAPSO recibe y responde**

```
KAPSO dice:
"Buenos días. Le damos la bienvenida al asistente de Vetanco
para la gestión de reclamos, quejas y comentarios..."

Luego pregunta:
"¿Usted es el cliente o un colaborador de Vetanco?"
[Botón: Soy el cliente] [Botón: Soy colaborador]
```

#### **PASO 3: Cliente responde**

```
Cliente presiona: "Soy el cliente"
```

#### **PASO 4: KAPSO activa el Agente de Identificación**

Este es un asistente inteligente que hace preguntas:

```
Bot: "¿Cuál es su nombre y apellido completo?"
Cliente: "Juan Pérez"

Bot: "¿Cuál es su dirección completa?"
Cliente: "Av. Rivadavia 1234, CABA"

Bot: "¿Cuál es su teléfono de contacto?"
Cliente: "11-5555-1234"

Bot: "Por favor indique la razón social de su empresa y el CUIT"
Cliente: "Agropecuaria Los Pinos SA, CUIT 30-12345678-9"

Bot: "¿Tiene el número de remito del pedido?"
Cliente: "Remito 0001-00012345"
```

#### **PASO 5: KAPSO llama a tu servidor para validar**

```
KAPSO envía una petición a tu servidor:

POST http://tu-servidor.com/functions/validar-cliente
{
  "sessionState": {
    "clienteNombre": "Juan Pérez",
    "clienteCUIT": "30-12345678-9",
    "clienteTelefono": "11-5555-1234",
    "clienteRazonSocial": "Agropecuaria Los Pinos SA",
    ...
  }
}
```

#### **PASO 6: TU SERVIDOR procesa la petición**

El archivo `validar-cliente.ts` ejecuta:

```javascript
1. Valida el CUIT:
   - Formato correcto (XX-XXXXXXXX-X)
   - Dígito verificador correcto
   ✓ CUIT válido

2. Busca en SUPABASE:
   "¿Existe un cliente con CUIT 30-12345678-9?"

3. SUPABASE responde:
   "Sí, existe: ID abc-123, nombre Juan Pérez"

4. TU SERVIDOR responde a KAPSO:
   "Cliente encontrado, ID: abc-123"
```

#### **PASO 7: KAPSO continúa con el siguiente paso**

Ahora activa el **Agente de Productos**:

```
Bot: "¿Cuál es el nombre y presentación del producto?"
Cliente: "Vetancilina 100ml"

Bot: "Indique el número de lote y fecha de vencimiento"
Cliente: "Lote ABC123, vence 12/2026"

Bot: "¿Cuál es el estado del producto?"
[Botones: Usado | Sin usar | Envase roto | Envase sano]
Cliente: "Usado"

Bot: "¿Qué cantidad está afectada?"
Cliente: "10 frascos"
```

#### **PASO 8: Luego el Agente de Descripción**

```
Bot: "Por favor, indique brevemente qué sucedió con el producto"
Cliente: "Al aplicar el producto, 3 bovinos murieron
         y otros presentan intoxicación"

Bot: "¿Dónde ocurrió el incidente?"
Cliente: "Establecimiento Las Rosas, Tandil"

Bot: "¿Cuándo ocurrió?"
Cliente: "Ayer a las 14:00 hs"
```

#### **PASO 9: KAPSO llama a clasificar-caso**

```
KAPSO → TU SERVIDOR: POST /functions/clasificar-caso

TU SERVIDOR analiza el texto:
- Detecta keywords: "murieron", "intoxicación"
- Clasificación automática: RECLAMO CRÍTICO
- Confianza: 95%
- Razonamiento: "Riesgo grave para salud animal"
```

#### **PASO 10: KAPSO llama a guardar-caso**

```
KAPSO → TU SERVIDOR: POST /functions/guardar-caso

TU SERVIDOR → SUPABASE:
- INSERT INTO casos (...)
- INSERT INTO productos_afectados (...)
- INSERT INTO interacciones (...)
- INSERT INTO mensajes (...)

SUPABASE responde:
- Caso creado con ID: xyz-789
- Número de caso generado: VET-2025-00123
```

#### **PASO 11: KAPSO envía mensaje final**

```
Bot: "El registro de su caso ha sido completado correctamente.

📋 El número asignado es: VET-2025-00123

⚠️ Debido a la criticidad reportada, este caso ha sido
marcado como URGENTE y el equipo de Calidad ha sido
notificado inmediatamente.

Un especialista se comunicará con usted en las
próximas 4 horas.

Agradecemos que se haya comunicado con Vetanco."
```

---

## 🧩 Las 3 Partes y Sus Responsabilidades

### 1. **KAPSO** = Conversación 💬

**Lo que SÍ hace:**
- ✅ Habla con el cliente por WhatsApp
- ✅ Hace preguntas inteligentes
- ✅ Coordina el flujo de la conversación
- ✅ Envía mensajes con botones y opciones
- ✅ Recibe fotos, videos, documentos

**Lo que NO hace:**
- ❌ NO guarda datos permanentemente
- ❌ NO valida CUIT ni hace lógica compleja
- ❌ NO genera reportes

**Ubicación:**
- Configurado en el Dashboard de Kapso (kapso.ai)

---

### 2. **TU SERVIDOR** = Lógica 🧠

**Lo que SÍ hace:**
- ✅ Valida datos (CUIT, teléfono, email)
- ✅ Clasifica casos (crítico, mayor, menor)
- ✅ Ejecuta reglas de negocio
- ✅ Busca clientes existentes
- ✅ Comunica Kapso ↔ Supabase
- ✅ Genera números de caso

**Lo que NO hace:**
- ❌ NO habla directo con WhatsApp
- ❌ NO maneja la conversación
- ❌ NO muestra pantallas al usuario

**Ubicación:**
- La carpeta `version_claude` en tu servidor
- Archivos: `src/functions/`, `src/services/`

---

### 3. **SUPABASE** = Almacenamiento 💾

**Lo que SÍ hace:**
- ✅ Guarda TODO permanentemente
- ✅ Permite consultar datos históricos
- ✅ Genera reportes y estadísticas
- ✅ Mantiene relaciones entre datos
- ✅ Protege datos con seguridad

**Lo que NO hace:**
- ❌ NO hace validaciones de negocio
- ❌ NO habla con el cliente
- ❌ NO envía mensajes

**Ubicación:**
- En la nube de Supabase (supabase.com)
- 9 tablas con todos los datos

---

## 📝 Los Scripts - ¿Qué hace cada comando?

Cuando trabajas con el proyecto, usas estos comandos:

```bash
npm run dev
```
**¿Qué hace?**
Inicia tu servidor EN MODO DESARROLLO.
- Detecta cambios automáticamente
- Reinicia el servidor solo
- Muestra errores detallados
- Usa el puerto 3000 (http://localhost:3000)

**¿Cuándo usarlo?**
Cuando estás desarrollando o probando.

---

```bash
npm run build
```
**¿Qué hace?**
Compila el código TypeScript a JavaScript.
- Lee todos los archivos `.ts`
- Los convierte a `.js` en la carpeta `dist/`
- Verifica que no haya errores de tipos

**¿Cuándo usarlo?**
Antes de subir a producción.

---

```bash
npm start
```
**¿Qué hace?**
Inicia tu servidor EN MODO PRODUCCIÓN.
- Usa el código compilado de `dist/`
- Es más rápido
- Menos logs
- Para uso real con clientes

**¿Cuándo usarlo?**
Cuando ya probaste todo y está listo para producción.

---

```bash
npm test
```
**¿Qué hace?**
Ejecuta tests automáticos.
- Prueba que las funciones funcionen bien
- Detecta errores antes de que lleguen a producción

**¿Cuándo usarlo?**
Antes de hacer cambios importantes.

---

```bash
npm run lint
```
**¿Qué hace?**
Revisa el código en busca de errores de estilo.
- Variables no usadas
- Código mal formateado
- Malas prácticas

**¿Cuándo usarlo?**
Antes de hacer commit de código.

---

## 🎬 Secuencia Visual Simplificada

```
┌─────────────────┐
│     CLIENTE     │ Envía: "Hola, quiero hacer un reclamo"
│   (WhatsApp)    │
└────────┬────────┘
         │
         │ Mensaje via WhatsApp Cloud API
         ▼
┌────────────────────────────────────────────┐
│  KAPSO (Director de Orquesta)              │
│                                            │
│  📋 Flow Principal ejecutándose:          │
│  1. Mensaje bienvenida                    │
│  2. ¿Cliente o Colaborador?               │
│  3. Agente de Identificación activo       │
│  4. Pregunta: "¿Cuál es tu nombre?"       │
└────────┬───────────────────────────────────┘
         │
         │ "Necesito validar este cliente"
         ▼
┌────────────────────────────────────────────┐
│  TU SERVIDOR (Empleado Administrativo)    │
│  📍 /functions/validar-cliente            │
│                                            │
│  Ejecutando:                               │
│  - ✓ Validar formato CUIT                 │
│  - ⏳ Buscando en base de datos...        │
└────────┬───────────────────────────────────┘
         │
         │ Query: "SELECT * FROM clientes WHERE cuit = '...'"
         ▼
┌────────────────────────────────────────────┐
│  SUPABASE (Archivo/Base de Datos)         │
│                                            │
│  📊 Tablas:                                │
│  - clientes (1,250 registros)             │
│  - casos (3,480 registros)                │
│  - productos_afectados (4,120 registros)  │
│  ...                                       │
│                                            │
│  Buscando cliente...                       │
│  ✓ Cliente encontrado: ID abc-123         │
└────────┬───────────────────────────────────┘
         │
         │ Respuesta: { clienteId: "abc-123", existe: true }
         ▼
┌────────────────────────────────────────────┐
│  TU SERVIDOR                               │
│  ✓ Cliente validado                        │
│  ✓ Respuesta preparada                     │
└────────┬───────────────────────────────────┘
         │
         │ { success: true, clienteId: "abc-123" }
         ▼
┌────────────────────────────────────────────┐
│  KAPSO                                     │
│  ✓ Validación exitosa                      │
│  → Continuar con siguiente paso            │
│  → Activar Agente de Productos             │
└────────┬───────────────────────────────────┘
         │
         │ "Ahora cuéntame sobre el producto afectado..."
         ▼
┌─────────────────┐
│     CLIENTE     │
└─────────────────┘
```

---

## 📊 Tabla Resumen - Comparación Rápida

| Parte | ¿Qué hace? | Ejemplo Real | Tecnología |
|-------|-----------|--------------|------------|
| **KAPSO** | Chatbot que habla con clientes | "¿Cuál es tu CUIT?" | WhatsApp Cloud API |
| **TU SERVIDOR** | Procesa y valida datos | "El CUIT es válido ✓" | Node.js + TypeScript |
| **SUPABASE** | Guarda todo | "Cliente guardado en tabla 'clientes'" | PostgreSQL |

---

## 🎯 En Una Frase

**KAPSO** pregunta → **TU SERVIDOR** procesa → **SUPABASE** guarda → **KAPSO** responde al cliente

---

## 🔁 Ciclo de Vida de un Caso

```
1. INICIO
   Cliente: "Quiero hacer un reclamo"
   ↓

2. CONVERSACIÓN (KAPSO)
   - Pregunta tipo de usuario
   - Captura datos cliente
   - Captura datos producto
   - Captura descripción
   ↓

3. VALIDACIÓN (TU SERVIDOR)
   - Valida CUIT
   - Busca cliente en BD
   - Si no existe, lo crea
   ↓

4. CLASIFICACIÓN (TU SERVIDOR)
   - Analiza keywords
   - Determina criticidad
   - Calcula confianza
   ↓

5. ALMACENAMIENTO (SUPABASE)
   - Guarda caso
   - Guarda producto
   - Guarda mensajes
   - Guarda adjuntos
   ↓

6. CIERRE (KAPSO)
   Bot: "Caso VET-2025-00123 registrado"
   ↓

7. SEGUIMIENTO (SUPABASE)
   - El equipo de Calidad consulta en Supabase
   - Actualiza estado del caso
   - Agrega investigación
   - Cierra caso
```

---

## 🤔 Preguntas Frecuentes

### P: ¿Qué pasa si Kapso se cae?
**R:** Los clientes no pueden iniciar nuevos reclamos por WhatsApp, pero todos los datos ya guardados en Supabase están seguros. Cuando Kapso vuelva, todo funciona normal.

### P: ¿Qué pasa si tu servidor se cae?
**R:** Kapso puede seguir conversando con clientes, pero no puede validar datos ni guardarlos. Es importante tener tu servidor siempre activo.

### P: ¿Qué pasa si Supabase se cae?
**R:** No se pueden guardar ni consultar datos. Pero Supabase tiene 99.9% de uptime (casi nunca se cae).

### P: ¿Los datos están seguros?
**R:** Sí. Supabase usa encriptación, backups automáticos, y Row Level Security. Kapso es oficial Meta Tech Provider.

### P: ¿Puedo ver los casos guardados?
**R:** Sí, en el dashboard de Supabase o usando la API REST:
```
GET http://tu-servidor.com/api/casos
```

---

## 📚 Analogía Final - Sistema de Reclamos como una Oficina

Imagina que el sistema es una **oficina de atención al cliente**:

### 🏢 La Oficina Tradicional

1. **Recepcionista (KAPSO)**
   - Recibe al cliente
   - Le hace preguntas
   - Llena formularios
   - Deriva al área correspondiente

2. **Empleado Administrativo (TU SERVIDOR)**
   - Valida documentos (CUIT, remitos)
   - Busca en archivos si el cliente ya existe
   - Clasifica el reclamo (urgente, normal, bajo)
   - Entrega formularios al archivo

3. **Archivo (SUPABASE)**
   - Guarda todos los documentos
   - Mantiene todo organizado
   - Permite buscar casos antiguos
   - Genera reportes

### 💻 La Oficina Digital (Tu Sistema)

Es EXACTAMENTE lo mismo, pero:
- ⚡ Mucho más rápido (segundos vs horas)
- 🌍 Funciona 24/7
- 📱 El cliente no necesita venir a la oficina
- 📊 Estadísticas automáticas
- 🔍 Búsquedas instantáneas
- 🔒 Más seguro (encriptado)

---

## ✅ Checklist de Entendimiento

Marca ✓ cuando entiendas cada concepto:

- [ ] Entiendo que Kapso maneja la conversación de WhatsApp
- [ ] Entiendo que mi servidor valida y procesa datos
- [ ] Entiendo que Supabase guarda todo permanentemente
- [ ] Entiendo cómo trabajan las 3 partes juntas
- [ ] Entiendo el flujo de un caso desde inicio a fin
- [ ] Entiendo para qué sirve cada comando npm
- [ ] Sé dónde consultar los casos guardados
- [ ] Entiendo la diferencia entre desarrollo y producción

---

## 📞 ¿Necesitas Más Ayuda?

Si algo no quedó claro, puedes:

1. **Ver ejemplos completos** en `docs/casos-uso.md`
2. **Ver el flujo detallado** en `docs/flujo-conversacion.md`
3. **Ver la arquitectura técnica** en `docs/arquitectura-multiagente.md`
4. **Leer el README principal** en `README.md`

---

**Versión**: 1.0.0
**Última actualización**: 18 de Octubre de 2025
**Audiencia**: Personas no técnicas que necesitan entender el sistema

---

💡 **Recuerda**: No necesitas ser programador para entender cómo funciona el sistema.
Es como entender cómo funciona una oficina, pero digital y automático.
