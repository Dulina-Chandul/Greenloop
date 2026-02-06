import { useState, useEffect, useRef } from "react";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export default function useGeolocation(
  watch: boolean = false,
  options: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  },
) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      });
      setLoading(false);
      setError(null);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      setLoading(false);
    };

    if (watch) {
      watchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options,
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options,
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [watch, options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return { location, error, loading };
}
