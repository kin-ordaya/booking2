#!/bin/bash

# Script para configurar servidor desde cero para Booking2 Backend
# Uso: curl -sSL https://raw.githubusercontent.com/tu-usuario/booking2/main/scripts/setup-server.sh | bash

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar que se ejecute como root o con sudo
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root o con sudo"
fi

log "🚀 Iniciando configuración del servidor para Booking2 Backend"

# Actualizar sistema
log "📦 Actualizando sistema..."
apt-get update -y
apt-get upgrade -y

# Instalar dependencias básicas
log "🔧 Instalando dependencias básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    htop \
    nano \
    vim

# Instalar Docker
log "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Agregar usuario actual al grupo docker
    if [[ -n "$SUDO_USER" ]]; then
        usermod -aG docker "$SUDO_USER"
        log "Usuario $SUDO_USER agregado al grupo docker"
    fi
else
    log "Docker ya está instalado"
fi

# Instalar Docker Compose
log "🔨 Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    log "Docker Compose ya está instalado"
fi

# Configurar firewall
log "🔥 Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw --force enable

# Crear directorio del proyecto
PROJECT_DIR="/opt/booking2"
log "📁 Creando directorio del proyecto: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/backups"
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/ssl"

# Configurar permisos
if [[ -n "$SUDO_USER" ]]; then
    chown -R "$SUDO_USER:$SUDO_USER" "$PROJECT_DIR"
    log "Permisos configurados para usuario: $SUDO_USER"
fi

# Instalar Node.js (para herramientas adicionales si es necesario)
log "📦 Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    log "Node.js ya está instalado"
fi

# Configurar logrotate para logs de Docker
log "📋 Configurando rotación de logs..."
cat > /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Configurar límites de recursos del sistema
log "⚙️ Configurando límites del sistema..."
cat >> /etc/security/limits.conf << EOF
# Límites para aplicaciones Docker
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Configurar sysctl para mejor rendimiento
cat >> /etc/sysctl.conf << EOF
# Configuración para mejor rendimiento de red
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
EOF

sysctl -p

# Crear script de monitoreo básico
log "📊 Creando script de monitoreo..."
cat > "$PROJECT_DIR/monitor.sh" << 'EOF'
#!/bin/bash
echo "=== Estado del Sistema ==="
echo "Fecha: $(date)"
echo "Uptime: $(uptime)"
echo ""
echo "=== Uso de Memoria ==="
free -h
echo ""
echo "=== Uso de Disco ==="
df -h
echo ""
echo "=== Contenedores Docker ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Logs Recientes de la Aplicación ==="
docker-compose -f /opt/booking2/docker-compose.prod.yml logs --tail=10 app 2>/dev/null || echo "Aplicación no está corriendo"
EOF

chmod +x "$PROJECT_DIR/monitor.sh"

# Crear cron job para monitoreo (opcional)
log "⏰ Configurando monitoreo automático..."
cat > /etc/cron.d/booking2-monitor << EOF
# Monitoreo cada 5 minutos
*/5 * * * * root $PROJECT_DIR/monitor.sh >> $PROJECT_DIR/logs/monitor.log 2>&1
# Limpiar logs antiguos cada día
0 2 * * * root find $PROJECT_DIR/logs -name "*.log" -mtime +7 -delete
EOF

# Configurar swap si no existe (para servidores pequeños)
if [[ ! -f /swapfile ]]; then
    log "💾 Configurando archivo swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Instalar herramientas de monitoreo adicionales
log "📈 Instalando herramientas de monitoreo..."
apt-get install -y htop iotop nethogs

# Crear usuario de despliegue si no existe
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
    log "👤 Creando usuario de despliegue: $DEPLOY_USER"
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    usermod -aG sudo "$DEPLOY_USER"
    
    # Configurar SSH para el usuario deploy
    mkdir -p "/home/$DEPLOY_USER/.ssh"
    chmod 700 "/home/$DEPLOY_USER/.ssh"
    chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
    
    info "Usuario $DEPLOY_USER creado. Configura su clave SSH manualmente."
fi

# Limpiar
log "🧹 Limpiando archivos temporales..."
apt-get autoremove -y
apt-get autoclean

log "✅ Configuración del servidor completada!"
echo ""
echo "=== Resumen de la Configuración ==="
echo "• Docker: $(docker --version)"
echo "• Docker Compose: $(docker-compose --version)"
echo "• Node.js: $(node --version)"
echo "• Directorio del proyecto: $PROJECT_DIR"
echo "• Usuario de despliegue: $DEPLOY_USER"
echo ""
echo "=== Próximos Pasos ==="
echo "1. Configurar claves SSH para el usuario $DEPLOY_USER"
echo "2. Clonar el repositorio en $PROJECT_DIR"
echo "3. Configurar variables de entorno"
echo "4. Ejecutar el primer despliegue"
echo ""
echo "=== Comandos Útiles ==="
echo "• Monitoreo: $PROJECT_DIR/monitor.sh"
echo "• Logs del sistema: journalctl -f"
echo "• Estado de Docker: systemctl status docker"
echo "• Firewall: ufw status"

if [[ -n "$SUDO_USER" ]]; then
    warn "Reinicia la sesión del usuario $SUDO_USER para aplicar los cambios de grupo"
fi