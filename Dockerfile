FROM node:18-alpine

# Instalar curl para el health check
RUN apk add --no-cache curl

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Remover devDependencies después de compilar
RUN npm prune --production

# Crear un usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Crear directorio de logs con permisos apropiados
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Cambiar propiedad del directorio de la app al usuario nestjs
RUN chown -R nestjs:nodejs /app
RUN chmod -R 755 /app

# Copiar y hacer ejecutable el script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto 3001 (configurado por T.I)
EXPOSE 3001

# Agregar health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Usar el script de entrada
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]