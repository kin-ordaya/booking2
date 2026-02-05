<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
  <h1>🎓 Booking2</h1>
  <h3>Sistema de Gestión de Reservas Académicas</h3>
  
  [![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.16.0-blue.svg)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-Support-2496ED.svg)](https://www.docker.com/)
</div>

## 📋 Descripción del Proyecto

**Booking2** es un sistema de gestión de reservas académicas desarrollado con NestJS que permite la administración completa de recursos educativos, aulas, laboratorios, estudiantes y reservas en un entorno universitario. El sistema está diseñado para facilitar la gestión de espacios académicos, horarios de clases y recursos educativos de manera eficiente y organizada.

### 🎯 Características Principales

- **Gestión de Recursos Académicos**: Administración de aulas, laboratorios, pabellones y campus
- **Sistema de Reservas**: Reserva de espacios académicos con validación de horarios
- **Gestión de Usuarios**: Sistema completo de autenticación y autorización con JWT
- **Administración de Cursos**: Gestión de cursos, modalidades y planes de estudio
- **Sistema de Estudiantes**: Registro y gestión de estudiantes y matrículas
- **API RESTful**: API completa con documentación Swagger
- **Base de Datos PostgreSQL**: Almacenamiento robusto y escalable
- **Validación de Datos**: Validación automática con class-validator
- **Sistema de Emails**: Notificaciones automáticas por correo electrónico

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado siguiendo los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**, organizando el código en módulos independientes:

### 📁 Estructura de Módulos

```
src/
├── auth/                    # Autenticación y autorización
├── usuario/                 # Gestión de usuarios
├── estudiante/             # Gestión de estudiantes
├── curso/                  # Gestión de cursos
├── aula/                   # Gestión de aulas
├── laboratorio/            # Gestión de laboratorios
├── reserva/                # Sistema de reservas
├── campus/                 # Gestión de campus
├── facultad/               # Gestión de facultades
├── eap/                    # Escuelas Académico Profesionales
├── plan/                   # Planes de estudio
├── horario/                # Gestión de horarios
├── email/                  # Sistema de notificaciones
└── common/                 # Utilidades compartidas
```

## 🚀 Tecnologías Utilizadas

### Backend
- **NestJS 11.0.1** - Framework de Node.js para aplicaciones escalables
- **TypeScript 5.7.3** - Lenguaje de programación tipado
- **PostgreSQL** - Base de datos relacional
- **TypeORM** - ORM para TypeScript y JavaScript
- **JWT** - Autenticación basada en tokens
- **Swagger** - Documentación automática de API
- **Class Validator** - Validación de DTOs
- **Nodemailer** - Envío de correos electrónicos

### Herramientas de Desarrollo
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formateador de código
- **Jest** - Framework de testing
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- PostgreSQL (versión 12 o superior)
- Docker y Docker Compose (opcional)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd booking2
```

### 2. Instalar Dependencias

```bash
# Instalación de dependencias principales
npm install

# Dependencias adicionales (si no están incluidas)
npm install @nestjs/config class-validator class-transformer
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/swagger swagger-ui-express
npm install bcryptjs @nestjs/jwt
npm install nestjs-pino pino-http pino-pretty
npm install nodemailer
```

### 3. Configuración de Base de Datos

#### Opción A: Docker Compose (Recomendado)

```bash
# Levantar la base de datos
docker-compose up -d

# Detener la base de datos
docker-compose down
```

#### Opción B: PostgreSQL Local

Crear una base de datos PostgreSQL y configurar las variables de entorno.

### 4. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=booking2

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRATION=1h

# Puerto de la aplicación
PORT=3000

# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Timezone
TZ=America/Lima
```

### 5. Ejecutar la Aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run start:prod

# Modo debug
npm run start:debug
```

## 📚 Uso de la API

### Documentación Swagger

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/docs
```

### Endpoints Principales

- **Autenticación**: `/auth/*`
- **Usuarios**: `/usuario/*`
- **Estudiantes**: `/estudiante/*`
- **Cursos**: `/curso/*`
- **Aulas**: `/aula/*`
- **Reservas**: `/reserva/*`
- **Campus**: `/campus/*`

### Autenticación

El sistema utiliza JWT para la autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu_token_jwt>
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests e2e
npm run test:e2e
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia en modo desarrollo con hot-reload
npm run start:debug        # Inicia en modo debug

# Producción
npm run build              # Compila el proyecto
npm run start:prod         # Inicia en modo producción

# Calidad de código
npm run lint               # Ejecuta ESLint
npm run format             # Formatea el código con Prettier

# Testing
npm run test               # Ejecuta tests unitarios
npm run test:e2e           # Ejecuta tests end-to-end
```

## 🐳 Docker

### Construir la imagen

```bash
docker build -t booking2 .
```

### Ejecutar con Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📝 Actualización de Dependencias

```bash
# Instalar herramienta de actualización
npm install -g npm-check-updates

# Actualizar dependencias de NestJS
ncu -u -f /^@nestjs/

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## ⚠️ Consideraciones Importantes

### Archivo .env
- **CRÍTICO**: El proyecto no funciona sin el archivo `.env`
- Configura todas las variables de entorno necesarias
- Mantén las credenciales seguras y no las subas al repositorio

### Configuración de Timezone
- **IMPORTANTE**: Configura el timezone a `America/Lima` en el archivo `.env`
- Esto es necesario para el correcto funcionamiento de las fechas y horarios

### Base de Datos
- El sistema utiliza `synchronize: false` en desarrollo 
- En producción, usa migraciones de TypeORM
- Configura el timezone UTC en la conexión a la base de datos
⚠️ Si se quiere migrar a una base de datos nueva y vacia, se debe crear el esquema, por ejemplo: "public"
## Migracion en Local/Desarrollo:

# 1. Creas/modificas una entidad
#    src/usuarios/entities/usuario.entity.ts

# 2. Compilas
npm run build

# 3. Generas migración (detecta cambios vs DB)
npm run migration:generate --name=AddEmailToUsuario

# 4. Se crea: src/migrations/123456789-AddEmailToUsuario.ts
#    Este archivo se COMMITEa a Git

# 5. Probamos localmente
npm run migration:run:dev

## En servidor/producción:
# 1. Pull del código (incluye nueva migración)
git pull origin main

# 2. Instalar dependencias
npm install

# 3. Compilar proyecto
npm run build

# 4. Ejecutar migraciones PENDIENTES
#    TypeORM lleva registro en tabla 'migrations'
npm run migration:run:prod
## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Validación de datos de entrada
- Encriptación de contraseñas con bcrypt
- CORS habilitado para desarrollo
- Headers de seguridad recomendados

## 📈 Monitoreo y Logs

- Sistema de logging con Pino
- Logs estructurados en formato JSON
- Configuración de niveles de log
- Integración con herramientas de monitoreo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

⚠️ **ADVERTENCIA**: Este código es solo para fines demostrativos. No está autorizado su uso, redistribución ni modificación sin consentimiento del autor.

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando NestJS y TypeScript**