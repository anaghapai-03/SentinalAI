import { create } from 'zustand';

export interface RiskStats {
  overallCityRisk: number;
  avgLighting: number;
  policePresence: number;
  incidentsLast24h: number;
}

export interface Guardian {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  availability: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

interface SentinelStore {
  // Risk data
  riskStats: RiskStats;
  lastRefreshed: string;
  isLoading: boolean;
  error: string | null;

  // User state
  userLocation: UserLocation;
  selectedCell: string | null;
  currentCellRisk: number;
  threatLevel: 'safe' | 'moderate' | 'high';

  // UI state
  showRiskOverlay: boolean;
  showSafeHavens: boolean;
  showGuardians: boolean;
  nearbyGuardians: Guardian[];
  alertDismissed: boolean;

  // Actions
  updateRiskStats: (stats: RiskStats) => void;
  updateUserLocation: (location: UserLocation) => void;
  setThreatLevel: (level: 'safe' | 'moderate' | 'high') => void;
  setCurrentCellRisk: (risk: number) => void;
  setSelectedCell: (cellId: string | null) => void;
  toggleRiskOverlay: () => void;
  toggleSafeHavens: () => void;
  toggleGuardians: () => void;
  setNearbyGuardians: (guardians: Guardian[]) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  dismissAlert: () => void;
  resetStore: () => void;
}

const initialState = {
  riskStats: {
    overallCityRisk: 0,
    avgLighting: 0,
    policePresence: 0,
    incidentsLast24h: 0,
  },
  lastRefreshed: new Date().toISOString(),
  isLoading: false,
  error: null,
  userLocation: { lat: 37.7749, lng: -122.4194 },
  selectedCell: null,
  currentCellRisk: 0,
  threatLevel: 'safe' as const,
  showRiskOverlay: true,
  showSafeHavens: false,
  showGuardians: false,
  nearbyGuardians: [],
  alertDismissed: false,
};

export const useSentinelStore = create<SentinelStore>((set) => ({
  ...initialState,

  updateRiskStats: (stats: RiskStats) =>
    set({
      riskStats: stats,
      lastRefreshed: new Date().toISOString(),
      isLoading: false,
    }),

  updateUserLocation: (location: UserLocation) =>
    set({ userLocation: location }),

  setThreatLevel: (level: 'safe' | 'moderate' | 'high') =>
    set({ threatLevel: level, alertDismissed: false }),

  setCurrentCellRisk: (risk: number) => set({ currentCellRisk: risk }),

  setSelectedCell: (cellId: string | null) => set({ selectedCell: cellId }),

  toggleRiskOverlay: () =>
    set((state) => ({ showRiskOverlay: !state.showRiskOverlay })),

  toggleSafeHavens: () =>
    set((state) => ({ showSafeHavens: !state.showSafeHavens })),

  toggleGuardians: () =>
    set((state) => ({ showGuardians: !state.showGuardians })),

  setNearbyGuardians: (guardians: Guardian[]) =>
    set({ nearbyGuardians: guardians }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  dismissAlert: () => set({ alertDismissed: true }),

  resetStore: () => set(initialState),
}));
