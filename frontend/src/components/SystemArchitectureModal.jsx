import React from 'react';
import { CpuIcon } from './Icons';

export default function SystemArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <CpuIcon size={22} className="text-cyan" />
            <h2>System Architecture &amp; Zone 1 Hardware Specifications</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Architecture flow */}
          <div className="arch-section">
            <h3 className="arch-subheading">Data Flow Pipeline</h3>
            <div className="arch-flow-diagram">
              <div className="arch-node node-client">
                <strong>React + Vite Dashboard</strong>
                <span>Real-Time Web UI (Telemetry &amp; Controls)</span>
              </div>
              <div className="arch-arrow">&darr; REST API / WebSocket &darr;</div>
              <div className="arch-node node-backend">
                <strong>FastAPI Python Backend</strong>
                <span>Orchestration, Validation &amp; Database Logging</span>
              </div>
              <div className="arch-split-row">
                <div className="arch-branch">
                  <span className="branch-label">Classification</span>
                  <div className="arch-node node-dnn">
                    <strong>TensorFlow / Keras DNN</strong>
                    <span>Input &rarr; Dense &rarr; Softmax (SAFE/WARN/DANGER)</span>
                  </div>
                </div>
                <div className="arch-branch">
                  <span className="branch-label">Explanation</span>
                  <div className="arch-node node-genai">
                    <strong>Generative AI Synthesis</strong>
                    <span>Gemini / Safe Local Fallback Natural Language Explainer</span>
                  </div>
                </div>
              </div>
              <div className="arch-arrow">&darr; Actuator Dispatch &darr;</div>
              <div className="arch-node node-hardware">
                <strong>ESP32 Microcontroller (UART / Serial)</strong>
                <span>Zone 1 Sensors &amp; Actuators: MQ-2, DHT11, Flame, Relay, Pump, Servo, Buzzer, LEDs</span>
              </div>
            </div>
          </div>

          {/* Hardware Pinout Specs */}
          <div className="arch-section">
            <h3 className="arch-subheading">Zone 1 Hardware Circuit &amp; Safety Design</h3>
            <div className="specs-grid">
              <div className="spec-card">
                <h4>MQ-2 Smoke Sensor (Analog)</h4>
                <ul>
                  <li><strong>VCC:</strong> 5V External / ESP32 VIN</li>
                  <li><strong>GND:</strong> Common System Ground</li>
                  <li><strong>Voltage Divider:</strong> 20kΩ in series with 10kΩ to protect ESP32 3.3V ADC input.</li>
                </ul>
              </div>

              <div className="spec-card">
                <h4>DHT11 &amp; Flame Sensor</h4>
                <ul>
                  <li><strong>DHT11:</strong> Digital Pin with 10k pull-up resistor.</li>
                  <li><strong>Flame Sensor:</strong> IR Phototransistor (760nm - 1100nm) to ESP32 digital/analog pin.</li>
                </ul>
              </div>

              <div className="spec-card">
                <h4>Actuator Protection (Relay &amp; Pump)</h4>
                <ul>
                  <li><strong>Water Pump:</strong> Powered strictly via dedicated 12V DC external supply.</li>
                  <li><strong>Relay Module:</strong> Optocoupler isolation driven by ESP32 GPIO. NEVER power pump from GPIO.</li>
                </ul>
              </div>

              <div className="spec-card">
                <h4>Servo Nozzle &amp; Indicators</h4>
                <ul>
                  <li><strong>Servo Motor:</strong> PWM signal on ESP32 pin (0° normal, 90° spray targeting).</li>
                  <li><strong>LEDs &amp; Buzzer:</strong> Green (Safe), Yellow (Warn), Red + 85dB Siren (Danger).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Architecture Guide</button>
        </div>
      </div>
    </div>
  );
}
