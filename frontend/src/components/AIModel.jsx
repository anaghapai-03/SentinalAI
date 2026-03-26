import React from "react";

function AIModel() {
  return (
    <section className="ai-model">
      <div className="model-header">
        <h2>SENTINEL Intelligence Engine</h2>
        <p>How our predictive AI works</p>
      </div>

      <div className="model-architecture">
        <div className="architecture-row">
          <div className="arch-box input">
            <h4>Data Inputs</h4>
            <ul>
              <li>📍 GPS & Location</li>
              <li>👥 Crowd Density</li>
              <li>💡 Lighting Sensors</li>
              <li>📊 Weather Data</li>
              <li>📱 Mobile Signals</li>
              <li>🚨 Incident Reports</li>
            </ul>
          </div>

          <div className="arch-arrow">→</div>

          <div className="arch-box processing">
            <h4>AI Processing</h4>
            <ul>
              <li>🧠 Neural Networks</li>
              <li>📈 Pattern Recognition</li>
              <li>🔄 Real-time Analysis</li>
              <li>⏰ Temporal Clustering</li>
              <li>🎯 Risk Scoring</li>
              <li>🔮 Predictive Modeling</li>
            </ul>
          </div>

          <div className="arch-arrow">→</div>

          <div className="arch-box output">
            <h4>Smart Outputs</h4>
            <ul>
              <li>🚦 Dynamic Navigation</li>
              <li>🏢 Safe Haven Routes</li>
              <li>⚠️ Risk Alerts</li>
              <li>🌟 Environmental Activation</li>
              <li>👮 Authority Coordination</li>
              <li>📊 Real-time Dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="model-details">
        <div className="detail-card">
          <h3>Predictive Window: 45 Minutes</h3>
          <p>
            Our algorithm analyzes convergent risk factors to forecast dangerous conditions
            before they materialize, giving users and authorities crucial intervention time.
          </p>
        </div>

        <div className="detail-card">
          <h3>Real-Time Environment Sensing</h3>
          <p>
            Integrates lighting decay, crowd flow anomalies, and historical incident clustering
            to create a living risk map that updates every 30 seconds.
          </p>
        </div>

        <div className="detail-card">
          <h3>Infrastructure Harmony</h3>
          <p>
            When risk is detected, SENTINEL automatically coordinates with city systems:
            brightening streets, alerting police, and activating safe-haven businesses.
          </p>
        </div>
      </div>

      <div className="ml-metrics">
        <h3>Model Performance</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-value">94.7%</span>
            <span className="metric-label">Prediction Accuracy</span>
          </div>
          <div className="metric">
            <span className="metric-value">45 min</span>
            <span className="metric-label">Prediction Window</span>
          </div>
          <div className="metric">
            <span className="metric-value">2.3s</span>
            <span className="metric-label">Avg Response Time</span>
          </div>
          <div className="metric">
            <span className="metric-value">99.2%</span>
            <span className="metric-label">Uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIModel;
