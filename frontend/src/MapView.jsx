import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

export default function MapView() {
  const [zones, setZones] = useState([]);

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
      .then(data => setZones(data.features));
  }, []);

  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100vh" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((z, i) => {
        const [lng, lat] = z.geometry.coordinates;
        const risk = z.properties.risk_score;

        let color = "green";
        if (risk > 70) color = "red";
        else if (risk > 40) color = "orange";

        return (
          <CircleMarker key={i} center={[lat, lng]} radius={8} color={color}>
            <Popup>Risk: {risk}</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
