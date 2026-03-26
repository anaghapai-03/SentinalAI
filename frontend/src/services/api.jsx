// ─── Configuration ──────────────────────────────────────────────────────────
const API_BASE_URL = "http://127.0.0.1:5000";

// ─── Risk API Endpoints ──────────────────────────────────────────────────────

export async function fetchPointRisk(lat, lng) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/risk/point?lat=${lat}&lng=${lng}`
    );
    if (!response.ok) throw new Error("Failed to fetch point risk");
    return await response.json();
  } catch (error) {
    console.error("Error fetching point risk:", error);
    // Return mock data for demo
    return {
      lat,
      lng,
      risk_score: Math.random() * 100,
      threat_level: "MODERATE",
      confidence: 0.947
    };
  }
}

export async function fetchRiskStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/risk/stats`);
    if (!response.ok) throw new Error("Failed to fetch risk stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching risk stats:", error);
    // Return mock data for demo
    return {
      total_zones: 145,
      high_risk_zones: 12,
      moderate_zones: 34,
      safe_zones: 99,
      update_timestamp: new Date().toISOString()
    };
  }
}

export async function triggerRiskRefresh() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/risk/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to trigger refresh");
    return await response.json();
  } catch (error) {
    console.error("Error triggering risk refresh:", error);
  }
}

export async function fetchRiskZones(bounds) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/risk/zones`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bounds)
      }
    );
    if (!response.ok) throw new Error("Failed to fetch risk zones");
    return await response.json();
  } catch (error) {
    console.error("Error fetching risk zones:", error);
    return [];
  }
}

export async function fetchSuggestedRoute(startLat, startLng, endLat, endLng) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/route/suggest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: { lat: startLat, lng: startLng },
          end: { lat: endLat, lng: endLng }
        })
      }
    );
    if (!response.ok) throw new Error("Failed to fetch route");
    return await response.json();
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
}

export async function fetchThreatForecast(lat, lng) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/threat/forecast?lat=${lat}&lng=${lng}`
    );
    if (!response.ok) throw new Error("Failed to fetch forecast");
    return await response.json();
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return [];
  }
}

export async function getRisk(features) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features)
    });
    if (!response.ok) throw new Error("Failed to get risk prediction");
    return await response.json();
  } catch (error) {
    console.error("Error getting risk:", error);
    return {
      risk: Math.random() > 0.5 ? "HIGH" : "LOW",
      score: Math.random()
    };
  }
}

// ─── Risk Analysis Helpers ───────────────────────────────────────────────────

export function riskColor(score) {
  if (score >= 70) return "#E24B4A";   // red - high risk
  if (score >= 40) return "#EF9F27";   // amber - moderate
  return "#1D9E75";                    // teal - safe
}

export function riskLabel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Safe";
}

export function riskOpacity(score) {
  // Scale from 0.05 (no risk) to 0.65 (max risk)
  return 0.05 + (score / 100) * 0.60;
}

export function getThreatLevel(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MODERATE";
  if (score >= 20) return "LOW";
  return "SAFE";
}

// ─── Guardian API ────────────────────────────────────────────────────────────

export async function fetchNearbyGuardians(lat, lng, radiusMeters = 400) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/guardians/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`
    );
    if (!response.ok) throw new Error("Failed to fetch guardians");
    return await response.json();
  } catch (error) {
    console.error("Error fetching guardians:", error);
    return [];
  }
}

export async function alertGuardians(lat, lng, threatLevel) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guardians/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { lat, lng },
        threat_level: threatLevel,
        timestamp: new Date().toISOString()
      })
    });
    if (!response.ok) throw new Error("Failed to alert guardians");
    return await response.json();
  } catch (error) {
    console.error("Error alerting guardians:", error);
  }
}

// ─── Infrastructure API ──────────────────────────────────────────────────────

export async function activateStreetLights(lat, lng) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/infrastructure/lights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { lat, lng },
        action: "brighten"
      })
    });
    if (!response.ok) throw new Error("Failed to activate lights");
    return await response.json();
  } catch (error) {
    console.error("Error activating lights:", error);
  }
}

export async function notifyPolice(lat, lng, threatLevel) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/infrastructure/police`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { lat, lng },
        threat_level: threatLevel,
        timestamp: new Date().toISOString()
      })
    });
    if (!response.ok) throw new Error("Failed to notify police");
    return await response.json();
  } catch (error) {
    console.error("Error notifying police:", error);
  }
}

export async function alertSafeHavens(lat, lng) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/safe-havens/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { lat, lng },
        action: "unlock_doors"
      })
    });
    if (!response.ok) throw new Error("Failed to alert safe havens");
    return await response.json();
  } catch (error) {
    console.error("Error alerting safe havens:", error);
  }
}