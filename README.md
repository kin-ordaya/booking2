## Advertencia
⚠️ Este código es solo para fines demostrativos en Replit. No está autorizado su uso, redistribución ni modificación sin consentimiento del autor.
## Instalación

```bash
#Instalacion de npm(gestor de paquetes)
$ npm i
```
```bash
#Ejecutar proyecto
$ npm run start:dev
```
```bash
#Verificar actualizaciones y actualizar el package.json, se debe eliminad el package.json y la carpeta node_modules
$ npm i -g npm-check-updates
$ ncu -u -f /^@nestjs/
```
```bash
# Variables de Entorno( Uso de .env)
$ npm i @nestjs/config
```
```bash
# Class Validator y Class Transformer
$ npm install class-validator class-transformer
```
```bash
# Type ORM con postgres
$ npm i @nestjs/typeorm typeorm pg
```
```bash
# Swagger
$ npm install @nestjs/swagger swagger-ui-express

```
```bash
# BCRYPTJS
$ npm i brcyptjs
```
```bash
# Levantar y apagar la bd
$ docker-compose up -d
$ docker-compose down
```
```bash
# Correr el proyecto
$ npm run start:dev
```
```bash
# Instalar de pino para logging
$ npm i nestjs-pino pino-http pino-pretty
```
```bash
# Instalar de bcryptjs para encriptar la contraseña
$ npm i bcryptjs
```
```bash
# Instalar de @nestjs/jwt para usar JWT
$ npm install --save @nestjs/jwt
```

!#Importante
⚠️ El proyecto no funciona sin el archivo .env, por lo que es necesario crearlo y ponerle los datos de conexión a la base de datos.

!#Importante
⚠️ Cuando se ejecute el despliegue es importante configurar el timezone America / Lima, por lo que es necesario modificar el archivo .env