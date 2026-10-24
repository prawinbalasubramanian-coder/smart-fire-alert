"""
ESP32 Serial Communication Service
Handles UART communication with physical ESP32 microcontroller when connected.
Format received from ESP32:
    TEMP:31.5,HUM:58,SMOKE:120,FLAME:0
Actuator Commands sent to ESP32:
    CMD:PUMP:ON,RELAY:ON,SERVO:90,BUZZER:ON,LED:RED
"""

import threading
import time
import re
from app.utils.config import SERIAL_PORT, BAUD_RATE
from app.services.dnn_service import dnn_engine
from app.services.genai_service import generate_ai_alert
from app.database.db import log_sensor_reading, log_system_event

try:
    import serial
except ImportError:
    serial = None

class ESP32SerialService:
    def __init__(self):
        self.port = SERIAL_PORT
        self.baud = BAUD_RATE
        self.ser = None
        self.is_connected = False
        self.running = False
        self.thread = None
        
        self.latest_data = {
            "zone": "Zone 1",
            "temperature": 25.0,
            "humidity": 60.0,
            "smoke": 120,
            "flame": False,
            "prediction": "SAFE",
            "confidence": 0.98,
            "probabilities": {"safe": 0.98, "warning": 0.019, "danger": 0.001},
            "response": {"pump": "OFF", "relay": "OFF", "servo": "NORMAL", "buzzer": "OFF", "led": "GREEN"},
            "ai_alert": "ESP32 Standby",
            "hardware_mode": False
        }

    def connect(self):
        if serial is None:
            return False
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=2)
            self.is_connected = True
            self.latest_data["hardware_mode"] = True
            log_system_event("HARDWARE_CONNECT", f"Connected to ESP32 on {self.port} at {self.baud} baud")
            print(f"[ESP32 Serial] Connected on {self.port}")
            return True
        except Exception as e:
            self.is_connected = False
            self.latest_data["hardware_mode"] = False
            # Silent fallback: ESP32 hardware is optional for simulation
            return False

    def start_listener(self):
        if self.connect():
            self.running = True
            self.thread = threading.Thread(target=self._read_loop, daemon=True)
            self.thread.start()

    def _read_loop(self):
        while self.running and self.ser and self.ser.is_open:
            try:
                line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue

                # Pattern expected: TEMP:31.5,HUM:58,SMOKE:120,FLAME:0
                match = re.search(r"TEMP:([\d\.]+),HUM:([\d\.]+),SMOKE:([\d]+),FLAME:([01])", line)
                if match:
                    temp = float(match.group(1))
                    hum = float(match.group(2))
                    smoke = int(match.group(3))
                    flame = bool(int(match.group(4)))

                    # Run DNN Prediction
                    dnn_res = dnn_engine.predict(temp, hum, smoke, flame)

                    # Log to DB
                    log_sensor_reading("Zone 1", temp, hum, smoke, flame, dnn_res["prediction"], dnn_res["confidence"])

                    # GenAI Explanation
                    ai_alert = generate_ai_alert(
                        "Zone 1", temp, hum, smoke, flame,
                        dnn_res["prediction"], dnn_res["confidence"], dnn_res["response"]
                    )

                    # Update internal state
                    self.latest_data = {
                        "zone": "Zone 1",
                        "temperature": temp,
                        "humidity": hum,
                        "smoke": smoke,
                        "flame": flame,
                        "prediction": dnn_res["prediction"],
                        "confidence": dnn_res["confidence"],
                        "probabilities": dnn_res["probabilities"],
                        "response": dnn_res["response"],
                        "ai_alert": ai_alert["message"],
                        "hardware_mode": True
                    }

                    # Send Actuator Response Command to ESP32
                    resp = dnn_res["response"]
                    cmd = f"CMD:PUMP:{resp['pump']},RELAY:{resp['relay']},SERVO:{resp['servo']},BUZZER:{resp['buzzer']},LED:{resp['led']}\n"
                    self.ser.write(cmd.encode('utf-8'))

            except Exception as e:
                print(f"[ESP32 Serial] Error in read loop: {e}")
                time.sleep(1)

    def send_actuator_command(self, pump="OFF", relay="OFF", servo="NORMAL", buzzer="OFF", led="GREEN"):
        if self.is_connected and self.ser and self.ser.is_open:
            try:
                cmd = f"CMD:PUMP:{pump},RELAY:{relay},SERVO:{servo},BUZZER:{buzzer},LED:{led}\n"
                self.ser.write(cmd.encode('utf-8'))
            except Exception as e:
                print(f"[ESP32 Serial] Failed to write command: {e}")

# Global serial service instance
serial_service = ESP32SerialService()
