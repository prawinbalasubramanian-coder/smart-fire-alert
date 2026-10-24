@echo off
title AI Smart Fire Alert System - Master Launcher
echo ===================================================
echo Launching AI Smart Fire Alert System
echo 1. Backend (FastAPI + TensorFlow DNN + SQLite)
echo 2. Frontend (React 19 + Vite Dashboard)
echo ===================================================

start "FastAPI Backend" cmd /k "cd /d D:\Smart Fire Alert System\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start "React Frontend" cmd /k "cd /d D:\Smart Fire Alert System\frontend && npm run dev"

echo.
echo Both servers are launching.
echo Backend URL:  http://localhost:8000
echo Frontend URL: http://localhost:5173
echo.
pause
