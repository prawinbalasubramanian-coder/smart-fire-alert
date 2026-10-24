import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SensorCard from './components/SensorCard';
import PredictionCard from './components/PredictionCard';
import ResponsePanel from './components/ResponsePanel';
import AlertPanel from './components/AlertPanel';
import SensorCharts from './components/SensorCharts';
import SimulationControls from './components/SimulationControls';
import AlertHistory from './components/AlertHistory';
import SystemArchitectureModal from './components/SystemArchitectureModal';
import { generateSimulatedReading, checkBackendHealth, SIMULATION_PROFILES } from './services/api';
import './App.css';

function App() {
  const [currentProfile, setCurrentProfile] = useState('SAFE');
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [systemOnline, setSystemOnline] = useState(false);
  const [hardwareMode, setHardwareMode] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);

  // Manual custom sliders override state
  const [customValues, setCustomValues] = useState({
    temperature: 24.5,
    humidity: 58,
    smoke: 115,
    flame: false,
    isCustomActive: false
  });

  // Current sensor & prediction state
  const [currentReading, setCurrentReading] = useState(() => {
    return generateSimulatedReading('SAFE');
  });

  // Telemetry History for Charts & Logs (store last 30 items)
  const [history, setHistory] = useState(() => {
    const initial = generateSimulatedReading('SAFE');
    // Pre-populate 5 points for initial chart display
    return [
      { ...initial, timestamp: '12:00:00' },
      { ...initial, temperature: 24.1, smoke: 110, timestamp: '12:00:02' },
      { ...initial, temperature: 24.3, smoke: 118, timestamp: '12:00:04' },
      { ...initial, temperature: 24.7, smoke: 114, timestamp: '12:00:06' },
      initial
    ];
  });

  // Periodic Backend Health Check
  useEffect(() => {
    const checkHealth = async () => {
      const res = await checkBackendHealth();
      setSystemOnline(res.online);
      if (res.online && res.data?.hardware_connected) {
        setHardwareMode(true);
      } else {
        setHardwareMode(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Simulation Loop
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      const overrides = customValues.isCustomActive ? customValues : null;
      const newReading = generateSimulatedReading(currentProfile, overrides);
      
      setCurrentReading(newReading);
      setHistory(prev => {
        const updated = [...prev, newReading];
        if (updated.length > 30) {
          return updated.slice(updated.length - 30);
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [simulationRunning, currentProfile, customValues]);

  // Handle Preset Profile Selection
  const handleSelectProfile = (profileKey) => {
    setCurrentProfile(profileKey);
    setCustomValues(prev => ({
      ...prev,
      temperature: SIMULATION_PROFILES[profileKey].temperature,
      humidity: SIMULATION_PROFILES[profileKey].humidity,
      smoke: SIMULATION_PROFILES[profileKey].smoke,
      flame: SIMULATION_PROFILES[profileKey].flame,
      isCustomActive: false
    }));

    const newReading = generateSimulatedReading(profileKey);
    setCurrentReading(newReading);
    setHistory(prev => [...prev.slice(-29), newReading]);
  };

  // Handle Manual Custom Slider Change
  const handleCustomChange = (key, value) => {
    const updatedCustom = {
      ...customValues,
      [key]: value,
      isCustomActive: true
    };
    setCustomValues(updatedCustom);
    const newReading = generateSimulatedReading(currentProfile, updatedCustom);
    setCurrentReading(newReading);
    setHistory(prev => [...prev.slice(-29), newReading]);
  };

  // Reset Simulation to Safe
  const handleResetSimulation = () => {
    setCurrentProfile('SAFE');
    setCustomValues({
      temperature: 24.5,
      humidity: 58,
      smoke: 115,
      flame: false,
      isCustomActive: false
    });
    const newReading = generateSimulatedReading('SAFE');
    setCurrentReading(newReading);
    setHistory(prev => [...prev.slice(-29), newReading]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        systemOnline={systemOnline}
        hardwareMode={hardwareMode}
        zoneStatus={currentReading.prediction}
        onReset={handleResetSimulation}
      />

      {/* Main Dashboard Layout */}
      <main className="dashboard-main">
        {/* Notice Bar */}
        <div className="notice-bar">
          <div className="notice-content">
            <span className="notice-pill">ZONE 1 SCOPE</span>
            <span className="notice-text">
              Active Monitoring: MQ-2 Gas &bull; DHT11 Temp/Hum &bull; IR Flame Detector &bull; Automatic Water Nozzle Suppression
            </span>
          </div>
          <button className="btn-arch-info" onClick={() => setShowArchModal(true)}>
            View Hardware &amp; Architecture Specs &rarr;
          </button>
        </div>

        {/* Top Simulation Controls */}
        <SimulationControls
          currentProfile={currentProfile}
          onSelectProfile={handleSelectProfile}
          isRunning={simulationRunning}
          onToggleRunning={() => setSimulationRunning(!simulationRunning)}
          customValues={customValues}
          onCustomChange={handleCustomChange}
          onResetSimulation={handleResetSimulation}
        />

        {/* 4 Sensor Cards Grid */}
        <section className="sensors-grid-section">
          <div className="section-title-row">
            <h2 className="section-title">Zone 1 Physical Telemetry</h2>
            <span className="section-caption">Real-Time Sensor Inputs to Deep Neural Network</span>
          </div>
          <div className="sensor-cards-grid">
            <SensorCard
              type="temperature"
              value={currentReading.temperature}
              status={currentReading.prediction}
            />
            <SensorCard
              type="humidity"
              value={currentReading.humidity}
              status={currentReading.prediction}
            />
            <SensorCard
              type="smoke"
              value={currentReading.smoke}
              status={currentReading.prediction}
            />
            <SensorCard
              type="flame"
              value={currentReading.flame ? 'DETECTED' : 'NOT DETECTED'}
              flameDetected={currentReading.flame}
              status={currentReading.prediction}
            />
          </div>
        </section>

        {/* AI & Actuator Response Dual Row */}
        <section className="dual-intelligence-grid">
          {/* Left: Deep Neural Network Classifier */}
          <PredictionCard
            prediction={currentReading.prediction}
            confidence={currentReading.confidence}
            probabilities={currentReading.probabilities}
          />

          {/* Right: Actuators & Response */}
          <ResponsePanel
            response={currentReading.response}
            prediction={currentReading.prediction}
          />
        </section>

        {/* Natural Language GenAI Alert Panel */}
        <section className="genai-alert-section">
          <AlertPanel
            message={currentReading.aiAlert}
            prediction={currentReading.prediction}
            timestamp={currentReading.timestamp}
          />
        </section>

        {/* Sensor Charts Panel */}
        <section className="charts-section">
          <SensorCharts history={history} />
        </section>

        {/* Database Audit Log / Alert History Table */}
        <section className="history-section">
          <AlertHistory
            history={history}
            onClearHistory={() => setHistory([])}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-left">
          AI-Powered Smart Fire Alert and Automatic Response System &bull; College Engineering Project
        </div>
        <div className="footer-right">
          <span>React 19 + Vite</span> &bull; <span>Python FastAPI</span> &bull; <span>TensorFlow DNN</span> &bull; <span>ESP32</span>
        </div>
      </footer>

      {/* System Architecture Modal */}
      <SystemArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
}

export default App;
