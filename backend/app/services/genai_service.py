"""
Generative AI Natural Language Explanation Service
Generates concise, human-readable situational reports for responders.
Role: Explains the DNN decision; never overrides the DNN classification.
Features: External Gemini API support + Safe Local Fallback Engine.
"""

import requests
import datetime
from app.utils.config import GENAI_API_KEY, GENAI_MODEL

def generate_local_fallback_alert(zone, temp, hum, smoke, flame, prediction, confidence, response):
    """
    Robust local rule-based natural language generator.
    Guarantees the system never crashes even without internet or API keys.
    """
    conf_pct = round(confidence * 100, 1)
    flame_str = "flame confirmed" if flame else "flame absent"
    pump_str = response.get("pump", "OFF") if isinstance(response, dict) else "OFF"

    if prediction == "DANGER":
        return (
            f"CRITICAL FIRE DANGER detected in {zone}! Active optical {flame_str}, "
            f"dense smoke particle concentration ({smoke} PPM), and extreme thermal spike ({temp:.1f}°C) "
            f"indicate an urgent structural fire event (DNN Confidence: {conf_pct}%). "
            f"Autonomous suppression engaged: DC Water Pump {pump_str}, servo nozzle deployed to target position, "
            f"and high-decibel acoustic siren activated. Evacuate immediately."
        )
    elif prediction == "WARNING":
        return (
            f"Advisory Warning issued for {zone}. Abnormal environmental signatures detected: "
            f"elevated thermal reading of {temp:.1f}°C and moderate atmospheric smoke density ({smoke} PPM). "
            f"Relative humidity at {hum}%. DNN model classified potential pre-combustion hazard "
            f"with {conf_pct}% confidence. Intermittent alert chime activated. Inspection recommended."
        )
    else:
        return (
            f"{zone} is currently SAFE. Ambient temperature ({temp:.1f}°C), humidity ({hum}%), "
            f"and baseline smoke concentration ({smoke} PPM) remain well within normal operational parameters. "
            f"No optical flame detected. All automatic suppression actuators remain on standby (Confidence: {conf_pct}%)."
        )

def generate_ai_alert(zone: str, temp: float, hum: float, smoke: int, flame: bool, prediction: str, confidence: float, response: dict = None):
    """
    Calls Google Gemini API if key is present; otherwise falls back to local synthesis engine.
    """
    if response is None:
        response = {}

    timestamp_str = datetime.datetime.now().strftime("%H:%M:%S")

    # If no API key configured, use local engine immediately
    if not GENAI_API_KEY or GENAI_API_KEY == "your_gemini_api_key_here":
        message = generate_local_fallback_alert(zone, temp, hum, smoke, flame, prediction, confidence, response)
        return {
            "message": message,
            "source": "LOCAL_ENGINE_FALLBACK",
            "timestamp": timestamp_str
        }

    # If key is available, call Gemini API securely
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GENAI_MODEL}:generateContent?key={GENAI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        prompt = (
            f"You are the autonomous incident reporter for a Smart Fire Detection and Automatic Response System.\n"
            f"Context:\n"
            f"- Zone: {zone}\n"
            f"- Temperature: {temp:.1f} °C\n"
            f"- Humidity: {hum}%\n"
            f"- Smoke Concentration: {smoke} PPM\n"
            f"- Flame Sensor: {'DETECTED' if flame else 'NOT DETECTED'}\n"
            f"- Deep Neural Network (DNN) Classification: {prediction} (Confidence: {confidence*100:.1f}%)\n"
            f"- Water Pump State: {response.get('pump', 'OFF')}\n"
            f"- Relay State: {response.get('relay', 'OFF')}\n"
            f"- Servo Position: {response.get('servo', 'NORMAL')}\n"
            f"- Buzzer: {response.get('buzzer', 'OFF')}\n\n"
            f"Generate a professional, concise 2-3 sentence emergency dispatch alert explaining the situation "
            f"and the hardware response. Do NOT question or alter the DNN prediction."
        )

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "maxOutputTokens": 150,
                "temperature": 0.2
            }
        }

        res = requests.post(url, json=payload, headers=headers, timeout=4)
        if res.status_code == 200:
            data = res.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return {
                "message": generated_text,
                "source": "GEMINI_API",
                "timestamp": timestamp_str
            }
    except Exception as e:
        print(f"[GenAI Service] API request error ({e}). Using local fallback.")

    # Graceful fallback on network/timeout/quota error
    message = generate_local_fallback_alert(zone, temp, hum, smoke, flame, prediction, confidence, response)
    return {
        "message": message,
        "source": "LOCAL_ENGINE_FALLBACK",
        "timestamp": timestamp_str
    }
