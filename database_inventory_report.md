# Informe Técnico: Arquitectura de Base de Datos y PostgreSQL

Este informe detalla la configuración actual de la base de datos, el proceso de migración y la infraestructura basada en Docker para Tech4U.

---

## 1. Estado Actual de la Base de Datos

La academia ha evolucionado de un modelo basado en archivos locales (**SQLite**) hacia un motor de base de datos relacional robusto (**PostgreSQL**) para soportar mayor concurrencia y escalabilidad.

- **Motor Principal**: PostgreSQL 15+
- **ORM**: SQLAlchemy (Python)
- **Ubicación**: El servidor backend se conecta a la base de datos vía red interna (localhost) o mediante el socket del contenedor Docker.

### Credenciales de Conexión (Configuradas en `.env`)
- **Host**: `localhost` (Puerto `5432`)
- **Usuario**: `tech4u_admin`
- **Password**: `tech4u_admin`
- **Base de Datos**: `tech4u`

---

## 2. Implementación en Docker

PostgreSQL se despliega de forma aislada mediante un contenedor Docker. Aunque el proyecto no utiliza un archivo `docker-compose.yml` centralizado, el despliegue estándar recomendado y utilizado es:

### Comando de Despliegue (Referencia)
```bash
docker run --name tech4u-db \
  -e POSTGRES_USER=tech4u_admin \
  -e POSTGRES_PASSWORD=tech4u_admin \
  -e POSTGRES_DB=tech4u \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres:15
```

### Ventajas de este modelo:
- **Persistencia**: Los datos se almacenan en un volumen de Docker (`pgdata`), lo que significa que si el contenedor se detiene o se borra, la información persiste.
- **Aislamiento**: El motor de base de datos no ensucia el sistema operativo host.
- **Portabilidad**: Se puede replicar el entorno en cualquier servidor con Docker en segundos.

---

## 3. Lógica de Migración

El sistema incluye scripts de migración híbridos (como `migrate_exercise_types.py`) que detectan automáticamente el dialecto de la base de datos.

### Proceso de Adaptación:
1. **Detección de Dialecto**: El código en `database.py` identifica si la URL empieza por `postgresql://` o `sqlite://`.
2. **Compatibilidad de Esquema**: Se han ajustado las columnas de tipo `JSON` o `Text` para que funcionen correctamente en ambos motores, priorizando la sintaxis de Postgres para funcionalidades avanzadas.
3. **Manejo de Concurrencia**: En PostgreSQL, el backend puede manejar múltiples conexiones simultáneas de forma real, a diferencia de SQLite que utiliza bloqueos a nivel de archivo.

---

## 4. Estructura de Tablas (Modelos Clave)

| Tabla | Propósito | Clave |
| :--- | :--- | :--- |
| **`users`** | Perfiles, racha, XP, niveles y suscripción. | UUID / Int PK |
| **`user_progress`** | Seguimiento de aciertos/fallos por asignatura. | FK `user_id` |
| **`sql_exercises`** | Banco de ejercicios SQL con soluciones y resultados. | FK `dataset_id` |
| **`terminal_challenges`** | Retos prácticos para los laboratorios Linux. | FK `lab_id` |

---

> [!IMPORTANT]
> **Recomendación de Backup**: Dado que la base de datos reside en un contenedor, se recomienda realizar volcados periódicos con `docker exec tech4u-db pg_dump -U tech4u_admin tech4u > backup.sql`.
