import React from "react";

function GuardianNetwork() {
  return (
    <div className="card guardian-card">
      <div className="card-header">
        <h3>
          <span className="icon">👮</span> GUARDIAN NETWORK
        </h3>
        <p className="subtitle">NEARBY COMMUNITY WATCH</p>
      </div>

      <div className="guardian-info">
        <div className="guardian-count">
          <span className="number">3</span>
          <span className="text">active within 400m</span>
        </div>
        <p className="guardian-description">
          Guardians are verified community members who receive silent alerts and can visibly appear near you within minutes.
        </p>
      </div>
    </div>
  );
}

export default GuardianNetwork;
