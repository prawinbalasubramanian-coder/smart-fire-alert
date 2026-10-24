import React from 'react';
import { SparklesIcon, ShieldAlertIcon, AlertTriangleIcon, ShieldCheckIcon } from './Icons';

export default function AlertPanel({ message, prediction, timestamp }) {
  const getAlertTheme = () => {
    switch (prediction) {
      case 'DANGER':
        return {
          bannerClass: 'alert-banner-danger',
          badgeText: 'CRITICAL ALERT',
          badgeClass: 'badge-danger',
          icon: <ShieldAlertIcon size={22} className="text-danger" />
        };
      case 'WARNING':
        return {
          bannerClass: 'alert-banner-warning',
          badgeText: 'ADVISORY WARNING',
          badgeClass: 'badge-warning',
          icon: <AlertTriangleIcon size={22} className="text-warning" />
        };
      default:
        return {
          bannerClass: 'alert-banner-safe',
          badgeText: 'SYSTEM NOMINAL',
          badgeClass: 'badge-safe',
          icon: <ShieldCheckIcon size={22} className="text-safe" />
        };
    }
  };

  const theme = getAlertTheme();

  return (
    <div className={`dashboard-card ai-alert-card ${theme.bannerClass}`}>
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="card-icon-badge badge-purple">
            <SparklesIcon size={20} />
          </div>
          <div>
            <div className="card-heading-row">
              <h2 className="card-heading">AI-Generated Natural Language Alert</h2>
              <span className={`alert-severity-badge ${theme.badgeClass}`}>{theme.badgeText}</span>
            </div>
            <p className="card-subheading">Generative AI Explainer (LLM API &bull; Safe Local Engine Fallback)</p>
          </div>
        </div>
        <div className="alert-meta-right">
          <span className="alert-timestamp">Generated: {timestamp || 'Live Active'}</span>
        </div>
      </div>

      <div className="ai-message-container">
        <div className="ai-quote-icon">“</div>
        <p className="ai-message-text">
          {message || "Zone 1 is currently safe. Sensor readings are within the normal operating range."}
        </p>
      </div>

      <div className="ai-footer-note">
        <span className="ai-model-tag">Architecture Rule:</span>
        <span className="ai-rule-desc">
          The <strong>DNN model</strong> executes classification; <strong>GenAI</strong> generates concise, natural language situation reports for human responders.
        </span>
      </div>
    </div>
  );
}
