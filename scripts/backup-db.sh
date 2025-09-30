#!/bin/bash

# Script de backup completo para la base de datos
# Uso: ./backup-db.sh [manual|auto]

set -e

# Configuración
BACKUP_DIR="./backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TYPE=${1:-manual}

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Verificar que la base de datos esté corriendo
if ! docker ps | grep -q "booking2-db-prod"; then
    error "La base de datos no está corriendo. Ejecuta: docker-compose -f docker-compose.prod.yml up -d db"
fi

# Obtener variables de entorno
DB_NAME=${DB_NAME:-booking2}
DB_USER=${DB_USER:-postgres}

# Crear backup
BACKUP_FILE="$BACKUP_DIR/booking2_${BACKUP_TYPE}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

log "Iniciando backup de la base de datos '$DB_NAME'..."
log "Tipo: $BACKUP_TYPE"
log "Archivo: $BACKUP_FILE"

# Ejecutar pg_dump dentro del contenedor
docker exec booking2-db-prod pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log "✅ Backup SQL creado exitosamente"
    
    # Comprimir el backup
    gzip "$BACKUP_FILE"
    log "✅ Backup comprimido: $COMPRESSED_FILE"
    
    # Mostrar información del archivo
    SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    log "📊 Tamaño del backup: $SIZE"
    
    # Limpiar backups antiguos
    log "🧹 Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    
    # Listar backups disponibles
    log "📋 Backups disponibles:"
    ls -lah "$BACKUP_DIR"/*.gz 2>/dev/null || warn "No hay backups comprimidos disponibles"
    
    log "🎉 Backup completado exitosamente!"
else
    error "❌ Error al crear el backup"
fi

# Si es backup automático, también crear un dump de la estructura
if [ "$BACKUP_TYPE" = "auto" ]; then
    SCHEMA_FILE="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
    log "📋 Creando backup de estructura..."
    docker exec booking2-db-prod pg_dump -U "$DB_USER" -d "$DB_NAME" --schema-only --verbose --no-password > "$SCHEMA_FILE"
    gzip "$SCHEMA_FILE"
    log "✅ Estructura guardada: ${SCHEMA_FILE}.gz"
fi