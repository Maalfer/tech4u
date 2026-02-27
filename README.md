# Tech4U — Academia para Estudiantes de FP (ASIR, DAW, DAM, SMR)

Plataforma full-stack con React, Tailwind CSS V4 y FastAPI. Ofrece tests técnicos, gamificación (rachas, XP) y recursos educativos (Cheat Sheets, PDFs) para estudiantes de Formación Profesional.

## 🚀 Requisitos Previos
- **Python 3.10+** (Recomendado 3.12, con soporte `venv`)
- **Node.js 18+** y `npm`

---

## ⚙️ Despliegue del Backend (FastAPI)

El backend utiliza SQLite por defecto (`tech4u.db`), contraseñas con `bcrypt` nativo y autenticación JWT.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea un entorno virtual y actívalo:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Genera la base de datos y preguntas de ejemplo (para FP):
   ```bash
   python seed.py
   ```
5. **(Opcional pero recomendado)** Crea los usuarios administradores y docentes iniciales para poder probar todos los roles en el panel de gestión:
   ```bash
   python crear_usuarios.py
   ```
   **Usuarios creados por defecto:**

   | Rol | Nombre | Correo Electrónico | Contraseña | Plan |
   |-----|--------|----------------|------------|------|
   | **Administrador** | Administrador Principal | `admin@tech4u.es` | `tech4u_admin` | Anual (PRO) |
   | **Docente** | Profesor DAW | `docente1@tech4u.es` | `tech4u_docente` | Anual (PRO) |
   | **Alumno** | Alumno Prueba FP | `alumno1@tech4u.es` | `tech4u_alumno` | Gratuito |

6. Arranca el servidor (por defecto en el puerto `8000`):
   ```bash
   python run.py
   ```
   *El backend estará disponible en `http://localhost:8000` y su documentación Swagger en `http://localhost:8000/docs`.*

---

## 🎨 Despliegue del Frontend (React + Vite)

El frontend está configurado para consumir la API en `:8000` gracias al Axios interceptor y los proxys.

1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de **npm**:
   ```bash
   npm install
   ```
3. Para iniciar el entorno de desarrollo con _Hot Reloading_:
   ```bash
   npm run dev
   ```
   *La app abrirá por defecto en `http://localhost:5173`.*

4. **Para producción**:
   ```bash
   npm run build
   # Generará una carpeta dist/ lista para servir estáticamente (Nginx/Apache).
   ```

---

## 🔒 Roles y Accesos
- **Administrador (`admin`)**: Tiene acceso completo a la pestaña de "Gestión de Usuarios" (modificar contraseñas, borrar, cambiar rol) y "Banco de Preguntas" (CRUD de Recursos y Preguntas).
- **Docente (`docente`)**: Puede acceder a "Banco de Preguntas" para contribuir a la academia añadiendo contenido, pero NO a la gestión de usuarios.
- **Alumno (`alumno`)**: Visualización estándar, tests adaptativos gamificados organizados por la suscripción activa.
