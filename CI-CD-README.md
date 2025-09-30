# CI/CD Full Docker - Booking2 Backend

## � Configuración Completa con Docker + GitHub Actions

**TODO en Docker**: Base de datos PostgreSQL + Aplicación NestJS + Backups automáticos + Despliegue automático.

## 🏗️ **Arquitectura**

```
┌─────────────────────────────────────────┐
│               SERVIDOR                  │
├─────────────────────────────────────────┤
│  🐳 Docker Compose:                    │
│  ├── 📦 booking2-app-prod              │
│  │   └── NestJS + Health Check          │
│  ├── 🗄️ booking2-db-prod               │
│  │   └── PostgreSQL + Volumen           │
│  └── 💾 booking2-backup                │
│      └── Backup automático             │
├─────────────────────────────────────────┤
│  📁 /opt/booking2/                     │
│  ├── docker-compose.prod.yml           │
│  ├── .env.prod                         │
│  ├── backups/ (BD backups)             │
│  ├── scripts/ (utilidades)             │
│  └── logs/ (sistema)                   │
└─────────────────────────────────────────┘
```

## 📋 **Requisitos Previos**

### 1. Cuenta de Docker Hub
- Regístrate en [Docker Hub](https://hub.docker.com/)
- Crea un repositorio: `tu-usuario/booking2-backend`

### 2. Servidor VPS/Cloud
- Ubuntu 20.04+ / Debian 11+
- Mínimo 2GB RAM, 20GB disco
- Acceso SSH con usuario sudo

## � **Configuración Completa (5 pasos)**

### **Paso 1: Configurar Servidor** ⚙️

**En tu servidor:**
```bash
# Descargar y ejecutar script de configuración
curl -sSL https://raw.githubusercontent.com/kin-ordaya/booking2/main/scripts/setup-docker-server.sh | bash

# O manualmente:
git clone https://github.com/kin-ordaya/booking2.git
cd booking2
chmod +x scripts/setup-docker-server.sh
./scripts/setup-docker-server.sh
```

Esto instala Docker, crea la estructura de directorios y configura todo automáticamente.

### **Paso 2: Configurar Variables de Entorno** 🔐

**En tu servidor (/opt/booking2):**
```bash
cd /opt/booking2
cp .env.prod.example .env.prod
nano .env.prod
```

**Configuración mínima:**
```env
# Docker Hub
DOCKER_USERNAME=tu-usuario-dockerhub

# Base de datos (local en Docker)
DB_PASS=una-password-muy-segura

# JWT
JWT_SECRET=un-jwt-secret-muy-largo-y-seguro

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-google-client-id

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

### **Paso 3: Configurar Secretos en GitHub** 🔑

Ve a: `GitHub Repo` → `Settings` → `Secrets and variables` → `Actions`

**Secretos obligatorios:**
```bash
DOCKER_USERNAME=tu-usuario-dockerhub
DOCKER_PASSWORD=tu-password-dockerhub

# Solo si quieres auto-deploy (recomendado)
SERVER_HOST=tu-servidor.com
SERVER_USER=tu-usuario-ssh
SSH_PRIVATE_KEY=tu-clave-privada-ssh-completa

# Variables de aplicación
DB_PASS=misma-password-del-servidor
JWT_SECRET=mismo-jwt-secret-del-servidor
GOOGLE_CLIENT_ID=tu-google-client-id
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

### **Paso 4: Preparar Clave SSH** 🔐

**En tu máquina local:**
```bash
# Generar clave SSH (si no tienes)
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"

# Copiar clave pública al servidor
ssh-copy-id tu-usuario@tu-servidor.com

# Copiar clave PRIVADA completa para GitHub Secret
cat ~/.ssh/id_rsa
# Copia TODO el contenido (incluyendo -----BEGIN/END-----)
```

**Pega el contenido completo en el secret `SSH_PRIVATE_KEY`**

### **Paso 5: ¡Hacer Push y Listo!** 🎉

```bash
git add .
git commit -m "feat: configuración CI/CD con Docker completo"
git push origin main
```

**GitHub Actions automáticamente:**
1. ✅ Ejecuta tests
2. 🐳 Construye imagen Docker
3. 📦 Sube a Docker Hub
4. 🚀 Despliega en tu servidor
5. 💾 Crea backup automático

## � **Flujo de Trabajo Diario**

### **Desarrollo Normal:**
```bash
# 1. Hacer cambios en el código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 2. GitHub Actions automáticamente:
#    - Tests ✅
#    - Build Docker 🐳
#    - Deploy 🚀
#    - Backup 💾

# 3. Verificar despliegue
curl http://tu-servidor.com:3001/health
```

### **Verificar Estado:**
```bash
# En tu servidor
ssh tu-usuario@tu-servidor.com
cd /opt/booking2

# Ver estado general
./scripts/monitor.sh

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## 🛠️ **Comandos Útiles del Servidor**

```bash
cd /opt/booking2

# 📊 Estado general
./scripts/monitor.sh

# 🔄 Reiniciar aplicación
docker-compose -f docker-compose.prod.yml restart app

# 🔄 Reiniciar todo
docker-compose -f docker-compose.prod.yml restart

# ⏹️ Parar todo
docker-compose -f docker-compose.prod.yml down

# ▶️ Iniciar todo
docker-compose -f docker-compose.prod.yml up -d

# 📝 Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# 🗄️ Conectarse a la base de datos
docker exec -it booking2-db-prod psql -U postgres -d booking2

# 💾 Backup manual
./scripts/backup-db.sh manual

# 🔄 Restaurar backup
./scripts/restore-db.sh

# 🧹 Limpiar sistema
./scripts/cleanup.sh
```

## 💾 **Sistema de Backups**

### **Automáticos:**
- ⏰ **Diarios**: 2:00 AM (backup completo)
- 🧹 **Semanales**: Domingo 3:00 AM (limpieza)
- 📅 **Retención**: 30 días

### **Manuales:**
```bash
# Crear backup
./scripts/backup-db.sh manual

# Restaurar último backup
./scripts/restore-db.sh

# Restaurar backup específico
./scripts/restore-db.sh backups/booking2_manual_20231201_120000.sql.gz

# Listar backups
ls -lah backups/
```

## 🔍 **Monitoreo y Logs**

### **Health Checks:**
- **Aplicación**: `http://tu-servidor:3001/health`
- **Base de datos**: Automático en Docker
- **Monitoreo**: `./scripts/monitor.sh`

### **Logs:**
```bash
# Aplicación
docker-compose logs app

# Base de datos  
docker-compose logs db

# Sistema
tail -f logs/backup.log
tail -f logs/cleanup.log
```

## 🚨 **Solución de Problemas**

### **La aplicación no responde:**
```bash
# Verificar contenedores
docker-compose ps

# Reiniciar aplicación
docker-compose restart app

# Ver logs de error
docker-compose logs app
```

### **Error de base de datos:**
```bash
# Verificar BD
docker-compose logs db

# Reiniciar BD
docker-compose restart db

# Restaurar backup
./scripts/restore-db.sh
```

### **Sin espacio en disco:**
```bash
# Limpiar Docker
./scripts/cleanup.sh

# Ver uso de espacio
docker system df
du -sh /opt/booking2/*
```

### **Error en deploy:**
```bash
# Ver logs de GitHub Actions
# GitHub → Actions → último run

# Verificar SSH
ssh tu-usuario@tu-servidor.com "whoami"

# Verificar Docker Hub
docker pull tu-usuario/booking2-backend:latest
```

## 📊 **Beneficios de esta Configuración**

✅ **Todo en Docker**: Fácil replicar en cualquier servidor  
✅ **Datos Seguros**: Backups automáticos + volúmenes persistentes  
✅ **Zero Downtime**: Health checks + restart automático  
✅ **Monitoreo**: Scripts de estado y limpieza  
✅ **Escalable**: Fácil agregar más servicios  
✅ **Portable**: Funciona en cualquier servidor Linux  

## 🎯 **Próximos Pasos (Opcionales)**

1. **🔒 SSL/HTTPS**: Nginx + Let's Encrypt
2. **📊 Monitoring**: Prometheus + Grafana  
3. **🚨 Alertas**: Notificaciones Slack/Discord
4. **🔄 Load Balancer**: Múltiples instancias
5. **📦 Staging**: Servidor de pruebas

¡Con esta configuración tienes un CI/CD profesional completamente automatizado! 🚀