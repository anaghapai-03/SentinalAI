import React, { useEffect, useState } from "react";

function RiskIndex({ userLocation }) {
  const [risk, setRisk] = useState(null);
  const [factors, setFactors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/risk/point?lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        const data = await res.json();
        setRisk(data.risk_score);
        setFactors(data.factors);
      } catch (err) {
        console.error("Error fetching risk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
    const interval = setInterval(fetchRisk, 60000);
    return () => clearInterval(interval);
  }, [userLocation]);

  const getRiskColor = (score) => {
    if (score >= 70) return "#E24B4A";
    if (score >= 40) return "#EF9F27";
    return "#1D9E75";
  };

  const getThreatLevel = (score) => {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MODERATE";
    return "SAFE";
  };

  return (
    <div className="card risk-index-card">
      <div className="card-header">
        <h3><span className="icon">📊</span> RISK INDEX</h3>
        <p className="subtitle">REAL-TIME THREAT ASSESSMENT</p>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Analyzing location...</p>
      ) : (
        <>
          <div className="risk-score" style={{ borderLeft: `4px solid ${getRiskColor(risk)}` }}>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: getRiskColor(risk) }}>
              {risk?.toFixed(1)}%
            </div>
            <p className="risk-label" style={{ color: getRiskColor(risk) }}>
              {getThreatLevel(risk)}
            </p>
          </div>

          {factors && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>KEY FACTORS:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#999" }}>Lighting</p>
                  <div style={{
                    height: "6px",
                    background: "#333",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${factors.lighting}%`,
                      background: `hsl(${factors.lighting * 1.2}, 70%, 50%)`
                    }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    {factors.lighting.toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "#999" }}>Police Presence</p>
                  <div style={{
                    height: "6px",
                    background: "#333",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${factors.police_presence}%`,
                      background: "#4a90e2"
                    }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    {factors.police_presence.toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "#999" }}>Crowd Density</p>
                  <div style={{
                    height: "6px",
                    background: "#333",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${factors.crowd_density}%`,
                      background: "#EF9F27"
                    }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    {factors.crowd_density.toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "#999" }}>Traffic</p>
                  <div style={{
                    height: "6px",
                    background: "#333",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${factors.traffic_density}%`,
                      background: "#E24B4A"
                    }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    {factors.traffic_density.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RiskIndex;
