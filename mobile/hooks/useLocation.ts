import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { useSentinelStore } from '../store/sentinelStore';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchLocationId = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        const hasPermission = status === 'granted';
        setHasPermission(hasPermission);

        if (hasPermission) {
          // Get initial location
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(currentLocation);

          // Watch for location changes
          const watchId = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 10000, // Update every 10 seconds
              distanceInterval: 20, // Or every 20 meters
            },
            (newLocation) => {
              setLocation(newLocation);
            }
          );

          watchLocationId.current = watchId;
        } else {
          setError('Location permission denied');
          // Use San Francisco as fallback
          setLocation({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    })();

    return () => {
      if (watchLocationId.current !== null) {
        Location.removeWatchAsync(watchLocationId.current);
      }
    };
  }, []);

  return {
    location,
    hasPermission,
    error,
    latitude: location?.coords.latitude ?? 37.7749,
    longitude: location?.coords.longitude ?? -122.4194,
  };
}

export function useLocationOnce() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(currentLocation);
        } else {
          setError('Location permission denied');
          setLocation({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    location,
    error,
    loading,
    latitude: location?.coords.latitude ?? 37.7749,
    longitude: location?.coords.longitude ?? -122.4194,
  };
}

export function useLocationTracking() {
  const { updateUserLocation } = useSentinelStore();
  const { location } = useLocation();

  useEffect(() => {
    if (location) {
      updateUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, updateUserLocation]);

  return location;
}
