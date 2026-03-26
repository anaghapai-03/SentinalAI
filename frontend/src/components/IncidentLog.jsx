import React from "react";

function IncidentLog() {
  const incidents = [
    {
      id: 1,
      type: "GUARD",
      icon: "👮",
      title: "Guardian Priya active 180m northeast",
      time: "4m"
    },
    {
      id: 2,
      type: "INFO",
      icon: "ℹ️",
      title: "Street lighting: 100% operational on your route",
      time: "2m"
    },
    {
      id: 3,
      type: "CLEAR",
      icon: "✓",
      title: "Whitefield Main Road — all zones nominal now",
      time: "now"
    }
  ];

  return (
    <div className="card incident-log-card">
      <div className="card-header">
        <h3>
          <span className="icon">📋</span> INCIDENT INTELLIGENCE LOG
        </h3>
        <p className="subtitle">LIVE CITY SIGNALS · AUTO-CURATED</p>
      </div>

      <div className="log-entries">
        {incidents.map((incident) => (
          <div key={incident.id} className={`log-entry ${incident.type.toLowerCase()}`}>
            <div className="log-badge">{incident.type}</div>
            <div className="log-content">
              <p className="log-text">{incident.title}</p>
            </div>
            <div className="log-time">{incident.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentLog;
