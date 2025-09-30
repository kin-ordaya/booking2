# 🎯 **CONFIGURACIÓN MÍNIMA - Solo 4 Secretos**

## ✅ **Lo que SÍ tienes que configurar en GitHub Secrets:**

Ve a: `https://github.com/kin-ordaya/booking2` → **Settings** → **Secrets and variables** → **Actions**

### **Agrega estos 4 secretos exactamente:**

**1. DOCKER_USERNAME**
```
Name: DOCKER_USERNAME
Secret: ravlabos2025
```

**2. DOCKER_PASSWORD**
```
Name: DOCKER_PASSWORD
Secret: rav202520
```

**3. EMAIL_PASS**
```
Name: EMAIL_PASS
Secret: vgxh bgvr saac eviy
```

**4. GOOGLE_CLIENT_ID**
```
Name: GOOGLE_CLIENT_ID
Secret: 250973841532-lli1ka587c31cmtk7hk15dhd19f1phri.apps.googleusercontent.com
```

## ❌ **Lo que NO necesitas configurar (usa valores automáticos):**

- ✅ **JWT_SECRET** → Usa: `jwt-secret-por-defecto-desarrollo-1234567890`
- ✅ **DB_PASS** → Usa: `booking123456`
- ✅ **EMAIL_HOST** → Usa: `smtp.gmail.com`
- ✅ **EMAIL_USER** → Usa: `lab.recursosvirt@continental.edu.pe`

## 🚀 **Pasos para configurar:**

### **1. Ve a GitHub Secrets:**
- Abre: `https://github.com/kin-ordaya/booking2/settings/secrets/actions`
- Click: **New repository secret**

### **2. Agrega los 4 secretos uno por uno:**
- Copia exactamente los nombres y valores de arriba
- Click **Add secret** después de cada uno

### **3. Verifica que estén configurados:**
Deberías ver exactamente estos 4:
```
✅ DOCKER_USERNAME
✅ DOCKER_PASSWORD
✅ EMAIL_PASS  
✅ GOOGLE_CLIENT_ID
```

### **4. Haz push para probar:**
```bash
git add .
git commit -m "feat: configuración mínima CI/CD"
git push origin master
```

### **5. Verificar que funcione:**
- Ve a: **Actions** en GitHub
- Espera que termine (unos 5-10 minutos)
- Si sale verde ✅ → ¡Listo!
- La imagen estará en: `https://hub.docker.com/r/ravlabos2025/booking2-backend`

### **6. Desplegar en tu servidor:**
```bash
# En tu servidor
docker pull ravlabos2025/booking2-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

Ver guía completa: `DEPLOY_MANUAL.md`

## 🎯 **¿Qué hace cada secreto?**

- **DOCKER_USERNAME/PASSWORD** → Para subir imagen a Docker Hub
- **EMAIL_PASS** → Para enviar emails desde tu app  
- **GOOGLE_CLIENT_ID** → Para login con Google

## 💡 **Valores automáticos que se usan:**

Tu aplicación funcionará con estos valores por defecto:
- **Base de datos**: `booking2` con password `booking123456`
- **JWT**: `jwt-secret-por-defecto-desarrollo-1234567890`
- **Email host**: `smtp.gmail.com:587`
- **Email user**: `lab.recursosvirt@continental.edu.pe`

## ✅ **Resumen:**

**Solo configuras 4 secretos** → GitHub Actions construye y sube la imagen → ¡Listo para usar!

**¿Alguna duda sobre estos 4 secretos?** 🤔