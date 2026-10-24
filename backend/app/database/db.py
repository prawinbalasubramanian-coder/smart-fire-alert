"""
SQLite Database Layer for AI Smart Fire Alert System
Automatically creates tables on startup:
- sensor_readings
- alerts
- system_events
"""

import sqlite3
import datetime
from app.utils.config import DATABASE_PATH

def get_connection():
    conn = sqlite3.connect(str(DATABASE_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables automatically when the backend starts."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. sensor_readings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        zone TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        smoke INTEGER NOT NULL,
        flame INTEGER NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL
    );
    """)

    # 2. alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        zone TEXT NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        pump_status TEXT NOT NULL,
        relay_status TEXT NOT NULL,
        servo_status TEXT NOT NULL,
        buzzer_status TEXT NOT NULL,
        ai_message TEXT NOT NULL
    );
    """)

    # 3. system_events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()
    print(f"[Database] SQLite initialized at: {DATABASE_PATH}")

def log_sensor_reading(zone, temp, hum, smoke, flame, prediction, confidence):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO sensor_readings (timestamp, zone, temperature, humidity, smoke, flame, prediction, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (now_str, zone, temp, hum, smoke, int(flame), prediction, confidence))
    conn.commit()
    conn.close()

def log_alert(zone, prediction, confidence, pump, relay, servo, buzzer, ai_message):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO alerts (timestamp, zone, prediction, confidence, pump_status, relay_status, servo_status, buzzer_status, ai_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (now_str, zone, prediction, confidence, pump, relay, servo, buzzer, ai_message))
    conn.commit()
    conn.close()

def log_system_event(event_type, description):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO system_events (timestamp, event_type, description)
        VALUES (?, ?, ?)
    """, (now_str, event_type, description))
    conn.commit()
    conn.close()

def get_recent_alerts(limit=50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_recent_readings(limit=50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
