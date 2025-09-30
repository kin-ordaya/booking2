# 🔐 Configuración de Secretos - GitHub Actions

## 📋 **Secretos que debes configurar en GitHub**

Ve a: `GitHub` → `Tu repositorio` → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### **🐳 Docker Hub (Obligatorios)**
```
DOCKER_USERNAME = ravlabos2025
DOCKER_PASSWORD = rav202520
```

### **🔐 Aplicación (Recomendados como secretos)**
```
DB_PASS = una-password-muy-segura-para-postgres
JWT_SECRET = un-jwt-secret-muy-largo-y-seguro-de-al-menos-32-caracteres
GOOGLE_CLIENT_ID = 250973841532-lli1ka587c31cmtk7hk15dhd19f1phri.apps.googleusercontent.com
EMAIL_PASS = vgxh bgvr saac eviy
```

### **🖥️ Servidor (Solo si quieres auto-deploy)**
```
SERVER_HOST = tu-servidor.com
SERVER_USER = tu-usuario-ssh
SSH_PRIVATE_KEY = [contenido completo de tu clave privada SSH]
```

## 📝 **Variables que van directamente en docker-compose.prod.yml**

Estas NO son secretas y ya están configuradas:
```yaml
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=lab.recursosvirt@continental.edu.pe
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_NAME=booking2
NODE_ENV=production
```

## 🚀 **Para empezar rápido (sin servidor)**

Si solo quieres que GitHub Actions construya y suba la imagen a Docker Hub:

### **Mínimo necesario:**
```
DOCKER_USERNAME = ravlabos2025
DOCKER_PASSWORD = rav202520
```

### **Opcional pero recomendado:**
```
DB_PASS = booking123456
JWT_SECRET = mi-jwt-secret-para-desarrollo
GOOGLE_CLIENT_ID = 250973841532-lli1ka587c31cmtk7hk15dhd19f1phri.apps.googleusercontent.com
EMAIL_PASS = vgxh bgvr saac eviy
```

## ✅ **Verificar configuración**

Después de configurar los secretos:
1. Haz un commit y push
2. Ve a `Actions` en GitHub
3. Verifica que el workflow se ejecute sin errores
4. Revisa que la imagen se suba a Docker Hub: https://hub.docker.com/r/ravlabos2025/booking2-backend

## 🔒 **Seguridad**

**✅ Como secretos (recomendado):**
- Passwords de cualquier tipo
- Tokens de autenticación
- Claves privadas
- IDs de servicios externos sensibles

**⚪ Como variables normales (OK):**
- Hosts públicos (smtp.gmail.com)
- Puertos estándar (587, 5432)
- Emails públicos
- Nombres de bases de datos
- Configuraciones no sensibles