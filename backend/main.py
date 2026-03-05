from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from websocket_manager import manager
from database import create_tables, get_db, Lab, User
from routers import auth, dashboard, tests, resources, users_admin, content_admin, announcements, subscriptions, video_courses, coupons_admin, leaderboard, support, skill_labs, paypal, achievements, labs
from docker_client import docker_launcher
from auth import decode_token, get_current_user
from schemas import TerminalStartResponse
import asyncio
import os
import datetime

app = FastAPI(
    title="Tech4U API",
    description="Plataforma para Estudiantes de FP Informática (ASIR, DAW, DAM, SMR) - Backend API",
    version="1.0.0",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
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
            if docker_launcher.client:
                containers = docker_launcher.client.containers.list(filters={"label": "academy=tech4u"})
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

# --- TERMINAL SANDBOX ENDPOINTS ---

@app.post("/labs/{lab_id}/start", response_model=TerminalStartResponse)
async def start_lab_endpoint(
    lab_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce limit: 1 lab per user
    active_containers = docker_launcher.get_active_containers_for_user(current_user.id)
    if len(active_containers) >= 1:
        # Kill previous to allow new one (or return error)
        # For better UX, we'll kill existing ones
        docker_launcher.kill_all_for_user(current_user.id)
    
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    container = docker_launcher.start_lab_container(
        current_user.id, 
        lab_id, 
        lab.docker_image,
        scenario_setup=lab.scenario_setup
    )
    
    return {
        "container_id": container.id,
        "ws_url": f"/ws/terminal/{container.id}"
    }

@app.post("/labs/{lab_id}/restart", response_model=TerminalStartResponse)
async def restart_lab_endpoint(
    lab_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kills current user lab and starts a fresh one."""
    docker_launcher.kill_all_for_user(current_user.id)
    return await start_lab_endpoint(lab_id, db, current_user)

@app.websocket("/ws/terminal/{container_id}")
async def terminal_websocket(websocket: WebSocket, container_id: str):
    await websocket.accept()
    
    container = docker_launcher.get_container(container_id)
    if not container:
        await websocket.close(code=4004)
        return

    # Use attach_socket for a more robust bi-directional TTY
    # This gives us a raw socket we can use directly
    try:
        # Attach to the container's stdin/stdout/stderr
        socket = container.attach_socket(params={'stdin': 1, 'stdout': 1, 'stderr': 1, 'stream': 1})
        # We need to use the low-level socket for sending
        raw_socket = socket._sock
        
        async def read_from_socket():
            # Use asyncio.to_thread to read from the blocking socket incrementally
            while True:
                try:
                    # Read up to 4KB at a time
                    data = await asyncio.to_thread(raw_socket.recv, 4096)
                    if not data:
                        break
                    await websocket.send_text(data.decode(errors='replace'))
                except Exception:
                    break

        async def write_to_socket():
            while True:
                try:
                    data = await websocket.receive_text()
                    # Use sendall for atomic/complete data transmission
                    await asyncio.to_thread(raw_socket.sendall, data.encode())
                except WebSocketDisconnect:
                    break
                except Exception:
                    break

        await asyncio.gather(read_from_socket(), write_to_socket())

    except Exception as e:
        print(f"WebSocket Terminal Error: {e}")
    finally:
        docker_launcher.kill_container(container_id)
        try:
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