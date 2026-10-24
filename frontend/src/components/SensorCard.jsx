import React from 'react';
import { ThermometerIcon, DropletIcon, SmokeIcon, FlameIcon } from './Icons';

export default function SensorCard({ type, value, flameDetected }) {
  if (type === 'temperature') {
    const isDanger = value >= 50;
    const isWarning = value >= 38 && value < 50;
    const badgeClass = isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-safe';
    const percent = Math.min(100, Math.max(0, ((value - 15) / (80 - 15)) * 100));

    return (
      <div className={`sensor-card ${isDanger ? 'border-danger' : isWarning ? 'border-warning' : ''}`}>
        <div className="sensor-card-header">
          <div className="sensor-title-group">
            <div className={`sensor-icon-box ${badgeClass}`}>
              <ThermometerIcon size={22} />
            </div>
            <div>
              <h3 className="sensor-name">Temperature</h3>
              <span className="sensor-model">DHT11 Sensor</span>
            </div>
          </div>
          <span className={`sensor-badge ${badgeClass}`}>
            {isDanger ? 'HIGH' : isWarning ? 'ELEVATED' : 'NORMAL'}
          </span>
        </div>

        <div className="sensor-value-row">
          <span className="sensor-main-value">{typeof value === 'number' ? value.toFixed(1) : value}</span>
          <span className="sensor-unit">°C</span>
        </div>

        <div className="sensor-meter-track">
          <div 
            className={`sensor-meter-fill ${isDanger ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-safe'}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <div className="sensor-footer">
          <span>Range: 0 - 60°C</span>
          <span>Baseline: 24 - 30°C</span>
        </div>
      </div>
    );
  }

  if (type === 'humidity') {
    const isLow = value < 30;
    const badgeClass = isLow ? 'badge-warning' : 'badge-safe';
    const percent = Math.min(100, Math.max(0, value));

    return (
      <div className={`sensor-card ${isLow ? 'border-warning' : ''}`}>
        <div className="sensor-card-header">
          <div className="sensor-title-group">
            <div className={`sensor-icon-box ${badgeClass}`}>
              <DropletIcon size={22} />
            </div>
            <div>
              <h3 className="sensor-name">Humidity</h3>
              <span className="sensor-model">DHT11 Sensor</span>
            </div>
          </div>
          <span className={`sensor-badge ${badgeClass}`}>
            {isLow ? 'DRY / ARID' : 'NORMAL'}
          </span>
        </div>

        <div className="sensor-value-row">
          <span className="sensor-main-value">{value}</span>
          <span className="sensor-unit">%</span>
        </div>

        <div className="sensor-meter-track">
          <div 
            className={`sensor-meter-fill ${isLow ? 'fill-warning' : 'fill-info'}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <div className="sensor-footer">
          <span>Range: 20 - 90%</span>
          <span>Normal: 40 - 70%</span>
        </div>
      </div>
    );
  }

  if (type === 'smoke') {
    const isDanger = value >= 600;
    const isWarning = value >= 300 && value < 600;
    const badgeClass = isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-safe';
    const percent = Math.min(100, Math.max(0, (value / 1000) * 100));

    return (
      <div className={`sensor-card ${isDanger ? 'border-danger' : isWarning ? 'border-warning' : ''}`}>
        <div className="sensor-card-header">
          <div className="sensor-title-group">
            <div className={`sensor-icon-box ${badgeClass}`}>
              <SmokeIcon size={22} />
            </div>
            <div>
              <h3 className="sensor-name">Smoke Density</h3>
              <span className="sensor-model">MQ-2 Gas Sensor</span>
            </div>
          </div>
          <span className={`sensor-badge ${badgeClass}`}>
            {isDanger ? 'HEAVY SMOKE' : isWarning ? 'MODERATE' : 'CLEAN AIR'}
          </span>
        </div>

        <div className="sensor-value-row">
          <span className="sensor-main-value">{value}</span>
          <span className="sensor-unit">PPM</span>
        </div>

        <div className="sensor-meter-track">
          <div 
            className={`sensor-meter-fill ${isDanger ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-safe'}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <div className="sensor-footer">
          <span>Divider: 20kΩ / 10kΩ ADC</span>
          <span>Threshold: &gt;350 PPM</span>
        </div>
      </div>
    );
  }

  if (type === 'flame') {
    const isDetected = Boolean(flameDetected);
    const badgeClass = isDetected ? 'badge-danger' : 'badge-safe';

    return (
      <div className={`sensor-card ${isDetected ? 'border-danger pulse-danger-card' : ''}`}>
        <div className="sensor-card-header">
          <div className="sensor-title-group">
            <div className={`sensor-icon-box ${badgeClass}`}>
              <FlameIcon size={22} className={isDetected ? 'flame-flicker' : ''} />
            </div>
            <div>
              <h3 className="sensor-name">Flame Sensor</h3>
              <span className="sensor-model">Infrared Optical Detector</span>
            </div>
          </div>
          <span className={`sensor-badge ${badgeClass}`}>
            {isDetected ? 'OPTICAL TRIGGER' : 'NO FIRE'}
          </span>
        </div>

        <div className="sensor-value-row">
          <span className={`sensor-main-value ${isDetected ? 'text-danger' : 'text-safe'}`}>
            {isDetected ? 'DETECTED' : 'NOT DETECTED'}
          </span>
        </div>

        <div className="sensor-meter-track">
          <div 
            className={`sensor-meter-fill ${isDetected ? 'fill-danger' : 'fill-safe'}`}
            style={{ width: isDetected ? '100%' : '15%' }}
          ></div>
        </div>

        <div className="sensor-footer">
          <span>Spectral: 760nm - 1100nm</span>
          <span>Status: {isDetected ? 'ACTIVE FLAME' : 'CLEAR'}</span>
        </div>
      </div>
    );
  }

  return null;
}
