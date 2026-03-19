from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from starlette.websockets import WebSocketState
from starlette.responses import Response  # CRITICAL: needed by antibot_middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_
from websocket_manager import manager
from database import get_db, Lab, User, SkillPath, Module, TheorySubject, TheoryPost, Challenge
from routers import auth, dashboard, tests, resources, users_admin, content_admin, announcements, subscriptions, video_courses, coupons_admin, leaderboard, support, skill_labs, achievements, labs, teoria, sql_skills, battle, certificates
from routers import referrals, analytics, oauth, flashcard_spaced, search

from docker_client import docker_launcher
from auth import decode_token, get_current_user
from schemas import TerminalStartResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import asyncio
import json
import os
import pty
import subprocess
import select
import datetime
import logging

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.1,
        environment=os.getenv("ENVIRONMENT", "production"),
    )

app = FastAPI(
    title="Tech4U API",
    description="Plataforma para Estudiantes de FP Informática (ASIR, DAW, DAM, SMR) - Backend API",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Explicitly handle CORS for production and development
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "https://tech4uacademy.es,https://www.tech4uacademy.es,http://localhost:3000,http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

def _is_docker_internal_ip(ip: str) -> bool:
    """Returns True if the IP belongs to Docker's internal bridge networks."""
    import ipaddress
    try:
        addr = ipaddress.ip_address(ip)
        # Docker default bridge: 172.16.0.0/12, loopback: 127.x.x.x, IPv6 loopback
        internal_nets = [
            ipaddress.ip_network("172.16.0.0/12"),
            ipaddress.ip_network("127.0.0.0/8"),
            ipaddress.ip_network("10.0.0.0/8"),
            ipaddress.ip_network("192.168.0.0/16"),
        ]
        return any(addr in net for net in internal_nets)
    except ValueError:
        return ip in ("::1", "localhost")


@app.middleware("http")
async def antibot_middleware(request: Request, call_next):
    """Rejects requests without User-Agent or known bot identifiers.
    Bypasses internal Docker health checks and the /health endpoint.
    """
    # Bypass: /health endpoint always passes (Docker healthcheck needs this)
    if request.url.path in ("/health", "/docs", "/openapi.json", "/redoc"):
        return await call_next(request)

    # Bypass: requests from Docker internal network (healthchecks, internal services)
    client_ip = request.client.host if request.client else ""
    if _is_docker_internal_ip(client_ip):
        return await call_next(request)

    user_agent = request.headers.get("user-agent", "")

    # 1. Reject empty User-Agent
    if not user_agent:
        return Response(content="User-Agent is required", status_code=403)

    # 2. Block known attack/scraping tools — NOT curl/wget (needed for health checks via nginx)
    blocked_patterns = [
        "python-requests", "aiohttp", "go-http-client",
        "headless", "selenium", "puppeteer",
        "sqlmap", "nikto", "nmap", "masscan", "zgrab",
    ]
    if any(pattern in user_agent.lower() for pattern in blocked_patterns):
        return Response(content="Bot access denied", status_code=403)

    return await call_next(request)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Populates request.state.user_id for rate limiting purposes AND adds HTTP security headers.
    Also extracts real client IP from Cloudflare CF-Connecting-IP header.
    """
    # ── Cloudflare Real IP ───────────────────────────────────────────────────
    # When behind Cloudflare, the real client IP is in CF-Connecting-IP.
    # Store it so rate limiters and logs get the actual user IP.
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        # Patch the request scope so get_remote_address() sees the real IP
        request.state.real_ip = cf_ip
    else:
        request.state.real_ip = request.client.host if request.client else "unknown"

    request.state.user_id = None
    token = None

    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        # Fall back to cookies: try tech4u_token (httpOnly) first, then access_token for backward compat
        token = request.cookies.get("tech4u_token") or request.cookies.get("access_token")

    if token:
        try:
            # Inline import to avoid circular dependencies if auth ever imports main
            from auth import decode_token
            payload = decode_token(token)
            user_id = payload.get("sub")
            if user_id:
                request.state.user_id = int(user_id)
        except Exception:
            pass
    response = await call_next(request)
    # ── HTTP Security Headers ────────────────────────────────────────────────
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # SEC-10 FIX: Strict-Transport-Security — fuerza HTTPS en el navegador
    # max-age=31536000 (1 año). Solo activar si el servidor usa HTTPS en producción.
    if os.getenv("ENVIRONMENT", "development") == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

    # SEC-09 FIX: CSP reforzada — eliminados unsafe-inline y unsafe-eval donde es posible.
    # unsafe-inline en script-src se mantiene para el SDK de PayPal que lo requiere,
    # pero se ha eliminado unsafe-eval (no es necesario en producción).
    # Si el frontend se migra a nonces/hashes, eliminar también unsafe-inline.
    response.headers["Content-Security-Policy"] = (
        f"frame-src {_paypal_domains}; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        f"form-action 'self' {_paypal_domains};"
    )
    return response

def migrate_usuarios_permisos_to_linux():
    """Migración única: mueve todos los módulos del SkillPath 'Usuarios y Permisos Linux'
    al SkillPath 'Linux Fundamentals' y elimina el path vacío."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Buscar el SkillPath destino: "Linux Fundamentals"
        linux_path = db.query(SkillPath).filter(
            SkillPath.title.ilike("%Linux Fundamental%")
        ).first()
        if not linux_path:
            logger.info("Migración: No se encontró SkillPath 'Linux Fundamentals', omitiendo.")
            return

        # 2. Buscar el SkillPath origen: "Usuarios y Permisos Linux" (o similar)
        usuarios_path = db.query(SkillPath).filter(
            or_(
                SkillPath.title.ilike("%Usuarios y Permisos%"),
                SkillPath.title.ilike("%Usuario%Permiso%"),
                SkillPath.title.ilike("%Permiso%Usuario%"),
            )
        ).first()

        if not usuarios_path:
            logger.info("Migración: No se encontró SkillPath 'Usuarios y Permisos', ya fue migrado o no existe.")
            return

        if usuarios_path.id == linux_path.id:
            logger.info("Migración: Mismo SkillPath, nada que hacer.")
            return

        logger.info(f"Migración: Moviendo módulos de '{usuarios_path.title}' (id={usuarios_path.id}) → '{linux_path.title}' (id={linux_path.id})")

        # 3. Reasignar todos los módulos del path origen al destino
        modules = db.query(Module).filter(Module.skill_path_id == usuarios_path.id).all()
        for mod in modules:
            logger.info(f"  → Módulo '{mod.title}' (id={mod.id})")
            mod.skill_path_id = linux_path.id

        # 4. Eliminar el SkillPath vacío "Usuarios y Permisos Linux"
        db.delete(usuarios_path)
        db.commit()
        logger.info(f"Migración completada: {len(modules)} módulo(s) movido(s), SkillPath eliminado.")
    except Exception as e:
        logger.error(f"Error en migración de SkillPath: {e}")
        db.rollback()
    finally:
        db.close()


SQL_ADVANCED_POSTS = [
    {
        "title": "Vistas (Views)",
        "slug": "sql-vistas-views",
        "order_index": 50,
        "is_free": True,
        "markdown_content": """# Vistas (Views) en SQL

## ¿Qué es una Vista?
Una **vista** es una consulta SQL almacenada con nombre que actúa como una tabla virtual. No guarda datos propios — cada vez que se consulta, ejecuta la SELECT subyacente.

```sql
-- Crear una vista
CREATE VIEW vista_empleados_activos AS
SELECT id, nombre, departamento, salario
FROM empleados
WHERE activo = 1;

-- Usarla como una tabla normal
SELECT * FROM vista_empleados_activos WHERE departamento = 'TI';
```

## Ventajas
- **Abstracción**: Oculta la complejidad de consultas con múltiples JOINs
- **Seguridad**: Puedes dar acceso a una vista sin exponer la tabla completa
- **Reutilización**: Evita repetir la misma consulta en múltiples lugares
- **Mantenimiento**: Cambiar la vista afecta a todos los que la usan, sin tocar el código

## Tipos de Vistas

### Vista simple (actualizable)
Basada en una sola tabla sin funciones de agregación. Se puede hacer INSERT/UPDATE/DELETE sobre ella.

```sql
CREATE VIEW vista_precios AS
SELECT id, producto, precio FROM catalogo WHERE activo = 1;

-- Esto funciona (vista simple actualizable)
UPDATE vista_precios SET precio = 29.99 WHERE id = 5;
```

### Vista compleja (solo lectura)
Con JOINs, GROUP BY, DISTINCT o subconsultas. No permite modificaciones.

```sql
CREATE VIEW resumen_ventas AS
SELECT c.nombre, COUNT(v.id) AS num_ventas, SUM(v.total) AS facturacion
FROM clientes c
JOIN ventas v ON c.id = v.cliente_id
GROUP BY c.id, c.nombre;
```

## Gestión de Vistas

```sql
-- Modificar una vista
CREATE OR REPLACE VIEW vista_empleados_activos AS
SELECT id, nombre, departamento, salario, fecha_alta
FROM empleados
WHERE activo = 1;

-- Eliminar una vista
DROP VIEW IF EXISTS vista_empleados_activos;

-- Ver la definición de una vista (MySQL)
SHOW CREATE VIEW vista_empleados_activos;

-- Ver todas las vistas del esquema
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'mi_base_de_datos';
```

## WITH CHECK OPTION
Garantiza que las filas insertadas/actualizadas a través de la vista sigan cumpliendo la condición WHERE:

```sql
CREATE VIEW empleados_TI AS
SELECT * FROM empleados WHERE departamento = 'TI'
WITH CHECK OPTION;

-- Esto dará error — viola la condición de la vista
INSERT INTO empleados_TI (nombre, departamento) VALUES ('Ana', 'RRHH');
```

## Buenas Prácticas
- Nombra las vistas con prefijo `v_` o `vista_` para distinguirlas de las tablas
- Evita `SELECT *` en vistas — si cambia la tabla base, la vista puede romperse
- No abuses de vistas sobre vistas (impacto en rendimiento)
""",
    },
    {
        "title": "Vistas Materializadas",
        "slug": "sql-vistas-materializadas",
        "order_index": 51,
        "is_free": False,
        "markdown_content": """# Vistas Materializadas

## ¿Qué son?
Las **vistas materializadas** (MATERIALIZED VIEW) almacenan físicamente el resultado de la consulta en disco, a diferencia de las vistas normales que se recalculan en cada acceso.

> **Nota**: No están disponibles en MySQL/MariaDB nativamente. Sí en **PostgreSQL**, Oracle y SQL Server (como "Indexed Views").

```sql
-- PostgreSQL
CREATE MATERIALIZED VIEW resumen_ventas_mes AS
SELECT DATE_TRUNC('month', fecha) AS mes,
       departamento,
       SUM(total) AS facturacion
FROM ventas
GROUP BY 1, 2;
```

## Vista normal vs Materializada

| Característica | Vista Normal | Vista Materializada |
|---|---|---|
| Datos guardados | ❌ Solo la consulta | ✅ Resultado en disco |
| Velocidad lectura | Depende de la query | Muy rápida |
| Actualización | Siempre al día | Manual o periódica |
| Espacio en disco | Mínimo | Como una tabla real |
| Índices sobre ella | ❌ | ✅ |

## Refrescar los datos

```sql
-- Refresco bloqueante (espera a terminar)
REFRESH MATERIALIZED VIEW resumen_ventas_mes;

-- Refresco no bloqueante (permite lecturas mientras refresca)
-- Requiere UNIQUE INDEX en la vista
REFRESH MATERIALIZED VIEW CONCURRENTLY resumen_ventas_mes;
```

## Cuándo usarlas
- Consultas con agregaciones costosas (SUM, COUNT sobre millones de filas)
- Dashboards y reportes que se consultan frecuentemente pero no necesitan datos en tiempo real
- Data warehouses y BI

## Índices sobre vistas materializadas

```sql
-- En PostgreSQL puedes crear índices sobre ellas
CREATE INDEX idx_resumen_mes ON resumen_ventas_mes(mes);
CREATE UNIQUE INDEX idx_resumen_uniq ON resumen_ventas_mes(mes, departamento);
```

## Automatización del refresco (PostgreSQL + pg_cron)

```sql
-- Refrescar automáticamente cada hora con pg_cron
SELECT cron.schedule('0 * * * *', 'REFRESH MATERIALIZED VIEW resumen_ventas_mes');
```
""",
    },
    {
        "title": "Índices (Indexes)",
        "slug": "sql-indices-indexes",
        "order_index": 52,
        "is_free": False,
        "markdown_content": """# Índices en SQL

## ¿Qué es un Índice?
Un índice es una estructura de datos auxiliar que acelera las búsquedas y ordenaciones en una tabla. Funciona como el índice de un libro: en lugar de leer página a página, saltas directamente a donde está la información.

**Sin índice**: Scan completo de tabla (O(n))
**Con índice B-Tree**: Búsqueda en árbol (O(log n))

## Crear y Eliminar Índices

```sql
-- Índice simple
CREATE INDEX idx_apellido ON empleados(apellido);

-- Índice único (garantiza unicidad + acelera búsquedas)
CREATE UNIQUE INDEX idx_email ON usuarios(email);

-- Índice compuesto (varios campos)
CREATE INDEX idx_apellido_nombre ON empleados(apellido, nombre);

-- Índice parcial (PostgreSQL) — solo indexa un subconjunto
CREATE INDEX idx_pedidos_pendientes ON pedidos(fecha_pedido)
WHERE estado = 'pendiente';

-- Eliminar
DROP INDEX idx_apellido;  -- MySQL/PostgreSQL
```

## Tipos de Índices

### B-Tree (por defecto)
El más común. Útil para comparaciones de igualdad (`=`), rangos (`BETWEEN`, `>`, `<`) y ordenación (`ORDER BY`).

### Hash
Solo para comparaciones de igualdad exacta. Más rápido que B-Tree en igualdad pero no funciona con rangos.

```sql
-- PostgreSQL
CREATE INDEX idx_hash_id ON tabla USING HASH (id);
```

### Full-Text
Para búsqueda de texto libre. Permite `MATCH ... AGAINST` en MySQL.

```sql
CREATE FULLTEXT INDEX idx_ft_descripcion ON productos(descripcion);
SELECT * FROM productos WHERE MATCH(descripcion) AGAINST('portátil gaming');
```

## El Coste de los Índices
Los índices **aceleran lecturas** pero **penalizan escrituras**:
- Cada `INSERT/UPDATE/DELETE` debe actualizar también todos los índices
- Ocupan espacio en disco (puede ser el 30-50% del tamaño de la tabla)

**Regla de oro**: Indexar campos usados frecuentemente en `WHERE`, `JOIN ON`, `ORDER BY` y `GROUP BY`.

## Ver los índices existentes

```sql
-- MySQL
SHOW INDEX FROM empleados;

-- PostgreSQL
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'empleados';
```

## EXPLAIN — Ver si se usa el índice

```sql
EXPLAIN SELECT * FROM empleados WHERE apellido = 'García';
-- Busca "Using index" o "Index Scan" en la salida
-- Si ves "Full Table Scan" o "Seq Scan", el índice no se está usando
```

## Cuándo NO crear un índice
- Tablas muy pequeñas (el scan completo es igual de rápido)
- Columnas con muy pocos valores distintos (baja cardinalidad), como un campo `genero` con solo 'M'/'F'
- Tablas con muchas escrituras y pocas lecturas
""",
    },
    {
        "title": "Transacciones y ACID",
        "slug": "sql-transacciones-acid",
        "order_index": 53,
        "is_free": True,
        "markdown_content": """# Transacciones y ACID

## ¿Qué es una Transacción?
Una transacción es un conjunto de operaciones SQL que se ejecutan como una **unidad atómica**: o todas tienen éxito, o ninguna se aplica. Garantizan la integridad de los datos ante errores o fallos concurrentes.

```sql
START TRANSACTION;  -- o BEGIN;

UPDATE cuentas SET saldo = saldo - 500 WHERE id = 1;  -- Débito
UPDATE cuentas SET saldo = saldo + 500 WHERE id = 2;  -- Crédito

COMMIT;   -- Confirmar ambas operaciones
-- o ROLLBACK; para deshacer todo si hay error
```

## Propiedades ACID

| Propiedad | Significado |
|---|---|
| **A**tomicidad | Todo o nada. Si falla una operación, se deshace todo |
| **C**onsistencia | La BD pasa de un estado válido a otro válido |
| **I**solación | Las transacciones concurrentes no se interfieren |
| **D**urabilidad | Los cambios confirmados sobreviven a fallos del sistema |

## Comandos Básicos

```sql
-- Iniciar transacción
BEGIN;
-- o
START TRANSACTION;

-- Confirmar cambios (los persiste definitivamente)
COMMIT;

-- Deshacer todos los cambios desde BEGIN/START
ROLLBACK;

-- Punto de guardado (para rollback parcial)
SAVEPOINT punto1;
UPDATE productos SET stock = stock - 1 WHERE id = 5;

-- Si algo sale mal, volver solo al SAVEPOINT
ROLLBACK TO SAVEPOINT punto1;

-- Liberar el savepoint (ya no se puede volver a él)
RELEASE SAVEPOINT punto1;
```

## Ejemplo Completo: Transferencia Bancaria

```sql
START TRANSACTION;

-- Verificar saldo suficiente
SELECT saldo INTO @saldo_actual FROM cuentas WHERE id = 1 FOR UPDATE;

IF @saldo_actual >= 500 THEN
    UPDATE cuentas SET saldo = saldo - 500 WHERE id = 1;
    UPDATE cuentas SET saldo = saldo + 500 WHERE id = 2;
    INSERT INTO historial (tipo, importe) VALUES ('transferencia', 500);
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

## Niveles de Aislamiento

Los niveles controlan cómo las transacciones concurrentes se ven entre sí:

| Nivel | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | ✅ posible | ✅ posible | ✅ posible |
| READ COMMITTED | ❌ | ✅ posible | ✅ posible |
| REPEATABLE READ | ❌ | ❌ | ✅ posible (MySQL lo evita) |
| SERIALIZABLE | ❌ | ❌ | ❌ |

```sql
-- Cambiar el nivel de aislamiento (MySQL)
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
-- ...
```

> **Por defecto en MySQL/InnoDB**: `REPEATABLE READ`
> **Por defecto en PostgreSQL**: `READ COMMITTED`

## Autocommit
Por defecto, la mayoría de los clientes SQL tienen `autocommit = ON`, lo que significa que cada sentencia SQL es una transacción por sí sola.

```sql
SET autocommit = 0;  -- Desactivar en MySQL
-- Ahora debes hacer COMMIT manualmente
```
""",
    },
    {
        "title": "Triggers (Disparadores)",
        "slug": "sql-triggers-disparadores",
        "order_index": 54,
        "is_free": False,
        "markdown_content": """# Triggers (Disparadores) en SQL

## ¿Qué es un Trigger?
Un trigger es un bloque de código SQL que se ejecuta **automáticamente** en respuesta a un evento (INSERT, UPDATE o DELETE) sobre una tabla. Se usa para automatizar auditorías, validaciones y lógica de negocio en la base de datos.

## Sintaxis (MySQL)

```sql
CREATE TRIGGER nombre_trigger
{BEFORE | AFTER} {INSERT | UPDATE | DELETE}
ON nombre_tabla
FOR EACH ROW
BEGIN
    -- código SQL aquí
END;
```

## Filas NEW y OLD
Dentro del trigger tienes acceso a:
- `NEW.columna` — Los nuevos valores (disponible en INSERT y UPDATE)
- `OLD.columna` — Los valores anteriores (disponible en UPDATE y DELETE)

| Evento | NEW | OLD |
|---|---|---|
| INSERT | ✅ | ❌ |
| UPDATE | ✅ | ✅ |
| DELETE | ❌ | ✅ |

## Ejemplo: Auditoría de Cambios

```sql
-- Tabla de auditoría
CREATE TABLE auditoria_salarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT,
    salario_anterior DECIMAL(10,2),
    salario_nuevo DECIMAL(10,2),
    modificado_por VARCHAR(100),
    fecha DATETIME DEFAULT NOW()
);

-- Trigger AFTER UPDATE
DELIMITER //
CREATE TRIGGER trg_auditoria_salario
AFTER UPDATE ON empleados
FOR EACH ROW
BEGIN
    IF OLD.salario != NEW.salario THEN
        INSERT INTO auditoria_salarios
            (empleado_id, salario_anterior, salario_nuevo, modificado_por)
        VALUES
            (OLD.id, OLD.salario, NEW.salario, USER());
    END IF;
END;
//
DELIMITER ;
```

## Ejemplo: Validación BEFORE INSERT

```sql
DELIMITER //
CREATE TRIGGER trg_validar_stock
BEFORE INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT;
    SELECT stock INTO stock_actual FROM productos WHERE id = NEW.producto_id;
    IF stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para el pedido';
    END IF;
END;
//
DELIMITER ;
```

## Ejemplo: Actualizar Totales Automáticamente

```sql
DELIMITER //
CREATE TRIGGER trg_actualizar_total_pedido
AFTER INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT SUM(precio_unitario * cantidad)
        FROM detalle_pedido
        WHERE pedido_id = NEW.pedido_id
    )
    WHERE id = NEW.pedido_id;
END;
//
DELIMITER ;
```

## Gestión de Triggers

```sql
-- Ver triggers existentes (MySQL)
SHOW TRIGGERS FROM mi_base_datos;
SHOW TRIGGERS LIKE 'trg_%';

-- Eliminar un trigger
DROP TRIGGER IF EXISTS trg_auditoria_salario;
```

## Cuándo usar (y no usar) Triggers

**✅ Usar para:**
- Auditoría automática de cambios
- Mantener tablas de resumen sincronizadas
- Validaciones complejas que no puede hacer un CHECK constraint

**❌ Evitar cuando:**
- La lógica se puede hacer en la aplicación (triggers ocultan comportamiento)
- Necesitas lógica que dependa del contexto de la aplicación (usuario logado, etc.)
- Hay riesgo de triggers encadenados que se disparen entre sí
""",
    },
    {
        "title": "Procedimientos Almacenados",
        "slug": "sql-procedimientos-almacenados",
        "order_index": 55,
        "is_free": False,
        "markdown_content": """# Procedimientos Almacenados (Stored Procedures)

## ¿Qué son?
Los procedimientos almacenados son bloques de código SQL con nombre que se guardan en la base de datos y se pueden ejecutar con `CALL`. Permiten encapsular lógica de negocio, reducir la cantidad de código SQL en la aplicación y mejorar el rendimiento (el plan de ejecución se cachea).

## Sintaxis básica (MySQL)

```sql
DELIMITER //

CREATE PROCEDURE nombre_procedimiento(
    IN  param_entrada  TIPO,
    OUT param_salida   TIPO,
    INOUT param_ambos  TIPO
)
BEGIN
    -- Declarar variables locales
    DECLARE mi_variable INT DEFAULT 0;

    -- Lógica SQL aquí
    SELECT COUNT(*) INTO param_salida FROM tabla WHERE campo = param_entrada;
END;
//

DELIMITER ;
```

## Tipos de Parámetros

| Tipo | Descripción |
|---|---|
| `IN` | Solo entrada (el procedimiento lee el valor, no lo modifica externamente) |
| `OUT` | Solo salida (el procedimiento asigna un valor que se devuelve al llamador) |
| `INOUT` | Entrada y salida (el procedimiento puede leer y modificar) |

## Ejemplo Completo: Registrar Pedido

```sql
DELIMITER //

CREATE PROCEDURE sp_registrar_pedido(
    IN  p_cliente_id   INT,
    IN  p_producto_id  INT,
    IN  p_cantidad     INT,
    OUT p_pedido_id    INT,
    OUT p_mensaje      VARCHAR(200)
)
BEGIN
    DECLARE v_stock     INT;
    DECLARE v_precio    DECIMAL(10,2);

    -- Verificar stock
    SELECT stock, precio INTO v_stock, v_precio
    FROM productos WHERE id = p_producto_id;

    IF v_stock < p_cantidad THEN
        SET p_pedido_id = -1;
        SET p_mensaje = 'Error: Stock insuficiente';
    ELSE
        -- Crear el pedido
        INSERT INTO pedidos (cliente_id, total)
        VALUES (p_cliente_id, v_precio * p_cantidad);

        SET p_pedido_id = LAST_INSERT_ID();

        -- Insertar detalle
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (p_pedido_id, p_producto_id, p_cantidad, v_precio);

        -- Actualizar stock
        UPDATE productos SET stock = stock - p_cantidad WHERE id = p_producto_id;

        SET p_mensaje = CONCAT('Pedido #', p_pedido_id, ' registrado correctamente');
    END IF;
END;
//

DELIMITER ;
```

## Llamar a un Procedimiento

```sql
-- Llamada básica
CALL sp_registrar_pedido(1, 5, 3, @pedido_id, @mensaje);

-- Ver los valores de salida
SELECT @pedido_id, @mensaje;
```

## Control de Flujo

```sql
-- IF / ELSEIF / ELSE
IF condicion THEN
    -- ...
ELSEIF otra_condicion THEN
    -- ...
ELSE
    -- ...
END IF;

-- CASE
CASE estado
    WHEN 'A' THEN SET descripcion = 'Activo';
    WHEN 'I' THEN SET descripcion = 'Inactivo';
    ELSE SET descripcion = 'Desconocido';
END CASE;

-- WHILE
WHILE i <= 10 DO
    SET total = total + i;
    SET i = i + 1;
END WHILE;

-- LOOP con LEAVE
mi_loop: LOOP
    IF condicion THEN LEAVE mi_loop; END IF;
    -- ...
END LOOP;
```

## Gestión

```sql
-- Ver todos los procedimientos
SHOW PROCEDURE STATUS WHERE Db = 'mi_bd';

-- Ver el código de un procedimiento
SHOW CREATE PROCEDURE sp_registrar_pedido;

-- Eliminar
DROP PROCEDURE IF EXISTS sp_registrar_pedido;
```

## Procedures vs Funciones (UDF)

| Característica | Procedure | Función (FUNCTION) |
|---|---|---|
| Valor de retorno | Via parámetros OUT | Con RETURN |
| Uso en SELECT | ❌ | ✅ |
| Llamada | CALL proc() | SELECT func() |
| Puede hacer DML | ✅ | Limitado |
""",
    },
    {
        "title": "CTEs — Common Table Expressions",
        "slug": "sql-ctes-common-table-expressions",
        "order_index": 56,
        "is_free": False,
        "markdown_content": """# CTEs — Common Table Expressions

## ¿Qué es una CTE?
Una **CTE** (Common Table Expression) es una consulta temporal con nombre definida dentro de la misma sentencia SQL usando la cláusula `WITH`. Actúa como una "subconsulta con nombre" que mejora la legibilidad y permite referencias recursivas.

```sql
WITH nombre_cte AS (
    SELECT columna1, columna2
    FROM tabla
    WHERE condicion
)
SELECT * FROM nombre_cte WHERE columna1 > 100;
```

## CTE Simple vs Subconsulta
Ambas hacen lo mismo, pero la CTE es más legible:

```sql
-- Con subconsulta anidada (difícil de leer)
SELECT nombre, ventas
FROM (
    SELECT e.nombre, SUM(v.total) AS ventas
    FROM empleados e
    JOIN ventas v ON e.id = v.empleado_id
    GROUP BY e.id, e.nombre
) AS resumen
WHERE ventas > 50000;

-- Con CTE (más legible)
WITH resumen_ventas AS (
    SELECT e.nombre, SUM(v.total) AS ventas
    FROM empleados e
    JOIN ventas v ON e.id = v.empleado_id
    GROUP BY e.id, e.nombre
)
SELECT nombre, ventas
FROM resumen_ventas
WHERE ventas > 50000;
```

## Múltiples CTEs Encadenadas

```sql
WITH
pedidos_grandes AS (
    SELECT cliente_id, SUM(total) AS total_compras
    FROM pedidos
    WHERE fecha >= '2024-01-01'
    GROUP BY cliente_id
    HAVING SUM(total) > 1000
),
clientes_vip AS (
    SELECT c.nombre, c.email, p.total_compras
    FROM clientes c
    JOIN pedidos_grandes p ON c.id = p.cliente_id
)
SELECT * FROM clientes_vip ORDER BY total_compras DESC;
```

## CTEs Recursivas
Las CTEs recursivas se referencian a sí mismas y son perfectas para recorrer jerarquías (categorías padre/hijo, organigramas, etc.).

```sql
-- Estructura: tabla con columna padre_id
-- Recorrer una jerarquía de categorías
WITH RECURSIVE jerarquia AS (
    -- Caso base: nodo raíz (sin padre)
    SELECT id, nombre, padre_id, 0 AS nivel, nombre AS ruta
    FROM categorias
    WHERE padre_id IS NULL

    UNION ALL

    -- Caso recursivo: nodos hijos
    SELECT c.id, c.nombre, c.padre_id, j.nivel + 1,
           CONCAT(j.ruta, ' > ', c.nombre)
    FROM categorias c
    JOIN jerarquia j ON c.padre_id = j.id
)
SELECT nivel, ruta FROM jerarquia ORDER BY ruta;
```

Resultado:
```
0  Tecnología
1  Tecnología > Informática
2  Tecnología > Informática > Hardware
2  Tecnología > Informática > Software
1  Tecnología > Móviles
```

## Caso de Uso: Secuencia de Números

```sql
-- Generar una secuencia del 1 al 10 sin tabla
WITH RECURSIVE secuencia AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM secuencia WHERE n < 10
)
SELECT * FROM secuencia;
```

## Buenas Prácticas
- Usa CTEs para dividir consultas complejas en partes con nombre significativo
- Prefiere CTEs a subconsultas anidadas para mejorar la legibilidad
- Las CTEs recursivas necesitan siempre un caso base (sin recursión) y un caso recursivo separados por `UNION ALL`
- En MySQL: disponibles desde la versión **8.0**
""",
    },
    {
        "title": "Tablas Federadas y Linked Servers",
        "slug": "sql-tablas-federadas-linked-servers",
        "order_index": 57,
        "is_free": False,
        "markdown_content": """# Tablas Federadas y Linked Servers

## ¿Qué son las Tablas Federadas?
Las tablas federadas permiten acceder a datos almacenados en **servidores remotos** como si fueran tablas locales. La consulta se ejecuta localmente pero los datos vienen de otra base de datos (en otra máquina o motor).

## MySQL FEDERATED Engine

```sql
-- 1. Habilitar el motor FEDERATED en MySQL
-- (en my.cnf o al iniciar)
-- federated=ON

-- 2. Crear la tabla federada apuntando al servidor remoto
CREATE TABLE empleados_remoto (
    id         INT         NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(50) NOT NULL,
    salario    DECIMAL(10,2),
    PRIMARY KEY (id)
) ENGINE=FEDERATED
  CONNECTION='mysql://usuario:password@servidor_remoto:3306/bd_remota/empleados';

-- 3. Consultar como si fuera local
SELECT nombre, salario FROM empleados_remoto WHERE salario > 2000;
```

> **Limitaciones FEDERATED**: No soporta transacciones, no funciona con `FULLTEXT`, impacto en rendimiento con grandes volúmenes de datos.

## PostgreSQL: Foreign Data Wrappers (FDW)

PostgreSQL usa el estándar SQL/MED con **Foreign Data Wrappers** para conectarse a fuentes de datos externas: otras bases PostgreSQL, MySQL, Oracle, ficheros CSV, APIs REST, etc.

```sql
-- 1. Instalar la extensión para conectar a otro PostgreSQL
CREATE EXTENSION postgres_fdw;

-- 2. Registrar el servidor remoto
CREATE SERVER servidor_ventas
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'servidor-ventas.empresa.com', port '5432', dbname 'ventas');

-- 3. Mapear el usuario local al usuario remoto
CREATE USER MAPPING FOR mi_usuario
    SERVER servidor_ventas
    OPTIONS (user 'usuario_remoto', password 'password_remoto');

-- 4. Crear la tabla foránea
CREATE FOREIGN TABLE ventas_externas (
    id      INT,
    fecha   DATE,
    total   DECIMAL(10,2),
    cliente VARCHAR(100)
)
SERVER servidor_ventas
OPTIONS (schema_name 'public', table_name 'ventas');

-- 5. Consultar normalmente
SELECT cliente, SUM(total) AS facturacion
FROM ventas_externas
WHERE fecha >= '2024-01-01'
GROUP BY cliente;

-- También puedes importar todas las tablas de un esquema remoto
IMPORT FOREIGN SCHEMA public
FROM SERVER servidor_ventas
INTO esquema_local;
```

## SQL Server: Linked Servers

```sql
-- Crear un Linked Server hacia otro SQL Server
EXEC sp_addlinkedserver
    @server    = 'SERVIDOR_REMOTO',
    @srvproduct = 'SQL Server';

-- Mapear credenciales
EXEC sp_addlinkedsrvlogin
    @rmtsrvname = 'SERVIDOR_REMOTO',
    @useself    = 'FALSE',
    @rmtuser    = 'sa',
    @rmtpassword = 'password';

-- Consultar con sintaxis de 4 partes: servidor.bd.esquema.tabla
SELECT * FROM SERVIDOR_REMOTO.ventas.dbo.pedidos WHERE año = 2024;

-- O con OPENQUERY para mayor control
SELECT * FROM OPENQUERY(SERVIDOR_REMOTO, 'SELECT id, total FROM ventas.dbo.pedidos');
```

## Cuándo usarlos
- Integración entre sistemas heterogéneos (ej: aplicación legada + sistema nuevo)
- Reportes consolidados de múltiples servidores
- Migración gradual de datos entre sistemas

## Alternativas Modernas
Para grandes volúmenes o integraciones complejas, considera:
- **ETL** (Extract, Transform, Load) con herramientas como Apache Airflow, Talend
- **Data Lake / Data Warehouse** (BigQuery, Snowflake, Redshift)
- **APIs REST** para acceso a datos externos
""",
    },
]


def seed_sql_advanced_theory():
    """Siembra posts de teoría avanzada de SQL si no existen ya."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Buscar el subject de Bases de Datos / SQL (varios slugs posibles)
        sql_subject = None
        for slug_candidate in ['bases-de-datos', 'sql', 'bbdd', 'sql-y-bases-de-datos', 'base-de-datos']:
            sql_subject = db.query(TheorySubject).filter(TheorySubject.slug == slug_candidate).first()
            if sql_subject:
                break

        if not sql_subject:
            # Intentar por nombre
            sql_subject = db.query(TheorySubject).filter(
                or_(
                    TheorySubject.name.ilike("%SQL%"),
                    TheorySubject.name.ilike("%Base%Dato%"),
                    TheorySubject.name.ilike("%Dato%Base%"),
                )
            ).first()

        if not sql_subject:
            logger.info("seed_sql_theory: No se encontró subject de SQL/Bases de Datos, omitiendo.")
            return

        added = 0
        for post_data in SQL_ADVANCED_POSTS:
            existing = db.query(TheoryPost).filter(TheoryPost.slug == post_data["slug"]).first()
            if existing:
                continue  # Ya existe, no duplicar
            post = TheoryPost(
                subject_id=sql_subject.id,
                title=post_data["title"],
                slug=post_data["slug"],
                markdown_content=post_data["markdown_content"],
                is_free=post_data["is_free"],
                order_index=post_data["order_index"],
            )
            db.add(post)
            added += 1

        db.commit()
        if added:
            logger.info(f"seed_sql_theory: {added} posts de teoría SQL añadidos correctamente.")
        else:
            logger.info("seed_sql_theory: Todos los posts ya existían, nada que añadir.")
    except Exception as e:
        logger.error(f"Error en seed_sql_theory: {e}")
        db.rollback()
    finally:
        db.close()


VM_LABS_SEED = [
    # ──────────────────────────────────────────────────────────────────────────
    # SKILL PATH: Linux Fundamentals
    # ──────────────────────────────────────────────────────────────────────────
    {
        "path": {"title": "Linux Fundamentals", "title_search": "%Linux Fundamental%", "description": "Comandos esenciales de Linux para ASIR/SMR", "order_index": 1},
        "module": {"title": "Redirecciones y Tuberías", "description": "stdin, stdout, stderr, pipes y redirecciones", "order_index": 10},
        "labs": [
            {
                "title": "Redirecciones Básicas",
                "description": "Domina las redirecciones de entrada/salida en Bash: >, >>, 2>, y cómo combinarlas.",
                "goal_description": "Crea el archivo /home/student/resultado.txt con el contenido exacto 'Hola Tech4U'.",
                "category": "Linux",
                "difficulty": "easy",
                "time_limit": 20,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({
                    "files": [
                        {"path": "/home/student/info.txt", "content": "Sistema: Ubuntu 22.04\nUsuario: student\nAcademia: Tech4U"}
                    ]
                }),
                "validation_command": "cat /home/student/resultado.txt",
                "expected_result": "Hola Tech4U",
                "step_by_step_guide": "### 📤 Redirecciones de Salida\n\n**Redirección básica** (`>`) — sobreescribe:\n```bash\necho 'Hola Tech4U' > resultado.txt\n```\n\n**Redirección append** (`>>`) — añade al final:\n```bash\necho 'Línea 2' >> resultado.txt\n```\n\n**Redirección de errores** (`2>`):\n```bash\nls /ruta/inexistente 2> errores.txt\n```\n\n**Combinar stdout y stderr** (`2>&1`):\n```bash\nls /ruta 2>&1 > todo.txt\n```\n\n**Misión**: Crea el archivo con exactamente `Hola Tech4U`:\n```bash\necho 'Hola Tech4U' > /home/student/resultado.txt\ncat /home/student/resultado.txt  # Verificar\n```",
            },
            {
                "title": "Tuberías y Filtros",
                "description": "Encadena comandos con pipes (|) y usa grep, sort, uniq y wc para procesar texto.",
                "goal_description": "Filtra las líneas del archivo /home/student/usuarios.txt que contengan 'admin', ordénalas y guárdalas en /home/student/admins.txt.",
                "category": "Linux",
                "difficulty": "easy",
                "time_limit": 25,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({
                    "files": [
                        {"path": "/home/student/usuarios.txt", "content": "admin_carlos\nuser_ana\nadmin_lucia\nuser_pedro\nadmin_marta\nuser_jose\nadmin_rafa"}
                    ]
                }),
                "validation_command": "cat /home/student/admins.txt",
                "expected_result": "admin_carlos\nadmin_lucia\nadmin_marta\nadmin_rafa",
                "step_by_step_guide": "### 🔗 Pipes y Filtros\n\n**grep** — filtra líneas:\n```bash\ngrep 'patron' archivo.txt\ngrep -i 'patron' archivo.txt  # Ignorar mayúsculas\ngrep -v 'patron' archivo.txt  # Invertir (excluir)\n```\n\n**sort** — ordenar:\n```bash\nsort archivo.txt            # Orden alfabético\nsort -r archivo.txt         # Orden inverso\nsort -n numeros.txt         # Orden numérico\n```\n\n**uniq** — eliminar duplicados (requiere sort previo):\n```bash\nsort archivo.txt | uniq\n```\n\n**wc** — contar:\n```bash\nwc -l archivo.txt   # Nº de líneas\nwc -w archivo.txt   # Nº de palabras\n```\n\n**Misión**:\n```bash\ngrep 'admin' /home/student/usuarios.txt | sort > /home/student/admins.txt\ncat /home/student/admins.txt\n```",
            },
            {
                "title": "Búsqueda con grep Avanzado",
                "description": "Usa expresiones regulares con grep para buscar patrones complejos en ficheros de log.",
                "goal_description": "Del archivo /var/log/auth.log extrae todas las líneas que contienen 'Failed password' y guárdalas en /home/student/fallos.txt.",
                "category": "Linux",
                "difficulty": "medium",
                "time_limit": 30,
                "xp_reward": 0,
                "order_index": 3,
                "scenario_setup": json.dumps({
                    "directories": ["/var/log"],
                    "files": [
                        {"path": "/var/log/auth.log", "content": "Mar  5 20:01:12 server sshd[1234]: Accepted password for root from 192.168.1.10 port 22\nMar  5 20:02:44 server sshd[1235]: Failed password for invalid user admin from 10.0.0.15 port 54321 ssh2\nMar  5 20:03:01 server sshd[1236]: Failed password for root from 10.0.0.15 port 54322 ssh2\nMar  5 20:04:05 server sshd[1237]: Accepted password for student from 192.168.1.20 port 22\nMar  5 20:05:18 server sshd[1238]: Failed password for guest from 10.0.0.15 port 54323 ssh2\nMar  5 20:06:30 server sshd[1239]: Accepted publickey for admin from 192.168.1.5 port 22"}
                    ]
                }),
                "validation_command": "grep -c 'Failed password' /home/student/fallos.txt",
                "expected_result": "3",
                "step_by_step_guide": "### 🔍 grep Avanzado\n\n**Flags útiles**:\n```bash\ngrep -n 'patron'     # Mostrar número de línea\ngrep -c 'patron'     # Contar coincidencias\ngrep -r 'patron' .   # Búsqueda recursiva en directorio\ngrep -E 'regex+'     # Expresiones regulares extendidas\n```\n\n**Expresiones regulares básicas**:\n```bash\ngrep '^Inicio'       # Líneas que empiezan por 'Inicio'\ngrep 'fin$'          # Líneas que terminan por 'fin'\ngrep '192\\.168\\.[0-9]+\\.[0-9]+' archivo  # IPs\n```\n\n**Misión**:\n```bash\ngrep 'Failed password' /var/log/auth.log > /home/student/fallos.txt\ncat /home/student/fallos.txt\nwc -l /home/student/fallos.txt  # Deberían ser 3 líneas\n```",
            },
        ],
    },

    {
        "path": {"title": "Linux Fundamentals", "title_search": "%Linux Fundamental%", "description": "Comandos esenciales de Linux para ASIR/SMR", "order_index": 1},
        "module": {"title": "Gestión de Procesos", "description": "ps, kill, systemctl, top y monitorización del sistema", "order_index": 20},
        "labs": [
            {
                "title": "Explorar Procesos en Ejecución",
                "description": "Aprende a listar y analizar procesos con ps, top y pgrep. Identifica PIDs y estados de proceso.",
                "goal_description": "Encuentra el PID del proceso 'sleep' en ejecución y guárdalo en /home/student/pid.txt.",
                "category": "Linux",
                "difficulty": "easy",
                "time_limit": 20,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({
                    "commands": ["sleep 9999 &"]
                }),
                "validation_command": "[ -s /home/student/pid.txt ] && echo 'OK' || echo 'FAIL'",
                "expected_result": "OK",
                "step_by_step_guide": "### 🔍 Gestión de Procesos\n\n**Ver todos los procesos**:\n```bash\nps aux              # Todos los procesos (usuario, PID, CPU, MEM, CMD)\nps aux | grep sleep # Filtrar por nombre\n```\n\n**Campos de ps aux**:\n- `USER` — Usuario propietario\n- `PID` — Process ID\n- `%CPU / %MEM` — Uso de recursos\n- `STAT` — Estado: R=running, S=sleeping, Z=zombie\n- `COMMAND` — Comando ejecutado\n\n**pgrep** — obtener PID directamente:\n```bash\npgrep sleep         # Solo el PID\npgrep -l sleep      # PID + nombre\n```\n\n**Misión** — Guarda el PID de sleep:\n```bash\npgrep sleep > /home/student/pid.txt\ncat /home/student/pid.txt\n```",
            },
            {
                "title": "Matar Procesos y Señales",
                "description": "Controla procesos con kill, killall y las señales SIGTERM/SIGKILL. Aprende la diferencia entre terminar limpiamente y forzar la parada.",
                "goal_description": "Detén el proceso 'sleep' que está en ejecución usando kill o killall.",
                "category": "Linux",
                "difficulty": "medium",
                "time_limit": 20,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({
                    "commands": ["sleep 9999 &", "sleep 9998 &"]
                }),
                "validation_command": "pgrep sleep | wc -l | tr -d ' '",
                "expected_result": "0",
                "step_by_step_guide": "### ⚡ Señales y kill\n\n**Señales más usadas**:\n| Señal | Número | Efecto |\n|---|---|---|\n| SIGTERM | 15 | Terminación elegante (por defecto) |\n| SIGKILL | 9 | Terminación forzada (no interceptable) |\n| SIGHUP | 1 | Recargar configuración |\n| SIGSTOP | 19 | Pausar proceso |\n\n**kill** — por PID:\n```bash\nkill 1234          # SIGTERM (elegante)\nkill -9 1234       # SIGKILL (forzado)\nkill -SIGTERM 1234 # Equivalente al primero\n```\n\n**killall** — por nombre:\n```bash\nkillall sleep      # Mata todos los sleep\nkillall -9 firefox\n```\n\n**pkill** — por patrón:\n```bash\npkill sleep\npkill -u student   # Mata todos los procesos del usuario student\n```\n\n**Misión**:\n```bash\nkillall sleep\npgrep sleep  # No debería devolver nada\n```",
            },
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # SKILL PATH: Bash Scripting
    # ──────────────────────────────────────────────────────────────────────────
    {
        "path": {"title": "Bash Scripting", "description": "Automatización y scripting en Bash", "order_index": 2},
        "module": {"title": "Scripts y Variables", "description": "Fundamentos de scripting: variables, input y lógica básica", "order_index": 1},
        "labs": [
            {
                "title": "Tu Primer Script Bash",
                "description": "Crea un script ejecutable con shebang, variables y salida formateada por pantalla.",
                "goal_description": "Crea el script /home/student/saludo.sh que imprima 'Hola, soy student en Linux.' y hazlo ejecutable.",
                "category": "Scripting",
                "difficulty": "easy",
                "time_limit": 20,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({}),
                "validation_command": "bash /home/student/saludo.sh",
                "expected_result": "Hola, soy student en Linux.",
                "step_by_step_guide": "### 🖊️ Tu Primer Script\n\n**Estructura básica**:\n```bash\n#!/bin/bash\n# Esto es un comentario\necho 'Hola Mundo'\n```\n\n**Variables**:\n```bash\nnombre='student'\nequipo='Linux'\necho \"Hola, soy $nombre en $equipo.\"\n```\n\n**Variables especiales**:\n```bash\n$0   # Nombre del script\n$1   # Primer argumento\n$#   # Número de argumentos\n$?   # Código de salida del último comando (0=OK)\n$$   # PID del script actual\n```\n\n**Crear y ejecutar**:\n```bash\nnano /home/student/saludo.sh\n# Escribe el script\nchmod +x /home/student/saludo.sh\n./saludo.sh\n# o también:\nbash /home/student/saludo.sh\n```\n\n**Misión** — El script debe imprimir exactamente:\n```\nHola, soy student en Linux.\n```",
            },
            {
                "title": "Condicionales if/elif/else",
                "description": "Controla el flujo de tus scripts con condicionales. Aprende comparaciones numéricas, de cadenas y de archivos.",
                "goal_description": "Crea /home/student/check_numero.sh que lea la variable NUM=42 y escriba en /home/student/check.txt si es 'mayor', 'menor' o 'igual' a 50.",
                "category": "Scripting",
                "difficulty": "medium",
                "time_limit": 30,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({}),
                "validation_command": "NUM=42 bash /home/student/check_numero.sh && cat /home/student/check.txt",
                "expected_result": "menor",
                "step_by_step_guide": "### 🔀 Condicionales en Bash\n\n**Comparaciones numéricas**:\n| Operador | Significado |\n|---|---|\n| `-eq` | igual |\n| `-ne` | no igual |\n| `-lt` | menor que |\n| `-le` | menor o igual |\n| `-gt` | mayor que |\n| `-ge` | mayor o igual |\n\n**Comparaciones de cadenas**:\n```bash\n[ \"$a\" = \"$b\" ]    # igual\n[ \"$a\" != \"$b\" ]   # distinto\n[ -z \"$a\" ]         # cadena vacía\n[ -n \"$a\" ]         # cadena no vacía\n```\n\n**Comprobación de archivos**:\n```bash\n[ -f /ruta/archivo ]  # existe y es fichero\n[ -d /ruta/dir ]      # existe y es directorio\n[ -x /ruta/script ]   # es ejecutable\n[ -r /ruta/fichero ]  # es legible\n```\n\n**Estructura completa**:\n```bash\n#!/bin/bash\nNUM=${NUM:-42}  # Usa NUM si está definido, si no 42\nif [ \"$NUM\" -gt 50 ]; then\n    echo 'mayor' > /home/student/check.txt\nelif [ \"$NUM\" -lt 50 ]; then\n    echo 'menor' > /home/student/check.txt\nelse\n    echo 'igual' > /home/student/check.txt\nfi\n```",
            },
        ],
    },

    {
        "path": {"title": "Bash Scripting", "description": "Automatización y scripting en Bash", "order_index": 2},
        "module": {"title": "Bucles y Funciones", "description": "Iteración y reutilización de código en scripts", "order_index": 2},
        "labs": [
            {
                "title": "Bucles for y while",
                "description": "Itera sobre listas, rangos y archivos. Automatiza tareas repetitivas con bucles en Bash.",
                "goal_description": "Crea /home/student/numeros.sh que escriba los números del 1 al 10 (uno por línea) en /home/student/numeros.txt.",
                "category": "Scripting",
                "difficulty": "easy",
                "time_limit": 25,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({}),
                "validation_command": "bash /home/student/numeros.sh && cat /home/student/numeros.txt",
                "expected_result": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
                "step_by_step_guide": "### 🔄 Bucles en Bash\n\n**for — rango de números**:\n```bash\nfor i in {1..10}; do\n    echo $i\ndone\n```\n\n**for — lista de elementos**:\n```bash\nfor color in rojo verde azul; do\n    echo \"Color: $color\"\ndone\n```\n\n**for — archivos de un directorio**:\n```bash\nfor archivo in /home/student/*.txt; do\n    echo \"Procesando: $archivo\"\ndone\n```\n\n**while — condición**:\n```bash\ni=1\nwhile [ $i -le 10 ]; do\n    echo $i\n    ((i++))\ndone\n```\n\n**while — leer líneas de archivo**:\n```bash\nwhile IFS= read -r linea; do\n    echo \"Línea: $linea\"\ndone < archivo.txt\n```\n\n**Misión** — Genera números del 1 al 10:\n```bash\n#!/bin/bash\nfor i in {1..10}; do\n    echo $i\ndone > /home/student/numeros.txt\n```",
            },
            {
                "title": "Script de Backup Automático",
                "description": "Combina todo lo aprendido: bucles, condicionales y redirecciones para crear un script real de backup.",
                "goal_description": "Crea /home/student/backup.sh que comprima /home/student/datos/ en /home/student/backup.tar.gz usando tar.",
                "category": "Scripting",
                "difficulty": "hard",
                "time_limit": 40,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/datos"],
                    "files": [
                        {"path": "/home/student/datos/config.conf", "content": "host=server1\nport=8080"},
                        {"path": "/home/student/datos/usuarios.csv", "content": "admin,admin@empresa.com\nuser1,user1@empresa.com"},
                        {"path": "/home/student/datos/README.txt", "content": "Directorio de datos de producción"}
                    ]
                }),
                "validation_command": "tar -tzf /home/student/backup.tar.gz > /dev/null 2>&1 && echo 'OK' || echo 'FAIL'",
                "expected_result": "OK",
                "step_by_step_guide": "### 🗜️ Compresión con tar\n\n**Crear un archivo tar.gz**:\n```bash\ntar -czf nombre_backup.tar.gz directorio/\n\n# Flags:\n# -c: crear archivo\n# -z: comprimir con gzip\n# -f: nombre del archivo\n# -v: verbose (ver archivos procesados)\n```\n\n**Extraer un tar.gz**:\n```bash\ntar -xzf backup.tar.gz          # Extraer aquí\ntar -xzf backup.tar.gz -C /tmp  # Extraer en /tmp\n```\n\n**Ver contenido sin extraer**:\n```bash\ntar -tzf backup.tar.gz\n```\n\n**Script de backup con fecha**:\n```bash\n#!/bin/bash\nFECHA=$(date +%Y%m%d_%H%M%S)\nORIGEN=/home/student/datos\nDESTINO=/home/student/backup_${FECHA}.tar.gz\n\nif [ -d \"$ORIGEN\" ]; then\n    tar -czf \"$DESTINO\" \"$ORIGEN\"\n    echo \"Backup creado: $DESTINO\"\nelse\n    echo \"ERROR: Directorio origen no existe\" >&2\n    exit 1\nfi\n```\n\n**Misión** — Versión simplificada:\n```bash\n#!/bin/bash\ntar -czf /home/student/backup.tar.gz /home/student/datos/\necho 'Backup completado'\n```",
            },
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # SKILL PATH: Storage & Disk Administration
    # ──────────────────────────────────────────────────────────────────────────
    {
        "path": {"title": "Storage & Disk Administration", "description": "Almacenamiento, particiones y sistemas de archivos", "order_index": 3},
        "module": {"title": "Monitorización de Disco", "description": "df, du y análisis del uso del disco", "order_index": 1},
        "labs": [
            {
                "title": "Análisis de Uso de Disco",
                "description": "Aprende a monitorizar el uso del disco con df y du. Identifica qué directorios ocupan más espacio.",
                "goal_description": "Usa du para encontrar el directorio más grande en /usr y guarda su nombre en /home/student/mayor.txt.",
                "category": "Storage",
                "difficulty": "easy",
                "time_limit": 20,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({}),
                "validation_command": "[ -s /home/student/mayor.txt ] && echo 'OK' || echo 'FAIL'",
                "expected_result": "OK",
                "step_by_step_guide": "### 💾 Monitorización de Disco\n\n**df — espacio en sistemas de ficheros montados**:\n```bash\ndf -h          # Human-readable (KB, MB, GB)\ndf -h /        # Solo el sistema raíz\ndf -h --output=source,size,used,avail,pcent,target\n```\n\n**du — espacio usado por directorios**:\n```bash\ndu -sh /home/student    # Tamaño total del directorio\ndu -sh /usr/*           # Tamaño de cada subdirectorio de /usr\ndu -h --max-depth=1 /   # Nivel 1 desde raíz\n```\n\n**Encontrar los directorios más grandes**:\n```bash\ndu -sh /usr/* | sort -rh | head -5\n# -r: invertir orden (mayor primero)\n# -h: ordenar por tamaño human-readable\n```\n\n**Misión** — Directorio más grande en /usr:\n```bash\ndu -sh /usr/* 2>/dev/null | sort -rh | head -1 | awk '{print $2}' | xargs basename > /home/student/mayor.txt\ncat /home/student/mayor.txt\n```",
            },
            {
                "title": "Compresión y Archivos",
                "description": "Gestiona archivos comprimidos con gzip, bzip2 y zip. Aprende a comprimir, descomprimir y listar contenidos.",
                "goal_description": "Comprime /home/student/logs/ en /home/student/logs.tar.gz y verifica que el archivo tiene al menos 3 ficheros.",
                "category": "Storage",
                "difficulty": "medium",
                "time_limit": 25,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/logs"],
                    "files": [
                        {"path": "/home/student/logs/app.log", "content": "2026-03-01 ERROR: Connection refused\n2026-03-01 INFO: Server started\n2026-03-02 WARN: High memory usage"},
                        {"path": "/home/student/logs/access.log", "content": "192.168.1.10 GET /index.html 200\n10.0.0.5 POST /login 401\n192.168.1.20 GET /api/users 200"},
                        {"path": "/home/student/logs/error.log", "content": "FATAL: Disk full\nERROR: Cannot write to /var/log\nWARN: Retry attempt 3"}
                    ]
                }),
                "validation_command": "tar -tzf /home/student/logs.tar.gz 2>/dev/null | grep -c '.log'",
                "expected_result": "3",
                "step_by_step_guide": "### 🗜️ Gestión de Archivos Comprimidos\n\n**gzip/gunzip** — comprimir ficheros individuales:\n```bash\ngzip fichero.txt        # Crea fichero.txt.gz y elimina el original\ngunzip fichero.txt.gz   # Descomprimir\ngzip -k fichero.txt     # Mantener el original (-k = keep)\nzcat fichero.txt.gz     # Ver sin descomprimir\n```\n\n**tar + gzip** (el más usado):\n```bash\ntar -czf backup.tar.gz directorio/   # Comprimir\ntar -xzf backup.tar.gz               # Extraer\ntar -tzf backup.tar.gz               # Listar contenido\n```\n\n**zip/unzip**:\n```bash\nzip -r archivo.zip directorio/\nunzip archivo.zip\nunzip -l archivo.zip    # Solo listar\n```\n\n**Comparativa de compresión**:\n- `gzip`: rápido, compresión moderada\n- `bzip2`: más lento, mejor compresión\n- `xz`: más lento, mejor compresión aún\n\n**Misión**:\n```bash\ntar -czf /home/student/logs.tar.gz /home/student/logs/\ntar -tzf /home/student/logs.tar.gz  # Verificar contenido\n```",
            },
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # SKILL PATH: Seguridad y Análisis
    # ──────────────────────────────────────────────────────────────────────────
    {
        "path": {"title": "Seguridad y Análisis", "description": "Análisis forense, logs y monitorización de seguridad en Linux", "order_index": 5},
        "module": {"title": "Análisis de Logs", "description": "Investigación de logs del sistema y detección de intrusiones", "order_index": 1},
        "labs": [
            {
                "title": "Investigación de Logs SSH",
                "description": "Analiza auth.log para detectar intentos de acceso fallidos y extraer IPs sospechosas.",
                "goal_description": "Encuentra cuántos intentos fallidos de SSH hay en /var/log/auth.log y guarda el número en /home/student/intentos.txt.",
                "category": "Seguridad",
                "difficulty": "medium",
                "time_limit": 30,
                "xp_reward": 0,
                "order_index": 1,
                "scenario_setup": json.dumps({
                    "directories": ["/var/log"],
                    "files": [
                        {"path": "/var/log/auth.log", "content": "Mar 5 20:01:00 srv sshd[100]: Failed password for root from 10.0.0.15 port 54321 ssh2\nMar 5 20:01:05 srv sshd[101]: Failed password for admin from 10.0.0.15 port 54322 ssh2\nMar 5 20:01:10 srv sshd[102]: Accepted password for student from 192.168.1.5 port 22 ssh2\nMar 5 20:01:15 srv sshd[103]: Failed password for user1 from 10.0.0.15 port 54323 ssh2\nMar 5 20:01:20 srv sshd[104]: Failed password for root from 10.0.0.99 port 12345 ssh2\nMar 5 20:01:25 srv sshd[105]: Accepted publickey for admin from 192.168.1.10 port 22\nMar 5 20:01:30 srv sshd[106]: Failed password for guest from 10.0.0.15 port 54324 ssh2"}
                    ]
                }),
                "validation_command": "cat /home/student/intentos.txt",
                "expected_result": "5",
                "step_by_step_guide": "### 🔐 Análisis de auth.log\n\n**Estructura de auth.log**:\n- Fecha y hora\n- Hostname\n- Servicio (sshd, sudo, su...)\n- PID\n- Mensaje\n\n**Buscar intentos fallidos**:\n```bash\ngrep 'Failed password' /var/log/auth.log\ngrep 'Failed password' /var/log/auth.log | wc -l\n```\n\n**Extraer IPs atacantes**:\n```bash\ngrep 'Failed password' /var/log/auth.log | \\\n  awk '{print $(NF-3)}' | \\\n  sort | uniq -c | sort -rn\n```\n\n**Buscar accesos exitosos**:\n```bash\ngrep 'Accepted' /var/log/auth.log\n```\n\n**Misión** — Contar intentos fallidos:\n```bash\ngrep -c 'Failed password' /var/log/auth.log > /home/student/intentos.txt\ncat /home/student/intentos.txt\n```",
            },
            {
                "title": "CTF: El Servidor Comprometido",
                "description": "Un servidor ha sido atacado. Analiza múltiples archivos de log para reconstruir la cadena del ataque y encontrar la flag oculta.",
                "goal_description": "El atacante dejó una flag en el sistema. Encuéntrala analizando los logs y guárdala en /home/student/flag.txt.",
                "category": "Seguridad",
                "difficulty": "hard",
                "time_limit": 45,
                "xp_reward": 0,
                "order_index": 2,
                "scenario_setup": json.dumps({
                    "directories": ["/var/log/apache2", "/var/log"],
                    "files": [
                        {"path": "/var/log/apache2/access.log", "content": "192.168.1.100 - - [05/Mar/2026:19:55:00] \"GET / HTTP/1.1\" 200 1024 \"-\" \"Mozilla/5.0\"\n10.0.0.99 - - [05/Mar/2026:20:00:01] \"GET /admin HTTP/1.1\" 401 234 \"-\" \"sqlmap/1.7\"\n10.0.0.99 - - [05/Mar/2026:20:00:05] \"GET /admin?id=1 OR 1=1 HTTP/1.1\" 200 534 \"-\" \"sqlmap/1.7\"\n10.0.0.99 - - [05/Mar/2026:20:01:00] \"POST /upload.php HTTP/1.1\" 200 89 \"-\" \"curl/7.68\"\n10.0.0.99 - - [05/Mar/2026:20:02:00] \"GET /shell.php?cmd=id HTTP/1.1\" 200 15 \"-\" \"curl/7.68\""},
                        {"path": "/var/log/syslog", "content": "Mar 5 20:02:05 server cron[555]: (root) CMD (echo 'flag{LOG_HUNTER_PRO}' > /tmp/.hidden_flag)\nMar 5 20:03:00 server kernel: [UFW BLOCK] IN=eth0 SRC=10.0.0.99 PROTO=TCP DPT=4444"},
                        {"path": "/tmp/.hidden_flag", "content": "flag{LOG_HUNTER_PRO}"}
                    ]
                }),
                "validation_command": "cat /home/student/flag.txt",
                "expected_result": "flag{LOG_HUNTER_PRO}",
                "step_by_step_guide": "### 🕵️ CTF: Investigación Forense\n\n**Pasos del análisis**:\n\n1. **Revisar logs de Apache** — busca actividad sospechosa:\n```bash\ncat /var/log/apache2/access.log\ngrep -E '(sqlmap|curl|shell|upload)' /var/log/apache2/access.log\n```\n\n2. **Revisar syslog** — busca comandos ejecutados:\n```bash\ngrep -i 'flag\\|hidden\\|secret' /var/log/syslog\n```\n\n3. **Buscar archivos ocultos** (empiezan por punto):\n```bash\nls -la /tmp/          # Archivos ocultos en /tmp\nfind / -name '.*' -type f 2>/dev/null | head -20\n```\n\n4. **Buscar la flag** en todo el sistema:\n```bash\ngrep -r 'flag{' /var/log/ 2>/dev/null\ngrep -r 'flag{' /tmp/ 2>/dev/null\n```\n\n5. **Guardar la flag**:\n```bash\ncat /tmp/.hidden_flag > /home/student/flag.txt\n```",
            },
        ],
    },
]


def seed_vm_labs():
    """Siembra el catálogo de labs de VM Skills (SkillPath → Module → Lab) si no existen."""
    import json as _json
    from database import SessionLocal
    db = SessionLocal()
    try:
        labs_added = 0
        for entry in VM_LABS_SEED:
            path_data = entry["path"]
            module_data = entry["module"]
            labs_data = entry["labs"]

            # 1. Buscar o crear el SkillPath
            # Si hay title_search, usar ilike para encontrar paths con nombre similar (ej. "Linux Fundamentals v1.0")
            if path_data.get("title_search"):
                skill_path = db.query(SkillPath).filter(
                    SkillPath.title.ilike(path_data["title_search"])
                ).first()
            else:
                skill_path = db.query(SkillPath).filter(
                    SkillPath.title == path_data["title"]
                ).first()
            if not skill_path:
                skill_path = SkillPath(
                    title=path_data["title"],
                    description=path_data["description"],
                    order_index=path_data["order_index"],
                    is_active=True,
                )
                db.add(skill_path)
                db.flush()
                logger.info(f"seed_vm_labs: SkillPath '{path_data['title']}' creado (id={skill_path.id})")

            # 2. Buscar o crear el Module
            module = db.query(Module).filter(
                Module.skill_path_id == skill_path.id,
                Module.title == module_data["title"]
            ).first()
            if not module:
                module = Module(
                    skill_path_id=skill_path.id,
                    title=module_data["title"],
                    description=module_data["description"],
                    order_index=module_data["order_index"],
                    is_active=True,
                )
                db.add(module)
                db.flush()
                logger.info(f"seed_vm_labs: Module '{module_data['title']}' creado (id={module.id})")

            # 3. Crear Labs si no existen
            for lab_data in labs_data:
                existing = db.query(Lab).filter(
                    Lab.module_id == module.id,
                    Lab.title == lab_data["title"]
                ).first()
                if existing:
                    continue
                lab = Lab(
                    module_id=module.id,
                    title=lab_data["title"],
                    description=lab_data["description"],
                    goal_description=lab_data.get("goal_description", ""),
                    category=lab_data.get("category", "Linux"),
                    difficulty=lab_data.get("difficulty", "easy"),
                    time_limit=lab_data.get("time_limit", 30),
                    xp_reward=lab_data.get("xp_reward", 0),
                    order_index=lab_data.get("order_index", 0),
                    docker_image="ubuntu:22.04",
                    scenario_setup=lab_data.get("scenario_setup", "{}"),
                    validation_command=lab_data.get("validation_command", ""),
                    expected_result=lab_data.get("expected_result", ""),
                    expected_flag=lab_data.get("expected_flag", ""),
                    step_by_step_guide=lab_data.get("step_by_step_guide", ""),
                    is_active=True,
                )
                db.add(lab)
                labs_added += 1

        db.commit()
        if labs_added:
            logger.info(f"seed_vm_labs: {labs_added} lab(s) añadido(s).")
        else:
            logger.info("seed_vm_labs: Todos los labs ya existían.")
    except Exception as e:
        logger.error(f"Error en seed_vm_labs: {e}")
        db.rollback()
    finally:
        db.close()


def fix_linux_fundamentals_duplicate():
    """Migración única: si existe un SkillPath llamado exactamente 'Linux Fundamentals'
    (duplicado creado por el seeder) Y también existe uno que coincide con ilike '%Linux Fundamental%'
    (el original, ej. 'Linux Fundamentals v1.0'), mueve todos los módulos del duplicado
    al original y elimina el duplicado vacío."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Buscar el original (ilike, excluye el exact "Linux Fundamentals")
        original = db.query(SkillPath).filter(
            SkillPath.title.ilike("%Linux Fundamental%"),
            SkillPath.title != "Linux Fundamentals"
        ).first()
        if not original:
            logger.info("fix_linux_fundamentals_duplicate: No se encontró un path original distinto, omitiendo.")
            return

        # Buscar el duplicado exacto creado por el seeder
        duplicate = db.query(SkillPath).filter(
            SkillPath.title == "Linux Fundamentals"
        ).first()
        if not duplicate:
            logger.info("fix_linux_fundamentals_duplicate: No existe duplicado 'Linux Fundamentals', nada que hacer.")
            return

        if original.id == duplicate.id:
            logger.info("fix_linux_fundamentals_duplicate: Original y duplicado son el mismo path, nada que hacer.")
            return

        # Mover todos los módulos del duplicado al original
        modules_moved = db.query(Module).filter(Module.skill_path_id == duplicate.id).all()
        for mod in modules_moved:
            # Comprobar que no existe ya un módulo con el mismo nombre en el original
            existing = db.query(Module).filter(
                Module.skill_path_id == original.id,
                Module.title == mod.title
            ).first()
            if not existing:
                mod.skill_path_id = original.id
                logger.info(f"fix_linux_fundamentals_duplicate: Módulo '{mod.title}' movido a '{original.title}'.")
            else:
                # El módulo ya existe en el original: mover sus labs y eliminar el duplicado
                dup_labs = db.query(Lab).filter(Lab.module_id == mod.id).all()
                for lab in dup_labs:
                    ex_lab = db.query(Lab).filter(Lab.module_id == existing.id, Lab.title == lab.title).first()
                    if not ex_lab:
                        lab.module_id = existing.id
                        logger.info(f"fix_linux_fundamentals_duplicate: Lab '{lab.title}' movido al módulo existente.")
                    else:
                        db.delete(lab)
                db.flush()
                db.delete(mod)
                logger.info(f"fix_linux_fundamentals_duplicate: Módulo duplicado '{mod.title}' eliminado (ya existía en original).")

        db.flush()
        # Eliminar el SkillPath duplicado si ya quedó vacío
        remaining = db.query(Module).filter(Module.skill_path_id == duplicate.id).count()
        if remaining == 0:
            db.delete(duplicate)
            logger.info(f"fix_linux_fundamentals_duplicate: SkillPath duplicado '{duplicate.title}' eliminado.")
        else:
            logger.warning(f"fix_linux_fundamentals_duplicate: Quedaron {remaining} módulos en duplicado, no se elimina.")

        db.commit()
    except Exception as e:
        logger.error(f"Error en fix_linux_fundamentals_duplicate: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
async def startup():
    # ── Validación de variables de entorno críticas ──────────────────────────
    REQUIRED_ENV_VARS = ["SECRET_KEY", "DATABASE_URL"]
    
    _env = os.getenv("ENVIRONMENT", "development")
    if _env == "production":
        # En producción, Stripe es obligatorio
        REQUIRED_ENV_VARS.append("STRIPE_SECRET_KEY")

    missing = [v for v in REQUIRED_ENV_VARS if not os.getenv(v)]
    if missing:
        raise RuntimeError(
            f"🚨 STARTUP FAILED — Variables de entorno requeridas no configuradas: {', '.join(missing)}\n"
            f"   Crea el archivo .env con estos valores antes de arrancar el servidor."
        )

    # 🛡️ SECURITY FIX: Enforce non-default/weak SECRET_KEY in production
    if _env == "production":
        secret = os.getenv("SECRET_KEY", "")
        if len(secret) < 32 or secret in ["change-me", "your-super-secret-key"]:
            raise RuntimeError(
                "🚨 STARTUP FAILED — El SECRET_KEY es demasiado débil o usa un valor por defecto.\n"
                "   En producción, debe ser una cadena aleatoria de al menos 32 caracteres (ej: openssl rand -hex 32)."
            )

    # ── Advertencias de producción ────────────────────────────────────────────
    if _env == "production":
        _warnings = []
        if not os.getenv("RESEND_API_KEY"):
            _warnings.append("⚠️  RESEND_API_KEY vacío — los emails transaccionales no se enviarán")
        if not os.getenv("SENTRY_DSN"):
            _warnings.append("⚠️  SENTRY_DSN vacío — los errores de producción no se monitorean")
        if os.getenv("COOKIE_SECURE", "false").lower() != "true":
            _warnings.append("⚠️  COOKIE_SECURE=false en producción — las cookies no son seguras sobre HTTP")
        if os.getenv("ALLOWED_ORIGINS", "").startswith("http://localhost"):
            _warnings.append("⚠️  ALLOWED_ORIGINS apunta a localhost — el CORS bloqueará el dominio real")
        for w in _warnings:
            logger.warning(w)
        if _warnings:
            logger.warning("   Revisa tu .env antes de recibir usuarios reales.")

    logger.info(f"✅ Entorno '{_env}' validado — configuraciones críticas presentes.")

    # Crear tablas nuevas que no existan en BD (seguro: no modifica tablas existentes)
    from database import create_tables
    create_tables()

    # ── Safe column migrations (ADD COLUMN IF NOT EXISTS) ────────────────────
    # Runs on every startup but is idempotent — safe to run multiple times.
    from database import engine, DATABASE_URL
    if not DATABASE_URL.startswith("sqlite"):
        # PostgreSQL
        _safe_columns = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;",
            "CREATE INDEX IF NOT EXISTS ix_users_reset_token ON users (reset_token);",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS ciclo VARCHAR;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;",
            # SEC-05 FIX: token_version para revocación de JWT sin blacklist
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;",
            # SEC-03 FIX: pending_uses para reserva atómica de cupones
            "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS pending_uses INTEGER DEFAULT 0;",
            # eJPTv2 video course migrations
            "ALTER TABLE video_courses ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;",
            "CREATE INDEX IF NOT EXISTS ix_video_courses_slug ON video_courses (slug);",
            "ALTER TABLE video_lessons ADD COLUMN IF NOT EXISTS section_title VARCHAR;",
            "ALTER TABLE video_lessons ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN DEFAULT FALSE;",
            """CREATE TABLE IF NOT EXISTS lesson_materials (
                id SERIAL PRIMARY KEY,
                lesson_id INTEGER NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
                title VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                file_type VARCHAR,
                file_size INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            );""",
            "CREATE INDEX IF NOT EXISTS ix_lesson_materials_lesson_id ON lesson_materials (lesson_id);",
        ]
    else:
        # SQLite doesn't support IF NOT EXISTS on ADD COLUMN — check manually
        from sqlalchemy import text, inspect as sa_inspect
        with engine.connect() as conn:
            inspector = sa_inspect(engine)
            existing_user_cols = [c["name"] for c in inspector.get_columns("users")]
            try:
                existing_coupon_cols = [c["name"] for c in inspector.get_columns("coupons")]
            except Exception:
                existing_coupon_cols = []
        _safe_columns = []
        if "reset_token" not in existing_user_cols:
            _safe_columns.append("ALTER TABLE users ADD COLUMN reset_token VARCHAR;")
        if "reset_token_expiry" not in existing_user_cols:
            _safe_columns.append("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME;")
        if "ciclo" not in existing_user_cols:
            _safe_columns.append("ALTER TABLE users ADD COLUMN ciclo VARCHAR;")
        if "onboarding_completed" not in existing_user_cols:
            _safe_columns.append("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;")
        # SEC-05 FIX: token_version para revocación de JWT
        if "token_version" not in existing_user_cols:
            _safe_columns.append("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0;")
        # SEC-03 FIX: pending_uses para reserva atómica de cupones
        if "pending_uses" not in existing_coupon_cols:
            _safe_columns.append("ALTER TABLE coupons ADD COLUMN pending_uses INTEGER DEFAULT 0;")

    if _safe_columns:
        from sqlalchemy import text
        with engine.begin() as conn:
            for stmt in _safe_columns:
                try:
                    conn.execute(text(stmt))
                    logger.info(f"✅ Migration applied: {stmt.strip()}")
                except Exception as e:
                    logger.warning(f"⚠️  Migration skipped (already applied?): {e}")

    os.makedirs("static/videos", exist_ok=True)
    os.makedirs("static/materials", exist_ok=True)
    # Migración: mover 'Usuarios y Permisos' a 'Linux Fundamentals'
    migrate_usuarios_permisos_to_linux()
    # Migración: fusionar SkillPath duplicado "Linux Fundamentals" con el original "Linux Fundamentals v1.0"
    fix_linux_fundamentals_duplicate()
    # Seed: añadir posts de teoría SQL avanzada si no existen
    seed_sql_advanced_theory()
    # Seed: añadir labs de VM Skills si no existen
    seed_vm_labs()
    # Seed: Teoría Ciberseguridad (5 guías: OWASP, Kali, Cripto, Firewall, Forense)
    # Seed: eJPTv2 - Junior Penetration Tester (7 módulos completos)
    from scripts.seed_teoria_startup import seed_ciberseguridad_teoria, seed_ejptv2_teoria
    seed_ciberseguridad_teoria()
    seed_ejptv2_teoria()
    # Start background cleanup task
    asyncio.create_task(cleanup_stale_containers())

async def cleanup_stale_containers():
    """Periodically kills containers that have been running for too long (1 hour) or are orphaned."""
    while True:
        try:
            client = docker_launcher.client
            if client:
                containers = await asyncio.to_thread(
                    client.containers.list, 
                    filters={"label": "academy=tech4u"}
                )
                now = datetime.datetime.now(datetime.timezone.utc)
                for c in containers:
                    try:
                        created_str = c.attrs.get("Created")

                        if created_str:
                            # Parse ISO format (handle Z or offset)
                            created_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                            if (now - created_dt).total_seconds() > 3600: # 1 hour limit
                                logger.info(f"Cleaning up stale container: {c.name}")
                                c.stop(timeout=2)
                    except Exception as e:
                        logger.error(f"Error checking container {c.name}: {e}")
            await asyncio.sleep(300) # Every 5 minutes
        except Exception as e:
            logger.error(f"Cleanup Task Error: {e}")
            await asyncio.sleep(60)

static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(tests.router)
app.include_router(resources.router)
app.include_router(users_admin.router)
app.include_router(content_admin.router)
app.include_router(announcements.router)
app.include_router(subscriptions.router)
app.include_router(video_courses.router)
app.include_router(coupons_admin.router)
app.include_router(leaderboard.router)
app.include_router(support.router)
app.include_router(skill_labs.router)
    app.include_router(achievements.router)
app.include_router(achievements.router)
app.include_router(labs.router)
app.include_router(teoria.router)
app.include_router(referrals.router)
app.include_router(search.router)
app.include_router(sql_skills.router)
app.include_router(battle.router)
app.include_router(certificates.router)
app.include_router(analytics.router)
app.include_router(oauth.router)
app.include_router(flashcard_spaced.router)


# --- TERMINAL SANDBOX ENDPOINTS MOVED TO labs.py ---

@app.websocket("/ws/terminal/{container_id}")
async def terminal_websocket(websocket: WebSocket, container_id: str):
    await websocket.accept()

    # 1. Verify User — read httpOnly cookie first, fall back to query param (legacy/dev)
    token = (
        websocket.cookies.get("tech4u_token")
        or websocket.cookies.get("access_token")
        or websocket.query_params.get("token")
    )
    if not token:
        logger.warning(f"SECURITY: Anonymous WS connection attempt to {container_id}")
        await websocket.close(code=4001) # Policy Violation
        return

    try:
        from auth import decode_token
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
    except Exception as e:
        logger.warning(f"SECURITY: Invalid JWT in WS connection for {container_id}: {e}")
        await websocket.close(code=4001)
        return

    container = docker_launcher.get_container(container_id)
    if not container:
        await websocket.close(code=4004)
        return

    # 2. Verify Container ownership
    container_user_id = container.labels.get("user_id")
    if not container_user_id or int(container_user_id) != user_id:
        logger.error(f"SECURITY ALERT: User {user_id} attempted to hijack container {container_id} (Owner: {container_user_id})")
        await websocket.close(code=403) # Forbidden
        return

    master_fd = None
    slave_fd = None
    process = None

    try:
        # 1. Open a PTY pair
        master_fd, slave_fd = pty.openpty()

        # 2. Start interactive bash via docker exec -it on the container name
        container_name = container.name
        process = subprocess.Popen(
            ["docker", "exec", "-it", container_name, "/bin/bash"],
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            close_fds=True
        )
        # The slave end is owned by the child process — close in parent
        os.close(slave_fd)
        slave_fd = None

        # 3. WebSocket → PTY input
        async def websocket_to_pty():
            try:
                while True:
                    data = await websocket.receive_bytes()
                    if process.poll() is not None:
                        break
                    os.write(master_fd, data)
            except (WebSocketDisconnect, RuntimeError):
                pass
            except Exception as e:
                logger.error(f"[Terminal WS→PTY] {e}")

        # 4. PTY output → WebSocket (non-blocking via asyncio.to_thread)
        async def pty_to_websocket():
            try:
                while True:
                    if process.poll() is not None:
                        break
                    readable, _, _ = await asyncio.to_thread(
                        select.select, [master_fd], [], [], 0.1
                    )
                    if readable:
                        data = os.read(master_fd, 1024)
                        if not data:
                            break
                        if websocket.client_state == WebSocketState.CONNECTED:
                            await websocket.send_bytes(data)
                        else:
                            break
            except (WebSocketDisconnect, RuntimeError, OSError):
                pass
            except Exception as e:
                logger.error(f"[Terminal PTY→WS] {e}")

        # Run both tasks, stop as soon as one finishes
        done, pending = await asyncio.wait(
            [
                asyncio.create_task(websocket_to_pty()),
                asyncio.create_task(pty_to_websocket()),
            ],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()

    except Exception as e:
        logger.error(f"[Terminal Critical] {e}")
    finally:
        # Clean up subprocess and file descriptors
        if process and process.poll() is None:
            try:
                process.terminate()
            except Exception:
                pass
        if master_fd is not None:
            try:
                os.close(master_fd)
            except Exception:
                pass
        if slave_fd is not None:
            try:
                os.close(slave_fd)
            except Exception:
                pass
        # NOTE: We intentionally do NOT kill the container here.
        # The container lifecycle is managed by the lab endpoints:
        #   - POST /labs/{id}/start    → kill_all_for_user + new container
        #   - POST /labs/{id}/restart  → kill_all_for_user + new container
        #   - POST /labs/{id}/complete → kill_all_for_user
        # Killing here causes React StrictMode (dev) to destroy the container
        # on the first effect cleanup, before the second mount can reconnect.
        logger.debug(f"[Terminal] WS closed for container {container_id} — container kept alive")
        try:
            if websocket.client_state == status.WS_CONNECTED:
                await websocket.close()
        except Exception:
            pass

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint with JWT token validation via cookie or query parameter."""
    # Extract token from cookie or query parameter
    token = websocket.cookies.get("tech4u_token") or websocket.cookies.get("access_token")
    if not token:
        token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=4001, reason="Unauthorized: No token provided")
        return

    # Decode and verify JWT token
    try:
        payload = decode_token(token)
        token_user_id = payload.get("sub")
        if not token_user_id:
            await websocket.close(code=4001, reason="Unauthorized: Invalid token")
            return

        # Verify token user_id matches URL user_id to prevent user impersonation
        if str(token_user_id) != str(user_id):
            await websocket.close(code=4001, reason="Unauthorized: User ID mismatch")
            return

    except Exception as e:
        logger.warning(f"WebSocket token validation failed: {e}")
        await websocket.close(code=4001, reason="Unauthorized: Token validation failed")
        return

    # Token is valid, proceed with connection
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@app.websocket("/ws/battle/{room_code}")
async def battle_websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    token: str = None,
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for real-time battle gameplay."""
    await battle.battle_websocket_handler(websocket, room_code, token, db)

@app.get("/")
def root():
    return {"message": "Tech4U API v1.0 — La academia para estudiantes de FP 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}


# ── SEO: robots.txt ──────────────────────────────────────────────────────────
from fastapi.responses import PlainTextResponse, Response as FastAPIResponse

@app.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
def robots_txt():
    """Serve robots.txt for search engine crawlers."""
    frontend = os.getenv("FRONTEND_URL", "https://tech4uacademy.es")
    return f"""User-agent: *
Allow: /

# Block admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /docs
Disallow: /redoc
Disallow: /openapi.json

# Sitemap location
Sitemap: {frontend}/sitemap.xml
"""


@app.get("/sitemap.xml", include_in_schema=False)
def sitemap_xml(db: Session = Depends(get_db)):
    """Generate dynamic sitemap.xml with all public URLs."""
    from datetime import date
    frontend = os.getenv("FRONTEND_URL", "https://tech4uacademy.es")
    today = date.today().isoformat()

    # Static public routes
    static_urls = [
        ("", "1.0", "daily"),
        ("/planes", "0.9", "weekly"),
        ("/login", "0.8", "monthly"),
        ("/para-centros", "0.7", "monthly"),
        ("/plataforma-asir", "0.7", "monthly"),
        ("/linux-terminal-exercises", "0.7", "monthly"),
        ("/sql-practice", "0.7", "monthly"),
        ("/sql-practice-asir", "0.6", "monthly"),
        ("/ciberseguridad-asir", "0.6", "monthly"),
        ("/labs-linux-asir", "0.6", "monthly"),
    ]

    # Dynamic theory subjects + posts
    try:
        subjects = db.query(TheorySubject).filter(TheorySubject.is_published == True).all()
    except Exception:
        subjects = []

    url_entries = []
    for path, priority, freq in static_urls:
        url_entries.append(
            f"  <url>\n"
            f"    <loc>{frontend}{path}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>{freq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            f"  </url>"
        )

    for subj in subjects:
        url_entries.append(
            f"  <url>\n"
            f"    <loc>{frontend}/teoria/{subj.slug}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>weekly</changefreq>\n"
            f"    <priority>0.8</priority>\n"
            f"  </url>"
        )
        try:
            posts = db.query(TheoryPost).filter(
                TheoryPost.subject_id == subj.id,
                TheoryPost.is_published == True
            ).all()
            for post in posts:
                url_entries.append(
                    f"  <url>\n"
                    f"    <loc>{frontend}/teoria/{subj.slug}/{post.slug}</loc>\n"
                    f"    <lastmod>{today}</lastmod>\n"
                    f"    <changefreq>monthly</changefreq>\n"
                    f"    <priority>0.7</priority>\n"
                    f"  </url>"
                )
        except Exception:
            pass

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(url_entries)
        + "\n</urlset>"
    )
    return FastAPIResponse(content=xml, media_type="application/xml")