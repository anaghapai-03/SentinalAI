import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useSentinelStore } from '@/store/sentinelStore';
import { useLocationTracking } from '@/hooks/useLocation';
import {
  fetchRiskStats,
  fetchNearbyGuardians,
  fetchThreatForecast,
  riskColor,
  riskLabel,
} from '@/services/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  riskScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  button: {
    backgroundColor: '#E24B4A',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  guardianItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  guardianName: {
    fontSize: 14,
    color: '#fff',
  },
  guardianDistance: {
    fontSize: 12,
    color: '#999',
  },
  forecastItem: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  forecastTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  forecastLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default function DashboardScreen() {
  const {
    riskStats,
    userLocation,
    nearbyGuardians,
    threatLevel,
    setNearbyGuardians,
    updateRiskStats,
    setThreatLevel,
    setLoading,
  } = useSentinelStore();

  const [forecast, setForecast] = useState<any[]>([]);
  const location = useLocationTracking();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [stats, guardians, forecastData] = await Promise.all([
          fetchRiskStats(),
          fetchNearbyGuardians(userLocation.lat, userLocation.lng, 2),
          fetchThreatForecast(userLocation.lat, userLocation.lng),
        ]);

        updateRiskStats(stats);
        setNearbyGuardians(guardians);
        setForecast(forecastData);

        // Update threat level based on risk
        if (stats.overallCityRisk >= 70) {
          setThreatLevel('high');
        } else if (stats.overallCityRisk >= 40) {
          setThreatLevel('moderate');
        } else {
          setThreatLevel('safe');
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userLocation]);

  const riskColor_value = riskColor(riskStats.overallCityRisk);
  const riskLabel_value = riskLabel(riskStats.overallCityRisk);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SENTINEL</Text>
          <Text style={styles.headerSubtitle}>
            Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Text>
        </View>

        {/* Risk Card */}
        <View style={[styles.card, { borderLeftColor: riskColor_value }]}>
          <Text style={styles.cardTitle}>Current Threat Level</Text>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: riskColor_value + '20' },
            ]}
          >
            <Text style={[styles.riskBadgeText, { color: riskColor_value }]}>
              {riskLabel_value.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.riskScore, { color: riskColor_value }]}>
            {riskStats.overallCityRisk.toFixed(1)}%
          </Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>ACTIVATE SILENT OVERRIDE</Text>
          </Pressable>
        </View>

        {/* City Statistics */}
        <View style={[styles.card, { borderLeftColor: '#4a90e2' }]}>
          <Text style={styles.cardTitle}>City Statistics</Text>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Average Lighting</Text>
            <Text style={styles.statValue}>{riskStats.avgLighting.toFixed(0)}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Police Presence</Text>
            <Text style={styles.statValue}>{riskStats.policePresence.toFixed(0)}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Incidents (24h)</Text>
            <Text style={styles.statValue}>{riskStats.incidentsLast24h}</Text>
          </View>
        </View>

        {/* Nearby Guardians */}
        {nearbyGuardians.length > 0 && (
          <View style={[styles.card, { borderLeftColor: '#1D9E75' }]}>
            <Text style={styles.cardTitle}>Nearby Guardians ({nearbyGuardians.length})</Text>
            {nearbyGuardians.slice(0, 5).map((guardian) => (
              <View key={guardian.id} style={styles.guardianItem}>
                <Text style={styles.guardianName}>{guardian.name}</Text>
                <Text style={styles.guardianDistance}>
                  {guardian.distance.toFixed(1)} km
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Threat Forecast */}
        {forecast.length > 0 && (
          <View style={[styles.card, { borderLeftColor: '#EF9F27' }]}>
            <Text style={styles.cardTitle}>45-Min Threat Forecast</Text>
            {forecast.slice(0, 4).map((item, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastTime}>{item.time}</Text>
                <Text
                  style={[
                    styles.forecastLevel,
                    {
                      color: riskColor(
                        item.riskLevel === 'high'
                          ? 80
                          : item.riskLevel === 'moderate'
                            ? 50
                            : 20
                      ),
                    },
                  ]}
                >
                  {item.riskLevel.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
