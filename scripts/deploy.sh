#!/bin/bash

# Script de despliegue para Booking2 Backend
# Uso: ./deploy.sh [production|development]

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
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

# Verificar argumentos
ENVIRONMENT=${1:-production}
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "development" ]]; then
    error "Ambiente inválido. Usa 'production' o 'development'"
fi

log "Iniciando despliegue en ambiente: $ENVIRONMENT"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
fi

# Definir archivos de configuración según el ambiente
if [[ "$ENVIRONMENT" == "production" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.prod"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.dev"
fi

# Verificar que los archivos necesarios existan
if [[ ! -f "$COMPOSE_FILE" ]]; then
    error "Archivo $COMPOSE_FILE no encontrado"
fi

if [[ ! -f "$ENV_FILE" ]]; then
    warn "Archivo $ENV_FILE no encontrado, usando variables de entorno del sistema"
fi

# Función para verificar la salud de la aplicación
check_health() {
    local max_attempts=30
    local attempt=1
    local port=${EXTERNAL_PORT:-3000}
    
    log "Verificando salud de la aplicación en puerto $port..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            log "✅ Aplicación está saludable"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    error "❌ La aplicación no responde después de $max_attempts intentos"
}

# Crear backup de la base de datos si existe
backup_database() {
    if docker ps | grep -q "booking2-db"; then
        log "Creando backup de la base de datos..."
        local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec booking2-db pg_dump -U postgres booking2 > "backups/$backup_file" || warn "No se pudo crear el backup"
        log "Backup creado: $backup_file"
    fi
}

# Crear directorio de backups si no existe
mkdir -p backups

# Hacer backup si estamos en producción
if [[ "$ENVIRONMENT" == "production" ]]; then
    backup_database
fi

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Limpiar imágenes no utilizadas
log "Limpiando imágenes no utilizadas..."
docker image prune -f

# Si estamos en producción, hacer pull de la imagen más reciente
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "Descargando imagen más reciente..."
    docker-compose -f "$COMPOSE_FILE" pull
fi

# Construir y levantar servicios
log "Construyendo y levantando servicios..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    docker-compose -f "$COMPOSE_FILE" up -d --build
else
    docker-compose -f "$COMPOSE_FILE" up -d --build
fi

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 10

# Verificar que los contenedores estén corriendo
log "Verificando estado de los contenedores..."
docker-compose -f "$COMPOSE_FILE" ps

# Verificar salud de la aplicación
check_health

# Mostrar logs recientes
log "Mostrando logs recientes..."
docker-compose -f "$COMPOSE_FILE" logs --tail=20 app

log "🎉 Despliegue completado exitosamente en ambiente: $ENVIRONMENT"

# Mostrar información útil
echo ""
echo "=== Información del Despliegue ==="
echo "Ambiente: $ENVIRONMENT"
echo "Archivo de configuración: $COMPOSE_FILE"
echo "Puerto: ${EXTERNAL_PORT:-3000}"
echo ""
echo "Comandos útiles:"
echo "  Ver logs: docker-compose -f $COMPOSE_FILE logs -f app"
echo "  Reiniciar: docker-compose -f $COMPOSE_FILE restart app"
echo "  Detener: docker-compose -f $COMPOSE_FILE down"
echo "  Estado: docker-compose -f $COMPOSE_FILE ps"