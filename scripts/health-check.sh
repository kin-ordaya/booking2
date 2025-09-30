#!/bin/bash

# Script de verificación de salud para Booking2 Backend
# Uso: ./health-check.sh [puerto]

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración
PORT=${1:-3001}
HOST="localhost"
TIMEOUT=10
MAX_RETRIES=3

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Función para verificar si un servicio responde
check_service() {
    local url=$1
    local service_name=$2
    local retry=0
    
    while [[ $retry -lt $MAX_RETRIES ]]; do
        if curl -f -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            log "✅ $service_name está funcionando correctamente"
            return 0
        fi
        
        ((retry++))
        if [[ $retry -lt $MAX_RETRIES ]]; then
            warn "Intento $retry/$MAX_RETRIES falló para $service_name, reintentando..."
            sleep 2
        fi
    done
    
    error "❌ $service_name no está respondiendo después de $MAX_RETRIES intentos"
    return 1
}

# Función para verificar el estado de Docker
check_docker() {
    log "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        return 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker no está corriendo"
        return 1
    fi
    
    log "✅ Docker está funcionando correctamente"
    return 0
}

# Función para verificar contenedores
check_containers() {
    log "Verificando contenedores..."
    
    local containers=("booking2-app-prod")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
            local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
            
            if [[ "$status" == "healthy" ]] || [[ "$status" == "no-healthcheck" ]]; then
                log "✅ Contenedor $container está corriendo"
            else
                error "❌ Contenedor $container no está saludable (estado: $status)"
                all_healthy=false
            fi
        else
            error "❌ Contenedor $container no está corriendo"
            all_healthy=false
        fi
    done
    
    return $([[ "$all_healthy" == true ]] && echo 0 || echo 1)
}

# Función para verificar uso de recursos
check_resources() {
    log "Verificando uso de recursos..."
    
    # Verificar memoria
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local mem_threshold=90
    
    if (( $(echo "$mem_usage > $mem_threshold" | bc -l) )); then
        warn "⚠️ Uso de memoria alto: ${mem_usage}%"
    else
        log "✅ Uso de memoria normal: ${mem_usage}%"
    fi
    
    # Verificar disco
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    local disk_threshold=85
    
    if [[ $disk_usage -gt $disk_threshold ]]; then
        warn "⚠️ Uso de disco alto: ${disk_usage}%"
    else
        log "✅ Uso de disco normal: ${disk_usage}%"
    fi
    
    # Verificar carga del sistema
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_threshold=$(echo "$cpu_cores * 2" | bc)
    
    if (( $(echo "$load_avg > $load_threshold" | bc -l) )); then
        warn "⚠️ Carga del sistema alta: $load_avg (cores: $cpu_cores)"
    else
        log "✅ Carga del sistema normal: $load_avg (cores: $cpu_cores)"
    fi
}

# Función para verificar conectividad de red
check_network() {
    log "Verificando conectividad de red..."
    
    # Verificar conectividad externa
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log "✅ Conectividad externa funcionando"
    else
        warn "⚠️ Sin conectividad externa"
    fi
    
    # Verificar puertos
    local ports=("$PORT")
    for port in "${ports[@]}"; do
        if netstat -tuln | grep -q ":$port "; then
            log "✅ Puerto $port está abierto"
        else
            error "❌ Puerto $port no está abierto"
        fi
    done
}

# Función principal de verificación de salud
main_health_check() {
    log "🏥 Iniciando verificación de salud completa..."
    echo ""
    
    local overall_status=0
    
    # Verificar Docker
    check_docker || overall_status=1
    echo ""
    
    # Verificar contenedores
    check_containers || overall_status=1
    echo ""
    
    # Verificar servicios web
    log "Verificando servicios web..."
    check_service "http://$HOST:$PORT/health" "API Health Endpoint" || overall_status=1
    check_service "http://$HOST:$PORT/api" "API Documentation" || overall_status=1
    echo ""
    
    # Verificar recursos
    check_resources
    echo ""
    
    # Verificar red
    check_network
    echo ""
    
    # Mostrar logs recientes si hay problemas
    if [[ $overall_status -ne 0 ]]; then
        warn "Mostrando logs recientes de la aplicación..."
        docker-compose -f /opt/booking2/docker-compose.prod.yml logs --tail=20 app 2>/dev/null || echo "No se pudieron obtener los logs"
        echo ""
    fi
    
    # Resultado final
    if [[ $overall_status -eq 0 ]]; then
        log "🎉 Todas las verificaciones pasaron exitosamente"
        echo ""
        echo "=== Resumen del Sistema ==="
        echo "• Aplicación: ✅ Funcionando"
        echo "• Puerto: $PORT"
        echo "• Memoria: $(free -h | grep Mem | awk '{print $3"/"$2}')"
        echo "• Disco: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" usado)"}')"
        echo "• Uptime: $(uptime -p)"
    else
        error "❌ Algunas verificaciones fallaron"
        echo ""
        echo "=== Comandos de Diagnóstico ==="
        echo "• Ver logs: docker-compose -f /opt/booking2/docker-compose.prod.yml logs -f app"
        echo "• Estado contenedores: docker ps"
        echo "• Reiniciar aplicación: docker-compose -f /opt/booking2/docker-compose.prod.yml restart app"
        echo "• Monitoreo recursos: htop"
    fi
    
    return $overall_status
}

# Ejecutar verificación
main_health_check

exit $?