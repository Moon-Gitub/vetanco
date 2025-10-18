# ⚡ COMANDOS RÁPIDOS - Referencia

## 🔧 Dokploy

```bash
# Ver logs de la aplicación
docker logs -f vetanco-reclamos-api

# Ver todos los contenedores
docker ps -a

# Reiniciar aplicación
docker restart vetanco-reclamos-api

# Ver uso de recursos
docker stats vetanco-reclamos-api

# Eliminar contenedor y reconstruir
docker-compose down
docker-compose up -d --build
```

## 🧪 Testing

```bash
# Health check
curl https://api.tu-dominio.com/health

# Test webhook
curl -X POST https://api.tu-dominio.com/webhooks/kapso \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'

# Listar casos
curl https://api.tu-dominio.com/api/casos

# Obtener caso específico
curl https://api.tu-dominio.com/api/casos/VET-2025-00001

# Estadísticas
curl https://api.tu-dominio.com/api/estadisticas
```

## 📊 Supabase

```sql
-- Ver últimos 10 casos
SELECT numero_caso, tipo_caso, criticidad, created_at
FROM casos
ORDER BY created_at DESC
LIMIT 10;

-- Contar casos por tipo
SELECT tipo_caso, COUNT(*)
FROM casos
GROUP BY tipo_caso;

-- Ver casos críticos abiertos
SELECT * FROM casos
WHERE criticidad = 'critico'
AND estado IN ('nuevo', 'en_investigacion');

-- Buscar cliente por CUIT
SELECT * FROM clientes
WHERE cuit = '30-12345678-9';
```

## 🐳 Docker

```bash
# Build local
docker build -t vetanco-reclamos .

# Run local
docker run -p 3000:3000 --env-file .env vetanco-reclamos

# Ver logs
docker logs vetanco-reclamos-api

# Entrar al contenedor
docker exec -it vetanco-reclamos-api sh

# Limpiar todo
docker system prune -a
```

## 🔐 VPS

```bash
# Conectar
ssh root@tu-ip-vps

# Ver uso de disco
df -h

# Ver uso de RAM
free -h

# Ver procesos
htop

# Ver logs del sistema
journalctl -xe

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

## 📦 NPM (desarrollo local)

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linting
npm run lint

# Tests
npm test
```

## 🔄 Git

```bash
# Ver cambios
git status

# Commit
git add .
git commit -m "Descripción del cambio"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline
```

## 🌐 Verificaciones Rápidas

```bash
# ¿El servidor está corriendo?
curl -I https://api.tu-dominio.com/health

# ¿El webhook responde?
curl -X POST https://api.tu-dominio.com/webhooks/kapso \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'

# ¿Supabase está accesible?
curl https://tu-proyecto.supabase.co/rest/v1/

# ¿Docker está corriendo?
docker ps | grep vetanco

# ¿El puerto está abierto?
netstat -tuln | grep 3000
```

## 🚨 Troubleshooting Rápido

```bash
# Ver logs en tiempo real
docker logs -f --tail 100 vetanco-reclamos-api

# Reiniciar todo
docker-compose restart

# Ver uso de memoria
docker stats --no-stream

# Limpiar logs antiguos
docker system prune

# Ver variables de entorno del contenedor
docker exec vetanco-reclamos-api env
```

## 📱 Kapso API (desde terminal)

```bash
# Enviar mensaje de prueba (reemplaza variables)
curl -X POST https://api.kapso.ai/v1/messages \
  -H "Authorization: Bearer $KAPSO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5491155551234",
    "type": "text",
    "text": { "body": "Mensaje de prueba" }
  }'
```

## 🔑 Generar Secrets

```bash
# Generar FUNCTION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar contraseña segura
openssl rand -base64 32
```

## 📊 Monitoreo

```bash
# Ver uso de CPU en tiempo real
top

# Ver uso de disco por directorio
du -sh /var/lib/docker/*

# Ver conexiones activas
netstat -an | grep :3000

# Ver últimas líneas del log
tail -f /var/log/syslog
```

---

**Tip**: Guarda este archivo para consulta rápida cuando necesites ejecutar comandos comunes.
