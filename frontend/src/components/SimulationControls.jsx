import React, { useState } from 'react';
import { PlayIcon, PauseIcon, SlidersIcon, ShieldCheckIcon, AlertTriangleIcon, ShieldAlertIcon, RefreshCwIcon } from './Icons';

export default function SimulationControls({
  currentProfile,
  onSelectProfile,
  isRunning,
  onToggleRunning,
  customValues,
  onCustomChange,
  onResetSimulation
}) {
  const [showSliders, setShowSliders] = useState(false);

  return (
    <div className="dashboard-card simulation-panel">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge badge-amber">
            <SlidersIcon size={20} />
          </div>
          <div>
            <h2 className="card-heading">Demonstration &amp; Simulation Engine</h2>
            <p className="card-subheading">College Viva / Evaluator Live Controls (Software-Only Mode)</p>
          </div>
        </div>

        <div className="sim-status-chip">
          <span className={`sim-dot ${isRunning ? 'active' : 'paused'}`}></span>
          <span>{isRunning ? 'SIMULATION LIVE (Auto Jitter)' : 'SIMULATION PAUSED'}</span>
        </div>
      </div>

      {/* Preset Action Buttons */}
      <div className="sim-buttons-grid">
        <button
          className={`sim-btn btn-safe ${currentProfile === 'SAFE' && !showSliders ? 'active-profile' : ''}`}
          onClick={() => {
            setShowSliders(false);
            onSelectProfile('SAFE');
          }}
        >
          <div className="btn-icon-wrap">
            <ShieldCheckIcon size={18} />
          </div>
          <div className="btn-text-wrap">
            <span className="btn-title">SAFE SIMULATION</span>
            <span className="btn-sub">Normal: 24.5°C &bull; 115 PPM &bull; Flame OFF</span>
          </div>
        </button>

        <button
          className={`sim-btn btn-warning ${currentProfile === 'WARNING' && !showSliders ? 'active-profile' : ''}`}
          onClick={() => {
            setShowSliders(false);
            onSelectProfile('WARNING');
          }}
        >
          <div className="btn-icon-wrap">
            <AlertTriangleIcon size={18} />
          </div>
          <div className="btn-text-wrap">
            <span className="btn-title">WARNING SIMULATION</span>
            <span className="btn-sub">Hazard: 41.8°C &bull; 410 PPM &bull; Buzzer Pulse</span>
          </div>
        </button>

        <button
          className={`sim-btn btn-danger ${currentProfile === 'DANGER' && !showSliders ? 'active-profile' : ''}`}
          onClick={() => {
            setShowSliders(false);
            onSelectProfile('DANGER');
          }}
        >
          <div className="btn-icon-wrap">
            <ShieldAlertIcon size={18} />
          </div>
          <div className="btn-text-wrap">
            <span className="btn-title">DANGER SIMULATION</span>
            <span className="btn-sub">Emergency: 58.6°C &bull; 845 PPM &bull; Pump &amp; Servo ON</span>
          </div>
        </button>
      </div>

      {/* Play / Pause / Custom Controls Bar */}
      <div className="sim-toolbar">
        <div className="toolbar-left">
          <button
            className={`tool-action-btn ${isRunning ? 'btn-pause' : 'btn-play'}`}
            onClick={onToggleRunning}
          >
            {isRunning ? (
              <>
                <PauseIcon size={16} />
                <span>STOP SIMULATION</span>
              </>
            ) : (
              <>
                <PlayIcon size={16} />
                <span>START SIMULATION</span>
              </>
            )}
          </button>

          <button
            className="tool-action-btn btn-secondary"
            onClick={onResetSimulation}
          >
            <RefreshCwIcon size={16} />
            <span>RESET TO SAFE</span>
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className={`slider-toggle-btn ${showSliders ? 'active' : ''}`}
            onClick={() => setShowSliders(!showSliders)}
          >
            <SlidersIcon size={16} />
            <span>{showSliders ? 'Hide Sliders' : 'Manual Sliders (Evaluator Demo)'}</span>
          </button>
        </div>
      </div>

      {/* Fine-Tuning Interactive Sliders */}
      {showSliders && (
        <div className="custom-sliders-box">
          <div className="sliders-banner">
            <span>Interactive Sensor Injector &bull; Drag sliders to trigger real-time AI classification</span>
          </div>

          <div className="sliders-grid">
            <div className="slider-control">
              <div className="slider-header">
                <span>Temperature (°C)</span>
                <strong>{customValues.temperature}°C</strong>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                step="0.5"
                value={customValues.temperature}
                onChange={(e) => onCustomChange('temperature', parseFloat(e.target.value))}
                className="custom-range range-temp"
              />
            </div>

            <div className="slider-control">
              <div className="slider-header">
                <span>Smoke Density (PPM)</span>
                <strong>{customValues.smoke} PPM</strong>
              </div>
              <input
                type="range"
                min="40"
                max="1000"
                step="10"
                value={customValues.smoke}
                onChange={(e) => onCustomChange('smoke', parseInt(e.target.value))}
                className="custom-range range-smoke"
              />
            </div>

            <div className="slider-control">
              <div className="slider-header">
                <span>Humidity (%)</span>
                <strong>{customValues.humidity}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={customValues.humidity}
                onChange={(e) => onCustomChange('humidity', parseInt(e.target.value))}
                className="custom-range range-hum"
              />
            </div>

            <div className="slider-control flame-toggle-control">
              <div className="slider-header">
                <span>Infrared Flame Sensor</span>
                <strong className={customValues.flame ? 'text-danger' : 'text-safe'}>
                  {customValues.flame ? 'DETECTED' : 'NOT DETECTED'}
                </strong>
              </div>
              <label className="flame-switch">
                <input
                  type="checkbox"
                  checked={customValues.flame}
                  onChange={(e) => onCustomChange('flame', e.target.checked)}
                />
                <span className="flame-slider"></span>
                <span className="flame-switch-text">Toggle Optical Flame Trigger</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
