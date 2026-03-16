# Informe Técnico: Arquitectura de Terminal y SQL Skills

Este informe detalla la lógica de implementación, despliegue y limitaciones de los sistemas de aprendizaje interactivo en la academia.

---

## 1. Terminal Skills (Laboratorios Prácticos)

### Infraestructura y Despliegue
La Terminal Skill utiliza una arquitectura basada en **Docker** para proporcionar un entorno seguro y aislado.
- **HARDENED CLIENT**: El backend (`docker_client.py`) gestiona las imágenes de los contenedores. Utiliza una imagen base propia (`tech4u-base:latest`).
- **PROCESO DE START**: Al iniciar un laboratorio, se lanza un contenedor dedicado.
- **INYECCIÓN DE ESCENARIOS**: El sistema puede inyectar archivos, crear directorios y ejecutar comandos de configuración base (definidos en JSON) antes de entregar el control al alumno.

### Seguridad y Aislamiento
- **Nivel de Red**: Modo `none` (Sin acceso a internet). El contenedor está aislado de la red externa y de otros contenedores.
- **Recursos Limitados**: 128MB de RAM, 0.5 Cores de CPU y un límite de 64 procesos.
- **Filesystem Inmutable**: El sistema de archivos raíz es de solo lectura (`read_only: true`).
- **Volatilidad**: Las áreas de escritura (`/tmp`, `/home/student`, `/var/log`) están montadas sobre `tmpfs`. **No hay persistencia** al cerrar el laboratorio.

### Puente WebSocket (The Bridge)
La comunicación se realiza en tiempo real:
- **Frontend**: Utiliza `xterm.js` para renderizar la terminal en el navegador.
- **Backend**: Un bridge WebSocket actúa como proxy entre el navegador y un PTY (Pseudo-Terminal) del host que ejecuta `docker exec -it`.

### Limitaciones
- **Escalabilidad**: Cada usuario activo requiere un contenedor. El servidor debe tener recursos suficientes para el número de usuarios concurrentes.
- **Persistencia**: Todos los cambios se pierden al cerrar la sesión o reiniciar el lab.
- **Latencia**: Pequeño retardo derivado del paso de datos por múltiples capas (WS -> Host -> Docker Engine).

---

## 2. SQL Skills (Editor de Consultas)

### Infraestructura
A diferencia de los laboratorios, SQL Skills no usa contenedores pesados. Utiliza un motor de **SQLite en memoria**.
- **Eficiencia**: Es extremadamente rápido y no consume apenas recursos del servidor.
- **Ciclo de Vida**: Cada vez que pulsas "EJECUTAR", se crea una base de datos nueva en RAM, se aplica el esquema, se insertan los datos (seed) y se ejecuta tu consulta.

### Lógica de Validación
- **Normalización**: El sistema normaliza los resultados (redondeo de decimales, trim de espacios, conversión de tipos) para que la comparación sea justa.
- **Comparación Estricta**: Compara el JSON resultante del alumno con el "Resultado Esperado" guardado en la base de datos central.

### Seguridad
- **Filtro de Seguridad**: Solo se permiten comandos que empiecen por `SELECT`, `WITH` o `EXPLAIN`.
- **Bloqueo DDL/DML**: Cualquier intento de `DROP`, `DELETE`, `UPDATE` o `INSERT` (que no sea el seed) es rechazado por el filtro de seguridad por regex.

### Limitaciones
- **Sintaxis SQLite**: Aunque muy compatible, algunas funciones específicas de MySQL o PostgreSQL podrían no funcionar igual.
- **Persistencia Transaccional**: No puedes realizar cambios permanentes en las tablas (está diseñado solo para consultas de lectura).

---

## Comparativa de Sistemas

| Característica | Terminal Skills | SQL Skills |
| :--- | :--- | :--- |
| **Tecnología** | Docker Containers | SQLite in-memory |
| **Velocidad** | Moderada (arranque ~2s) | Instantánea (<100ms) |
| **Persistencia** | Volátil (tmpfs) | No aplicable (ReadOnly) |
| **Aislamiento** | Muy Alto (Kernel isolation) | Alto (Runtime sandbox) |
| **Consumo RAM** | ~128MB por sesión | ~5MB por ejecución |

> [!NOTE]
> Ambos sistemas están diseñados con un enfoque **"Safety-First"**, garantizando que el usuario nunca pueda comprometer la infraestructura del host de la academia.
