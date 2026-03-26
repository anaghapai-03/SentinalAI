import React from "react";

function CrowdDensity() {
  const hours = ["8P", "9P", "10P", "11P", "NOW", "1A", "2A"];
  const densities = [30, 45, 60, 75, 85, 70, 40];
  const maxDensity = 100;

  return (
    <div className="card crowd-density-card">
      <div className="card-header">
        <h3>
          <span className="icon">👥</span> CROWD DENSITY
        </h3>
        <p className="subtitle">CURRENT HOUR VS BASELINE</p>
      </div>

      <div className="chart">
        <div className="bars">
          {hours.map((hour, idx) => (
            <div key={idx} className="bar-container">
              <div className="bar-label">{hour}</div>
              <div className="bar-wrapper">
                <div 
                  className={`bar ${idx === 4 ? "current" : ""}`}
                  style={{ height: `${(densities[idx] / maxDensity) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CrowdDensity;
