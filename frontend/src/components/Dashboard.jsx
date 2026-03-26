import React, { useState, useEffect } from "react";
import ThreatMap from "./ThreatMap";
import ThreatForecast from "./ThreatForecast";
import RiskIndex from "./RiskIndex";
import SuggestedRoutes from "./SuggestedRoutes";
import CrowdDensity from "./CrowdDensity";
import GuardianNetwork from "./GuardianNetwork";
import IncidentLog from "./IncidentLog";
import AIPredictionEngine from "./AIPredictionEngine";

function Dashboard() {
  const [simulationMode, setSimulationMode] = useState(false);
  const [threatLevel, setThreatLevel] = useState("low");
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    if (simulationMode) {
      const interval = setInterval(() => {
        setThreatLevel(Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low");
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [simulationMode]);

  const handleSimulation = (type) => {
    setSimulationMode(true);
    if (type === "safe") {
      setThreatLevel("low");
    } else if (type === "risk") {
      setThreatLevel("medium");
    } else if (type === "imminent") {
      setThreatLevel("high");
    }
  };

  return (
    <div className="dashboard">
      {/* TOP SECTION - TITLE & ALERTS */}
      <div className="dashboard-header">
        <h1 className="main-title">
          DON'T ESCAPE DANGER.<br />
          <span className="highlight">NEVER REACH IT.</span>
        </h1>
        <p className="subtitle">
          SENTINEL predicts where threats will form — before they happen — and invisibly reroutes you,
          activates nearby infrastructure, and crowdsources a protective net around you.
        </p>
        <div className="alert-bar">
          <span className="alert-icon">▲</span>
          <span className="alert-text">Crowd spike detected — MG Road junction — 11:42 PM</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN - MAP & FORECAST */}
        <div className="left-column">
          <ThreatMap threatLevel={threatLevel} />
          <ThreatForecast />
        </div>

        {/* RIGHT COLUMN - STATS & ANALYSIS */}
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
        </div>
      </div>

      {/* AI PREDICTION ENGINE */}
      <AIPredictionEngine />

      {/* SIMULATION CONTROLS */}
      <div className="simulation-section">
        <h4 className="section-label">SIMULATE ▸</h4>
        <div className="simulation-buttons">
          <button 
            className="sim-btn safe"
            onClick={() => handleSimulation("safe")}
          >
            ✓ Safe Journey
          </button>
          <button 
            className="sim-btn risk"
            onClick={() => handleSimulation("risk")}
          >
            ⚠ Entering Risk Zone
          </button>
          <button 
            className="sim-btn danger"
            onClick={() => handleSimulation("imminent")}
          >
            🛑 Threat Imminent
          </button>
        </div>
        <p className="sim-text">Interactive prototype — click above to see SENTINEL respond</p>
      </div>
    </div>
  );
}

export default Dashboard;
