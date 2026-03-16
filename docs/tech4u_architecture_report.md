# TECH4U ACADEMY — SYSTEM ARCHITECTURE REPORT

## 1. Project Overview
Tech4U Academy is a specialized e-learning platform designed for vocational training students (FP) in IT fields such as ASIR, DAW, DAM, and SMR. The platform provides a gamified experience with hands-on labs (Terminal, SQL, Networking) and academic resources.

- **Architecture Style**: Decoupled Monolith (FastAPI Backend + React Frontend).
- **Primary Objective**: Provide interactive learning environments for technical IT skills.
- **Target Audience**: Individual IT students and subscribers.

## 2. Backend Architecture
The backend is built with **FastAPI**, leveraging asynchronous capabilities for performance and scalability.

### Core Components
- **Framework**: FastAPI (Python 3.10+).
- **Server**: Uvicorn.
- **Middleware**:
    - `CORSMiddleware`: Manages cross-origin requests (primarily from localhost and tech4uacademy.es).
    - `GZipMiddleware`: Compresses responses >1KB.
    - `security_middleware`: Custom middleware to populate `request.state.user_id` from JWT for rate limiting.
- **Rate Limiting**: Implemented via `SlowAPI` with `backend/limiter.py` configuration.
    - SQL Execution: 30/min
    - Lab Starts: 10/min
    - Skill Submissions: 20/min
- **Caching**: Redis-based caching layer in `backend/services/cache_service.py` to optimize heavy endpoints like leaderboards.
- **Security Logging**: Structured event logging for critical actions in `backend/utils/security_logger.py`.
- **Background Tasks**: 
    - `cleanup_stale_containers`: Async task that kills orphaned Docker containers after 1 hour.
- **WebSockets**: 
    - `/terminal/ws/{container_id}`: Provides interactive PTY-to-WebSocket bridge for Linux labs.
    - `/ws/{user_id}`: General purpose notification/status socket.

### Authentication & Authorization
- **Method**: JWT (JSON Web Tokens).
- **Storage**: Tokens are stored in `localStorage` on the client and accepted via `Authorization: Bearer <token>` header or `access_token` HttpOnly cookie.
- **Password Hashing**: Bcrypt.

## 3. Database Design
The system uses **SQLAlchemy ORM** with **PostgreSQL**.
- **Migrations**: Database schema versioning managed via **Alembic**.
- **Constraints**: Strict foreign key constraints and automated schema synchronization.

### Key Models
- **User**: Core identity model. Tracks `role`, `xp` (capped at 5000/day), `level`, and `subscription_type`.
- **Terminal System**:
    - `SkillPath` → `Module` → `Lab` → `Challenge`.
    - `UserLabCompletion` & `UserChallengeCompletion` track progress.
- **SQL System**:
    - `SQLDataset` (schemas) → `SQLExercise`.
    - `UserSQLProgress` tracks completions.
- **Skill Labs**:
    - `SkillLabExercise` (D&D templates).
    - `SkillLabSession` tracks interactive attempts.
- **Gamification**:
    - `Achievement`, `UserItem` (RPG drops), `TestSession`.
- **Management**:
    - `Ticket`, `Announcement`, `Coupon`, `Referral`.

### Relationships & Indexes
- High use of `ForeignKey` for progress tracking.
- Composite indexes (e.g., `ix_user_progress_user_subject`) optimize frequently accessed status queries.

## 4. Permission System
Access control is managed via `backend/services/permission_service.py` and FastAPI dependencies.

### Roles
1.  **admin**: Full system access, financial management, user oversight.
2.  **developer**: Access to technical tools, content management, and terminal builders.
3.  **alumno**: Default role for students. Access determined by subscription.

### Access Logic
- **`is_subscription_active`**: Validates `subscription_type != 'free'` and ensures expiry date is in the future.
- **`require_module_access(module_name)`**: A dependency factory that checks if a user has the permitted role or an active subscription for specific features.

## 5. Learning Modules
The academy is divided into functional units:

| Module | Description | Backend Router | Progress Tracking |
| :--- | :--- | :--- | :--- |
| **Terminal Skills** | Docker-based interactive Linux labs. | `labs.py` | `UserLabCompletion` |
| **SQL Skills** | Interactive SQL sandbox with real datasets. | `sql_skills.py`| `UserSQLProgress` |
| **Skill Labs** | Drag & drop technical exercises. | `skill_labs.py` | `SkillLabSession` |
| **NetLab** | Networking and CLI debugging simulation. | `labs.py` | `UserProgress` |
| **Theory** | Markdown-based technical guides. | `teoria.py` | N/A |
| **Test Center** | MCQ bank for exam preparation. | `tests.py` | `TestSession` |

## 6. Gamification System
A deep XP-based system drives student engagement.

- **XP Curve**: Managed via `User.get_next_level_xp`. Thresholds increase from 800 to 4000 XP as levels progress (Cap at 20).
- **Daily Streak**: Tracks consecutive logins; failing to log in triggers a penalty (`remove_xp`).
- **Rewards**:
    - Tests: XP based on accuracy.
    - Labs: Large XP rewards upon flag/command validation.
    - Achievements: Leveling up or completing paths grants badges and items.
- **RPG Elements**: Random item drops (`UserItem`) upon successful completion of complex tasks.

## 7. Frontend Architecture
Built with **React 18** and **Vite**, prioritizing a high-performance "Neon/Dark" UI.

- **Routing**: `react-router-dom` with `lazy` loading for all pages to ensure fast initial loads.
- **Global State**:
    - **Zustand**: Centralized state management in `frontend/src/store/userStore.js` for better performance and debugging.
    - `AuthContext`: Bridge component that provides store state to the application tree.
    - `NotificationContext`: Handles globally triggered toasts.
- **Styling**: Tailwind CSS with custom variables for the "Hacker" aesthetic.
- **Service Layer**: `api.js` (Axios) includes interceptors for automatic JWT injection, 429 (rate limit) handling, and 401 management.

## 8. API Structure (High Level)
- **Auth**: `/auth/login`, `/auth/register`, `/auth/me`, `/auth/logout`.
- **Terminal**: `/labs/`, `/labs/start`, `/labs/verify`.
- **SQL**: `/sql-skills/exercises`, `/sql-skills/execute`.
- **User**: `/users/me`, `/users/character`.
- **Admin**: `/admin/users` (Paginated), `/admin/questions` (Paginated), `/admin/tickets`, `/admin/coupons`.

## 9. Security Review
- **Authentication**: JWT-based. `get_current_user` checks both `Authorization` header and `access_token` cookie.
- **Integrity**: HttpOnly cookies prevent XSS-based token theft.
- **Sandboxing**: 
    - **Linux Labs**: Full Docker isolation with labels for user-specific tracking.
    - **SQL**: Uses temporary in-memory sessions or isolated files for user queries.
- **Rate Limiting**: Enforced on critical endpoints (login, register, terminal start).
- **Vulnerabilities/Improvements**:
    - Infrastructure depends on a local PostgreSQL instance; high-availability configurations are recommended for production.
    - `docker exec` runs as root by default in some labs; should be restricted to non-privileged users.

## 10. Infrastructure
- **Deployment**: Local execution via `restart_all.sh`.
- **Port Mapping**: 
    - API: 8000.
    - Frontend: 5173.
- **Dependencies**: React, Vite, FastAPI, SQLAlchemy, Docker, Jose (JWT), Bcrypt.

## 11. Performance Observations
- **Database**: PostgreSQL handles concurrent loads efficiently; Alembic ensures safe migrations.
- **Rendering**: Global state migrated to Zustand to minimize Context-related re-renders.
- **IO**: Redis caching reduces DB latency for high-traffic endpoints (Leaderboards).

## 12. Improvement Opportunities
1. **Managed Database**: Consider moving to a managed service (AWS RDS, Google Cloud SQL, etc.) for automated backups and scaling.
2. **Monitoring**: Integrate Sentry or similar for backend error tracking.
3. **Container Orchestration**: If the laboratory system grows, consider moving from raw Docker to a lightweight orchestration layer (K3s).
4. **Caching**: Implement Redis for frequently accessed leaderboard data and stats.
