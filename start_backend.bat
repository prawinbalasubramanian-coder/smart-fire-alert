@echo off
title AI Smart Fire Alert System - Backend Server
echo ===================================================
echo Starting AI Smart Fire Alert System - FastAPI Backend
echo Port: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo ===================================================
cd /d "D:\Smart Fire Alert System\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
