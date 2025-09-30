# 🚀 Guía de Despliegue Manual - Booking2 Backend

## ✅ **Flujo Simplificado:**

### **1. GitHub Actions (Automático)**
```
Push a master → Build Docker → Push a Docker Hub ✅
```

### **2. Servidor (Manual)**
```
Pull imagen → Docker Compose → ¡Funcionando! ✅
```

---

## 🐳 **Comandos para tu servidor:**

### **Paso 1: Preparar servidor**
```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Crear directorio
sudo mkdir -p /opt/booking2
sudo chown $USER:$USER /opt/booking2
cd /opt/booking2
```

### **Paso 2: Descargar configuración**
```bash
# Descargar docker-compose.prod.yml desde el repo
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/kin-ordaya/booking2/master/docker-compose.prod.yml

# Crear archivo de variables de entorno
cat > .env.prod << EOF
# Base de datos
DB_PASS=booking123456

# JWT y autenticación  
JWT_SECRET=jwt-secret-por-defecto-desarrollo-1234567890
GOOGLE_CLIENT_ID=250973841532-lli1ka587c31cmtk7hk15dhd19f1phri.apps.googleusercontent.com

# Email
EMAIL_PASS=vgxh bgvr saac eviy
EOF
```

### **Paso 3: Desplegar**
```bash
# Pull de la imagen más reciente
docker pull ravlabos2025/booking2-backend:latest

# Levantar todo el stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar que funcione
curl http://localhost:3001/health
```

---

## 🔄 **Para actualizar (después de cada push):**

```bash
cd /opt/booking2

# Pull nueva imagen
docker pull ravlabos2025/booking2-backend:latest

# Reiniciar con nueva imagen
docker-compose -f docker-compose.prod.yml --env-file .env.prod down
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verificar
curl http://localhost:3001/health
```

---

## 📊 **Comandos útiles:**

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs db

# Reiniciar solo la app
docker-compose -f docker-compose.prod.yml restart app

# Parar todo
docker-compose -f docker-compose.prod.yml down

# Backup manual de BD
docker exec booking2-db-prod pg_dump -U postgres booking2 > backup_$(date +%Y%m%d_%H%M%S).sql

# Limpiar imágenes viejas
docker image prune -f
```

---

## 🎯 **Beneficios de esta approach:**

✅ **Simple**: Solo push → pull → run  
✅ **Control total**: Decides cuándo desplegar  
✅ **Sin secretos SSH**: No necesitas configurar claves en GitHub  
✅ **Debugging fácil**: Puedes ver logs directamente  
✅ **Rollback rápido**: `docker pull imagen-anterior`  

---

## 📦 **URLs importantes:**

- **Docker Hub**: https://hub.docker.com/r/ravlabos2025/booking2-backend
- **GitHub Actions**: https://github.com/kin-ordaya/booking2/actions
- **Health Check**: http://tu-servidor:3001/health

**¡Eso es todo! Súper simple y efectivo.** 🚀