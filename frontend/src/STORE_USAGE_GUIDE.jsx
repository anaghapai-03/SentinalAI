/**
 * SENTINEL Store Integration Guide
 * 
 * How to use Zustand global state in your components
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. BASIC STORE ACCESS
// ─────────────────────────────────────────────────────────────────────────────

import { useSentinelStore } from "../store/sentinelStore";

function MyComponent() {
  // Read state
  const userLocation = useSentinelStore((state) => state.userLocation);
  const threatLevel = useSentinelStore((state) => state.threatLevel);
  const isLoading = useSentinelStore((state) => state.isLoading);

  // Or get everything:
  const store = useSentinelStore();
  console.log(store.userLocation, store.threatLevel);

  return <div>{threatLevel}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. USING CUSTOM HOOKS (Recommended)
// ─────────────────────────────────────────────────────────────────────────────

import { useUserRisk, useRiskStats, useNearbyGuardians } from "../hooks/useSentinel";

function RiskPanel() {
  const userLocation = useSentinelStore((state) => state.userLocation);
  const { fetchCurrentRisk } = useUserRisk(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );

  // Auto-fetch when location changes
  useEffect(() => {
    if (userLocation) {
      fetchCurrentRisk();
    }
  }, [userLocation]);

  return <div>Risk fetched!</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATING STATE
// ─────────────────────────────────────────────────────────────────────────────

function UpdateUserLocation() {
  const setUserLocation = useSentinelStore((state) => state.setUserLocation);
  const setThreatLevel = useSentinelStore((state) => state.setThreatLevel);

  const handleLocationUpdate = () => {
    setUserLocation({ lat: 40.7128, lng: -74.006 });
    setThreatLevel("HIGH");
  };

  return <button onClick={handleLocationUpdate}>Update Location</button>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TOGGLING UI STATE
// ─────────────────────────────────────────────────────────────────────────────

function UIControls() {
  const { showRiskOverlay, toggleRiskOverlay } = useSentinelStore();

  return (
    <button onClick={toggleRiskOverlay}>
      {showRiskOverlay ? "Hide" : "Show"} Risk Overlay
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BATCH UPDATES
// ─────────────────────────────────────────────────────────────────────────────

function UpdateMultipleValues() {
  const { updateRiskData } = useSentinelStore();

  const handleUpdate = (geoJSON, stats) => {
    // Updates multiple values at once + lastRefreshed + clears error
    updateRiskData(geoJSON, stats);
  };

  return <button onClick={() => handleUpdate(data1, data2)}>Update</button>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. WATCHING STATE FOR SIDE EFFECTS
// ─────────────────────────────────────────────────────────────────────────────

function WatchThreatLevel() {
  const threatLevel = useSentinelStore((state) => state.threatLevel);
  const alertDismissed = useSentinelStore((state) => state.alertDismissed);
  const dismissAlert = useSentinelStore((state) => state.dismissAlert);

  useEffect(() => {
    if (threatLevel === "HIGH" && !alertDismissed) {
      // Show alert
      console.warn("HIGH THREAT DETECTED!");
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => dismissAlert(), 10000);
      return () => clearTimeout(timer);
    }
  }, [threatLevel, alertDismissed, dismissAlert]);

  return <div>{threatLevel}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPLETE REAL-WORLD EXAMPLE
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useSentinelStore } from "../store/sentinelStore";
import {
  useUserRisk,
  useRiskStats,
  useNearbyGuardians,
  useAutoRefresh
} from "../hooks/useSentinel";

export function CompleteExample() {
  // Get state
  const {
    userLocation,
    currentCellRisk,
    threatLevel,
    nearbyGuardians,
    isLoading,
    error
  } = useSentinelStore();

  // Get hooks
  const { fetchCurrentRisk } = useUserRisk(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );
  const { fetchStats } = useRiskStats();
  const { fetchGuardians } = useNearbyGuardians(
    userLocation?.lat || 0,
    userLocation?.lng || 0
  );

  // Auto-refresh every 30 seconds
  useAutoRefresh(30);

  // Fetch current risk when location changes
  useEffect(() => {
    if (userLocation) {
      fetchCurrentRisk();
      fetchStats();
      fetchGuardians();
    }
  }, [userLocation, fetchCurrentRisk, fetchStats, fetchGuardians]);

  // Render
  return (
    <div>
      {error && <div className="error">{error}</div>}
      {isLoading && <div className="loading">Loading...</div>}

      {currentCellRisk && (
        <div>
          <h3>Risk: {currentCellRisk.risk_score.toFixed(1)}</h3>
          <p>Threat Level: {threatLevel}</p>
          <p>Nearby Guardians: {nearbyGuardians.length}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. STORE STATE REFERENCE
// ─────────────────────────────────────────────────────────────────────────────

/*
RISK DATA:
- riskGeoJSON: GeoJSON object with all risk zones
- riskStats: Statistics (high_risk_zones, moderate_zones, safe_zones)
- lastRefreshed: Date of last update
- isLoading: Boolean for loading state
- error: Error message string or null

USER STATE:
- userLocation: {lat, lng}
- selectedCell: Currently selected risk cell
- currentCellRisk: Risk data at user's location

UI STATE:
- showRiskOverlay: Boolean
- showSafeHavens: Boolean
- showGuardians: Boolean
- alertDismissed: Boolean
- threatLevel: SAFE | LOW | MODERATE | HIGH | CRITICAL
- nearbyGuardians: Array of guardian objects

ACTIONS (all functions that can modify state):
- setRiskGeoJSON(data)
- setRiskStats(stats)
- setUserLocation(loc)
- setSelectedCell(cell)
- setCurrentCellRisk(cell)
- setLoading(v)
- setError(msg)
- setThreatLevel(level)
- setNearbyGuardians(guardians)
- toggleRiskOverlay()
- toggleSafeHavens()
- toggleGuardians()
- dismissAlert()
- resetAlert()
- updateRiskData(geoJSON, stats) [batch]
- resetStore() [reset everything]
*/
