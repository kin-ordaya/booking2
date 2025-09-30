#!/bin/bash

# Script para desarrollo local y testing

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] $1${NC}"
    exit 1
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev         Iniciar en modo desarrollo"
    echo "  test        Ejecutar todos los tests"
    echo "  build       Construir la aplicación"
    echo "  docker      Construir y ejecutar con Docker"
    echo "  clean       Limpiar archivos generados"
    echo "  lint        Ejecutar linter"
    echo "  format      Formatear código"
    echo "  health      Verificar health check local"
    echo "  help        Mostrar esta ayuda"
}

# Verificar que Node.js esté instalado
check_node() {
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
    fi
}

# Instalar dependencias si es necesario
install_deps() {
    if [ ! -d "node_modules" ]; then
        log "Instalando dependencias..."
        npm install
    fi
}

# Comando: dev
cmd_dev() {
    log "Iniciando aplicación en modo desarrollo..."
    check_node
    install_deps
    npm run start:dev
}

# Comando: test
cmd_test() {
    log "Ejecutando tests..."
    check_node
    install_deps
    
    log "Ejecutando linter..."
    npm run lint
    
    log "Ejecutando tests unitarios..."
    npm run test
    
    log "Ejecutando tests e2e..."
    npm run test:e2e
    
    log "✅ Todos los tests pasaron!"
}

# Comando: build
cmd_build() {
    log "Construyendo aplicación..."
    check_node
    install_deps
    npm run build
    log "✅ Build completado!"
}

# Comando: docker
cmd_docker() {
    log "Construyendo imagen Docker..."
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    docker build -t booking2-backend .
    
    log "Ejecutando contenedor..."
    docker run --rm -p 3000:3000 \
        -e NODE_ENV=development \
        -e DB_HOST=host.docker.internal \
        -e DB_PORT=5432 \
        -e DB_USER=postgres \
        -e DB_PASS=password \
        -e DB_NAME=booking2 \
        booking2-backend
}

# Comando: clean
cmd_clean() {
    log "Limpiando archivos generados..."
    rm -rf dist/
    rm -rf coverage/
    rm -rf node_modules/.cache/
    log "✅ Limpieza completada!"
}

# Comando: lint
cmd_lint() {
    log "Ejecutando linter..."
    check_node
    install_deps
    npm run lint
    log "✅ Linting completado!"
}

# Comando: format
cmd_format() {
    log "Formateando código..."
    check_node
    install_deps
    npm run format
    log "✅ Formateo completado!"
}

# Comando: health
cmd_health() {
    log "Verificando health check..."
    
    # Verificar si la aplicación está corriendo
    if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
        log "✅ Aplicación está corriendo y saludable"
        curl -s "http://localhost:3000/health" | jq . 2>/dev/null || curl -s "http://localhost:3000/health"
    else
        warn "❌ Aplicación no está respondiendo en http://localhost:3000/health"
        warn "¿Está la aplicación corriendo? Ejecuta: ./dev.sh dev"
    fi
}

# Procesar comando
case "${1:-help}" in
    dev)
        cmd_dev
        ;;
    test)
        cmd_test
        ;;
    build)
        cmd_build
        ;;
    docker)
        cmd_docker
        ;;
    clean)
        cmd_clean
        ;;
    lint)
        cmd_lint
        ;;
    format)
        cmd_format
        ;;
    health)
        cmd_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Comando desconocido: $1. Usa '$0 help' para ver comandos disponibles."
        ;;
esac