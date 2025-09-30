# Script para desarrollo local en Windows PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Colores para output
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Red
    exit 1
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Uso: .\dev.ps1 [COMANDO]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "  dev         Iniciar en modo desarrollo"
    Write-Host "  test        Ejecutar todos los tests"
    Write-Host "  build       Construir la aplicación"
    Write-Host "  docker      Construir y ejecutar con Docker"
    Write-Host "  clean       Limpiar archivos generados"
    Write-Host "  lint        Ejecutar linter"
    Write-Host "  format      Formatear código"
    Write-Host "  health      Verificar health check local"
    Write-Host "  help        Mostrar esta ayuda"
}

# Verificar que Node.js esté instalado
function Test-Node {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Node.js no está instalado"
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "npm no está instalado"
    }
}

# Instalar dependencias si es necesario
function Install-Dependencies {
    if (-not (Test-Path "node_modules")) {
        Write-Log "Instalando dependencias..."
        npm install
    }
}

# Comando: dev
function Start-Dev {
    Write-Log "Iniciando aplicación en modo desarrollo..."
    Test-Node
    Install-Dependencies
    npm run start:dev
}

# Comando: test
function Start-Test {
    Write-Log "Ejecutando tests..."
    Test-Node
    Install-Dependencies
    
    Write-Log "Ejecutando linter..."
    npm run lint
    
    Write-Log "Ejecutando tests unitarios..."
    npm run test
    
    Write-Log "Ejecutando tests e2e..."
    npm run test:e2e
    
    Write-Log "✅ Todos los tests pasaron!"
}

# Comando: build
function Start-Build {
    Write-Log "Construyendo aplicación..."
    Test-Node
    Install-Dependencies
    npm run build
    Write-Log "✅ Build completado!"
}

# Comando: docker
function Start-Docker {
    Write-Log "Construyendo imagen Docker..."
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Docker no está instalado"
    }
    
    docker build -t booking2-backend .
    
    Write-Log "Ejecutando contenedor..."
    docker run --rm -p 3000:3000 `
        -e NODE_ENV=development `
        -e DB_HOST=host.docker.internal `
        -e DB_PORT=5432 `
        -e DB_USER=postgres `
        -e DB_PASS=password `
        -e DB_NAME=booking2 `
        booking2-backend
}

# Comando: clean
function Start-Clean {
    Write-Log "Limpiando archivos generados..."
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "coverage") { Remove-Item -Recurse -Force "coverage" }
    if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
    Write-Log "✅ Limpieza completada!"
}

# Comando: lint
function Start-Lint {
    Write-Log "Ejecutando linter..."
    Test-Node
    Install-Dependencies
    npm run lint
    Write-Log "✅ Linting completado!"
}

# Comando: format
function Start-Format {
    Write-Log "Formateando código..."
    Test-Node
    Install-Dependencies
    npm run format
    Write-Log "✅ Formateo completado!"
}

# Comando: health
function Test-Health {
    Write-Log "Verificando health check..."
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -TimeoutSec 5
        Write-Log "✅ Aplicación está corriendo y saludable"
        $response | ConvertTo-Json -Depth 3
    }
    catch {
        Write-Warn "❌ Aplicación no está respondiendo en http://localhost:3000/health"
        Write-Warn "¿Está la aplicación corriendo? Ejecuta: .\dev.ps1 dev"
    }
}

# Procesar comando
switch ($Command.ToLower()) {
    "dev" { Start-Dev }
    "test" { Start-Test }
    "build" { Start-Build }
    "docker" { Start-Docker }
    "clean" { Start-Clean }
    "lint" { Start-Lint }
    "format" { Start-Format }
    "health" { Test-Health }
    "help" { Show-Help }
    default {
        Write-Error-Custom "Comando desconocido: $Command. Usa '.\dev.ps1 help' para ver comandos disponibles."
    }
}