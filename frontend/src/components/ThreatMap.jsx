import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ThreatMap({ userLocation }) {
  const [zones, setZones] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch risk zones
        const zonesRes = await fetch("http://127.0.0.1:5000/api/risk/zones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            north: 13.15,
            south: 12.85,
            east: 77.75,
            west: 77.45
          })
        });
        const zonesData = await zonesRes.json();
        setZones(zonesData.features || []);

        // Fetch routes
        const routesRes = await fetch("http://127.0.0.1:5000/api/route/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        const routesData = await routesRes.json();
        setRoutes(routesData.routes || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score) => {
    if (score >= 70) return "#E24B4A"; // Red
    if (score >= 40) return "#EF9F27"; // Orange
    return "#1D9E75"; // Green
  };

  return (
    <div className="card threat-map-card">
      <div className="card-header">
        <h3>
          <span className="icon">📍</span> LIVE THREAT MAP
        </h3>
        <p className="subtitle">CITY-WIDE RISK TOPOLOGY · UPDATED EVERY 60 SEC</p>
        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            style={{
              padding: "6px 12px",
              background: showRoutes ? "#4a90e2" : "#555",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            {showRoutes ? "✓ Routes Shown" : "Show Routes"}
          </button>
        </div>
      </div>

      <div className="threat-map" style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#999"
          }}>
            Loading real-time threat data...
          </div>
        ) : (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />

            {/* Risk Zones */}
            {zones.map((zone, idx) => {
              const [lng, lat] = zone.geometry.coordinates;
              const risk = zone.properties.risk_score;
<<<<<<< HEAD

              let color = "#22C55E";    // Green for SAFE (<30%)
              if (risk > 50) color = "#EF4444";    // Red for HIGH risk (>50%)
              else if (risk > 30) color = "#F97316";  // Orange for MODERATE (30-50%)
=======
              const color = getRiskColor(risk);
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6

              return (
                <CircleMarker
                  key={idx}
                  center={[lat, lng]}
                  radius={Math.max(5, risk / 20)}
                  fillColor={color}
                  color={color}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div style={{ color: "#333", fontSize: "12px" }}>
                      <strong>Risk: {risk.toFixed(1)}%</strong><br/>
                      Level: {risk > 70 ? "HIGH" : risk > 40 ? "MODERATE" : "SAFE"}<br/>
                      Lighting: {zone.properties.factors.lighting}%<br/>
                      Incidents: {zone.properties.factors.incidents}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* User Location */}
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              fillColor="#3366ff"
              color="#3366ff"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup>📍 Your Location</Popup>
            </CircleMarker>

            {/* Routes */}
            {showRoutes && routes.map((route, idx) => {
              const safetyColor = route.safety_score >= 70 ? "#1D9E75" : 
                                  route.safety_score >= 40 ? "#EF9F27" : "#E24B4A";
              const routeCoords = [
                [userLocation.lat, userLocation.lng],
                [userLocation.lat + (idx - 1) * 0.02, userLocation.lng + (idx - 1) * 0.03]
              ];

              return (
                <Polyline
                  key={`route_${idx}`}
                  positions={routeCoords}
                  color={safetyColor}
                  weight={3}
                  opacity={0.7}
                  dashArray={idx === 0 ? "0" : "5,5"}
                >
                  <Popup>{route.name} - Safety: {route.safety_score.toFixed(1)}%</Popup>
                </Polyline>
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
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#3366ff" }}></span> You
        </div>
      </div>
    </div>
  );
}

export default ThreatMap;
