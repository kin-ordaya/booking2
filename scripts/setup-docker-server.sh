#!/bin/bash

# Script de inicialización completa del servidor para Booking2 Backend
# Este script configura todo lo necesario para Docker + CI/CD
# Uso: ./setup-docker-server.sh

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log "🚀 Configuración completa del servidor para Booking2 Backend con Docker"

# Verificar usuario
if [ "$EUID" -eq 0 ]; then
    warn "No ejecutes este script como root. Usa un usuario normal con privilegios sudo."
    exit 1
fi

# Actualizar sistema
log "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Docker
if ! command -v docker &> /dev/null; then
    log "🐳 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log "✅ Docker instalado"
else
    log "✅ Docker ya está instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log "🔧 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose instalado"
else
    log "✅ Docker Compose ya está instalado"
fi

# Configurar proyecto
PROJECT_DIR="/opt/booking2"
log "📁 Configurando proyecto en: $PROJECT_DIR"
sudo mkdir -p "$PROJECT_DIR"
sudo chown $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Crear estructura
log "📂 Creando estructura de directorios..."
mkdir -p {backups,scripts,init,logs}

# Configurar firewall
log "🔒 Configurando firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP  
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3001/tcp # App
sudo ufw --force enable

# Herramientas adicionales
log "🛠️ Instalando herramientas..."
sudo apt install -y curl wget htop nano git unzip jq

# Scripts de utilidad
log "📊 Creando scripts de monitoreo..."
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash
echo "=== 📊 Estado de Booking2 Backend ==="
echo "🕐 Fecha: $(date)"
echo ""

echo "🐳 Contenedores:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💾 Uso de disco:"
df -h | grep -E "Filesystem|/dev/"

echo ""
echo "🧠 Memoria:"
free -h

echo ""
echo "🔗 Aplicación:"
if curl -f -s "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "✅ OK - Aplicación respondiendo"
    curl -s "http://localhost:3001/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/health"
else
    echo "❌ ERROR - Aplicación no responde"
fi

echo ""
echo "📋 Backups (últimos 5):"
ls -lah backups/ | grep -E "\.(sql|gz|zip)$" | tail -5 || echo "No hay backups"

echo ""
echo "📝 Logs recientes:"
docker-compose -f docker-compose.prod.yml logs --tail=5 app 2>/dev/null || echo "No hay logs"
EOF

chmod +x scripts/monitor.sh

# Script de limpieza
cat > scripts/cleanup.sh << 'EOF'
#!/bin/bash
echo "🧹 Limpieza del sistema Docker..."

docker container prune -f
docker image prune -f
docker volume prune -f
docker network prune -f

# Limpiar backups antiguos
find backups/ -name "*.sql" -mtime +30 -delete 2>/dev/null || true
find backups/ -name "*.gz" -mtime +30 -delete 2>/dev/null || true
find backups/ -name "*.zip" -mtime +30 -delete 2>/dev/null || true

echo "✅ Limpieza completada"
df -h | grep -E "Filesystem|/dev/"
EOF

chmod +x scripts/cleanup.sh

# Configurar cron
log "⏰ Configurando tareas automáticas..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && ./scripts/backup-db.sh auto >> logs/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd $PROJECT_DIR && ./scripts/cleanup.sh >> logs/cleanup.log 2>&1") | crontab -

# Archivo de configuración
log "📝 Creando configuración de ejemplo..."
cat > .env.prod.example << 'EOF'
# === CONFIGURACIÓN BOOKING2 BACKEND ===

# Docker
DOCKER_USERNAME=tu-usuario-dockerhub

# Aplicación
EXTERNAL_PORT=3001
NODE_ENV=production

# Base de datos (Docker local)
DB_NAME=booking2
DB_USER=postgres
DB_PASS=booking123456
DB_EXTERNAL_PORT=5432

# Seguridad
JWT_SECRET=cambia-este-secreto-por-uno-muy-seguro
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EOF

# Documentación rápida
log "📖 Creando guía rápida..."
cat > QUICK_GUIDE.md << 'EOF'
# 🚀 Guía Rápida - Booking2 Backend

## ⚡ Comandos Esenciales

```bash
cd /opt/booking2

# 👀 Ver estado
./scripts/monitor.sh

# 🔄 Reiniciar app
docker-compose -f docker-compose.prod.yml restart app

# 📝 Ver logs
docker-compose -f docker-compose.prod.yml logs -f app

# 💾 Backup manual
./scripts/backup-db.sh manual

# 🧹 Limpieza
./scripts/cleanup.sh
```

## 🗂️ Estructura
```
/opt/booking2/
├── docker-compose.prod.yml  # ⚙️ Configuración
├── .env.prod               # 🔐 Variables
├── backups/               # 💾 Backups BD
├── scripts/              # 🛠️ Utilidades
└── logs/                # 📝 Logs sistema
```

## 🆘 Problemas Comunes

**App no responde:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

**BD corrupta:**
```bash
./scripts/restore-db.sh
```

**Sin espacio:**
```bash
./scripts/cleanup.sh
```

**Ver qué consume espacio:**
```bash
docker system df
du -sh /opt/booking2/*
```
EOF

log "✅ ¡Configuración completada!"
echo ""
info "🎯 Próximos pasos:"
echo "   1. 📝 Copiar .env.prod.example a .env.prod y configurar"
echo "   2. 🔑 Configurar secretos en GitHub:"
echo "      - DOCKER_USERNAME, DOCKER_PASSWORD"
echo "      - SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY"
echo "      - DB_PASS, JWT_SECRET, etc."
echo "   3. 🚀 Push a main/master para desplegar"
echo ""
info "📂 Proyecto: $PROJECT_DIR"
info "📖 Guía: $PROJECT_DIR/QUICK_GUIDE.md"
echo ""
warn "⚠️  REINICIA la sesión para usar Docker sin sudo"
warn "⚠️  O ejecuta: newgrp docker"