/**
 * Global state store using Zustand.
 * Holds risk cells, user location, and UI state.
 */

import { create } from "zustand";

/**
 * @typedef {Object} Location
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} RiskCell
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} risk_score - Risk score 0-100
 * @property {string} threat_level - HIGH/MODERATE/LOW
 * @property {number} confidence - Confidence 0-1
 */

/**
 * @typedef {Object} RiskStats
 * @property {number} total_zones - Total risk zones
 * @property {number} high_risk_zones - High risk count
 * @property {number} moderate_zones - Moderate risk count
 * @property {number} safe_zones - Safe zone count
 * @property {string} update_timestamp - Last update time
 */

/**
 * @typedef {Object} RiskGeoJSON
 * @property {string} type - GeoJSON type
 * @property {Array} features - GeoJSON features
 */

export const useSentinelStore = create((set) => ({
  // ─── Risk Data ───────────────────────────────────────────────────────────
  riskGeoJSON: null,
  riskStats: null,
  lastRefreshed: null,
  isLoading: false,
  error: null,

  // ─── User State ───────────────────────────────────────────────────────────
  userLocation: null,
  selectedCell: null,
  currentCellRisk: null,

  // ─── UI State ─────────────────────────────────────────────────────────────
  showRiskOverlay: true,
  showSafeHavens: false,
  showGuardians: true,
  alertDismissed: false,
  threatLevel: "SAFE", // SAFE, LOW, MODERATE, HIGH, CRITICAL
  nearbyGuardians: [],

  // ─── Risk Data Actions ────────────────────────────────────────────────────
  setRiskGeoJSON: (data) =>
    set({ riskGeoJSON: data, lastRefreshed: new Date(), error: null }),

  setRiskStats: (stats) =>
    set({ riskStats: stats }),

  setLoading: (v) =>
    set({ isLoading: v }),

  setError: (msg) =>
    set({ error: msg }),

  // ─── User Location Actions ────────────────────────────────────────────────
  setUserLocation: (loc) =>
    set({ userLocation: loc }),

  setSelectedCell: (cell) =>
    set({ selectedCell: cell }),

  setCurrentCellRisk: (cell) =>
    set({ currentCellRisk: cell }),

  // ─── UI Toggle Actions ────────────────────────────────────────────────────
  toggleRiskOverlay: () =>
    set((s) => ({ showRiskOverlay: !s.showRiskOverlay })),

  toggleSafeHavens: () =>
    set((s) => ({ showSafeHavens: !s.showSafeHavens })),

  toggleGuardians: () =>
    set((s) => ({ showGuardians: !s.showGuardians })),

  // ─── Alert Actions ────────────────────────────────────────────────────────
  dismissAlert: () =>
    set({ alertDismissed: true }),

  resetAlert: () =>
    set({ alertDismissed: false }),

  // ─── Threat Level Actions ─────────────────────────────────────────────────
  setThreatLevel: (level) =>
    set({ threatLevel: level }),

  // ─── Guardian Actions ─────────────────────────────────────────────────────
  setNearbyGuardians: (guardians) =>
    set({ nearbyGuardians: guardians }),

  // ─── Batch Updates (for multiple state changes) ───────────────────────────
  updateRiskData: (riskGeoJSON, riskStats) =>
    set({
      riskGeoJSON,
      riskStats,
      lastRefreshed: new Date(),
      error: null,
      isLoading: false
    }),

  resetStore: () =>
    set({
      riskGeoJSON: null,
      riskStats: null,
      lastRefreshed: null,
      isLoading: false,
      error: null,
      userLocation: null,
      selectedCell: null,
      currentCellRisk: null,
      showRiskOverlay: true,
      showSafeHavens: false,
      showGuardians: true,
      alertDismissed: false,
      threatLevel: "SAFE",
      nearbyGuardians: []
    })
}));
