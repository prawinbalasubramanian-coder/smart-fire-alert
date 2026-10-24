"""
Pydantic Schemas for API Request and Response Serialization
"""

from typing import Optional, Dict
from pydantic import BaseModel, Field

class SensorInput(BaseModel):
    zone: str = Field(default="Zone 1")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage")
    smoke: int = Field(..., description="MQ-2 Gas sensor reading (PPM)")
    flame: bool = Field(..., description="True if flame detected, else False")

class Probabilities(BaseModel):
    safe: float
    warning: float
    danger: float

class ActuatorResponse(BaseModel):
    pump: str = "OFF"
    relay: str = "OFF"
    servo: str = "NORMAL"
    buzzer: str = "OFF"
    led: str = "GREEN"

class PredictionResult(BaseModel):
    prediction: str  # SAFE, WARNING, DANGER
    confidence: float
    probabilities: Probabilities
    response: ActuatorResponse

class GenAIAlertRequest(BaseModel):
    zone: str = "Zone 1"
    temperature: float
    humidity: float
    smoke: int
    flame: bool
    prediction: str
    confidence: float
    response: Optional[Dict[str, str]] = None

class GenAIAlertResponse(BaseModel):
    message: str
    source: str
    timestamp: str

class SimulationModeRequest(BaseModel):
    profile: str = "SAFE"  # SAFE, WARNING, DANGER
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    smoke: Optional[int] = None
    flame: Optional[bool] = None

class SystemStatusResponse(BaseModel):
    system_online: bool = True
    hardware_connected: bool = False
    simulation_mode: bool = True
    active_port: Optional[str] = None
    model_loaded: bool = True
    zone: str = "Zone 1"
    timestamp: str
