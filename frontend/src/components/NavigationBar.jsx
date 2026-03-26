import React, { useState, useEffect } from "react";

function NavigationBar({ activeView, setActiveView }) {
  return (
    <nav className="sentinel-navbar">
      <div className="navbar-left">
        <h2 className="sentinel-logo">SENTINEL</h2>
        <p className="navbar-subtitle">PREDICTIVE THREAT INTERCEPTION · V2.1</p>
      </div>
      <div className="navbar-right">
        <button className={`nav-btn ${activeView === "dashboard" ? "active" : ""}`} onClick={() => setActiveView && setActiveView("dashboard")}>Dashboard</button>
        <button className={`nav-btn ${activeView === "search" ? "active" : ""}`} onClick={() => setActiveView && setActiveView("search")}>Search Routes</button>
        <button className={`nav-btn ${activeView === "safe-routes" ? "active" : ""}`} onClick={() => setActiveView && setActiveView("safe-routes")}>Safe Routes</button>
        <button className={`nav-btn ${activeView === "shortest" ? "active" : ""}`} onClick={() => setActiveView && setActiveView("shortest")}>Shortest Route</button>
        <span className="live-indicator">🔴 LIVE CITY FEED</span>
      </div>
    </nav>
  );
}

export default NavigationBar;
