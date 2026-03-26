import React, { useState, useEffect } from "react";
import "./style.css";
import Dashboard from "./components/Dashboard";
import NavigationBar from "./components/NavigationBar";
import ShortestRoute from "./components/ShortestRoute";
import SafeRoutesMap from "./components/SafeRoutesMap";
import SearchRouteFinder from "./components/SearchRouteFinder";
import { useLocation } from "./hooks/useLocation";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  useLocation(); // Initialize user location from browser geolocation

  return (
    <div className="app">
      <NavigationBar activeView={activeView} setActiveView={setActiveView} />
      {activeView === "dashboard" && <Dashboard setActiveView={setActiveView} />}
      {activeView === "shortest" && <ShortestRoute setActiveView={setActiveView} />}
      {activeView === "safe-routes" && <SafeRoutesMap setActiveView={setActiveView} />}
      {activeView === "search" && <SearchRouteFinder setActiveView={setActiveView} />}
    </div>
  );
}

export default App;