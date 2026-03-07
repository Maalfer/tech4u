from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from starlette.websockets import WebSocketState
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from websocket_manager import manager
from database import create_tables, get_db, Lab, User
from routers import auth, dashboard, tests, resources, users_admin, content_admin, announcements, subscriptions, video_courses, coupons_admin, leaderboard, support, skill_labs, paypal, achievements, labs, teoria
from docker_client import docker_launcher
from auth import decode_token, get_current_user
from schemas import TerminalStartResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import asyncio
import os
import pty
import subprocess
import select
import datetime

app = FastAPI(
    title="Tech4U API",
    description="Plataforma para Estudiantes de FP Informática (ASIR, DAW, DAM, SMR) - Backend API",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    create_tables()
    os.makedirs("static/videos", exist_ok=True)
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
                                print(f"Cleaning up stale container: {c.name}")
                                c.stop(timeout=2)
                    except Exception as e:
                        print(f"Error checking container {c.name}: {e}")
            await asyncio.sleep(300) # Every 5 minutes
        except Exception as e:
            print(f"Cleanup Task Error: {e}")
            await asyncio.sleep(60)

app.mount("/static", StaticFiles(directory="static"), name="static")

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
app.include_router(paypal.router)
app.include_router(achievements.router)
app.include_router(labs.router)
app.include_router(teoria.router)

# --- TERMINAL SANDBOX ENDPOINTS MOVED TO labs.py ---

@app.websocket("/ws/terminal/{container_id}")
async def terminal_websocket(websocket: WebSocket, container_id: str):
    await websocket.accept()

    container = docker_launcher.get_container(container_id)
    if not container:
        await websocket.close(code=4004)
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
                print(f"[Terminal WS→PTY] {e}")

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
                print(f"[Terminal PTY→WS] {e}")

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
        print(f"[Terminal Critical] {e}")
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
        docker_launcher.kill_container(container_id)
        try:
            if websocket.client_state == status.WS_CONNECTED:
                await websocket.close()
        except Exception:
            pass

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@app.get("/")
def root():
    return {"message": "Tech4U API v1.0 — La academia para estudiantes de FP 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}