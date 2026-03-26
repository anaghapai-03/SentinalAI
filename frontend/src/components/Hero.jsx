import React from "react";

function Hero({ setActiveSection }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">SENTINEL AI</h1>
        <p className="hero-subtitle">
          The safety system that makes danger never happen
        </p>
        <p className="hero-description">
          Predictive risk assessment powered by real-time environmental intelligence and machine learning
        </p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setActiveSection("demo")}
          >
            See Live Demo
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveSection("features")}
          >
            Learn More
          </button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="animated-globe">
          <div className="globe-ring"></div>
          <div className="globe-center"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
