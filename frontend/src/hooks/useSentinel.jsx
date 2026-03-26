/**
 * Custom hooks for SENTINEL store with API integration
 */

import { useEffect, useCallback } from "react";
import { useSentinelStore } from "./sentinelStore";
import {
  fetchPointRisk,
  fetchRiskStats,
  fetchRiskZones,
  fetchNearbyGuardians,
  triggerRiskRefresh
} from "../services/api";

/**
 * Hook to fetch and manage user's current risk
 */
export function useUserRisk(lat, lng) {
  const { setCurrentCellRisk, setThreatLevel, setError, isLoading } =
    useSentinelStore();

  const fetchCurrentRisk = useCallback(async () => {
    try {
      const risk = await fetchPointRisk(lat, lng);
      setCurrentCellRisk(risk);
      
      // Update threat level based on risk score
      if (risk.risk_score >= 70) setThreatLevel("HIGH");
      else if (risk.risk_score >= 40) setThreatLevel("MODERATE");
      else setThreatLevel("SAFE");
    } catch (err) {
      setError(err.message);
    }
  }, [lat, lng, setCurrentCellRisk, setThreatLevel, setError]);

  return { fetchCurrentRisk, isLoading };
}

/**
 * Hook to fetch and manage risk zone statistics
 */
export function useRiskStats() {
  const { setRiskStats, setError, isLoading, setLoading } =
    useSentinelStore();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await fetchRiskStats();
      setRiskStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setRiskStats, setError, setLoading]);

  return { fetchStats, isLoading };
}

/**
 * Hook to manage risk zone overlay data
 */
export function useRiskOverlay(bounds) {
  const { setRiskGeoJSON, setError, isLoading, setLoading } =
    useSentinelStore();

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const zones = await fetchRiskZones(bounds);
      setRiskGeoJSON(zones);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bounds, setRiskGeoJSON, setError, setLoading]);

  return { fetchZones, isLoading };
}

/**
 * Hook to manage nearby guardians
 */
export function useNearbyGuardians(lat, lng, radiusMeters = 400) {
  const { setNearbyGuardians, setError } = useSentinelStore();

  const fetchGuardians = useCallback(async () => {
    try {
      const guardians = await fetchNearbyGuardians(lat, lng, radiusMeters);
      setNearbyGuardians(guardians);
    } catch (err) {
      setError(err.message);
    }
  }, [lat, lng, radiusMeters, setNearbyGuardians, setError]);

  return { fetchGuardians };
}

/**
 * Hook for auto-refreshing risk data at intervals
 */
export function useAutoRefresh(intervalSeconds = 30) {
  const { riskStats, setLoading, setError } = useSentinelStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true);
      try {
        await triggerRiskRefresh();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [intervalSeconds, setLoading, setError]);

  return { lastRefreshed: riskStats?.update_timestamp };
}

/**
 * Hook to watch user location and update risk
 */
export function useLocationTracking() {
  const { setUserLocation, setError } = useSentinelStore();
  const { fetchCurrentRisk } = useUserRisk(0, 0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchCurrentRisk();
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setUserLocation, setError, fetchCurrentRisk]);
}
