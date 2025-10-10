FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

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

# Exponer puerto
EXPOSE 3000

# Usar el script de entrada
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]