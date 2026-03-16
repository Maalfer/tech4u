# Tech4U Academy — Deep Technical Architecture Audit

## SECTION 1 — DATABASE CONFIGURATION

1. **Database Engine**: **PostgreSQL**.
2. **Configuration Location**: Primarily in the `.env` file (`DATABASE_URL`) and initialized in `backend/database.py`.
3. **Current DATABASE_URL**: `postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u`.
4. **Environment**: The database is running **locally** on the host machine (likely via a system service or a dedicated container exposing port 5432).
5. **Migrations**: **None**. The system relies on `Base.metadata.create_all(bind=engine)` in `database.py`. Manual SQL updates/scripts are used for schema changes (e.g., `migrations/freemium_is_free.sql`).
6. **Indexes**: **Yes**. Critical indexes are defined in SQLAlchemy models (e.g., `User.email`, `UserProgress.user_id`, `TestSession.user_id`).
7. **Fastest Growing Tables**: 
   - `UserProgress` (all learning activity logs).
   - `SkillLabSession` (each drag-and-drop attempt).
   - `UserLabCompletion` (detailed records of terminal lab completions).
   - `TestSession` (results of every knowledge test taken).

---

## SECTION 2 — DATABASE MODELS

| Table Name | Critical Fields | Relationships | Estimated Growth |
| :--- | :--- | :--- | :--- |
| **User** | `role`, `subscription_type`, `xp`, `level` | `UserLabCompletion`, `TestSession`, `Tickets` | Linear (per user) |
| **TerminalLab** | `image`, `scenario_setup` (JSON) | `UserLabCompletion`, `Challenges` | Static (Content) |
| **SQLExercise** | `query_check`, `dataset_id` | `UserSQLProgress` | Static (Content) |
| **SkillLabSession**| `user_id`, `exercise_id`, `score` | N/A | High (per attempt) |
| **UserLabCompletion**| `user_id`, `lab_id`, `challenges_done` | `User`, `TerminalLab` | High |
| **TestSession** | `user_id`, `score`, `subject` | `User` | High |
| **Coupon** | `code`, `discount_pct`, `active` | N/A | Low |
| **Referral** | `referrer_id`, `referred_id` | `User` | Linear |

**Critical Tables for Performance**: `User` (every request), `UserProgress` (dashboard rendering), and `SkillLabSession` (high frequency writes).

---

## SECTION 3 — LAB INFRASTRUCTURE

1. **Container Creation**: Created via **Docker SDK for Python** (`docker.DockerClient`).
2. **Isolation**: Containers are isolated **per user/session**. Names follow the pattern `lab_{lab_id}_user_{user_id}_{timestamp}`.
3. **Resource Constraints**:
   - `--memory`: **128MB** (`mem_limit="128m"`).
   - `--cpus`: **0.5 CPU** (`cpu_quota=50000`).
   - `--pids-limit`: **64**.
   - `ulimits`: `nproc=64`, `nofile=128`.
   - `network_mode`: **none** (No internet access for sandbox containers).
4. **User Context**: **`student`** (non-root) runs the main shell. Limited `sudo` or root privileges are strictly controlled via `cap_drop`.
5. **Auto-Cleanup**:
   - `auto_remove=True`: Docker deletes the container immediately on stop.
   - `cleanup_stale_containers`: Backend background task (`main.py`) kills containers with label `academy=tech4u` older than 1 hour.
6. **Concurrency Capacity**: On a 16GB RAM host, theoretical limit is ~100-120 concurrent labs (accounting for overhead), assuming moderate CPU usage.

---

## SECTION 4 — WEBSOCKET SYSTEM

1. **Authentication**: Handled via **JWT token in query parameter** (`?token=...`). Validated against `SECRET_KEY` during handshake.
2. **PTY Bridge**: Uses `pty.openpty()` to create a master/slave pair. A subprocess runs `docker exec -it <id> /bin/bash`. Data is read from/written to the master FD and bridged to the WebSocket.
3. **Protections**: Rate limited at the API level for starting containers. `ConnectionManager` prevents multiple duplicate PTY bridges for the same container.
4. **Connection Drops**: If the WS closes, the `finally` block in `main.py` ensures `docker_launcher.kill_container(container_id)` is called.
5. **Zombies**: The system is resilient via the 1-hour active label cleanup task in the event of a hard crash.

---

## SECTION 5 — AUTHENTICATION SYSTEM

1. **Method**: **JWT tokens** (HS256).
2. **Storage**: **Both**. `localStorage` is used by frontend services for convenience, while `HTTPOnly cookies` (`access_token`) are checked by the backend for session persistence/CSRF protection.
3. **Duration**: 10080 minutes (7 days).
4. **Refresh Tokens**: **Not implemented**.
5. **Expiry Behavior**: Frontend Axios interceptor detects `401 Unauthorized`, clears local storage, and redirects to `/login`.
6. **Rate Limiting**: Enforced via `SlowAPI` on `/auth/login` (e.g., 5 per minute) and `/auth/register`.

---

## SECTION 6 — PERMISSION SYSTEM

1. **Roles**: `admin`, `developer`, `alumno`.
2. **Enforcement**: Centralized in `permission_service.py`. Python dependencies (`require_admin`, `require_module_access`) guard FastAPI routes.
3. **Checks**: 
   - **API Level**: Mandatory guard on all sensitive endpoints.
   - **Frontend Level**: Sidebar and Page UI elements are conditionally hidden based on `user.role`.
4. **Current Status**: All sensitive management routes are correctly guarded. Some "Theory" routes are open but validated via `require_module_access` based on subscription.

---

## SECTION 7 — FRONTEND STATE MANAGEMENT

1. **Global State**:
   - **AuthContext**: Manages user data and token persistence.
   - **NotificationContext**: Manages real-time toasts and WebSocket notification stream.
2. **Re-renders**: Standard React re-renders. Context providers trigger updates for all consumers on any state change (e.g., XP gain notification triggers render in Sidebar/Dashboard).
3. **Zustand/Redux**: Highly recommended for the `User` object and Notifications to avoid prop drilling and unnecessary sub-tree renders.
4. **Lazy Loading**: Implemented for all major pages in `App.jsx` using `React.lazy` and `Suspense`.

---

## SECTION 8 — PERFORMANCE

1. **SQL Performance**: Lack of pagination in `ADMIN/users` is a critical risk as the user base grows.
2. **Payloads**: The statistics dashboard (`/admin/users/dashboard-stats`) performs multiple counts on every load; these should be cached in Redis.
3. **React Performance**: Dashboard contains many small components; wrapping expensive calculations in `useMemo` is mostly done but could be improved.
4. **WebSockets**: Single-threaded `asyncio` loop is efficient but could bottleneck if handling >1000 concurrent active terminal streams on a single core.

---

## SECTION 9 — SECURITY REVIEW

1. **XSS**: High protection via React's default escaping. HttpOnly cookies prevent token theft.
2. **SQLi**: Strong protection via SQLAlchemy parameterized queries.
3. **Docker Escape**:
   - **Risks**: `tmpfs` has `exec` flag enabled for student scripts. Root filesystem is `read_only`.
   - **Mitigation**: `cap_drop=["ALL"]` and `network_mode="none"` provide excellent defense-in-depth.
4. **Rate Limiting**: Good coverage on Auth. Should be added to `SQL/execute` to prevent DOS.
5. **XP Farming**: Some endpoints for completing minor tasks lack aggressive cooldowns, allowing potential automated "macroing" of XP.

---

## SECTION 10 — DEPLOYMENT

1. **Docker**: Used for lab sandboxes; application deployment status is currently "bare metal" via `restart_all.sh`.
2. **Reverse Proxy**: Presumed Nginx for `tech4uacademy.es` to handle SSL termination.
3. **SSL**: Modern TLS (via Certbot/Caddy) is standard for this architecture.
4. **CI/CD**: No explicit evidence of automated pipelines in the current repository.
5. **Backups**: Rely on filesystem backups or manual PostgreSQL dumps.

---

## SECTION 11 — SCALABILITY

1. **Conc. Users**: ~2000-5000 (limited by PostgreSQL connection pool and Python workers).
2. **Conc. Labs**: ~100-150 per server (strictly limited by RAM per sandbox).
3. **DB Bottlenecks**: High-frequency writes on `SkillLabSession`. Moving to an append-only log or batching would help.
4. **WS Scalability**: Current Redis-based broadcast allows scaling horizontal workers, which is a major strength.

---

## SECTION 12 — FINAL ARCHITECTURE EVALUATION

### Strengths
- **Secure Sandboxing**: Excellent use of Docker SDK with strict capabilities dropping and resource limits.
- **Decoupled Architecture**: Clean separation between FastAPI and React allows independent scaling.
- **Hybrid Auth**: Using both localStorage and HttpOnly cookies provides a balance of convenience and security.

### Weaknesses
- **Lack of Pagination**: Management views will fail under load.
- **No Migrations**: Schema updates are risky without Alembic/Flyway.
- **Manual Cleanup**: Reliance on a background loop for Docker cleanup is reactive; better integration with container lifecycle events would be more robust.

### Recommendations

| Timeline | Action |
| :--- | :--- |
| **Short-term** | Implement pagination in Admin views and add Alembic for database migrations. |
| **Medium-term**| Migrate Global State to Zustand. Add rate limiting to SQL execution endpoints. |
| **Long-term** | Move to K3s/Kubernetes for lab orchestration to support cross-node workload distribution. |
