# Zone 1 Hardware Wiring and Circuit Guide

This guide details the complete hardware circuit connections for **Zone 1** of the **AI Smart Fire Alert System**.

---

## 1. Power Supply Architecture

> [!CAUTION]
> **DO NOT POWER THE WATER PUMP DIRECTLY FROM THE ESP32 GPIO PINS.**
> The pump requires up to 1-2 Amperes at 12V. Connecting it to an ESP32 GPIO pin will permanently destroy the microcontroller.
> Always use the Relay module as an isolated electronic switch.

### Power Distribution:
- **12V DC External Adapter**: Connects directly to the Relay Switch COM terminal and powers the 12V-to-5V step-down buck converter.
- **5V DC Rail (from Buck Converter or ESP32 VIN)**: Powers the MQ-2 sensor heater, Servo Motor, and Relay module VCC.
- **ESP32 3.3V Output**: Powers low-voltage digital sensors if needed.
- **COMMON GROUND (GND)**: All grounds (12V Supply GND, 5V Converter GND, ESP32 GND, Relay GND, and Sensor GNDs) **MUST be tied together** to create a shared reference point.

---

## 2. Sensor Pinout & Voltage Divider

### A. MQ-2 Smoke / Gas Sensor
- **VCC**: Connect to 5V (from VIN or 5V rail).
- **GND**: Common Ground.
- **DO**: Not used (Leave disconnected).
- **AO (Analog Output)**: The MQ-2 outputs up to 5.0V. The ESP32 ADC only supports up to 3.3V. You must connect the **20kΩ / 10kΩ Voltage Divider**:

```text
MQ-2 AO Pin ─────────[ 20kΩ Resistor ]─────────┬─────────> ESP32 GPIO 34 (ADC1_CH6)
                                               │
                                      [ 10kΩ Resistor ]
                                               │
                                             Ground (GND)
```
*Formula:* $V_{out} = 5.0V \times \frac{10k\Omega}{20k\Omega + 10k\Omega} = 1.66V$ (Safely within 3.3V ADC limit).

### B. DHT11 Temperature & Humidity Sensor
- **VCC**: 3.3V or 5V.
- **GND**: Common Ground.
- **DATA**: Connect to **ESP32 GPIO 4** (add a 10kΩ pull-up resistor to VCC if your module does not have one built-in).

### C. Infrared Flame Sensor
- **VCC**: 3.3V or 5V.
- **GND**: Common Ground.
- **DO (Digital Output)**: Connect to **ESP32 GPIO 15**. (Outputs LOW when flame is present, HIGH when clear).

---

## 3. Actuator Connections

### A. 1-Channel Relay Module & 12V Water Pump
- **Relay VCC**: 5V.
- **Relay GND**: Common Ground.
- **Relay IN**: Connect to **ESP32 GPIO 25**.
- **Relay Terminal Wiring**:
  - `12V Supply (+)` ────> Relay `COM` (Common)
  - Relay `NO` (Normally Open) ────> Water Pump `(+) Wire`
  - Water Pump `(-) Wire` ────> `12V Supply (-)` Ground

### B. SG90 Micro Servo Motor
- **Brown Wire (GND)**: Common Ground.
- **Red Wire (VCC)**: 5V Rail.
- **Orange Wire (PWM)**: Connect to **ESP32 GPIO 26**.

### C. Active Buzzer Alarm
- **Positive (+)**: Connect to **ESP32 GPIO 27**.
- **Negative (-)**: Common Ground.

### D. Tricolor Status LEDs
- **Green LED (+ Anode)**: 220Ω resistor ────> **ESP32 GPIO 12**
- **Yellow LED (+ Anode)**: 220Ω resistor ────> **ESP32 GPIO 14**
- **Red LED (+ Anode)**: 220Ω resistor ────> **ESP32 GPIO 13**
- **All LED Cathodes (-)**: Common Ground.

---

## 4. ESP32 Pin Summary Table

| Peripheral | ESP32 GPIO Pin | Type | Notes |
| :--- | :--- | :--- | :--- |
| **MQ-2 AO** | GPIO 34 | Analog Input (ADC1) | Protected via 20kΩ / 10kΩ divider |
| **DHT11 Data** | GPIO 4 | Digital I/O | 10k pullup |
| **Flame DO** | GPIO 15 | Digital Input | Active LOW on flame |
| **Relay IN** | GPIO 25 | Digital Output | Controls 12V Pump |
| **Servo PWM** | GPIO 26 | PWM Output | 0° Normal, 90° Spray |
| **Buzzer** | GPIO 27 | Digital Output | Acoustic Siren |
| **Green LED** | GPIO 12 | Digital Output | Safe Indicator |
| **Yellow LED** | GPIO 14 | Digital Output | Warning Indicator |
| **Red LED** | GPIO 13 | Digital Output | Danger Emergency Indicator |
