"""
Application Configuration and Path Constants
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for the entire project: D:\Smart Fire Alert System
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# Paths
AI_DIR = PROJECT_ROOT / "ai"
MODEL_PATH = AI_DIR / "fire_dnn_model.keras"
SCALER_PATH = AI_DIR / "scaler.pkl"

DATABASE_DIR = PROJECT_ROOT / "database"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = DATABASE_DIR / "fire_alert.db"

# Serial Hardware Settings (for ESP32)
SERIAL_PORT = os.getenv("ESP32_SERIAL_PORT", "COM3")
BAUD_RATE = int(os.getenv("ESP32_BAUD_RATE", "115200"))

# Generative AI Configuration
GENAI_API_KEY = os.getenv("GENAI_API_KEY", "")
GENAI_MODEL = os.getenv("GENAI_MODEL", "gemini-1.5-flash")

# Server settings
HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
PORT = int(os.getenv("BACKEND_PORT", "8000"))
