import React from "react";

function SuggestedRoutes() {
  const routes = [
    {
      id: 1,
      name: "Whitefield - Indiranagar",
      time: "+4 min",
      guardians: "3 guardians",
      lighting: "lit",
      safety: "SAFEST"
    },
    {
      id: 2,
      name: "MG Road - Koramangala",
      time: "+0 min",
      guardians: "1 guardian",
      lighting: "moderate",
      safety: "MODERATE"
    },
    {
      id: 3,
      name: "BTM - Banashankari",
      time: "-3 min",
      guardians: "none",
      lighting: "dark",
      safety: "AVOID"
    }
  ];

  return (
    <div className="card routes-card">
      <div className="card-header">
        <h3>
          <span className="icon">📍</span> SUGGESTED ROUTES
        </h3>
        <p className="subtitle">RANKED BY PREDICTED SAFETY</p>
      </div>

      <div className="routes-list">
        {routes.map((route) => (
          <div key={route.id} className={`route-item ${route.safety.toLowerCase()}`}>
            <div className="route-number">{route.id}</div>
            <div className="route-details">
              <h4>{route.name}</h4>
              <p className="route-info">{route.time} · {route.guardians || "no guardian"} {route.lighting}</p>
            </div>
            <div className={`route-badge ${route.safety.toLowerCase()}`}>
              {route.safety}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestedRoutes;
