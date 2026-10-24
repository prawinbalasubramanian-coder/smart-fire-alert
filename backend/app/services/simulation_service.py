"""
Backend Simulation Service
Generates realistic fluctuating sensor telemetry when physical hardware is not connected.
"""

import random
from app.services.dnn_service import dnn_engine
from app.services.genai_service import generate_ai_alert
from app.database.db import log_sensor_reading

class SimulationService:
    def __init__(self):
        self.current_profile = "SAFE"
        self.custom_overrides = {}

    def set_profile(self, profile: str, overrides: dict = None):
        self.current_profile = profile.upper()
        self.custom_overrides = overrides or {}

    def get_simulated_reading(self):
        profile = self.current_profile

        if profile == "DANGER":
            base_temp = 58.0 + (random.random() - 0.5) * 4.0
            base_hum = 25.0 + (random.random() - 0.5) * 4.0
            base_smoke = int(820 + (random.random() - 0.5) * 60)
            base_flame = True
        elif profile == "WARNING":
            base_temp = 42.0 + (random.random() - 0.5) * 3.0
            base_hum = 38.0 + (random.random() - 0.5) * 4.0
            base_smoke = int(410 + (random.random() - 0.5) * 40)
            base_flame = False
        else: # SAFE
            base_temp = 24.5 + (random.random() - 0.5) * 2.0
            base_hum = 58.0 + (random.random() - 0.5) * 3.0
            base_smoke = int(115 + (random.random() - 0.5) * 20)
            base_flame = False

        # Apply any manual overrides from the dashboard
        temp = round(self.custom_overrides.get("temperature", base_temp), 1)
        hum = round(self.custom_overrides.get("humidity", base_hum), 1)
        smoke = int(self.custom_overrides.get("smoke", base_smoke))
        flame = bool(self.custom_overrides.get("flame", base_flame))

        # Run through DNN Model
        dnn_result = dnn_engine.predict(temp, hum, smoke, flame)

        # Log reading in SQLite
        log_sensor_reading(
            zone="Zone 1",
            temp=temp,
            hum=hum,
            smoke=smoke,
            flame=flame,
            prediction=dnn_result["prediction"],
            confidence=dnn_result["confidence"]
        )

        # Generate AI natural language report
        ai_alert_data = generate_ai_alert(
            zone="Zone 1",
            temp=temp,
            hum=hum,
            smoke=smoke,
            flame=flame,
            prediction=dnn_result["prediction"],
            confidence=dnn_result["confidence"],
            response=dnn_result["response"]
        )

        return {
            "zone": "Zone 1",
            "temperature": temp,
            "humidity": hum,
            "smoke": smoke,
            "flame": flame,
            "prediction": dnn_result["prediction"],
            "confidence": dnn_result["confidence"],
            "probabilities": dnn_result["probabilities"],
            "response": dnn_result["response"],
            "ai_alert": ai_alert_data["message"],
            "ai_source": ai_alert_data["source"]
        }

simulation_engine = SimulationService()
