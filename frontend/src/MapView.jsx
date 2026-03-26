import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {

  const routeCoords = [
    [12.9716, 77.5946],
    [12.975, 77.60],
    [12.98, 77.605]
  ];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Polyline
          positions={routeCoords}
          pathOptions={{ color: "red", weight: 8 }}
        />

      </MapContainer>
    </div>
  );
}