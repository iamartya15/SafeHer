import { useState, useEffect, useCallback, useRef } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const retriesRef = useRef(0);

  const getNewLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      ...options
    };

    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      retriesRef.current = 0;
      setLoading(false);
    };

    const errorHandler = (err) => {
      if (err.code === err.TIMEOUT && retriesRef.current < 1) {
        retriesRef.current += 1;
        navigator.geolocation.getCurrentPosition(successHandler, finalErrorHandler, { ...defaultOptions, enableHighAccuracy: false, timeout: 15000 });
        return;
      }
      finalErrorHandler(err);
    };

    const finalErrorHandler = (err) => {
      let message = 'An error occurred fetching location';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = 'Location access denied. Please enable GPS permissions.';
          break;
        case err.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          break;
        case err.TIMEOUT:
          message = 'Location request timed out. Try moving outdoors.';
          break;
        default:
          break;
      }
      setError(message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, defaultOptions);
  }, [options]);

  useEffect(() => {
    getNewLocation();
    
    // Auto-update every 60 seconds (but don't set too frequently to avoid battery drain)
    const interval = setInterval(() => {
      getNewLocation();
    }, 60000);

    return () => clearInterval(interval);
  }, [getNewLocation]);

  return {
    location,
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    accuracy: location?.accuracy || null,
    error,
    loading,
    refresh: getNewLocation
  };
};
