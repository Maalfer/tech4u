import os
import uvicorn

if __name__ == "__main__":
    is_dev = os.getenv("ENVIRONMENT", "development") != "production"
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=is_dev,          # True solo en desarrollo; False en producción
        workers=1 if is_dev else int(os.getenv("WORKERS", "2")),
    )
