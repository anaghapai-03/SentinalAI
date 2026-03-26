import React, { useEffect, useState } from "react";

function AIPredictionEngine() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureImportance = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/model/feature-importance");
        const data = await res.json();
        
        if (data.features) {
          // Take top 4 most important features
          setFactors(data.features.slice(0, 4).map(f => ({
            label: f.label,
            value: f.importance
          })));
        }
      } catch (err) {
        console.error("Error fetching feature importance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureImportance();
    const interval = setInterval(fetchFeatureImportance, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card ai-engine-card">
      <div className="card-header">
        <h3>
          <span className="icon">🧠</span> AI PREDICTION ENGINE
        </h3>
        <p className="subtitle">MODEL FEATURE IMPORTANCE · WHAT'S FEEDING THE THREAT PREDICTION</p>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading model insights...</p>
      ) : (
        <div className="ai-factors">
          {factors.map((factor, idx) => (
            <div
              key={idx}
              className="factor-item"
              style={{
                padding: "12px",
                marginBottom: "8px",
                background: "#2a3a4a",
                borderRadius: "4px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "#aaa", fontSize: "12px" }}>{factor.label}</span>
                <span style={{
                  color: "#FFD700",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>
                  {factor.value.toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: "6px",
                background: "#1a2a3a",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <div
                  style={{
                    height: "100%",
                    width: `${factor.value}%`,
                    background: "linear-gradient(90deg, #FFD700, #FFA500)",
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIPredictionEngine;
