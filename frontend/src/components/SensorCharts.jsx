import React, { useState } from 'react';
import { ActivityIcon, ThermometerIcon, SmokeIcon, DropletIcon } from './Icons';

export default function SensorCharts({ history }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'temp', 'smoke', 'hum'

  // Safety check: ensure at least two points to draw lines
  const data = history.length > 0 ? history : [
    { timestamp: '00:00:00', temperature: 25, smoke: 120, humidity: 60 }
  ];

  // Chart Dimensions
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Calculate scales
  const tempValues = data.map(d => d.temperature);
  const smokeValues = data.map(d => d.smoke);

  const minTemp = Math.min(10, Math.floor(Math.min(...tempValues)));
  const maxTemp = Math.max(70, Math.ceil(Math.max(...tempValues)));

  const minSmoke = 0;
  const maxSmoke = Math.max(1000, Math.ceil(Math.max(...smokeValues) / 100) * 100);

  const minHum = 0;
  const maxHum = 100;

  // Function to compute (x, y) coordinates
  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (data.length - 1)) * chartW;
  };

  const getYTemp = (val) => {
    return padding.top + chartH - ((val - minTemp) / (maxTemp - minTemp || 1)) * chartH;
  };

  const getYSmoke = (val) => {
    return padding.top + chartH - ((val - minSmoke) / (maxSmoke - minSmoke || 1)) * chartH;
  };

  const getYHum = (val) => {
    return padding.top + chartH - ((val - minHum) / (maxHum - minHum || 1)) * chartH;
  };

  // Build SVG path strings
  const buildPolyline = (getY) => {
    return data.map((d, i) => `${getX(i)},${getY(d)}`).join(' ');
  };

  const buildAreaPath = (getY) => {
    if (data.length === 0) return '';
    const points = data.map((d, i) => `${getX(i)},${getY(d)}`);
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const bottomY = padding.top + chartH;
    return `M ${firstX} ${bottomY} L ${points.join(' L ')} L ${lastX} ${bottomY} Z`;
  };

  const tempPoints = buildPolyline((d) => getYTemp(d.temperature));
  const smokePoints = buildPolyline((d) => getYSmoke(d.smoke));
  const humPoints = buildPolyline((d) => getYHum(d.humidity));

  const currentTemp = data[data.length - 1]?.temperature ?? 24;
  const currentSmoke = data[data.length - 1]?.smoke ?? 120;
  const currentHum = data[data.length - 1]?.humidity ?? 55;

  return (
    <div className="dashboard-card charts-panel">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge badge-blue">
            <ActivityIcon size={20} />
          </div>
          <div>
            <h2 className="card-heading">Real-Time Sensor Telemetry</h2>
            <p className="card-subheading">Live temporal trends of physical parameters (Sampling: 2s)</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Signals
          </button>
          <button 
            className={`chart-tab ${activeTab === 'temp' ? 'active' : ''}`}
            onClick={() => setActiveTab('temp')}
          >
            <ThermometerIcon size={14} /> Temp
          </button>
          <button 
            className={`chart-tab ${activeTab === 'smoke' ? 'active' : ''}`}
            onClick={() => setActiveTab('smoke')}
          >
            <SmokeIcon size={14} /> Smoke
          </button>
          <button 
            className={`chart-tab ${activeTab === 'hum' ? 'active' : ''}`}
            onClick={() => setActiveTab('hum')}
          >
            <DropletIcon size={14} /> Hum
          </button>
        </div>
      </div>

      {/* Legend & Current metrics */}
      <div className="chart-legend-bar">
        {(activeTab === 'all' || activeTab === 'temp') && (
          <div className="legend-item text-temp">
            <span className="legend-indicator bg-temp"></span>
            <span>Temperature: <strong>{currentTemp}°C</strong></span>
          </div>
        )}
        {(activeTab === 'all' || activeTab === 'smoke') && (
          <div className="legend-item text-smoke">
            <span className="legend-indicator bg-smoke"></span>
            <span>Smoke (MQ-2): <strong>{currentSmoke} PPM</strong></span>
          </div>
        )}
        {(activeTab === 'all' || activeTab === 'hum') && (
          <div className="legend-item text-hum">
            <span className="legend-indicator bg-hum"></span>
            <span>Humidity (DHT11): <strong>{currentHum}%</strong></span>
          </div>
        )}
      </div>

      {/* Responsive SVG Chart */}
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg-chart">
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * pct;
            return (
              <g key={i}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={width - padding.right} 
                  y2={y} 
                  stroke="#1f2937" 
                  strokeDasharray="4 4" 
                />
              </g>
            );
          })}

          {/* Area Fills for single tab */}
          {activeTab === 'temp' && (
            <path d={buildAreaPath((d) => getYTemp(d.temperature))} fill="url(#tempGradient)" />
          )}
          {activeTab === 'smoke' && (
            <path d={buildAreaPath((d) => getYSmoke(d.smoke))} fill="url(#smokeGradient)" />
          )}
          {activeTab === 'hum' && (
            <path d={buildAreaPath((d) => getYHum(d.humidity))} fill="url(#humGradient)" />
          )}

          {/* Humidity Line */}
          {(activeTab === 'all' || activeTab === 'hum') && (
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              points={humPoints}
              strokeLinejoin="round"
            />
          )}

          {/* Smoke Line */}
          {(activeTab === 'all' || activeTab === 'smoke') && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              points={smokePoints}
              strokeLinejoin="round"
            />
          )}

          {/* Temperature Line */}
          {(activeTab === 'all' || activeTab === 'temp') && (
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              points={tempPoints}
              strokeLinejoin="round"
            />
          )}

          {/* Data Points on latest item */}
          {data.length > 0 && (
            <>
              {(activeTab === 'all' || activeTab === 'temp') && (
                <circle 
                  cx={getX(data.length - 1)} 
                  cy={getYTemp(currentTemp)} 
                  r="5" 
                  fill="#ef4444" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              )}
              {(activeTab === 'all' || activeTab === 'smoke') && (
                <circle 
                  cx={getX(data.length - 1)} 
                  cy={getYSmoke(currentSmoke)} 
                  r="5" 
                  fill="#f59e0b" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              )}
              {(activeTab === 'all' || activeTab === 'hum') && (
                <circle 
                  cx={getX(data.length - 1)} 
                  cy={getYHum(currentHum)} 
                  r="5" 
                  fill="#06b6d4" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              )}
            </>
          )}

          {/* X-axis labels (Time) */}
          {data.map((d, i) => {
            if (i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) {
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 10}
                  fill="#6b7280"
                  fontSize="11"
                  textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                >
                  {d.timestamp}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}
