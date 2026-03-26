import React from "react";

function ThreatForecast() {
  return (
    <div className="card threat-forecast-card">
      <div className="card-header">
        <h3>
          <span className="icon">⚡</span> THREAT FORECAST
        </h3>
        <p className="subtitle">NEXT 45 MINUTES · YOUR PATH</p>
      </div>

      <div className="threat-timeline">
        <div className="timeline-item high">
          <span className="time">11:42 PM</span>
          <span className="status">HIGH RISK</span>
          <p>Crowd spike detected — MG Road junction</p>
        </div>
        <div className="timeline-item moderate">
          <span className="time">11:55 PM</span>
          <span className="status">MODERATE</span>
          <p>Light traffic at intersection ahead</p>
        </div>
        <div className="timeline-item safe">
          <span className="time">12:15 AM</span>
          <span className="status">SAFE</span>
          <p>Clear path via North Corridor</p>
        </div>
        <div className="timeline-item safe">
          <span className="time">12:27 AM</span>
          <span className="status">SAFE</span>
          <p>Destination reached safely</p>
        </div>
      </div>
    </div>
  );
}

export default ThreatForecast;
