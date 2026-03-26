const API_BASE_URL = 'http://localhost:5000/api';

export interface RiskData {
  score: number;
  level: 'safe' | 'moderate' | 'high';
  factors: string[];
}

export interface RiskStats {
  overallCityRisk: number;
  avgLighting: number;
  policePresence: number;
  incidentsLast24h: number;
}

export interface RiskZone {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      risk_score: number;
      risk_level: string;
    };
  }>;
}

export interface Guardian {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  availability: boolean;
}

export interface Route {
  id: string;
  waypoints: Array<{ lat: number; lng: number }>;
  riskScore: number;
  estimatedTime: number;
  reason: string;
}

export interface ThreatForecast {
  time: string;
  riskLevel: 'safe' | 'moderate' | 'high';
  factors: string[];
  recommendations: string[];
}

// Risk APIs
export async function fetchPointRisk(lat: number, lng: number): Promise<RiskData> {
  try {
    const response = await fetch(`${API_BASE_URL}/risk/point?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Failed to fetch risk');
    const data = await response.json();
    return {
      score: data.risk_score || Math.random() * 100,
      level: data.risk_level || 'moderate',
      factors: data.factors || [],
    };
  } catch (error) {
    console.error('Risk fetch error:', error);
    return {
      score: Math.random() * 100,
      level: 'moderate',
      factors: ['Network error - using mock data'],
    };
  }
}

export async function fetchRiskStats(): Promise<RiskStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/risk/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();
    return {
      overallCityRisk: data.overall_city_risk || 45,
      avgLighting: data.avg_lighting || 75,
      policePresence: data.police_presence || 60,
      incidentsLast24h: data.incidents_last_24h || 12,
    };
  } catch (error) {
    console.error('Stats fetch error:', error);
    return {
      overallCityRisk: 45,
      avgLighting: 75,
      policePresence: 60,
      incidentsLast24h: 12,
    };
  }
}

export async function fetchRiskZones(bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}): Promise<RiskZone> {
  try {
    const response = await fetch(`${API_BASE_URL}/risk/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bounds),
    });
    if (!response.ok) throw new Error('Failed to fetch zones');
    return await response.json();
  } catch (error) {
    console.error('Zones fetch error:', error);
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
}

// Route APIs
export async function suggestSafeRoutes(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<Route[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/route/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat: startLat,
        start_lng: startLng,
        end_lat: endLat,
        end_lng: endLng,
      }),
    });
    if (!response.ok) throw new Error('Failed to fetch routes');
    const data = await response.json();
    return data.routes || [];
  } catch (error) {
    console.error('Routes fetch error:', error);
    return [];
  }
}

// Guardian APIs
export async function fetchNearbyGuardians(
  lat: number,
  lng: number,
  radiusKm: number = 2
): Promise<Guardian[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/guardians/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
    );
    if (!response.ok) throw new Error('Failed to fetch guardians');
    const data = await response.json();
    return data.guardians || [];
  } catch (error) {
    console.error('Guardians fetch error:', error);
    return [];
  }
}

export async function alertGuardians(
  lat: number,
  lng: number,
  silentAlert: boolean = true
): Promise<{ success: boolean; guardians: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/guardians/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat,
        lng,
        silent_alert: silentAlert,
      }),
    });
    if (!response.ok) throw new Error('Failed to alert guardians');
    return await response.json();
  } catch (error) {
    console.error('Guardian alert error:', error);
    return { success: false, guardians: [] };
  }
}

// Threat Forecast API
export async function fetchThreatForecast(
  lat: number,
  lng: number
): Promise<ThreatForecast[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/threat/forecast?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    const data = await response.json();
    return data.forecast || [];
  } catch (error) {
    console.error('Forecast fetch error:', error);
    return [];
  }
}

// Infrastructure APIs
export async function activateStreetLights(lat: number, lng: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/infrastructure/lights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    return response.ok;
  } catch (error) {
    console.error('Street lights error:', error);
    return false;
  }
}

export async function notifyPolice(lat: number, lng: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/infrastructure/police`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    return response.ok;
  } catch (error) {
    console.error('Police notify error:', error);
    return false;
  }
}

export async function alertSafeHavens(lat: number, lng: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/safe-havens/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    return response.ok;
  } catch (error) {
    console.error('Safe havens error:', error);
    return false;
  }
}

// Color and label utilities
export function riskColor(score: number): string {
  if (score >= 70) return '#E24B4A'; // High risk - red
  if (score >= 40) return '#EF9F27'; // Moderate risk - orange
  return '#1D9E75'; // Safe - green
}

export function riskLabel(score: number): 'Safe' | 'Moderate' | 'High' {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Safe';
}

export function riskOpacity(score: number): number {
  return 0.05 + (score / 100) * 0.6; // 0.05 to 0.65
}
