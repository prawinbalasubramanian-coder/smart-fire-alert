import React, { useState } from 'react';
import { ShieldAlertIcon, DownloadIcon, TrashIcon } from './Icons';

export default function AlertHistory({ history, onClearHistory }) {
  const [filter, setFilter] = useState('ALL');

  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.prediction === filter;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Time', 'Zone', 'Temperature(C)', 'Humidity(%)', 'Smoke(PPM)', 'Flame', 'Prediction', 'Confidence', 'Pump', 'Relay', 'Servo', 'Buzzer', 'LED', 'AI Alert'];
    const rows = history.map(item => [
      `"${item.timestamp}"`,
      `"${item.zone || 'Zone 1'}"`,
      item.temperature,
      item.humidity,
      item.smoke,
      item.flame ? 'DETECTED' : 'NONE',
      item.prediction,
      item.confidence,
      item.response?.pump || 'OFF',
      item.response?.relay || 'OFF',
      item.response?.servo || 'NORMAL',
      item.response?.buzzer || 'OFF',
      item.response?.led || 'GREEN',
      `"${(item.aiAlert || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fire_alert_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-card alert-history-panel">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge badge-red">
            <ShieldAlertIcon size={20} />
          </div>
          <div>
            <h2 className="card-heading">Telemetry &amp; Alert Event Log</h2>
            <p className="card-subheading">Historical database audit trail (Zone 1 sensor logs &amp; AI dispatches)</p>
          </div>
        </div>

        <div className="history-actions">
          {/* Filter Pills */}
          <div className="filter-pill-group">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({history.length})
            </button>
            <button
              className={`filter-btn filter-danger ${filter === 'DANGER' ? 'active' : ''}`}
              onClick={() => setFilter('DANGER')}
            >
              Danger ({history.filter(h => h.prediction === 'DANGER').length})
            </button>
            <button
              className={`filter-btn filter-warning ${filter === 'WARNING' ? 'active' : ''}`}
              onClick={() => setFilter('WARNING')}
            >
              Warning ({history.filter(h => h.prediction === 'WARNING').length})
            </button>
            <button
              className={`filter-btn filter-safe ${filter === 'SAFE' ? 'active' : ''}`}
              onClick={() => setFilter('SAFE')}
            >
              Safe ({history.filter(h => h.prediction === 'SAFE').length})
            </button>
          </div>

          <div className="action-buttons-group">
            <button
              className="export-btn"
              onClick={exportCSV}
              disabled={history.length === 0}
              title="Download CSV for academic reporting"
            >
              <DownloadIcon size={14} />
              <span>Export CSV</span>
            </button>

            <button
              className="clear-btn"
              onClick={onClearHistory}
              disabled={history.length === 0}
              title="Clear event log"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Display */}
      <div className="table-responsive">
        <table className="history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temp</th>
              <th>Humidity</th>
              <th>Smoke (MQ-2)</th>
              <th>Flame</th>
              <th>DNN Prediction</th>
              <th>Confidence</th>
              <th>Actuators Response</th>
              <th>AI-Generated Alert Rationale</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-table-cell">
                  No telemetry events recorded in current filter.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, index) => {
                const isDanger = item.prediction === 'DANGER';
                const isWarning = item.prediction === 'WARNING';
                const badgeClass = isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-safe';

                return (
                  <tr key={index} className={isDanger ? 'row-danger' : isWarning ? 'row-warning' : ''}>
                    <td className="cell-time">{item.timestamp}</td>
                    <td className="cell-metric font-mono">{typeof item.temperature === 'number' ? item.temperature.toFixed(1) : item.temperature}°C</td>
                    <td className="cell-metric font-mono">{item.humidity}%</td>
                    <td className="cell-metric font-mono">{item.smoke} PPM</td>
                    <td>
                      <span className={`mini-badge ${item.flame ? 'badge-danger' : 'badge-neutral'}`}>
                        {item.flame ? 'DETECTED' : 'NONE'}
                      </span>
                    </td>
                    <td>
                      <span className={`prediction-tag ${badgeClass}`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="font-mono text-muted">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td>
                      <div className="response-summary-badges">
                        <span className={`actuator-chip ${item.response?.pump === 'ON' ? 'chip-active-pump' : 'chip-off'}`}>
                          Pump: {item.response?.pump || 'OFF'}
                        </span>
                        <span className={`actuator-chip ${item.response?.buzzer === 'ON' || item.response?.buzzer === 'INTERMITTENT' ? 'chip-active-buzzer' : 'chip-off'}`}>
                          Buzzer: {item.response?.buzzer || 'OFF'}
                        </span>
                        <span className={`actuator-chip ${item.response?.led === 'RED' ? 'chip-red' : item.response?.led === 'YELLOW' ? 'chip-yellow' : 'chip-green'}`}>
                          LED: {item.response?.led || 'GREEN'}
                        </span>
                      </div>
                    </td>
                    <td className="cell-ai-message" title={item.aiAlert}>
                      {item.aiAlert}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
