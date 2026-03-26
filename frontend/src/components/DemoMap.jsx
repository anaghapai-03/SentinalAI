import React, { useState, useEffect } from "react";

function DemoMap() {
  const [simulating, setSimulating] = useState(false);
  const [riskZones, setRiskZones] = useState([
    { id: 1, lat: 40.7128, lng: -74.006, risk: "HIGH", time: "Now" },
    { id: 2, lat: 40.72, lng: -74.01, risk: "MEDIUM", time: "15 min" },
    { id: 3, lat: 40.73, lng: -74.005, risk: "LOW", time: "30 min" }
  ]);

  const [safeRoute, setSafeRoute] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    if (simulating) {
      const interval = setInterval(() => {
        setUserLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [simulating]);

  const handleStartSimulation = () => {
    setSimulating(true);
    setSafeRoute({
      waypoints: [
        { lat: 40.7128, lng: -74.006 },
        { lat: 40.715, lng: -74.008 },
        { lat: 40.718, lng: -74.010 }
      ]
    });
  };

  const handleStopSimulation = () => {
    setSimulating(false);
    setSafeRoute(null);
  };

  return (
    <section className="demo-map">
      <div className="demo-header">
        <h2>Live Predictive Risk Map</h2>
        <p>Real-time demonstration of SENTINEL's predictive capabilities</p>
      </div>

      <div className="demo-container">
        <div className="map-area">
          <div className="map-placeholder">
            {/* Map Visualization */}
            <svg viewBox="0 0 300 400" width="100%" height="100%">
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="300" height="400" fill="#1a1a2e" />
              <rect width="300" height="400" fill="url(#grid)" />

              {/* Safe Route Path */}
              {safeRoute && (
                <polyline
                  points={safeRoute.waypoints.map(p => `${p.lng * 100},${p.lat * 100}`).join(" ")}
                  stroke="#4ade80"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                  strokeDasharray="5,5"
                />
              )}

              {/* Risk Zones */}
              {riskZones.map((zone) => (
                <g key={zone.id}>
                  <circle
                    cx={zone.lng * 100}
                    cy={zone.lat * 100}
                    r={40}
                    fill={
                      zone.risk === "HIGH"
                        ? "#ef4444"
                        : zone.risk === "MEDIUM"
                        ? "#f97316"
                        : "#22c55e"
                    }
                    opacity="0.2"
                  />
                  <circle
                    cx={zone.lng * 100}
                    cy={zone.lat * 100}
                    r={40}
                    stroke={
                      zone.risk === "HIGH"
                        ? "#ef4444"
                        : zone.risk === "MEDIUM"
                        ? "#f97316"
                        : "#22c55e"
                    }
                    strokeWidth="2"
                    fill="none"
                  />
                </g>
              ))}

              {/* User Location */}
              {simulating && (
                <g>
                  <circle
                    cx={userLocation.lng * 100}
                    cy={userLocation.lat * 100}
                    r="8"
                    fill="#3b82f6"
                    opacity="0.8"
                  />
                  <circle
                    cx={userLocation.lng * 100}
                    cy={userLocation.lat * 100}
                    r="12"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.5"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-color high"></span> High Risk Zone
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span> Medium Risk Zone
            </div>
            <div className="legend-item">
              <span className="legend-color low"></span> Low Risk Zone
            </div>
            <div className="legend-item">
              <span className="legend-color user"></span> Your Location
            </div>
            <div className="legend-item">
              <span className="legend-color route"></span> Safe Route
            </div>
          </div>
        </div>

        <div className="demo-panel">
          <h3>Predictive Risk Analysis</h3>

          <div className="risk-zones-list">
            <h4>Detected Risk Zones</h4>
            {riskZones.map((zone) => (
              <div key={zone.id} className="zone-item">
                <div className={`zone-badge ${zone.risk.toLowerCase()}`}>
                  {zone.risk}
                </div>
                <div className="zone-info">
                  <p className="zone-location">Zone {zone.id}</p>
                  <p className="zone-time">{zone.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="demo-controls">
            {!simulating ? (
              <button className="btn btn-primary" onClick={handleStartSimulation}>
                Start Simulation
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStopSimulation}>
                Stop Simulation
              </button>
            )}
          </div>

          <div className="demo-status">
            <p>
              <strong>Status:</strong> {simulating ? "🟢 Live" : "⚪ Ready"}
            </p>
            <p>
              <strong>Prediction:</strong> 45-minute window active
            </p>
            <p>
              <strong>Update Frequency:</strong> Every 30 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoMap;
