# AI-Powered Smart Fire Alert and Automatic Response System

A complete, production-grade engineering and college final-year project featuring real-time sensor processing, Deep Neural Network (DNN) fire classification, Generative AI explanation, automated actuator response, and an interactive dark-modern IoT dashboard.

---

## 1. Project Overview

The **AI Smart Fire Alert System** is designed for autonomous fire detection and targeted response in **Zone 1**. It combines physical environmental telemetry with a multi-layer Deep Neural Network (DNN) to reliably categorize environmental conditions into **SAFE**, **WARNING**, or **DANGER**, and automatically executes localized mitigation actions (water pump spray targeting, buzzer siren, relay isolation, and tricolor LED indicators) while synthesizing natural-language emergency alerts for human responders.

The system features **dual-mode flexibility**:
1. **Software-Only / Simulation Mode:** Fully functional interactive demonstration without requiring physical hardware (includes preset scenarios, live sensor jitter, and evaluator sliders).
2. **Hardware Mode:** Direct serial UART connection with an **ESP32** microcontroller reading MQ-2, DHT11, and optical flame sensors.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, Modern CSS (Pure SVG icons & responsive charts, zero heavy external packages)
- **Backend:** Python 3.14+, FastAPI, Uvicorn, Pydantic
- **Deep Learning / AI:** TensorFlow / Keras 2.x, Scikit-learn, NumPy, Pandas, Matplotlib
- **Generative AI:** Google Gemini API integration with a built-in safe local rule synthesis fallback
- **Database:** SQLite 3 (auto-created on startup, zero configuration)
- **Embedded IoT:** ESP32 Microcontroller (C++ / Arduino Framework)

---

## 3. Overall System Architecture

```text
                           WEB BROWSER
                                |
                                v
                         REACT FRONTEND (Vite)
                         (http://localhost:5173)
                                |
                                | REST API / CORS
                                v
                         FASTAPI BACKEND
                         (http://localhost:8000)
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
     DNN CLASSIFIER (Keras)               GENERATIVE AI EXPLAINER
  (StandardScaler -> Dense -> Softmax)    (Gemini API / Local Fallback)
             |                                     |
             +------------------+------------------+
                                |
                                v
                          FIRE DECISION
                     (SAFE / WARNING / DANGER)
                                |
                +---------------+---------------+
                |                               |
                v                               v
         SQLITE DATABASE                 ESP32 CONTROLLER
     (Readings, Alerts, Events)         (UART Serial @ 115200)
                                                |
               +--------------------------------+--------------------------------+
               |               |                |               |                |
             DHT11           MQ-2             Flame           Relay            Servo
          (Temp & Hum)   (Smoke PPM)         Sensor       (12V DC Pump)    (Target Nozzle)
```

---

## 4. Complete Project Folder Structure

```text
D:\Smart Fire Alert System\
├── frontend\                         # React + Vite Dashboard
│   ├── src\
│   │   ├── components\
│   │   │   ├── Header.jsx            # Status badges, mode toggles, Zone 1 condition
│   │   │   ├── SensorCard.jsx        # Gauge cards for Temp, Hum, Smoke, Flame
│   │   │   ├── PredictionCard.jsx    # TensorFlow DNN classifier & Softmax meters
│   │   │   ├── ResponsePanel.jsx     # Actuator control panel (Pump, Relay, Servo, Buzzer, LEDs)
│   │   │   ├── AlertPanel.jsx        # Generative AI natural-language explainer
│   │   │   ├── SensorCharts.jsx      # Real-time multi-signal SVG telemetry charts
│   │   │   ├── SimulationControls.jsx# SAFE/WARN/DANGER presets & evaluator sliders
│   │   │   ├── AlertHistory.jsx      # Historical audit trail table & CSV exporter
│   │   │   ├── SystemArchitectureModal.jsx # College viva architecture & circuit guide
│   │   │   └── Icons.jsx             # Pure SVG icons
│   │   ├── services\
│   │   │   └── api.js                # API connector + seamless frontend simulation fallback
│   │   ├── App.jsx                   # Main React state coordinator
│   │   ├── App.css                   # Dark modern SCADA theme
│   │   ├── index.css                 # Base theme variables
│   │   └── main.jsx                  # Application root
│   ├── index.html                    # Page entry and meta tags
│   └── package.json                  # Frontend scripts and dependencies
│
├── backend\                          # Python FastAPI Server
│   ├── app\
│   │   ├── main.py                   # FastAPI app entry point & CORS
│   │   ├── api\
│   │   │   └── routes.py             # REST endpoints (/sensors, /prediction, /simulation, etc.)
│   │   ├── models\
│   │   │   └── schemas.py            # Pydantic schemas
│   │   ├── services\
│   │   │   ├── dnn_service.py        # Keras DNN inference engine & response mapper
│   │   │   ├── genai_service.py      # Gemini API + safe local fallback explainer
│   │   │   ├── simulation_service.py # Realistic fluctuating sensor engine
│   │   │   └── serial_service.py     # Background ESP32 UART listener
│   │   ├── database\
│   │   │   └── db.py                 # SQLite schema, tables, and logging queries
│   │   └── utils\
│   │       └── config.py             # Paths, port constants, and environment loader
│   └── requirements.txt              # Python dependencies
│
├── ai\                               # Deep Learning Pipeline
│   ├── generate_dataset.py           # Generates 3,000 balanced samples (fire_dataset.csv)
│   ├── train_model.py                # Trains Keras DNN, saves model & scaler
│   ├── evaluate_model.py             # Evaluates accuracy, precision, recall & confusion matrix
│   ├── fire_dataset.csv              # Training dataset
│   ├── fire_dnn_model.keras          # Trained TensorFlow DNN model weights
│   ├── scaler.pkl                    # Fitted StandardScaler
│   ├── training_history.png          # Accuracy and Loss curves
│   └── confusion_matrix.png          # Visual confusion matrix plot
│
├── database\                         # SQLite Storage
│   └── fire_alert.db                 # SQLite database file
│
├── esp32\                            # Hardware Firmware
│   ├── smart_fire_alert.ino          # Arduino firmware sketch
│   └── wiring_diagram_guide.md       # Pinout, voltage divider & circuit specs
│
├── .env.example                      # Template environment variables
├── .env                              # Active local environment variables
├── .gitignore                        # Git exclusion rules
├── start_frontend.bat                # 1-Click launcher for React Frontend
├── start_backend.bat                 # 1-Click launcher for FastAPI Backend
├── start_full_system.bat             # 1-Click launcher for complete system
└── README.md                         # Complete project documentation
```

---

## 5. Step-by-Step Installation & Quick Start

### Prerequisites
- Node.js (v18+ or v24+)
- Python 3.10+ (tested on Python 3.14)

### Option A: 1-Click Startup (Recommended for Windows)
Simply double-click:
```cmd
start_full_system.bat
```
This automatically starts both the FastAPI backend and React frontend in separate windows.

---

### Option B: Manual Startup (Step-by-Step)

#### Step 1: Start the Backend
Open a terminal in the project directory:
```powershell
cd "D:\Smart Fire Alert System\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

#### Step 2: Start the Frontend
Open a second terminal window:
```powershell
cd "D:\Smart Fire Alert System\frontend"
npm run dev
```
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)

---

## 6. How to Train the Deep Neural Network (DNN)

The AI model has already been trained and evaluated, with weights saved to `ai/fire_dnn_model.keras`. If you wish to retrain or generate a fresh dataset:

1. **Generate Dataset:**
   ```powershell
   cd "D:\Smart Fire Alert System\ai"
   python generate_dataset.py
   ```
2. **Train Model:**
   ```powershell
   python train_model.py
   ```
   *Trains for 25 epochs, fits StandardScaler, and saves `fire_dnn_model.keras` and `scaler.pkl`.*
3. **Evaluate Model:**
   ```powershell
   python evaluate_model.py
   ```
   *Generates `confusion_matrix.png` and prints precision, recall, and F1-score.*

---

## 7. How to Test and Demonstrate (Viva / Demo Mode)

Open [http://localhost:5173](http://localhost:5173) in your browser:

1. **Preset One-Click Demonstrations:**
   - **Click `SAFE SIMULATION`:**
     - Zone 1 Status: `SAFE` (Green dot).
     - Green LED illuminates; Water Pump, Relay, and Buzzer remain `OFF`.
     - AI Explainer reports nominal environmental readings.
   - **Click `WARNING SIMULATION`:**
     - Zone 1 Status: `WARNING` (Amber dot).
     - Yellow LED illuminates; Buzzer emits intermittent warning.
     - AI Explainer reports elevated temperature and pre-combustion smoke.
   - **Click `DANGER SIMULATION`:**
     - Zone 1 Status: `CRITICAL DANGER` (Crimson pulsing glow).
     - Red LED flashes; Buzzer activates continuous siren.
     - Water pump activates (`SPRAYING` badge), Relay triggers, and Servo moves to `SPRAY POSITION (90°)`.
     - AI Explainer outputs critical emergency fire suppression dispatch.

2. **Evaluator Manual Sliders:**
   - Click **`Manual Sliders (Evaluator Demo)`** in the simulation bar.
   - Drag **Temperature** above 50°C or **Smoke** above 600 PPM or toggle the **Infrared Flame Sensor** to see the DNN classify the change in real-time.

3. **CSV Export:**
   - Scroll down to the **Telemetry & Alert Event Log** and click **Export CSV** to download recorded sensor history for your project report.

---

## 8. ESP32 Hardware Integration (Zone 1)

When you are ready to connect physical sensors:

1. Open `esp32/smart_fire_alert.ino` in Arduino IDE.
2. Install the required Arduino libraries:
   - `DHT sensor library` by Adafruit
   - `ESP32Servo` by Kevin Harrington
3. Connect the ESP32 via USB and note its COM port (e.g. `COM3`).
4. In `.env`, set:
   ```env
   ESP32_SERIAL_PORT=COM3
   ESP32_BAUD_RATE=115200
   ```
5. Follow the exact wiring diagram in [wiring_diagram_guide.md](esp32/wiring_diagram_guide.md):
   - **MQ-2 AO:** Connected through the **20kΩ / 10kΩ voltage divider** to GPIO 34.
   - **DHT11 Data:** Connected to GPIO 4.
   - **Flame Sensor DO:** Connected to GPIO 15.
   - **Relay IN (12V Pump):** Connected to GPIO 25.
   - **Servo PWM:** Connected to GPIO 26.
   - **Buzzer:** Connected to GPIO 27.
   - **LEDs (Green/Yellow/Red):** Connected to GPIO 12, 14, 13 via 220Ω resistors.
6. Restart the FastAPI backend. It will automatically detect the serial stream and transition the dashboard from `SIMULATION MODE` to `HARDWARE MODE`.

---

## 9. API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | System health, mode (simulation vs hardware), and model status |
| `GET` | `/api/sensors` | Current sensor readings (from ESP32 or simulation engine) |
| `POST` | `/api/prediction` | Predicts condition for any `[temp, hum, smoke, flame]` input |
| `POST` | `/api/simulation` | Configures simulation profile (`SAFE`, `WARNING`, `DANGER`) |
| `POST` | `/api/genai-alert`| Synthesizes natural-language alert report |
| `GET` | `/api/alerts` | Fetches logged alerts from SQLite database |
| `GET` | `/api/history` | Fetches historical sensor readings from SQLite |
| `POST` | `/api/response` | Manual actuator control override |
| `GET` | `/api/system` | Architecture specs and Zone 1 peripheral metadata |

---

## 10. Generative AI Configuration & Security

- Generative AI is strictly used to **explain** the situation to human responders. It is not permitted to override the DNN's classification decision.
- To use external Google Gemini API:
  1. Add your key in `.env`: `GENAI_API_KEY=your_key_here`
  2. If the API key is blank, network is offline, or quota is reached, the backend **automatically switches to the built-in local fallback engine**. The application never crashes.

---

## 11. Troubleshooting

1. **Port 8000 already in use:**
   - In PowerShell, run: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force`
2. **ESP32 COM Port Access Denied:**
   - Ensure the Arduino Serial Monitor is closed before starting the backend, as only one program can access the COM port at a time.
3. **Frontend says `STANDALONE`:**
   - This means the frontend is running in local simulation fallback mode because the backend server is not running. Start the backend with `python -m uvicorn app.main:app --reload`.
