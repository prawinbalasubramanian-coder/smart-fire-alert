import React from 'react';
import { CpuIcon, ShieldCheckIcon, AlertTriangleIcon, ShieldAlertIcon } from './Icons';

export default function PredictionCard({ prediction, confidence, probabilities }) {
  const getPredictionTheme = () => {
    switch (prediction) {
      case 'DANGER':
        return {
          colorClass: 'text-danger',
          borderClass: 'border-danger',
          bgClass: 'bg-danger-subtle',
          badgeClass: 'badge-danger',
          icon: <ShieldAlertIcon size={28} className="text-danger" />
        };
      case 'WARNING':
        return {
          colorClass: 'text-warning',
          borderClass: 'border-warning',
          bgClass: 'bg-warning-subtle',
          badgeClass: 'badge-warning',
          icon: <AlertTriangleIcon size={28} className="text-warning" />
        };
      default:
        return {
          colorClass: 'text-safe',
          borderClass: 'border-safe',
          bgClass: 'bg-safe-subtle',
          badgeClass: 'badge-safe',
          icon: <ShieldCheckIcon size={28} className="text-safe" />
        };
    }
  };

  const theme = getPredictionTheme();
  const confPercent = (confidence * 100).toFixed(1);

  const pSafe = ((probabilities?.safe ?? 0) * 100).toFixed(1);
  const pWarn = ((probabilities?.warning ?? 0) * 100).toFixed(1);
  const pDang = ((probabilities?.danger ?? 0) * 100).toFixed(1);

  return (
    <div className={`dashboard-card prediction-card ${theme.borderClass}`}>
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge">
            <CpuIcon size={20} />
          </div>
          <div>
            <h2 className="card-heading">DNN Fire Classifier</h2>
            <p className="card-subheading">Keras Deep Neural Network (Input &rarr; Dense &rarr; Softmax)</p>
          </div>
        </div>
        <span className="tech-tag">TensorFlow 2.x</span>
      </div>

      <div className="prediction-main-hero">
        <div className={`prediction-result-box ${theme.bgClass}`}>
          <div className="prediction-icon-wrapper">
            {theme.icon}
          </div>
          <div className="prediction-text-wrapper">
            <div className="prediction-label-mini">CLASSIFIED STATUS</div>
            <div className={`prediction-title-value ${theme.colorClass}`}>
              {prediction}
            </div>
          </div>
        </div>

        <div className="confidence-metric-box">
          <div className="confidence-label">MODEL CONFIDENCE</div>
          <div className="confidence-value-row">
            <span className="confidence-num">{confPercent}</span>
            <span className="confidence-pct">%</span>
          </div>
          <div className="confidence-status">
            {confidence >= 0.90 ? 'High Confidence' : 'Moderate Confidence'}
          </div>
        </div>
      </div>

      {/* Probabilities distribution */}
      <div className="probabilities-section">
        <div className="prob-header">
          <span>Softmax Probability Distribution</span>
          <span className="prob-subtext">Sum = 100%</span>
        </div>

        <div className="prob-bar-item">
          <div className="prob-label-row">
            <span className="text-safe">SAFE</span>
            <span>{pSafe}%</span>
          </div>
          <div className="prob-track">
            <div className="prob-fill fill-safe" style={{ width: `${pSafe}%` }}></div>
          </div>
        </div>

        <div className="prob-bar-item">
          <div className="prob-label-row">
            <span className="text-warning">WARNING</span>
            <span>{pWarn}%</span>
          </div>
          <div className="prob-track">
            <div className="prob-fill fill-warning" style={{ width: `${pWarn}%` }}></div>
          </div>
        </div>

        <div className="prob-bar-item">
          <div className="prob-label-row">
            <span className="text-danger">DANGER</span>
            <span>{pDang}%</span>
          </div>
          <div className="prob-track">
            <div className="prob-fill fill-danger" style={{ width: `${pDang}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
