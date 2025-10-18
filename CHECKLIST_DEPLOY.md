# ✅ CHECKLIST DE DEPLOY - Sistema Vetanco

Imprime este documento y marca cada casilla al completar.

---

## 📋 FASE 1: PREPARACIÓN (15 min)

### VPS
- [ ] Conectado al VPS por SSH
- [ ] Sistema actualizado (`apt update && apt upgrade`)
- [ ] Firewall configurado (puertos 22, 80, 443)
- [ ] IP del VPS anotada: `_________________`

### Dominio (Opcional)
- [ ] Dominio registrado: `_________________`
- [ ] Registro A configurado apuntando a IP del VPS
- [ ] DNS propagado (esperar 5-30 min)

---

## 🐳 FASE 2: DOCKER Y DOKPLOY (20 min)

### Docker
- [ ] Docker instalado
- [ ] Verificado: `docker --version`
- [ ] Usuario agregado a grupo docker (si aplica)

### Dokploy
- [ ] Dokploy instalado
- [ ] Dashboard accesible: `http://IP-VPS:3000`
- [ ] Login exitoso
- [ ] Contraseña cambiada
- [ ] Credenciales guardadas:
  ```
  Usuario: _________________
  Password: _________________
  ```

---

## 🗄️ FASE 3: SUPABASE (30 min)

### Proyecto
- [ ] Cuenta creada en Supabase
- [ ] Proyecto creado: `vetanco-reclamos`
- [ ] Region seleccionada: `_________________`
- [ ] Credenciales copiadas:
  ```
  Project URL: _________________________________
  Anon Key: ____________________________________
  Service Key: _________________________________
  ```

### Base de Datos
- [ ] SQL Editor abierto
- [ ] Schema SQL pegado y ejecutado
- [ ] 9 tablas verificadas:
  - [ ] clientes
  - [ ] colaboradores_vetanco
  - [ ] casos
  - [ ] productos_afectados
  - [ ] interacciones
  - [ ] mensajes
  - [ ] adjuntos
  - [ ] clasificaciones
  - [ ] investigaciones

### Storage
- [ ] Bucket `adjuntos` creado
- [ ] Configurado como privado

---

## 🚀 FASE 4: DEPLOY (30 min)

### Código
- [ ] Repositorio Git inicializado
- [ ] Código subido a GitHub (o listo localmente)
- [ ] URL del repo: `_________________`

### Dokploy
- [ ] Aplicación creada: `vetanco-reclamos`
- [ ] Tipo: Docker Compose o Git
- [ ] Variables de entorno configuradas:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] NODE_ENV=production
  - [ ] PORT=3000
  - [ ] BASE_URL
  - [ ] FUNCTION_SECRET
  - [ ] CORS_ORIGINS

### Dominio y SSL
- [ ] Dominio agregado: `api.tu-dominio.com`
- [ ] SSL habilitado (Let's Encrypt)
- [ ] Certificado generado (esperar 1-2 min)

### Build
- [ ] Deploy iniciado
- [ ] Build exitoso
- [ ] Contenedor corriendo
- [ ] Logs sin errores críticos

### Verificación
- [ ] Health check OK:
  ```bash
  curl https://api.tu-dominio.com/health
  ```
- [ ] Respuesta JSON recibida
- [ ] Status: "ok"

---

## 📱 FASE 5: KAPSO (45 min)

### Cuenta y Proyecto
- [ ] Cuenta creada en Kapso
- [ ] Proyecto creado: `Vetanco Reclamos`

### WhatsApp
- [ ] WhatsApp Business conectado
- [ ] Número verificado: `_________________`
- [ ] Estado: Connected (verde)

### Credenciales
- [ ] API Key generada: `_________________`
- [ ] Webhook Secret generado: `_________________`
- [ ] Variables actualizadas en Dokploy:
  - [ ] KAPSO_API_KEY
  - [ ] KAPSO_WEBHOOK_SECRET
  - [ ] KAPSO_PHONE_NUMBER
- [ ] Aplicación redeployada

### Webhook
- [ ] URL configurada: `https://api.tu-dominio.com/webhooks/kapso`
- [ ] Eventos seleccionados (todos)
- [ ] Test de webhook exitoso

### Flow Principal
- [ ] Flow creado: `Main - Reclamos Vetanco`
- [ ] Nodos configurados:
  - [ ] StartNode
  - [ ] SendTextNode (bienvenida)
  - [ ] SendTextNode (pregunta tipo usuario)
  - [ ] WaitForResponseNode
  - [ ] DecideNode
  - [ ] AgentNode (identificación cliente)
  - [ ] AgentNode (identificación colaborador)
  - [ ] FunctionNode (validar-cliente)
  - [ ] AgentNode (producto)
  - [ ] AgentNode (descripción)
  - [ ] FunctionNode (clasificar-caso)
  - [ ] FunctionNode (guardar-caso)
  - [ ] AgentNode (cierre)
  - [ ] EndNode

### Agentes
- [ ] Agente 1: `identificacion-cliente`
  - [ ] System prompt configurado
  - [ ] Max turns: 10
  - [ ] Timeout: 600
- [ ] Agente 2: `identificacion-colaborador`
  - [ ] System prompt configurado
  - [ ] Max turns: 15
  - [ ] Timeout: 900
- [ ] Agente 3: `producto`
  - [ ] System prompt configurado
  - [ ] Accepts Media: ✅
  - [ ] Max turns: 12
- [ ] Agente 4: `descripcion`
  - [ ] System prompt configurado
  - [ ] Max turns: 8
- [ ] Agente 5: `cierre`
  - [ ] System prompt configurado
  - [ ] Max turns: 2

### FunctionNodes
- [ ] `/functions/validar-cliente`
  - [ ] URL: `https://api.tu-dominio.com/functions/validar-cliente`
  - [ ] Method: POST
  - [ ] Timeout: 30s
- [ ] `/functions/clasificar-caso`
  - [ ] URL configurada
  - [ ] Method: POST
- [ ] `/functions/guardar-caso`
  - [ ] URL configurada
  - [ ] Method: POST

### Activación
- [ ] Flow publicado
- [ ] Set as default flow
- [ ] Estado: Active (verde)

---

## 🧪 FASE 6: TESTING (30 min)

### Tests Técnicos
- [ ] Health check: ✅
  ```bash
  curl https://api.tu-dominio.com/health
  ```
- [ ] Webhook test: ✅
  ```bash
  curl -X POST https://api.tu-dominio.com/webhooks/kapso
  ```
- [ ] API casos: ✅
  ```bash
  curl https://api.tu-dominio.com/api/casos
  ```

### Test de WhatsApp
- [ ] Mensaje enviado: "Hola"
- [ ] Bot respondió con bienvenida
- [ ] Flujo completado exitosamente
- [ ] Número de caso recibido: `VET-2025-_____`

### Verificación en Supabase
- [ ] Caso visible en tabla `casos`
- [ ] Cliente visible en tabla `clientes`
- [ ] Producto visible en `productos_afectados`
- [ ] Mensajes en tabla `mensajes`

### Test de API
- [ ] GET /api/casos responde
- [ ] GET /api/casos/VET-2025-00001 responde
- [ ] Datos correctos

---

## 📊 FASE 7: CONFIGURACIÓN FINAL (15 min)

### Monitoreo
- [ ] Logs de Dokploy revisados
- [ ] Dashboard de Kapso explorado
- [ ] Supabase Table Editor revisado

### Documentación
- [ ] URLs importantes anotadas:
  ```
  API: _________________________________
  Dokploy: _____________________________
  Supabase: ____________________________
  Kapso: _______________________________
  ```

### Backups
- [ ] Configuración de flow exportada
- [ ] Variables de entorno respaldadas
- [ ] Credenciales guardadas en lugar seguro

### Equipo
- [ ] Credenciales compartidas con equipo (si aplica)
- [ ] Documentación entregada
- [ ] Demo realizada

---

## ✅ RESULTADO FINAL

**Fecha de deploy**: `_____ / _____ / _____`

**Tiempo total**: `_______ horas`

**Estado del sistema**:
- [ ] ✅ Servidor funcionando
- [ ] ✅ Base de datos operativa
- [ ] ✅ WhatsApp conectado
- [ ] ✅ Flow activo
- [ ] ✅ Tests exitosos

**Casos de prueba completados**: `_____`

**Sistema en PRODUCCIÓN**: ✅ SÍ / ❌ NO

---

## 🎉 FELICITACIONES

**Firma**: ______________________

**Fecha**: ______________________

---

## 📞 CONTACTOS IMPORTANTES

| Servicio | URL | Usuario | Notas |
|----------|-----|---------|-------|
| VPS | | | |
| Dokploy | | | |
| Supabase | | | |
| Kapso | | | |
| GitHub | | | |
| Dominio | | | |

---

## 📝 NOTAS ADICIONALES

```
_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________
```

---

**Versión del Checklist**: 1.0.0
**Para**: Sistema de Reclamos Vetanco
**Tiempo estimado total**: 2-3 horas
