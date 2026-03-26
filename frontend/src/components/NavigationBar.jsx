import React, { useState, useEffect } from "react";

function NavigationBar({ activeView, setActiveView }) {
  return (
    <nav className="sentinel-navbar">
      <div className="navbar-left">
        <h2 className="sentinel-logo">SENTINEL</h2>
        <p className="navbar-subtitle">PREDICTIVE THREAT INTERCEPTION · V2.1</p>
      </div>
      <div className="navbar-right">
        <span className="live-indicator">🔴 LIVE CITY FEED</span>
      </div>
    </nav>
  );
}

export default NavigationBar;
