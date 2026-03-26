import React from "react";

function Features() {
  const features = [
    {
      id: 1,
      title: "Silent Navigation Override",
      icon: "🛤️",
      description:
        "Quietly reroutes you without alerting others, preventing the stigma of danger alerts that also tip off observers. Your safety path is invisible to those watching.",
      benefits: [
        "Private rerouting without visible alerts",
        "Prevents social stigma",
        "Maintains situational awareness",
        "Real-time path optimization"
      ]
    },
    {
      id: 2,
      title: "Infrastructure Activation",
      icon: "🏙️",
      description:
        "Directly communicates with city systems — street lights brighten, police dispatch receives alerts, and safe-haven businesses are activated in a single automated chain.",
      benefits: [
        "Direct city system integration",
        "Automated street lighting",
        "Police dispatch coordination",
        "Safe-haven business network"
      ]
    },
    {
      id: 3,
      title: "Predictive Zones, Not Incident Maps",
      icon: "🔮",
      description:
        "Forecasts where risk conditions are converging 45 minutes before incidents occur, using crowd flow, lighting patterns, and historical clustering as AI inputs.",
      benefits: [
        "45-minute predictive window",
        "Real-time crowd flow analysis",
        "Dynamic lighting intelligence",
        "Historical pattern analysis"
      ]
    }
  ];

  return (
    <section className="features">
      <div className="features-header">
        <h2>Three Ideas That Change Everything</h2>
        <p>The philosophy: The best safety system makes danger never happen</p>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            <ul className="feature-benefits">
              {feature.benefits.map((benefit, idx) => (
                <li key={idx}>✓ {benefit}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
