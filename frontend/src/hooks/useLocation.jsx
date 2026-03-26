/**
 * useLocation — requests permissions and streams user position (WEB VERSION)
 * 
 * Uses browser Geolocation API instead of Expo for web/desktop apps
 */

import { useEffect, useCallback } from "react";
import { useSentinelStore } from "../store/sentinelStore";

export function useLocation() {
  const { setUserLocation, setError } = useSentinelStore();

  useEffect(() => {
    let watchId = null;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      // Fall back to demo city center (Bangalore)
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
      return;
    }

    // Request permission and start watching position
    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude
          });
        },
        (error) => {
          // Handle geolocation errors
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Location permission denied. Using demo location.");
              // Fall back to demo city center (Bangalore)
              setUserLocation({ lat: 12.9716, lng: 77.5946 });
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setError("Location request timed out.");
              break;
            default:
              setError(`Unknown error: ${error.message}`);
          }
        },
        {
          enableHighAccuracy: true,  // Use GPS for better accuracy
          timeout: 10000,             // 10 second timeout
          maximumAge: 0               // Don't use cached positions
        }
      );
    } catch (err) {
      setError(err.message);
      // Fall back to demo location (Bangalore)
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
    }

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [setUserLocation, setError]);
}

/**
 * useLocationOnce — Get user location once instead of watching continuously
 */
export function useLocationOnce() {
  const { setUserLocation, setError } = useSentinelStore();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [setUserLocation, setError]);

  return { requestLocation };
}

/**
 * useLocationPermission — Check permission status (informational only for web)
 */
export function useLocationPermission() {
  useEffect(() => {
    // Web doesn't have a direct permission API like mobile
    // Permissions are handled implicitly by browser
    if (!navigator.geolocation) {
      console.warn("Geolocation API not available");
    }
  }, []);

  return {
    permissionStatus: "granted", // Browser handles this implicitly
    isSupported: !!navigator.geolocation
  };
}
