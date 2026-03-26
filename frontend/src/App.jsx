import React, { useState } from "react";
import "./style.css";
import Dashboard from "./components/Dashboard";
import NavigationBar from "./components/NavigationBar";

function App() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="app">
      <NavigationBar activeView={activeView} setActiveView={setActiveView} />
      {activeView === "dashboard" && <Dashboard />}
    </div>
  );
}

export default App;