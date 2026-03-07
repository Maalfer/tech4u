from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from websocket_manager import manager
from database import create_tables, get_db, Lab, User
from routers import auth, dashboard, tests, resources, users_admin, content_admin, announcements, subscriptions, video_courses, coupons_admin, leaderboard, support, skill_labs, paypal, achievements, labs
from docker_client import docker_launcher
from auth import decode_token, get_current_user
from schemas import TerminalStartResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import asyncio
import os
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

# --- TERMINAL SANDBOX ENDPOINTS MOVED TO labs.py ---

@app.websocket("/ws/terminal/{container_id}")
async def terminal_websocket(websocket: WebSocket, container_id: str):
    await websocket.accept()
    
    container = docker_launcher.get_container(container_id)
    if not container:
        await websocket.close(code=4004)
        return

    try:
        # 1. Attach to container socket with specific streams (Section 2)
        socket = container.attach_socket(params={
            'stdin': 1, 
            'stdout': 1, 
            'stderr': 1, 
            'stream': 1,
            'logs': 0
        })
        # Use iterator for non-blocking next() calls (Section 3)
        socket_iter = iter(socket)

        # 2. Heartbeat Watchdog Task
        async def websocket_heartbeat():
            try:
                while True:
                    await asyncio.sleep(10)
                    if websocket.client_state == status.WS_CONNECTED:
                        await websocket.send_text("ping")
                    else:
                        break
            except (WebSocketDisconnect, RuntimeError):
                return
            except Exception:
                pass

        # 3. Stream Reader Task - Non-blocking
        async def read_from_socket():
            try:
                while True:
                    # Use the recommended non-blocking iterator approach
                    chunk = await asyncio.to_thread(next, socket_iter, None)
                    if chunk is None:
                        # Container stream ended
                        break
                    
                    if websocket.client_state == status.WS_CONNECTED:
                         await websocket.send_bytes(chunk)
                    else:
                        break
            except (WebSocketDisconnect, StopIteration, RuntimeError):
                pass
            except Exception as e:
                print(f"Terminal Read Error: {e}")

        # 4. Input Handling Task
        async def write_to_socket():
            try:
                while True:
                    if websocket.client_state != status.WS_CONNECTED:
                        break
                    # Receive binary input
                    data = await websocket.receive_bytes()
                    if data:
                        await asyncio.to_thread(socket._sock.sendall, data)
            except (WebSocketDisconnect, RuntimeError):
                pass
            except Exception as e:
                try:
                    # Fallback for text data
                    text_data = await websocket.receive_text()
                    if text_data in ["pong", "ping"]:
                        return # This is a recursive-like call, but simplified
                    await asyncio.to_thread(socket._sock.sendall, text_data.encode())
                except:
                    pass

        # Run all tasks concurrently and wait for any to finish
        done, pending = await asyncio.wait(
            [
                asyncio.create_task(read_from_socket()),
                asyncio.create_task(write_to_socket()),
                asyncio.create_task(websocket_heartbeat())
            ],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cleanup pending tasks
        for task in pending:
            task.cancel()

    except Exception as e:
        print(f"WebSocket Terminal Critical Error: {e}")
    finally:
        docker_launcher.kill_container(container_id)
        try:
            if websocket.client_state == status.WS_CONNECTED:
                await websocket.close()
        except:
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