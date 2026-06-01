# Maribel Alba - Guía de Configuración

## ✅ Lo que ya está listo

- ✅ Frontend compila sin errores
- ✅ Backend inicia en puerto 4000
- ✅ Panel admin con login + dashboard
- ✅ API REST completa para CRUD
- ✅ TypeScript sin errores
- ✅ Todas las dependencias instaladas

## ⚠️ Lo que necesitas hacer

### 1. Instalar MySQL (Windows)

1. Descarga MySQL Community Server: https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador
3. Selecciona "MySQL Server" como servicio
4. Configura:
   - Puerto: **3306**
   - Root password: (dejar en blanco o tu contraseña)
5. Verifica la instalación abriendo Command Prompt:
   ```cmd
   mysql -h localhost -u root
   ```

### 2. Crear base de datos

En Command Prompt o MySQL Workbench:

```sql
CREATE DATABASE maribel_alba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Crear usuario admin inicial

```sql
USE maribel_alba;

-- Usuario: admin@example.com
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO profiles (id, email, display_name, password_hash, role, email_verified, created_at, updated_at)
VALUES (
  'admin-001',
  'admin@example.com',
  'Administrador',
  '$2b$10$N9qo8uLOickgx2ZMRZoMye1dUz3t4h5JBT9D5c1Z5qVWJBvtXRhve', -- hash de 'admin123'
  'admin',
  1,
  NOW(),
  NOW()
);
```

O en PowerShell (si tienes Node instalado):

```powershell
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log(hash);
});
"
```

Luego usa ese hash en la consulta INSERT.

### 4. Verificar MySQL está corriendo

#### Opción A: Services (Windows)
- Presiona `Win + R`
- Escribe: `services.msc`
- Busca "MySQL80" o "MySQL" y verifica que está "Running"

#### Opción B: PowerShell
```powershell
Get-Service MySQL80
```

#### Opción C: Command Prompt
```cmd
netstat -ano | findstr :3306
```

## 🚀 Ejecutar la aplicación

### Terminal 1 - Backend
```bash
cd d:\workspace\Maribel-web
npm run backend
```

Deberías ver:
```
🎨 Servidor de Galería Maribel Alba ejecutándose en http://localhost:4000
📍 Ambiente: development
🗄️  Base de datos: MySQL en localhost:3306
✓ Base de datos MySQL inicializada correctamente
```

### Terminal 2 - Frontend (en otra ventana)
```bash
cd d:\workspace\Maribel-web
npm run frontend
```

Abre: http://localhost:5173

### Credenciales de login
- **Email:** admin@example.com
- **Contraseña:** admin123

## 🔧 Troubleshooting

### "ECONNREFUSED" al iniciar backend
→ MySQL no está corriendo. Inicia el servicio MySQL desde Services.

### "ER_ACCESS_DENIED_FOR_USER" al insertar
→ La contraseña de root es diferente. Actualiza `.env`:
```
DB_PASSWORD=tu_contraseña_real
```

### Compilación falla
→ Ejecuta:
```bash
npm install
npm run build
```

## 📝 Archivos importantes

- `.env` - Configuración de BD y API
- `server/index.ts` - Rutas API Express
- `server/db.ts` - Conexión MySQL
- `src/pages/Admin.tsx` - Panel administración
- `src/lib/api.ts` - Cliente API

## 📚 Endpoints disponibles

### Públicos
- `GET /api/health` - Health check
- `GET /api/site-content` - Contenido del sitio
- `POST /api/contact-messages` - Enviar mensaje
- `POST /api/restoration-requests` - Solicitar restauración

### Admin (requieren JWT token)
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual
- `GET/POST/PUT/DELETE /api/admin/*` - CRUD de todo

## 🎯 Próximos pasos recomendados

1. Implementar CRUD completo en Admin.tsx
2. Agregar carga de imágenes para paintings
3. Crear Home.tsx con galería responsive
4. Implementar búsqueda y filtros
5. Agregar secciones de restauración y blog
