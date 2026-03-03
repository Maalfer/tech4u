from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routers import auth, dashboard, tests, resources, users_admin, content_admin, announcements, subscriptions, video_courses

app = FastAPI(
    title="Tech4U API",
    description="Plataforma para Estudiantes de FP Informática (ASIR, DAW, DAM, SMR) - Backend API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(tests.router)
app.include_router(resources.router)
app.include_router(users_admin.router)
app.include_router(content_admin.router)
# --- NUEVO ROUTER REGISTRADO ---
app.include_router(announcements.router)
app.include_router(subscriptions.router)
app.include_router(video_courses.router)


@app.get("/")
def root():
    return {"message": "Tech4U API v1.0 — La academia para estudiantes de FP 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}