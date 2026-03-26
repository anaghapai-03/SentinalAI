/**
 * Example: Dashboard with Location Tracking
 * Shows how to integrate useLocation hook with SENTINEL dashboard
 */

import React, { useEffect } from "react";
import { useSentinelStore } from "../store/sentinelStore";
import { useLocation, useLocationOnce } from "../hooks/useLocation";
import { useUserRisk, useNearbyGuardians, useAutoRefresh } from "../hooks/useSentinel";

/**
 * Main Dashboard with Live Location Tracking
 */
export function DashboardWithLocation() {
  // Start location tracking when component mounts
  useLocation(); // Runs watchPosition in background

  // Get state
  const {
    userLocation,
    currentCellRisk,
    threatLevel,
    nearbyGuardians,
    error,
    isLoading
  } = useSentinelStore();

  // Get API hooks
  const { fetchCurrentRisk } = useUserRisk(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );
  const { fetchGuardians } = useNearbyGuardians(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );

  // Auto-refresh every 30 seconds
  useAutoRefresh(30);

  // Fetch risk and guardians when location changes
  useEffect(() => {
    if (userLocation) {
      fetchCurrentRisk();
      fetchGuardians();
    }
  }, [userLocation, fetchCurrentRisk, fetchGuardians]);

  return (
    <div className="dashboard-with-location">
      {/* Header */}
      <div className="header">
        <h1>SENTINEL Safety Dashboard</h1>
        {error && <div className="error-banner">{error}</div>}
      </div>

      {/* Location Display */}
      <div className="location-section">
        <h3>📍 Your Location</h3>
        {userLocation ? (
          <div className="location-info">
            <p>Latitude: {userLocation.lat.toFixed(4)}</p>
            <p>Longitude: {userLocation.lng.toFixed(4)}</p>
            <p className="timestamp">Live tracking active</p>
          </div>
        ) : (
          <p>Waiting for location...</p>
        )}
      </div>

      {/* Risk Analysis */}
      {currentCellRisk && (
        <div className="risk-section">
          <h3>🛡️ Current Risk Analysis</h3>
          <div className={`risk-card ${threatLevel.toLowerCase()}`}>
            <div className="threat-level">{threatLevel}</div>
            <div className="risk-score">
              <span className="label">Risk Score:</span>
              <span className="value">{currentCellRisk.risk_score.toFixed(1)}/100</span>
            </div>
            <div className="confidence">
              <span className="label">Confidence:</span>
              <span className="value">{(currentCellRisk.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Network */}
      <div className="guardians-section">
        <h3>👮 Guardian Network</h3>
        <div className="guardian-count">
          <span className="number">{nearbyGuardians.length}</span>
          <span className="text">Guardians within 400m</span>
        </div>
        {nearbyGuardians.length > 0 && (
          <ul className="guardians-list">
            {nearbyGuardians.map((guardian, idx) => (
              <li key={idx} className="guardian-item">
                <span className="guardian-name">{guardian.name}</span>
                <span className="guardian-distance">{guardian.distance}m away</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <div className="loading-indicator">Updating...</div>}
    </div>
  );
}

/**
 * Simple Button to Request Location Once
 */
export function LocationRequestButton() {
  const { requestLocation } = useLocationOnce();

  return (
    <button className="btn btn-location" onClick={requestLocation}>
      📍 Share My Location
    </button>
  );
}

/**
 * Location Status Indicator
 */
export function LocationStatus() {
  const userLocation = useSentinelStore((state) => state.userLocation);

  return (
    <div className="location-status">
      {userLocation ? (
        <>
          <span className="indicator active">🟢</span>
          <span className="text">Location tracking active</span>
        </>
      ) : (
        <>
          <span className="indicator inactive">⚪</span>
          <span className="text">Waiting for location...</span>
        </>
      )}
    </div>
  );
}

export default DashboardWithLocation;
