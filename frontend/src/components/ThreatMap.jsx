import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ThreatMap({ threatLevel }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/risk/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        north: 12.99,
        south: 12.94,
        east: 77.62,
        west: 77.57
      })
    })
      .then(res => res.json())
      .then(data => {
        setZones(data.features || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching zones:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card threat-map-card">
      <div className="card-header">
        <h3>
          <span className="icon">📍</span> LIVE THREAT MAP
        </h3>
        <p className="subtitle">CITY-WIDE RISK TOPOLOGY · UPDATED EVERY 90 SEC</p>
      </div>

      <div className="threat-map" style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
            Loading map...
          </div>
        ) : (
          <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {zones.map((zone, idx) => {
              const coords = zone.geometry.coordinates;
              const [lng, lat] = coords;
              const risk = zone.properties.risk_score;

              let color = "#22C55E";    // Green for SAFE (<30%)
              if (risk > 50) color = "#EF4444";    // Red for HIGH risk (>50%)
              else if (risk > 30) color = "#F97316";  // Orange for MODERATE (30-50%)

              return (
                <CircleMarker
                  key={idx}
                  center={[lat, lng]}
                  radius={8}
                  fillColor={color}
                  color={color}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div style={{ color: "#333" }}>
                      <strong>Risk: {risk.toFixed(1)}%</strong><br/>
                      Level: {risk > 70 ? "HIGH" : risk > 40 ? "MODERATE" : "SAFE"}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot high-risk"></span> High Risk (&gt;50%)
        </div>
        <div className="legend-item">
          <span className="legend-dot moderate"></span> Moderate (30-50%)
        </div>
        <div className="legend-item">
          <span className="legend-dot safe"></span> Safe (&lt;30%)
        </div>
      </div>
    </div>
  );
}

export default ThreatMap;
