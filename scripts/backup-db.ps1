# Script de backup para Windows PowerShell
# Uso: .\backup-db.ps1 [-Type manual|auto]

param(
    [Parameter(Position=0)]
    [ValidateSet("manual", "auto")]
    [string]$Type = "manual"
)

# Configuración
$BackupDir = ".\backups"
$RetentionDays = 30
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Funciones de logging
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor Red
    exit 1
}

# Crear directorio de backups
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Verificar que Docker esté corriendo
if (-not (docker ps | Select-String "booking2-db-prod")) {
    Write-Error-Custom "La base de datos no está corriendo. Ejecuta: docker-compose -f docker-compose.prod.yml up -d db"
}

# Variables de entorno
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "booking2" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }

# Crear backup
$BackupFile = "$BackupDir\booking2_${Type}_${Timestamp}.sql"
$CompressedFile = "$BackupFile.gz"

Write-Log "Iniciando backup de la base de datos '$DbName'..."
Write-Log "Tipo: $Type"
Write-Log "Archivo: $BackupFile"

# Ejecutar pg_dump
try {
    docker exec booking2-db-prod pg_dump -U $DbUser -d $DbName --verbose --no-password | Out-File -FilePath $BackupFile -Encoding UTF8
    
    Write-Log "✅ Backup SQL creado exitosamente"
    
    # Comprimir usando 7zip si está disponible, sino usar PowerShell
    if (Get-Command 7z -ErrorAction SilentlyContinue) {
        7z a "$CompressedFile" "$BackupFile"
        Remove-Item $BackupFile
    } else {
        # Usar PowerShell para comprimir
        Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip" -Force
        Remove-Item $BackupFile
        $CompressedFile = "$BackupFile.zip"
    }
    
    Write-Log "✅ Backup comprimido: $CompressedFile"
    
    # Mostrar tamaño
    $Size = [math]::Round((Get-Item $CompressedFile).Length / 1MB, 2)
    Write-Log "📊 Tamaño del backup: $Size MB"
    
    # Limpiar backups antiguos
    Write-Log "🧹 Limpiando backups antiguos (más de $RetentionDays días)..."
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem $BackupDir -Filter "*.gz" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force
    Get-ChildItem $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force
    
    # Listar backups disponibles
    Write-Log "📋 Backups disponibles:"
    Get-ChildItem $BackupDir -Filter "*.gz", "*.zip" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
    
    Write-Log "🎉 Backup completado exitosamente!"
    
    # Backup de estructura si es automático
    if ($Type -eq "auto") {
        $SchemaFile = "$BackupDir\schema_${Timestamp}.sql"
        Write-Log "📋 Creando backup de estructura..."
        docker exec booking2-db-prod pg_dump -U $DbUser -d $DbName --schema-only --verbose --no-password | Out-File -FilePath $SchemaFile -Encoding UTF8
        
        if (Get-Command 7z -ErrorAction SilentlyContinue) {
            7z a "$SchemaFile.gz" $SchemaFile
            Remove-Item $SchemaFile
        } else {
            Compress-Archive -Path $SchemaFile -DestinationPath "$SchemaFile.zip" -Force
            Remove-Item $SchemaFile
        }
        
        Write-Log "✅ Estructura guardada: $SchemaFile"
    }
}
catch {
    Write-Error-Custom "❌ Error al crear el backup: $($_.Exception.Message)"
}