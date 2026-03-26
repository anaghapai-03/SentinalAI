import React, { useState, useEffect } from "react";
import MapView from "./MapView";   // ✅ IMPORTANT
import ThreatForecast from "./ThreatForecast";
import RiskIndex from "./RiskIndex";
import SuggestedRoutes from "./SuggestedRoutes";
import CrowdDensity from "./CrowdDensity";
import GuardianNetwork from "./GuardianNetwork";
import IncidentLog from "./IncidentLog";
import AIPredictionEngine from "./AIPredictionEngine";
import { useSentinelStore } from "../store/sentinelStore";

function Dashboard({ setActiveView }) {
  const userLocation = useSentinelStore((s) => s.userLocation);
  const [simulationMode, setSimulationMode] = useState(false);
  const [threatLevel, setThreatLevel] = useState("low");

  useEffect(() => {
    if (simulationMode) {
      const interval = setInterval(() => {
        setThreatLevel(
          Math.random() > 0.6
            ? "high"
            : Math.random() > 0.3
            ? "medium"
            : "low"
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [simulationMode]);

  const handleSimulation = (type) => {
    setSimulationMode(true);
    if (type === "safe") setThreatLevel("low");
    else if (type === "risk") setThreatLevel("medium");
    else if (type === "imminent") setThreatLevel("high");
  };

  return (
    <div className="dashboard">

      {/* 🔝 HEADER */}
      <div className="dashboard-header">
        <h1 className="main-title">
          DON'T ESCAPE DANGER.<br />
          <span className="highlight">NEVER REACH IT.</span>
        </h1>

        <p className="subtitle">
          SENTINEL predicts where threats will form — before they happen — and reroutes you safely.
        </p>

        <div className="alert-bar">
          <span className="alert-icon">▲</span>
          <span className="alert-text">
            Crowd spike detected — MG Road — 11:42 PM
          </span>
        </div>

        {userLocation && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#2a3a4a", borderRadius: "6px", fontSize: "0.9rem", color: "#cbd5e1" }}>
            📍 <strong>Your Location:</strong> {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
          </div>
        )}
      </div>

      {/* 🎯 QUICK DESTINATIONS */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", letterSpacing: "2px", marginBottom: "1rem" }}>
          📍 QUICK DESTINATIONS
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {[
            { name: "Station", icon: "🚂" },
            { name: "Hospital", icon: "🏥" },
            { name: "Market", icon: "🛒" },
            { name: "Park", icon: "🌳" },
            { name: "Tech Hub", icon: "💻" },
            { name: "Police", icon: "🚔" }
          ].map((dest) => (
            <button
              key={dest.name}
              className="btn"
              onClick={() => setActiveView && setActiveView("search")}
              style={{
                padding: "0.75rem",
                fontSize: "0.85rem",
                background: "#2a3a4a",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2a3a4a";
              }}
            >
              {dest.icon} {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 MAIN GRID */}
      <div className="dashboard-grid">

        {/* LEFT SIDE → MAP */}
        <div className="left-column">
          {/* ✅ THIS IS THE FIX */}
          <MapView />

          <ThreatForecast />
        </div>

        {/* RIGHT SIDE */}
        <div className="right-column">
          <RiskIndex />
          <SuggestedRoutes />
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="dashboard-grid">
        <div className="left-column">
          <CrowdDensity />
          <GuardianNetwork />
        </div>

        <div className="right-column">
          <IncidentLog />
          <button 
            className="btn btn-primary" 
            onClick={() => setActiveView && setActiveView("search")}
            style={{ width: "100%", padding: "1rem", marginTop: "1rem", background: "#059669" }}
          >
            🔍 Search Destination & Compare Routes
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setActiveView && setActiveView("safe-routes")}
            style={{ width: "100%", padding: "1rem", marginTop: "0.5rem" }}
          >
            🛣️ View Safe Routes on Map
          </button>
        </div>
      </div>

      {/* AI ENGINE */}
      <AIPredictionEngine />

      {/* 🎮 SIMULATION */}
      <div className="simulation-section">
        <h4 className="section-label">SIMULATE ▸</h4>

        <div className="simulation-buttons">
          <button className="sim-btn safe" onClick={() => handleSimulation("safe")}>
            ✓ Safe Journey
          </button>

          <button className="sim-btn risk" onClick={() => handleSimulation("risk")}>
            ⚠ Entering Risk Zone
          </button>

          <button className="sim-btn danger" onClick={() => handleSimulation("imminent")}>
            🛑 Threat Imminent
          </button>
        </div>

        <p className="sim-text">
          Click above to simulate SENTINEL responses
        </p>
      </div>
    </div>
  );
}

export default Dashboard;