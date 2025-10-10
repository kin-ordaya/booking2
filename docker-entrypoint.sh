#!/bin/sh

# Crear directorio de logs si no existe
mkdir -p /app/logs

# Establecer permisos apropiados
chmod 755 /app/logs

# Ejecutar el comando principal
exec "$@"
