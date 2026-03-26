import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>SENTINEL AI</h4>
          <p>Making danger never happen</p>
        </div>

        <div className="footer-section">
          <h5>Features</h5>
          <ul>
            <li><a href="#features">Silent Navigation</a></li>
            <li><a href="#features">Infrastructure Activation</a></li>
            <li><a href="#features">Predictive Zones</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Resources</h5>
          <ul>
            <li><a href="#model">AI Model</a></li>
            <li><a href="#demo">Live Demo</a></li>
            <li><a href="#docs">Documentation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Contact</h5>
          <ul>
            <li><a href="mailto:hello@sentinel.ai">hello@sentinel.ai</a></li>
            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 SENTINEL AI. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
