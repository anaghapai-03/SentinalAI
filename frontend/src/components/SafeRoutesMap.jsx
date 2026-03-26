import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSentinelStore } from "../store/sentinelStore";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function SafeRoutesMap({ setActiveView }) {
  const userLocation = useSentinelStore((s) => s.userLocation) || { lat: 37.7749, lng: -122.4194 };
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Demo safe routes with coordinates
  const routes = [
    {
      id: 1,
      name: "94 North Corridor",
      time: "+4 min",
      guardians: "3 guardians",
      lighting: "lit",
      safety: "SAFEST",
      color: "#22c55e",
      coordinates: [
        [userLocation.lat, userLocation.lng],
        [userLocation.lat + 0.002, userLocation.lng + 0.003],
        [userLocation.lat + 0.004, userLocation.lng + 0.006],
        [userLocation.lat + 0.006, userLocation.lng + 0.008]
      ]
    },
    {
      id: 2,
      name: "61 Central Pass",
      time: "+0 min",
      guardians: "1 guardian",
      lighting: "moderate",
      safety: "MODERATE",
      color: "#f97316",
      coordinates: [
        [userLocation.lat, userLocation.lng],
        [userLocation.lat + 0.001, userLocation.lng - 0.002],
        [userLocation.lat + 0.003, userLocation.lng - 0.004],
        [userLocation.lat + 0.005, userLocation.lng - 0.005]
      ]
    },
    {
      id: 3,
      name: "23 South Underpass",
      time: "-3 min",
      guardians: "none",
      lighting: "dark",
      safety: "AVOID",
      color: "#ef4444",
      coordinates: [
        [userLocation.lat, userLocation.lng],
        [userLocation.lat - 0.002, userLocation.lng + 0.002],
        [userLocation.lat - 0.004, userLocation.lng + 0.004],
        [userLocation.lat - 0.006, userLocation.lng + 0.006]
      ]
    }
  ];

  return (
    <section style={{ padding: "1rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <button className="btn" onClick={() => setActiveView && setActiveView("dashboard")}>
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>🛣️ SAFE ROUTES MAP</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1rem", flex: 1, minHeight: 0 }}>
        {/* Map */}
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Your Location Marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your Location</Popup>
            </Marker>

            {/* Show all routes */}
            {routes.map((route) => (
              <div key={route.id}>
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: route.color,
                    weight: selectedRoute?.id === route.id ? 8 : 4,
                    opacity: selectedRoute?.id === route.id ? 1 : 0.6,
                    dashArray: route.safety === "AVOID" ? "5,5" : "0"
                  }}
                  eventHandlers={{
                    click: () => setSelectedRoute(route)
                  }}
                />

                {/* Destination marker for each route */}
                <Marker position={route.coordinates[route.coordinates.length - 1]}>
                  <Popup>{route.name}</Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>

        {/* Routes Panel */}
        <div style={{
          background: "#242d3a",
          border: "1px solid #334155",
          borderRadius: "8px",
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <h3 style={{ marginTop: 0 }}>📍 Available Routes</h3>

          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              style={{
                padding: "1rem",
                border: `2px solid ${selectedRoute?.id === route.id ? route.color : "#334155"}`,
                borderRadius: "6px",
                cursor: "pointer",
                background: selectedRoute?.id === route.id ? "rgba(59, 130, 246, 0.1)" : "transparent",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, color: route.color }}>{route.name}</h4>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  background: route.color + "30",
                  color: route.color,
                  border: `1px solid ${route.color}`
                }}>
                  {route.safety}
                </span>
              </div>

              <div style={{ fontSize: "0.9rem", color: "#cbd5e1", display: "grid", gap: "0.25rem" }}>
                <div>⏱️ {route.time}</div>
                <div>🛡️ {route.guardians}</div>
                <div>💡 {route.lighting}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SafeRoutesMap;
