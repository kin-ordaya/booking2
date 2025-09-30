#!/bin/bash

# Script de restore para la base de datos
# Uso: ./restore-db.sh [archivo_backup.sql.gz] [--force]

set -e

BACKUP_FILE=$1
FORCE_RESTORE=$2
BACKUP_DIR="./backups"

# Colores
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

show_help() {
    echo "Uso: $0 [archivo_backup.sql.gz] [--force]"
    echo ""
    echo "Parámetros:"
    echo "  archivo_backup.sql.gz  Archivo de backup a restaurar (opcional)"
    echo "  --force               Forzar restore sin confirmación"
    echo ""
    echo "Si no especificas un archivo, se usará el backup más reciente."
    echo ""
    echo "Backups disponibles:"
    ls -lah "$BACKUP_DIR"/*.gz 2>/dev/null || echo "  No hay backups disponibles"
}

# Mostrar ayuda si se solicita
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Verificar que la base de datos esté corriendo
if ! docker ps | grep -q "booking2-db-prod"; then
    error "La base de datos no está corriendo. Ejecuta: docker-compose -f docker-compose.prod.yml up -d db"
fi

# Determinar archivo de backup a usar
if [ -z "$BACKUP_FILE" ]; then
    # Usar el backup más reciente
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | head -n1)
    if [ -z "$BACKUP_FILE" ]; then
        error "No se encontraron archivos de backup. Ejecuta primero: ./scripts/backup-db.sh"
    fi
    log "📁 Usando el backup más reciente: $(basename "$BACKUP_FILE")"
else
    # Verificar que el archivo existe
    if [ ! -f "$BACKUP_FILE" ]; then
        # Intentar buscar en el directorio de backups
        if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
            BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
        else
            error "Archivo de backup no encontrado: $BACKUP_FILE"
        fi
    fi
fi

# Obtener variables de entorno
DB_NAME=${DB_NAME:-booking2}
DB_USER=${DB_USER:-postgres}

# Mostrar información del backup
log "📋 Información del backup:"
log "  Archivo: $(basename "$BACKUP_FILE")"
log "  Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
log "  Fecha: $(date -r "$BACKUP_FILE" 2>/dev/null || stat -c %y "$BACKUP_FILE" 2>/dev/null || echo "No disponible")"

# Confirmación (solo si no se usa --force)
if [ "$FORCE_RESTORE" != "--force" ]; then
    echo ""
    warn "⚠️  ADVERTENCIA: Este proceso REEMPLAZARÁ todos los datos actuales en la base de datos '$DB_NAME'"
    echo ""
    read -p "¿Estás seguro que quieres continuar? (escribe 'SI' para confirmar): " confirm
    if [ "$confirm" != "SI" ]; then
        log "❌ Restore cancelado por el usuario"
        exit 0
    fi
fi

# Crear backup de seguridad antes del restore
log "💾 Creando backup de seguridad antes del restore..."
SAFETY_BACKUP="$BACKUP_DIR/before_restore_$(date +"%Y%m%d_%H%M%S").sql"
docker exec booking2-db-prod pg_dump -U "$DB_USER" -d "$DB_NAME" --no-password > "$SAFETY_BACKUP"
gzip "$SAFETY_BACKUP"
log "✅ Backup de seguridad creado: ${SAFETY_BACKUP}.gz"

# Detener la aplicación temporalmente
log "⏸️  Deteniendo la aplicación..."
docker-compose -f docker-compose.prod.yml stop app

# Descomprimir el backup si es necesario
TEMP_SQL_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    TEMP_SQL_FILE="/tmp/restore_$(date +"%Y%m%d_%H%M%S").sql"
    log "📂 Descomprimiendo backup..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_SQL_FILE"
    SQL_FILE="$TEMP_SQL_FILE"
else
    SQL_FILE="$BACKUP_FILE"
fi

# Restaurar la base de datos
log "🔄 Iniciando restore de la base de datos..."

# Terminar conexiones activas
docker exec booking2-db-prod psql -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

# Eliminar y recrear la base de datos
log "🗑️  Eliminando base de datos existente..."
docker exec booking2-db-prod dropdb -U "$DB_USER" "$DB_NAME" || warn "La base de datos no existía"

log "🆕 Creando nueva base de datos..."
docker exec booking2-db-prod createdb -U "$DB_USER" "$DB_NAME"

# Restaurar desde el backup
log "📥 Restaurando datos desde el backup..."
if [ -n "$TEMP_SQL_FILE" ]; then
    # Copiar archivo al contenedor y restaurar
    docker cp "$SQL_FILE" booking2-db-prod:/tmp/restore.sql
    docker exec booking2-db-prod psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/restore.sql
    docker exec booking2-db-prod rm /tmp/restore.sql
    rm "$TEMP_SQL_FILE"
else
    docker exec -i booking2-db-prod psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"
fi

if [ $? -eq 0 ]; then
    log "✅ Restore completado exitosamente!"
    
    # Reiniciar la aplicación
    log "▶️  Reiniciando la aplicación..."
    docker-compose -f docker-compose.prod.yml up -d app
    
    # Esperar a que la aplicación esté lista
    log "⏳ Esperando a que la aplicación esté lista..."
    sleep 10
    
    # Verificar que la aplicación responda
    if curl -f -s "http://localhost:${EXTERNAL_PORT:-3001}/health" > /dev/null 2>&1; then
        log "🎉 ¡Restore completado y aplicación funcionando correctamente!"
    else
        warn "⚠️  Restore completado pero la aplicación podría no estar respondiendo"
        log "💡 Verifica los logs: docker-compose -f docker-compose.prod.yml logs app"
    fi
    
    log "📊 Estadísticas de la base de datos restaurada:"
    docker exec booking2-db-prod psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT schemaname,tablename,n_tup_ins as inserts,n_tup_upd as updates,n_tup_del as deletes 
        FROM pg_stat_user_tables 
        ORDER BY schemaname,tablename;
    "
else
    error "❌ Error durante el restore"
fi