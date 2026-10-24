"""
AI Smart Fire Alert System - FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database.db import init_db, log_system_event
from app.services.serial_service import serial_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & hardware serial listener
    print("[System] Initializing AI Smart Fire Alert System Backend...")
    init_db()
    log_system_event("STARTUP", "FastAPI backend started successfully")
    
    # Start serial background listener (falls back gracefully if ESP32 not connected)
    serial_service.start_listener()
    
    yield
    
    # Shutdown
    print("[System] Shutting down backend...")
    log_system_event("SHUTDOWN", "FastAPI backend shutting down")

app = FastAPI(
    title="AI Smart Fire Alert System API",
    description="Backend API with TensorFlow DNN & Generative AI for Zone 1 Autonomous Fire Response",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React Frontend (running on Vite http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Router
app.include_router(router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AI-Powered Smart Fire Alert and Automatic Response System",
        "documentation": "/docs",
        "api_endpoints": "/api/status"
    }

if __name__ == "__main__":
    import uvicorn
    from app.utils.config import HOST, PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
