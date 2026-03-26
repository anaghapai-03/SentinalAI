import React, { useEffect, useState } from "react";

function ThreatForecast({ userLocation }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/threat/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: userLocation?.lat || 12.9716,
            lng: userLocation?.lng || 77.5946
          })
        });
        const data = await res.json();
        setForecast(data.forecast || []);
      } catch (err) {
        console.error("Error fetching forecast:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchForecast();
      const interval = setInterval(fetchForecast, 60000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const getThreatColor = (score) => {
    if (score >= 70) return "#E24B4A";
    if (score >= 40) return "#EF9F27";
    return "#1D9E75";
  };

  const getThreatLabel = (score) => {
    if (score >= 70) return "HIGH RISK";
    if (score >= 40) return "MODERATE";
    return "SAFE";
  };

  return (
    <div className="card threat-forecast-card">
      <div className="card-header">
        <h3>
          <span className="icon">⚡</span> THREAT FORECAST
        </h3>
        <p className="subtitle">NEXT 45 MINUTES · ML PREDICTION</p>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading forecast...</p>
      ) : (
        <div className="threat-timeline">
          {forecast.map((point, idx) => {
            const color = getThreatColor(point.risk_score);
            const threatLabel = getThreatLabel(point.risk_score);
            const offset = point.offset_minutes;
            const now = new Date();
            const futureTime = new Date(now.getTime() + offset * 60000);
            const timeStr = futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={idx}
                className="timeline-item"
                style={{
                  borderLeft: `4px solid ${color}`,
                  marginBottom: "12px",
                  padding: "12px",
                  background: "#2a3a4a",
                  borderRadius: "4px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <span style={{ color: color, fontWeight: "600" }}>{timeStr}</span>
                    <span style={{
                      marginLeft: "12px",
                      color: color,
                      fontWeight: "600",
                      fontSize: "12px"
                    }}>
                      {threatLabel}
                    </span>
                    <p style={{
                      margin: "4px 0 0 0",
                      color: "#aaa",
                      fontSize: "12px"
                    }}>
                      {point.description}
                    </p>
                  </div>

                  <div style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: color,
                    minWidth: "50px",
                    textAlign: "right"
                  }}>
                    {point.risk_score.toFixed(0)}%
                  </div>
                </div>

                {/* Mini risk bar */}
                <div style={{
                  height: "3px",
                  background: "#333",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "8px"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${point.risk_score}%`,
                    background: color,
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThreatForecast;
