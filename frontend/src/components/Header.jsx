import React from 'react';
import { FlameIcon, ShieldCheckIcon, ShieldAlertIcon, AlertTriangleIcon, CpuIcon } from './Icons';

export default function Header({ systemOnline, hardwareMode, zoneStatus }) {
  const getStatusBadge = () => {
    switch (zoneStatus) {
      case 'DANGER':
        return (
          <div className="status-badge status-danger">
            <span className="pulsing-dot danger-dot"></span>
            <ShieldAlertIcon size={16} />
            <span>ZONE 1: CRITICAL DANGER</span>
          </div>
        );
      case 'WARNING':
        return (
          <div className="status-badge status-warning">
            <span className="pulsing-dot warning-dot"></span>
            <AlertTriangleIcon size={16} />
            <span>ZONE 1: WARNING</span>
          </div>
        );
      default:
        return (
          <div className="status-badge status-safe">
            <span className="pulsing-dot safe-dot"></span>
            <ShieldCheckIcon size={16} />
            <span>ZONE 1: SAFE</span>
          </div>
        );
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo-wrapper">
          <div className="logo-icon-bg">
            <FlameIcon size={26} className="logo-flame" />
          </div>
          <div>
            <div className="brand-badge">COLLEGE ENGINEERING PROJECT • ZONE 1 MONITOR</div>
            <h1 className="header-title">AI SMART FIRE ALERT SYSTEM</h1>
            <p className="header-subtitle">AI-Powered Fire Detection and Automatic Response</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* System Status */}
        <div className="system-pill">
          <span className={`status-indicator ${systemOnline ? 'online' : 'offline'}`}></span>
          <span className="pill-label">SYSTEM:</span>
          <strong className="pill-value">{systemOnline ? 'ONLINE' : 'STANDALONE'}</strong>
        </div>

        {/* Mode Status */}
        <div className="system-pill">
          <CpuIcon size={15} className="pill-icon" />
          <span className="pill-label">MODE:</span>
          <strong className={`pill-value ${hardwareMode ? 'text-cyan' : 'text-purple'}`}>
            {hardwareMode ? 'HARDWARE MODE (ESP32)' : 'SIMULATION MODE'}
          </strong>
        </div>

        {/* Zone 1 Condition */}
        {getStatusBadge()}
      </div>
    </header>
  );
}
