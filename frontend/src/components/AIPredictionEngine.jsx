import React from "react";

function AIPredictionEngine() {
  const factors = [
    { label: "Crowd density", value: "8%" },
    { label: "Lighting status", value: "100%" },
    { label: "Historical incidents", value: "5%" },
    { label: "Time-of-day risk", value: "12%" }
  ];

  return (
    <div className="card ai-engine-card">
      <div className="card-header">
        <h3>
          <span className="icon">🧠</span> AI PREDICTION ENGINE
        </h3>
        <p className="subtitle">WHAT'S FEEDING THE THREAT MODEL RIGHT NOW</p>
      </div>

      <div className="ai-factors">
        {factors.map((factor, idx) => (
          <div key={idx} className="factor-item">
            <span className="factor-label">{factor.label}</span>
            <div className="factor-bar">
              <div 
                className="factor-fill"
                style={{ width: factor.value }}
              ></div>
            </div>
            <span className="factor-value">{factor.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIPredictionEngine;
