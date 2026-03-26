import React, { useState, useEffect } from "react";
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

function SearchRouteFinder({ setActiveView }) {
  const storeLocation = useSentinelStore((s) => s.userLocation) || { lat: 37.7749, lng: -122.4194 };
  const [userLocation, setUserLocation] = useState(storeLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeComparison, setRouteComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState("safest");
  const [locationStatus, setLocationStatus] = useState("📍 Updating location...");

  // Real-time location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("⚠️ Geolocation not available");
      return;
    }

    setLocationStatus("📍 Requesting location...");

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setLocationStatus(`📍 Live (${newLocation.lat.toFixed(4)}°, ${newLocation.lng.toFixed(4)}°)`);
        
        // Auto-fetch nearby destinations when location changes
        fetchNearbyDestinations(newLocation);
      },
      (error) => {
        setLocationStatus("⚠️ Using default location");
        fetchNearbyDestinations(userLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000 // Update every 1 second
      }
    );

    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  // Fetch nearby destinations based on current location
  async function fetchNearbyDestinations(location) {
    try {
      const query = searchQuery ? `q=${encodeURIComponent(searchQuery)}&` : "";
      const res = await fetch(
        `http://localhost:5000/api/search/destinations?${query}lat=${location.lat}&lng=${location.lng}`
      );
      const data = await res.json();
      setNearbyDestinations(data.results || []);
    } catch (err) {
      console.error("Destination fetch error:", err);
    }
  }

  // Handle search
  async function handleSearch(value) {
    setSearchQuery(value);
    if (searchQuery.length > 0 || value.length > 0) {
      try {
        const q = value || searchQuery;
        const res = await fetch(
          `http://localhost:5000/api/search/destinations?q=${encodeURIComponent(q)}&lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        const data = await res.json();
        setNearbyDestinations(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      await fetchNearbyDestinations(userLocation);
    }
  }

  // Fetch route comparison
  async function handleSelectDestination(destination) {
    setSelectedDestination(destination);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/route/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: userLocation,
          end: { lat: destination.lat, lng: destination.lng }
        })
      });

      const data = await res.json();
      setRouteComparison(data);
      setSearchQuery("");
    } catch (err) {
      setError("Failed to load routes: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const activeRoute = routeComparison ? routeComparison[selectedRoute] : null;
  const mapCenter = activeRoute
    ? activeRoute.coordinates[0]
    : [userLocation.lat, userLocation.lng];

  return (
    <section style={{ padding: "1rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button className="btn" onClick={() => setActiveView && setActiveView("dashboard")}>
              ← Back
            </button>
            <h2 style={{ margin: 0 }}>🔍 Find Routes Near You</h2>
          </div>
          <div style={{ fontSize: "0.9rem", color: "#cbd5e1", background: "#2a3a4a", padding: "0.5rem 1rem", borderRadius: "6px" }}>
            {locationStatus}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search nearby destinations... (e.g., Hospital, Station)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #334155",
              borderRadius: "6px",
              background: "#242d3a",
              color: "#f1f5f9"
            }}
          />

          {/* Nearby Destinations Dropdown */}
          {nearbyDestinations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1a1f2e",
                border: "1px solid #334155",
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                maxHeight: "300px",
                overflowY: "auto",
                zIndex: 10
              }}
            >
              {nearbyDestinations.map((dest, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectDestination(dest)}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid #334155",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2a3a4a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600" }}>{dest.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                      {dest.category || "Destination"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: "500" }}>
                    {dest.distance ? `${dest.distance.toFixed(2)} km` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", color: "#cbd5e1" }}>⏳ Loading routes...</div>}
      {error && <div style={{ color: "#ef4444", marginBottom: "1rem" }}>❌ {error}</div>}

      {/* Routes Display */}
      {routeComparison && selectedDestination && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1rem", flex: 1, minHeight: 0 }}>
          {/* Map */}
          <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {/* User Location */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>📍 Your Location</Popup>
              </Marker>

              {/* Destination */}
              <Marker position={[selectedDestination.lat, selectedDestination.lng]}>
                <Popup>🎯 {selectedDestination.name}</Popup>
              </Marker>

              {/* 500m radius circle */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500}
                pathOptions={{ color: "#3b82f6", weight: 1, opacity: 0.2 }}
              />

              {/* Routes */}
              <Polyline
                positions={routeComparison.shortest.coordinates}
                pathOptions={{
                  color: selectedRoute === "shortest" ? "#3b82f6" : "#666",
                  weight: selectedRoute === "shortest" ? 6 : 2,
                  opacity: selectedRoute === "shortest" ? 1 : 0.3
                }}
              />

              <Polyline
                positions={routeComparison.safest.coordinates}
                pathOptions={{
                  color: selectedRoute === "safest" ? "#10b981" : "#666",
                  weight: selectedRoute === "safest" ? 6 : 2,
                  opacity: selectedRoute === "safest" ? 1 : 0.3
                }}
              />
            </MapContainer>
          </div>

          {/* Info Panel */}
          <div
            style={{
              background: "#242d3a",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "1.5rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <div>
              <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>🎯 Destination</h3>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#cbd5e1" }}>
                {selectedDestination.name}
              </p>
            </div>

            {/* Shortest Route */}
            <div
              onClick={() => setSelectedRoute("shortest")}
              style={{
                padding: "1rem",
                border: `2px solid ${selectedRoute === "shortest" ? "#3b82f6" : "#334155"}`,
                borderRadius: "6px",
                cursor: "pointer",
                background: selectedRoute === "shortest" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                transition: "all 0.2s"
              }}
            >
              <h4 style={{ margin: 0, marginBottom: "0.5rem", color: "#3b82f6" }}>
                ⚡ Shortest Route
              </h4>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: "0.25rem" }}>
                <div>📏 {routeComparison.shortest.distance}</div>
                <div>⏱️ {routeComparison.shortest.time}</div>
                <div>⚠️ Risk: {routeComparison.shortest.avg_risk}%</div>
                <div>🛡️ {routeComparison.shortest.guardians} guardians</div>
              </div>
            </div>

            {/* Safest Route */}
            <div
              onClick={() => setSelectedRoute("safest")}
              style={{
                padding: "1rem",
                border: `2px solid ${selectedRoute === "safest" ? "#10b981" : "#334155"}`,
                borderRadius: "6px",
                cursor: "pointer",
                background: selectedRoute === "safest" ? "rgba(16, 185, 129, 0.1)" : "transparent",
                transition: "all 0.2s"
              }}
            >
              <h4 style={{ margin: 0, marginBottom: "0.5rem", color: "#10b981" }}>
                🛣️ Safest Route
              </h4>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "grid", gap: "0.25rem" }}>
                <div>📏 {routeComparison.safest.distance}</div>
                <div>⏱️ {routeComparison.safest.time}</div>
                <div>⚠️ Risk: {routeComparison.safest.avg_risk}%</div>
                <div>🛡️ {routeComparison.safest.guardians} guardians</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setSelectedDestination(null)}
              style={{ width: "100%", marginTop: "auto" }}
            >
              Search Another Destination
            </button>
          </div>
        </div>
      )}

      {/* Popular Destinations Grid */}
      {!routeComparison && !loading && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ textAlign: "center", color: "#cbd5e1", marginBottom: "2rem", marginTop: "1rem" }}>
            🔍 Select a popular destination or search nearby
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { name: "Central Station", icon: "🚂", cat: "Transport", lat: 37.7847, lng: -122.4086 },
              { name: "City Hospital", icon: "🏥", cat: "Health", lat: 37.7694, lng: -122.4862 },
              { name: "Downtown Market", icon: "🛒", cat: "Shopping", lat: 37.7797, lng: -122.3954 },
              { name: "Central Park", icon: "🌳", cat: "Recreation", lat: 37.7749, lng: -122.4194 },
              { name: "Tech Hub", icon: "💻", cat: "Business", lat: 37.7694, lng: -122.3862 },
              { name: "Police Station", icon: "🚔", cat: "Safety", lat: 37.7749, lng: -122.4194 }
            ].map((place) => (
              <div
                key={place.name}
                onClick={() => handleSelectDestination(place)}
                style={{
                  padding: "1.5rem",
                  background: "#2a3a4a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#334155";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2a3a4a";
                  e.currentTarget.style.borderColor = "#334155";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{place.icon}</div>
                <h4 style={{ margin: 0, marginBottom: "0.25rem" }}>{place.name}</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1" }}>{place.cat}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default SearchRouteFinder;
