import React, { useEffect, useState } from "react";

function SuggestedRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/route/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        const data = await res.json();
        setRoutes(data.routes || []);
      } catch (err) {
        console.error("Error fetching routes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
    const interval = setInterval(fetchRoutes, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSafetyColor = (score) => {
    if (score >= 70) return "#1D9E75";
    if (score >= 40) return "#EF9F27";
    return "#E24B4A";
  };

  const getThreatLevel = (score) => {
    if (score >= 70) return "SAFEST";
    if (score >= 40) return "MODERATE";
    return "AVOID";
  };

  return (
    <div className="card routes-card">
      <div className="card-header">
        <h3>
          <span className="icon">🛣️</span> SUGGESTED ROUTES
        </h3>
        <p className="subtitle">RANKED BY PREDICTED SAFETY (ML MODEL)</p>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Calculating safe routes...</p>
      ) : (
        <div className="routes-list">
          {routes.map((route, idx) => {
            const color = getSafetyColor(route.safety_score);
            const threat = getThreatLevel(route.safety_score);

            return (
              <div
                key={route.id}
                className="route-item"
                style={{
                  borderLeft: `4px solid ${color}`,
                  padding: "12px",
                  marginBottom: "8px",
                  background: "#2a3a4a",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#fff", fontSize: "14px" }}>
                      {idx === 0 ? "✓ " : ""}{route.name}
                    </h4>
                    <p style={{ margin: "4px 0", color: "#aaa", fontSize: "12px" }}>
                      📏 {route.distance} km · ⏱️ {route.estimated_time} min
                    </p>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginTop: "8px",
                      fontSize: "11px"
                    }}>
                      <div>
                        <p style={{ color: "#999" }}>Lighting</p>
                        <div style={{
                          height: "4px",
                          background: "#333",
                          borderRadius: "2px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${route.factors.lighting}%`,
                            background: "#FFD700"
                          }} />
                        </div>
                      </div>
                      <div>
                        <p style={{ color: "#999" }}>Police</p>
                        <div style={{
                          height: "4px",
                          background: "#333",
                          borderRadius: "2px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${route.factors.police}%`,
                            background: "#4a90e2"
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: "right",
                    marginLeft: "16px"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: color
                    }}>
                      {route.safety_score.toFixed(0)}%
                    </div>
                    <p style={{
                      fontSize: "11px",
                      color: color,
                      margin: "4px 0",
                      fontWeight: "600"
                    }}>
                      {threat}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SuggestedRoutes;
