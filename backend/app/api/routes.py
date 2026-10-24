"""
FastAPI REST API Endpoints for AI Smart Fire Alert System
"""

import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    SensorInput, PredictionResult, SimulationModeRequest,
    GenAIAlertRequest, GenAIAlertResponse, SystemStatusResponse
)
from app.services.dnn_service import dnn_engine
from app.services.genai_service import generate_ai_alert
from app.services.simulation_service import simulation_engine
from app.services.serial_service import serial_service
from app.database.db import get_recent_alerts, get_recent_readings, log_alert, log_sensor_reading
from app.utils.config import SERIAL_PORT

router = APIRouter(prefix="/api")

@router.get("/status", response_model=SystemStatusResponse)
def get_system_status():
    """Returns general operational status of the fire monitoring system."""
    return SystemStatusResponse(
        system_online=True,
        hardware_connected=serial_service.is_connected,
        simulation_mode=not serial_service.is_connected,
        active_port=SERIAL_PORT if serial_service.is_connected else None,
        model_loaded=dnn_engine.is_loaded,
        zone="Zone 1",
        timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.get("/sensors")
def get_sensor_readings():
    """
    Returns latest sensor readings.
    If ESP32 hardware is connected, returns real hardware values.
    Otherwise, returns live simulated readings.
    """
    if serial_service.is_connected:
        return serial_service.latest_data
    return simulation_engine.get_simulated_reading()

@router.post("/prediction", response_model=PredictionResult)
def predict_fire_condition(data: SensorInput):
    """
    Direct endpoint to run the TensorFlow DNN classifier on any input sensor values.
    """
    res = dnn_engine.predict(
        temperature=data.temperature,
        humidity=data.humidity,
        smoke=data.smoke,
        flame=data.flame
    )
    
    # Log to SQLite
    log_sensor_reading(
        zone=data.zone,
        temp=data.temperature,
        hum=data.humidity,
        smoke=data.smoke,
        flame=data.flame,
        prediction=res["prediction"],
        confidence=res["confidence"]
    )
    
    return res

@router.post("/simulation")
def configure_simulation(req: SimulationModeRequest):
    """
    Configures software-only simulation mode (SAFE, WARNING, DANGER) or injects custom values.
    """
    overrides = {}
    if req.temperature is not None: overrides["temperature"] = req.temperature
    if req.humidity is not None: overrides["humidity"] = req.humidity
    if req.smoke is not None: overrides["smoke"] = req.smoke
    if req.flame is not None: overrides["flame"] = req.flame

    simulation_engine.set_profile(req.profile, overrides)
    reading = simulation_engine.get_simulated_reading()
    return {
        "status": "success",
        "profile": req.profile,
        "current_reading": reading
    }

@router.post("/genai-alert", response_model=GenAIAlertResponse)
def trigger_genai_alert(req: GenAIAlertRequest):
    """
    Generates a natural-language emergency dispatch report using Gemini API with safe local fallback.
    """
    res = generate_ai_alert(
        zone=req.zone,
        temp=req.temperature,
        hum=req.humidity,
        smoke=req.smoke,
        flame=req.flame,
        prediction=req.prediction,
        confidence=req.confidence,
        response=req.response
    )

    # Log alert into SQLite
    log_alert(
        zone=req.zone,
        prediction=req.prediction,
        confidence=req.confidence,
        pump=req.response.get("pump", "OFF") if req.response else "OFF",
        relay=req.response.get("relay", "OFF") if req.response else "OFF",
        servo=req.response.get("servo", "NORMAL") if req.response else "NORMAL",
        buzzer=req.response.get("buzzer", "OFF") if req.response else "OFF",
        ai_message=res["message"]
    )

    return GenAIAlertResponse(
        message=res["message"],
        source=res["source"],
        timestamp=res["timestamp"]
    )

@router.get("/alerts")
def get_alert_history(limit: int = 50):
    """Returns stored alert records from the SQLite database."""
    return get_recent_alerts(limit=limit)

@router.get("/history")
def get_sensor_history(limit: int = 50):
    """Returns stored sensor readings from the SQLite database."""
    return get_recent_readings(limit=limit)

@router.post("/response")
def manual_actuator_response(pump: str = "OFF", relay: str = "OFF", servo: str = "NORMAL", buzzer: str = "OFF", led: str = "GREEN"):
    """Allows manual override of actuators for testing."""
    serial_service.send_actuator_command(pump=pump, relay=relay, servo=servo, buzzer=buzzer, led=led)
    return {
        "status": "command_sent",
        "actuators": {
            "pump": pump,
            "relay": relay,
            "servo": servo,
            "buzzer": buzzer,
            "led": led
        }
    }

@router.get("/system")
def get_system_info():
    """Returns architecture overview and hardware pinout information."""
    return {
        "project": "AI-Powered Smart Fire Alert and Automatic Response System",
        "scope": "Zone 1 Autonomous Fire Station",
        "stack": {
            "frontend": "React 19 + Vite",
            "backend": "Python FastAPI + Uvicorn",
            "ai_classifier": "TensorFlow / Keras Feed-Forward DNN",
            "explainer": "Generative AI (Gemini 1.5 + Safe Local Engine)",
            "database": "SQLite 3",
            "hardware": "ESP32 (UART Serial @ 115200 Baud)"
        },
        "zone1_devices": [
            "MQ-2 Gas Sensor (Analog Divider 20k/10k)",
            "DHT11 Temp/Humidity",
            "Infrared Optical Flame Sensor",
            "1-Channel Optocoupled Relay",
            "12V DC Submersible Pump",
            "SG90 Micro Servo (0-90 deg spray)",
            "Active Buzzer Siren (85dB)",
            "Tricolor Status LED Array (Green/Yellow/Red)"
        ]
    }
