import React from 'react';
import { WaterPumpIcon, RelayIcon, ServoIcon, BuzzerIcon, SlidersIcon } from './Icons';

export default function ResponsePanel({ response, prediction }) {
  const isPumpOn = response?.pump === 'ON';
  const isRelayOn = response?.relay === 'ON';
  const isServoSpray = response?.servo === 'SPRAY POSITION';
  const buzzerStatus = response?.buzzer || 'OFF';
  const activeLed = response?.led || 'GREEN';

  return (
    <div className="dashboard-card response-panel">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge badge-cyan">
            <SlidersIcon size={20} />
          </div>
          <div>
            <h2 className="card-heading">Automatic Actuator Response</h2>
            <p className="card-subheading">Zone 1 Hardware Control State (Relay &bull; Pump &bull; Servo &bull; Siren &bull; LEDs)</p>
          </div>
        </div>
        <span className={`trigger-tag ${prediction === 'DANGER' ? 'trigger-active' : ''}`}>
          {prediction === 'DANGER' ? 'SUPPRESSION ENGAGED' : 'STANDBY'}
        </span>
      </div>

      <div className="actuators-grid">
        {/* Water Pump */}
        <div className={`actuator-tile ${isPumpOn ? 'actuator-active actuator-pump' : ''}`}>
          <div className="actuator-icon-wrap">
            <WaterPumpIcon size={24} />
          </div>
          <div className="actuator-info">
            <div className="actuator-label">Water Pump</div>
            <div className={`actuator-state ${isPumpOn ? 'state-on' : 'state-off'}`}>
              {isPumpOn ? 'ON (ACTIVE)' : 'OFF'}
            </div>
            <div className="actuator-sub">12V DC External Supply</div>
          </div>
          {isPumpOn && <span className="spray-indicator">SPRAYING</span>}
        </div>

        {/* Relay Module */}
        <div className={`actuator-tile ${isRelayOn ? 'actuator-active actuator-relay' : ''}`}>
          <div className="actuator-icon-wrap">
            <RelayIcon size={24} />
          </div>
          <div className="actuator-info">
            <div className="actuator-label">Relay Module</div>
            <div className={`actuator-state ${isRelayOn ? 'state-on' : 'state-off'}`}>
              {isRelayOn ? 'TRIGGERED (CLOSED)' : 'OPEN (OFF)'}
            </div>
            <div className="actuator-sub">Optocoupler Isolation</div>
          </div>
        </div>

        {/* Servo Motor */}
        <div className={`actuator-tile ${isServoSpray ? 'actuator-active actuator-servo' : ''}`}>
          <div className="actuator-icon-wrap">
            <ServoIcon size={24} />
          </div>
          <div className="actuator-info">
            <div className="actuator-label">Servo Nozzle</div>
            <div className={`actuator-state ${isServoSpray ? 'state-danger-text' : 'state-normal'}`}>
              {isServoSpray ? 'SPRAY POSITION (90°)' : 'NORMAL (0°)'}
            </div>
            <div className="actuator-sub">Aim Nozzle at Heat Zone</div>
          </div>
        </div>

        {/* Buzzer Siren */}
        <div className={`actuator-tile ${buzzerStatus !== 'OFF' ? 'actuator-active actuator-buzzer' : ''}`}>
          <div className="actuator-icon-wrap">
            <BuzzerIcon size={24} />
          </div>
          <div className="actuator-info">
            <div className="actuator-label">Buzzer Alarm</div>
            <div className={`actuator-state ${buzzerStatus === 'ON' ? 'state-danger-text' : buzzerStatus === 'INTERMITTENT' ? 'state-warning-text' : 'state-off'}`}>
              {buzzerStatus === 'ON' ? 'CONTINUOUS ON' : buzzerStatus === 'INTERMITTENT' ? 'INTERMITTENT' : 'OFF'}
            </div>
            <div className="actuator-sub">Acoustic Alert 85dB</div>
          </div>
        </div>
      </div>

      {/* Hardware LED Bank */}
      <div className="led-bank-section">
        <div className="led-bank-title">Tricolor Status LED Array (GPIO Indicators)</div>
        <div className="led-lights-row">
          {/* Green LED */}
          <div className={`led-item ${activeLed === 'GREEN' ? 'led-on-green' : 'led-dim'}`}>
            <div className="led-bulb bulb-green"></div>
            <div className="led-meta">
              <span className="led-name">GREEN LED</span>
              <span className="led-condition">{activeLed === 'GREEN' ? 'ILLUMINATED' : 'OFF'}</span>
              <span className="led-meaning">Safe Condition</span>
            </div>
          </div>

          {/* Yellow LED */}
          <div className={`led-item ${activeLed === 'YELLOW' ? 'led-on-yellow' : 'led-dim'}`}>
            <div className="led-bulb bulb-yellow"></div>
            <div className="led-meta">
              <span className="led-name">YELLOW LED</span>
              <span className="led-condition">{activeLed === 'YELLOW' ? 'ILLUMINATED' : 'OFF'}</span>
              <span className="led-meaning">Warning Hazard</span>
            </div>
          </div>

          {/* Red LED */}
          <div className={`led-item ${activeLed === 'RED' ? 'led-on-red' : 'led-dim'}`}>
            <div className="led-bulb bulb-red"></div>
            <div className="led-meta">
              <span className="led-name">RED LED</span>
              <span className="led-condition">{activeLed === 'RED' ? 'FLASHING' : 'OFF'}</span>
              <span className="led-meaning">Fire Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
