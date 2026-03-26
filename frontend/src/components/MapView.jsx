import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSentinelStore } from "../store/sentinelStore";

function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const riskMarkers = useRef([]);
  const userMarker = useRef(null);
  const [riskZones, setRiskZones] = useState([]);
  const userLocation = useSentinelStore((s) => s.userLocation) || { lat: 37.7749, lng: -122.4194 };

  // Fetch risk zones from backend
  const fetchRiskZones = useCallback(async (bounds) => {
    try {
      console.log("Fetching risk zones with bounds:", bounds);
      const response = await fetch("http://127.0.0.1:5000/api/risk/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bounds)
      });
      
      if (!response.ok) {
        console.error("Response error:", response.status, response.statusText);
        throw new Error(`Failed to fetch risk zones: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Risk zones received:", data);
      setRiskZones(data.features || []);
    } catch (error) {
      console.error("Error fetching risk zones:", error);
      // Generate mock data if API fails
      const mockZones = [];
      for (let i = 0; i < 8; i++) {
        const risk = Math.random() * 100;
        mockZones.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [bounds.west + Math.random() * (bounds.east - bounds.west), 
                         bounds.south + Math.random() * (bounds.north - bounds.south)]
          },
          properties: {
            risk_score: Math.round(risk * 100) / 100,
            threat_level: risk > 70 ? "HIGH" : risk > 40 ? "MODERATE" : "LOW"
          }
        });
      }
      console.log("Using mock risk zones:", mockZones);
      setRiskZones(mockZones);
    }
  }, []);

  // Get color based on risk score (UPDATED THRESHOLDS)
  const getRiskColor = useCallback((riskScore) => {
    if (riskScore > 50) return "#FF0000";    // Red for HIGH risk (>50%)
    if (riskScore > 30) return "#FF9800";    // Orange for MODERATE risk (30-50%)
    return "#4CAF50";                        // Green for LOW risk (<30%)
  }, []);

  // Initialize map once
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    console.log("Map initialized");

  }, []);

  // Update user location marker and fetch risk zones when location changes
  useEffect(() => {
    if (!map.current) return;

    console.log("User location updated:", userLocation);

    // Create or update user location marker
    const userIcon = L.divIcon({
      html: '<div style="background-color: #4A90E2; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(74, 144, 226, 0.6);"></div>',
      iconSize: [22, 22],
      popupAnchor: [0, -10]
    });

    if (userMarker.current) {
      // Update existing marker position
      userMarker.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      // Create new marker
      userMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("📍 Your Location")
        .addTo(map.current);
    }

    // Pan map to user location (smooth animation)
    map.current.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.5 });

    // Fetch risk zones for the current map bounds
    const bounds = {
      north: userLocation.lat + 0.1,
      south: userLocation.lat - 0.1,
      east: userLocation.lng + 0.1,
      west: userLocation.lng - 0.1
    };
    fetchRiskZones(bounds);

  }, [userLocation, fetchRiskZones]);

  // Render risk zones on map
  useEffect(() => {
    if (!map.current) {
      console.log("Map not initialized yet");
      return;
    }

    console.log("Rendering risk zones on map, zone count:", riskZones.length);

    // Clear existing markers
    riskMarkers.current.forEach(marker => {
      try {
        map.current.removeLayer(marker);
      } catch (e) {
        console.error("Error removing marker:", e);
      }
    });
    riskMarkers.current = [];

    // Add risk zone markers
    if (riskZones.length === 0) {
      console.log("No risk zones to render");
      return;
    }

    riskZones.forEach((zone, index) => {
      try {
        const { coordinates } = zone.geometry;
        const { risk_score, threat_level } = zone.properties;
        const color = getRiskColor(risk_score);

        console.log(`Zone ${index}:`, { coordinates, risk_score, threat_level, color });

        // Create a custom divIcon for risk zones
        const riskIcon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>`,
          iconSize: [18, 18],
          popupAnchor: [0, -9]
        });

        const marker = L.marker([coordinates[1], coordinates[0]], { icon: riskIcon })
          .bindPopup(`<strong>${threat_level}</strong><br/>Risk Score: ${risk_score.toFixed(1)}%`)
          .addTo(map.current);

        riskMarkers.current.push(marker);
      } catch (e) {
        console.error(`Error adding zone ${index}:`, e);
      }
    });

    console.log("Added", riskMarkers.current.length, "markers to map");
  }, [riskZones, getRiskColor]);

  return (
    <div className="card map-card">
      <div className="card-header">
        <h3>
          <span className="icon">🗺️</span> LIVE CITY MAP
        </h3>
      </div>
      <div
        ref={mapContainer}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}

export default MapView;