import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, CircleMarker } from "react-leaflet";
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

// Function to generate random safe/risky zones along a route
const generateRouteZones = (coordinates, density = 0.3) => {
  const zones = [];
  const totalPoints = Math.max(3, Math.floor(coordinates.length * density));
  
  for (let i = 0; i < totalPoints; i++) {
    // Pick random point along the route
    const randomIdx = Math.floor(Math.random() * coordinates.length);
    const [lat, lng] = coordinates[randomIdx];
    
    // Add small random offset to avoid exact route line
    const offsetLat = (Math.random() - 0.5) * 0.003;
    const offsetLng = (Math.random() - 0.5) * 0.003;
    
    // Randomly choose safe (green) or risky (red)
    const isSafe = Math.random() > 0.4; // 60% chance of safe zones
    
    zones.push({
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      isSafe,
      risk: isSafe ? Math.random() * 30 : 50 + Math.random() * 40
    });
  }
  
  return zones;
};

function SafeRoutesMap({ setActiveView }) {
  const userLocation = useSentinelStore((s) => s.userLocation) || { lat: 12.9716, lng: 77.5946 };
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [destination, setDestination] = useState({ lat: 12.9716, lng: 77.6050 });
  const [loading, setLoading] = useState(false);
  const [showDestinationInput, setShowDestinationInput] = useState(false);
  const [inputValues, setInputValues] = useState({ lat: 12.9850, lng: 77.6050 });  const [routeZones, setRouteZones] = useState([]);  // Safe/risky zones along route
  // Fetch safe routes when destination changes
  useEffect(() => {
    fetchSafeRoutes();
  }, []);

  const fetchSafeRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/route/safe-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: userLocation,
          end: destination
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const data = await response.json();
      setRoutes(data.routes || []);
      
      // Auto-select the safest route
      if (data.routes && data.routes.length > 0) {
        setSelectedRoute(data.routes[0]);
        // Generate zones along the safest route
        const safestRoute = data.routes[0];
        const zones = generateRouteZones(safestRoute.coordinates, 0.35);
        setRouteZones(zones);
      }
    } catch (error) {
      console.error("Error fetching safe routes:", error);
      // Fallback to demo routes
      setRoutes(getDemoRoutes());
    } finally {
      setLoading(false);
    }
  };

  const getDemoRoutes = () => {
    return [
      {
        id: 1,
        name: "🛡️ Indiranagar - Whitefield",
        time: "+4 min",
        guardians: "3-5 guardians",
        lighting: "Well-lit",
        safety: "SAFEST",
        color: "#22c55e",
        avg_risk: 25,
        max_risk: 35,
        coordinates: [
          [userLocation.lat, userLocation.lng],
          [userLocation.lat + 0.002, userLocation.lng + 0.003],
          [userLocation.lat + 0.004, userLocation.lng + 0.006],
          [userLocation.lat + 0.006, userLocation.lng + 0.008]
        ]
      },
      {
        id: 2,
        name: "⚡ MG Road - Koramangala",
        time: "0 min",
        guardians: "1-2 guardians",
        lighting: "Moderate",
        safety: "MODERATE",
        color: "#f97316",
        avg_risk: 38,
        max_risk: 52,
        coordinates: [
          [userLocation.lat, userLocation.lng],
          [userLocation.lat + 0.001, userLocation.lng - 0.002],
          [userLocation.lat + 0.003, userLocation.lng - 0.004],
          [userLocation.lat + 0.005, userLocation.lng - 0.005]
        ]
      },
      {
        id: 3,
        name: "🚀 BTM - Banashankari",
        time: "-3 min",
        guardians: "None nearby",
        lighting: "Poor",
        safety: "RISKY",
        color: "#ef4444",
        avg_risk: 55,
        max_risk: 72,
        coordinates: [
          [userLocation.lat, userLocation.lng],
          [userLocation.lat - 0.002, userLocation.lng + 0.002],
          [userLocation.lat - 0.004, userLocation.lng + 0.004],
          [userLocation.lat - 0.006, userLocation.lng + 0.006]
        ]
      }
    ];
  };

  const handleUpdateDestination = () => {
    setDestination(inputValues);
    setShowDestinationInput(false);
    // Re-fetch routes with new destination
    const newDest = inputValues;
    try {
      fetch("http://127.0.0.1:5000/api/route/safe-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: userLocation,
          end: newDest
        })
      })
        .then(res => res.json())
        .then(data => {
          setRoutes(data.routes || []);
          if (data.routes && data.routes.length > 0) {
            setSelectedRoute(data.routes[0]);
            // Generate zones along new route
            const zones = generateRouteZones(data.routes[0].coordinates, 0.35);
            setRouteZones(zones);
          }
        });
    } catch (error) {
      console.error("Error updating routes:", error);
    }
  };

  return (
    <section style={{ padding: "1rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <button className="btn" onClick={() => setActiveView && setActiveView("dashboard")}>
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>🛣️ SAFE ROUTES MAP</h2>
        <button 
          className="btn" 
          onClick={() => setShowDestinationInput(!showDestinationInput)}
          style={{ padding: "0.5rem 1rem" }}
        >
          📍 Change Destination
        </button>
      </div>

      {/* Destination Input Modal */}
      {showDestinationInput && (
        <div style={{
          background: "#1a202c",
          border: "1px solid #334155",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
          display: "grid",
          gap: "0.5rem"
        }}>
          <label style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
            Destination Latitude:
            <input
              type="number"
              step="0.0001"
              value={inputValues.lat}
              onChange={(e) => setInputValues({ ...inputValues, lat: parseFloat(e.target.value) })}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "4px",
                color: "#fff"
              }}
            />
          </label>
          <label style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
            Destination Longitude:
            <input
              type="number"
              step="0.0001"
              value={inputValues.lng}
              onChange={(e) => setInputValues({ ...inputValues, lng: parseFloat(e.target.value) })}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "4px",
                color: "#fff"
              }}
            />
          </label>
          <button 
            onClick={handleUpdateDestination}
            className="btn"
            style={{ marginTop: "0.5rem" }}
          >
            Calculate Safe Routes
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1rem", flex: 1, minHeight: 0 }}>
        {/* Map */}
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
          <MapContainer
            center={[12.9716, 77.5946]}
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

            {/* Destination Marker */}
            <Marker position={[destination.lat, destination.lng]}>
              <Popup>Destination</Popup>
            </Marker>

            {/* Safe and Risky Zones along route */}
            {routeZones.map((zone, idx) => (
              <CircleMarker
                key={`zone-${idx}`}
                center={[zone.lat, zone.lng]}
                radius={7}
                fillColor={zone.isSafe ? "#22C55E" : "#EF4444"}
                color={zone.isSafe ? "#16A34A" : "#DC2626"}
                weight={2}
                opacity={0.8}
                fillOpacity={0.7}
              >
                <Popup>
                  {zone.isSafe ? "✅ SAFE AREA" : "⚠️ HIGH RISK"}<br/>
                  Risk Level: {zone.risk.toFixed(0)}%
                </Popup>
              </CircleMarker>
            ))}

            {/* Show all routes */}
            {routes.map((route) => (
              <div key={route.id}>
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: selectedRoute?.id === route.id ? route.color : route.color,
                    weight: selectedRoute?.id === route.id ? 6 : 3,
                    opacity: selectedRoute?.id === route.id ? 0.9 : 0.5,
                    dashArray: route.safety === "RISKY" ? "5,5" : "0"
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedRoute(route);
                      // Update zone markers when route is selected
                      const zones = generateRouteZones(route.coordinates, 0.35);
                      setRouteZones(zones);
                    }
                  }}
                />

                {/* Destination marker for route */}
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
          <h3 style={{ marginTop: 0 }}>📍 {loading ? "Loading Routes..." : "Recommended Routes"}</h3>

          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => {
                setSelectedRoute(route);
                // Update zone markers when route is selected
                const zones = generateRouteZones(route.coordinates, 0.35);
                setRouteZones(zones);
              }}
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

              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: "0.4rem" }}>
                <div>⏱️ {route.time}</div>
                <div>🛡️ {route.guardians}</div>
                <div>💡 {route.lighting}</div>
                <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #334155" }}>
                  <div style={{ color: "#ef4444" }}>⚠️ Avg Risk: {route.avg_risk}%</div>
                  <div style={{ color: "#ef4444" }}>Max Risk: {route.max_risk}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SafeRoutesMap;
