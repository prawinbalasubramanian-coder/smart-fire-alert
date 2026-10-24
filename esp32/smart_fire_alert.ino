/*
 * =====================================================================================
 * PROJECT: AI-Powered Smart Fire Alert and Automatic Response System
 * TARGET: ESP32 Microcontroller (Zone 1 Hardware Controller)
 * 
 * SENSORS:
 * - MQ-2 Smoke/Gas Sensor (Analog Output with 20k/10k Voltage Divider -> GPIO 34)
 * - DHT11 Temperature & Humidity Sensor (Digital Pin -> GPIO 4)
 * - Infrared Optical Flame Sensor (Digital Pin -> GPIO 15)
 * 
 * ACTUATORS:
 * - 1-Channel Relay Module (Controls external 12V DC Submersible Pump -> GPIO 25)
 * - Micro Servo Motor SG90 (Targeted Spray Nozzle 0°/90° -> GPIO 26)
 * - Active Buzzer Alarm (Acoustic Siren -> GPIO 27)
 * - Green Status LED (Safe Indicator -> GPIO 12)
 * - Yellow Status LED (Warning Indicator -> GPIO 14)
 * - Red Status LED (Emergency Fire Indicator -> GPIO 13)
 * 
 * COMMUNICATION:
 * - UART Serial @ 115200 Baud
 * - Transmit Telemetry: "TEMP:xx.x,HUM:xx,SMOKE:xxx,FLAME:x\n"
 * - Receive Response:  "CMD:PUMP:ON,RELAY:ON,SERVO:SPRAY POSITION,BUZZER:ON,LED:RED\n"
 * =====================================================================================
 */

#include <DHT.h>
#include <ESP32Servo.h>

// --- PIN DEFINITIONS ---
#define PIN_DHT11       4
#define PIN_MQ2_ADC     34    // Analog ADC1_CH6 (Protected by 20k / 10k divider)
#define PIN_FLAME       15    // Active LOW or HIGH depending on sensor board

#define PIN_RELAY_PUMP  25    // Active LOW on most 5V optocoupled relays
#define PIN_SERVO       26
#define PIN_BUZZER      27
#define PIN_LED_GREEN   12
#define PIN_LED_YELLOW  14
#define PIN_LED_RED     13

// --- CONFIGURATION ---
#define DHTTYPE DHT11
DHT dht(PIN_DHT11, DHTTYPE);
Servo sprayServo;

// Timing variables for non-blocking execution
unsigned long lastSensorReadTime = 0;
const unsigned long SENSOR_INTERVAL = 2000; // Send telemetry every 2 seconds

// Actuator State
int servoNormalAngle = 0;
int servoSprayAngle = 90;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize Sensors
  dht.begin();
  pinMode(PIN_MQ2_ADC, INPUT);
  pinMode(PIN_FLAME, INPUT);

  // Initialize Actuators
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, HIGH); // Most relays are Active-LOW (HIGH = OFF)

  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);

  // Start with Safe State: Green LED ON
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  // Initialize Servo
  sprayServo.attach(PIN_SERVO);
  sprayServo.write(servoNormalAngle);

  Serial.println("[ESP32] AI Smart Fire Alert System Initialized.");
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Periodic Sensor Reading & Serial Transmission
  if (currentMillis - lastSensorReadTime >= SENSOR_INTERVAL) {
    lastSensorReadTime = currentMillis;
    readAndTransmitSensors();
  }

  // 2. Process incoming actuator commands from FastAPI backend
  if (Serial.available() > 0) {
    String incoming = Serial.readStringUntil('\n');
    incoming.trim();
    if (incoming.startsWith("CMD:")) {
      handleActuatorCommand(incoming);
    }
  }
}

void readAndTransmitSensors() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // If DHT fails or disconnected, fallback to ambient defaults
  if (isnan(temperature) || isnan(humidity)) {
    temperature = 25.0;
    humidity = 55.0;
  }

  // Read MQ-2 Analog Voltage (0 - 4095 on ESP32 12-bit ADC)
  int rawADC = analogRead(PIN_MQ2_ADC);
  // Map raw ADC reading roughly to estimated 0 - 1000 PPM
  int smokePPM = map(rawADC, 0, 4095, 30, 1000);

  // Read Flame Sensor (Usually LOW when fire detected)
  int flameRaw = digitalRead(PIN_FLAME);
  int flameDetected = (flameRaw == LOW) ? 1 : 0; // 1 = Detected, 0 = Absent

  // Format UART string: TEMP:31.5,HUM:58,SMOKE:120,FLAME:0
  String payload = "TEMP:" + String(temperature, 1) + 
                   ",HUM:" + String(humidity, 0) + 
                   ",SMOKE:" + String(smokePPM) + 
                   ",FLAME:" + String(flameDetected);

  Serial.println(payload);
}

void handleActuatorCommand(String cmd) {
  // Example command: CMD:PUMP:ON,RELAY:ON,SERVO:SPRAY POSITION,BUZZER:ON,LED:RED
  
  // 1. Pump & Relay Control
  if (cmd.indexOf("PUMP:ON") != -1 || cmd.indexOf("RELAY:ON") != -1) {
    digitalWrite(PIN_RELAY_PUMP, LOW); // Trigger relay (Pump ON)
  } else {
    digitalWrite(PIN_RELAY_PUMP, HIGH); // Release relay (Pump OFF)
  }

  // 2. Servo Motor Positioning
  if (cmd.indexOf("SERVO:SPRAY POSITION") != -1 || cmd.indexOf("SERVO:90") != -1) {
    sprayServo.write(servoSprayAngle);
  } else {
    sprayServo.write(servoNormalAngle);
  }

  // 3. Buzzer Alarm
  if (cmd.indexOf("BUZZER:ON") != -1) {
    digitalWrite(PIN_BUZZER, HIGH);
  } else if (cmd.indexOf("BUZZER:INTERMITTENT") != -1) {
    // Single pulse for warning
    digitalWrite(PIN_BUZZER, HIGH);
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    digitalWrite(PIN_BUZZER, LOW);
  }

  // 4. Tricolor LEDs
  if (cmd.indexOf("LED:RED") != -1) {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);
  } else if (cmd.indexOf("LED:YELLOW") != -1) {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_RED, LOW);
  } else { // Green Safe
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
  }
}
