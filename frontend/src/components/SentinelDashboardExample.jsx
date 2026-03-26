/**
 * Example: Complete integration of Zustand store with API calls
 * Shows how to use the store and custom hooks in a real component
 */

import React, { useEffect } from "react";
import { useSentinelStore } from "../store/sentinelStore";
import {
  useUserRisk,
  useRiskStats,
  useNearbyGuardians,
  useAutoRefresh
} from "../hooks/useSentinel";

/**
 * Example 1: Risk Display Component
 * Shows current risk and threat level
 */
export function RiskDisplay() {
  const { currentCellRisk, threatLevel, userLocation } = useSentinelStore();
  const { fetchCurrentRisk } = useUserRisk(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );

  useEffect(() => {
    if (userLocation) {
      fetchCurrentRisk();
    }
  }, [userLocation, fetchCurrentRisk]);

  if (!currentCellRisk) {
    return <div>Loading risk data...</div>;
  }

  return (
    <div className="risk-display">
      <h3>Current Threat Level: {threatLevel}</h3>
      <p>Risk Score: {currentCellRisk.risk_score.toFixed(1)}/100</p>
      <p>Confidence: {(currentCellRisk.confidence * 100).toFixed(1)}%</p>
    </div>
  );
}

/**
 * Example 2: Risk Statistics Component
 * Shows overall city risk statistics
 */
export function RiskStats() {
  const { riskStats, lastRefreshed } = useSentinelStore();
  const { fetchStats } = useRiskStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!riskStats) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="risk-stats">
      <h3>City-Wide Risk Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="label">High Risk Zones</span>
          <span className="value">{riskStats.high_risk_zones}</span>
        </div>
        <div className="stat-item">
          <span className="label">Moderate Zones</span>
          <span className="value">{riskStats.moderate_zones}</span>
        </div>
        <div className="stat-item">
          <span className="label">Safe Zones</span>
          <span className="value">{riskStats.safe_zones}</span>
        </div>
      </div>
      {lastRefreshed && (
        <p className="last-update">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

/**
 * Example 3: Guardian Network Component
 * Shows nearby guardians
 */
export function GuardianStatus() {
  const { nearbyGuardians, userLocation } = useSentinelStore();
  const { fetchGuardians } = useNearbyGuardians(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );

  useEffect(() => {
    if (userLocation) {
      fetchGuardians();
    }
  }, [userLocation, fetchGuardians]);

  return (
    <div className="guardian-status">
      <h3>Nearby Guardians</h3>
      <div className="guardian-count">{nearbyGuardians.length} Active</div>
      {nearbyGuardians.length > 0 && (
        <ul className="guardians-list">
          {nearbyGuardians.map((guardian, idx) => (
            <li key={idx}>
              <span className="name">{guardian.name}</span>
              <span className="distance">{guardian.distance}m away</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 4: Control Panel
 * Shows UI toggles and controls
 */
export function ControlPanel() {
  const {
    showRiskOverlay,
    showSafeHavens,
    showGuardians,
    toggleRiskOverlay,
    toggleSafeHavens,
    toggleGuardians,
    resetAlert,
    alertDismissed
  } = useSentinelStore();

  return (
    <div className="control-panel">
      <h3>Display Options</h3>
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={showRiskOverlay}
            onChange={toggleRiskOverlay}
          />
          Show Risk Overlay
        </label>
        <label>
          <input
            type="checkbox"
            checked={showSafeHavens}
            onChange={toggleSafeHavens}
          />
          Show Safe Havens
        </label>
        <label>
          <input
            type="checkbox"
            checked={showGuardians}
            onChange={toggleGuardians}
          />
          Show Guardians
        </label>
      </div>

      {alertDismissed && (
        <button className="btn-reset" onClick={resetAlert}>
          Show Alert Again
        </button>
      )}
    </div>
  );
}

/**
 * Example 5: Main Dashboard Integration
 * Shows how to combine everything
 */
export function SentinelDashboardExample() {
  const { error, isLoading, userLocation } = useSentinelStore();

  // Auto-refresh every 30 seconds
  useAutoRefresh(30);

  return (
    <div className="sentinel-dashboard">
      <h1>SENTINEL Dashboard</h1>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && <div className="loading">Updating...</div>}

      {/* User Location */}
      {userLocation && (
        <div className="location-info">
          Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        <div className="section">
          <RiskDisplay />
        </div>
        <div className="section">
          <RiskStats />
        </div>
        <div className="section">
          <GuardianStatus />
        </div>
        <div className="section">
          <ControlPanel />
        </div>
      </div>
    </div>
  );
}

export default SentinelDashboardExample;
