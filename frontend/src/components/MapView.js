import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { getRisk } from "../services/api";
import { isDeviated } from "../utils/deviation";

mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

function MapView() {
  const mapContainer = useRef(null);
  let route = [
    { lat: 12.97, lng: 77.59 },
    { lat: 12.98, lng: 77.60 },
    { lat: 12.99, lng: 77.61 }
  ];

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [77.59, 12.97],
      zoom: 12,
    });

    navigator.geolocation.watchPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const current = { lat, lng };

      // ML features
      const features = {
        time: new Date().getHours(),
        day: new Date().getDay(),
        crowd: Math.random(),
        lighting: Math.random(),
        incidents: Math.floor(Math.random() * 20),
      };

      const risk = await getRisk(features);

      const deviated = isDeviated(current, route);

      if (deviated && risk === 1) {
        alert("⚠️ High Risk! Route deviation detected.");
      }

      console.log("Risk:", risk);
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ height: "100vh" }} />;
}

export default MapView;