import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchSuggestedRoute } from "../services/api";
import { useSentinelStore } from "../store/sentinelStore";

function ShortestRoute({ setActiveView }) {
  const userLocation = useSentinelStore((s) => s.userLocation);
  const [start, setStart] = useState(userLocation || { lat: 37.7749, lng: -122.4194 });
  const [endLat, setEndLat] = useState(37.7758);
  const [endLng, setEndLng] = useState(-122.4212);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLocation) setStart(userLocation);
  }, [userLocation]);

  async function handleFindRoute() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSuggestedRoute(start.lat, start.lng, parseFloat(endLat), parseFloat(endLng));
      if (res && res.coordinates) {
        // expected: { coordinates: [[lat,lng], ...] }
        setRoute(res.coordinates);
      } else if (res && res.route) {
        // alternative shape
        setRoute(res.route);
      } else {
        // fallback demo route (straight line)
        setRoute([[start.lat, start.lng], [parseFloat(endLat), parseFloat(endLng)]]);
      }
    } catch (err) {
      setError("Failed to fetch route; showing demo route.");
      setRoute([[start.lat, start.lng], [parseFloat(endLat), parseFloat(endLng)]]);
    } finally {
      setLoading(false);
    }
  }

  const center = route && route.length ? route[0] : [start.lat, start.lng];

  return (
    <section style={{ padding: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <button className="btn" onClick={() => setActiveView && setActiveView("dashboard")}>Back</button>
        <div>
          <label>Destination Latitude</label>
          <input value={endLat} onChange={(e) => setEndLat(e.target.value)} style={{ marginLeft: 8 }} />
        </div>
        <div>
          <label>Destination Longitude</label>
          <input value={endLng} onChange={(e) => setEndLng(e.target.value)} style={{ marginLeft: 8 }} />
        </div>
        <button className="btn btn-primary" onClick={handleFindRoute} disabled={loading}>
          {loading ? "Finding..." : "Find Shortest Route"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

      <div style={{ height: "60vh", width: "100%" }}>
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route && (
            <>
              <Polyline positions={route} pathOptions={{ color: "#2563eb", weight: 6 }} />
              <Marker position={route[0]}>
                <Popup>Start</Popup>
              </Marker>
              <Marker position={route[route.length - 1]}>
                <Popup>Destination</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </section>
  );
}

export default ShortestRoute;
