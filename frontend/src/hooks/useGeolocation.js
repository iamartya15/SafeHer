import { useState, useEffect, useCallback, useRef } from 'react';

// Default fallback coordinates (New Delhi, India) if browser GPS is unavailable or denied
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 100,
  isFallback: true
};

export const useGeolocation = (options = {}) => {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('safeher_last_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch (e) {
      return DEFAULT_LOCATION;
    }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const retriesRef = useRef(0);

  const getNewLocation = useCallback(() => {
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const currentOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
      ...optionsRef.current
    };

    const successHandler = (position) => {
      const newLoc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        isFallback: false
      };
      setLocation(newLoc);
      try {
        localStorage.setItem('safeher_last_location', JSON.stringify(newLoc));
      } catch (e) {}
      retriesRef.current = 0;
      setLoading(false);
    };

    const finalErrorHandler = (err) => {
      let message = 'An error occurred fetching location';
      if (err) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access denied. Please enable GPS permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out. Using approximate location.';
            break;
          default:
            break;
        }
      }
      setError(message);
      setLoading(false);
    };

    const errorHandler = (err) => {
      if (err && err.code === err.TIMEOUT && retriesRef.current < 1) {
        retriesRef.current += 1;
        navigator.geolocation.getCurrentPosition(
          successHandler,
          finalErrorHandler,
          { ...currentOptions, enableHighAccuracy: false, timeout: 10000 }
        );
        return;
      }
      finalErrorHandler(err);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, currentOptions);
  }, []); // Stable empty dependency array prevents infinite re-render loop!

  useEffect(() => {
    getNewLocation();
    
    // Auto-update every 60 seconds
    const interval = setInterval(() => {
      getNewLocation();
    }, 60000);

    return () => clearInterval(interval);
  }, [getNewLocation]);

  return {
    location,
    latitude: location?.latitude || DEFAULT_LOCATION.latitude,
    longitude: location?.longitude || DEFAULT_LOCATION.longitude,
    accuracy: location?.accuracy || null,
    isFallback: location?.isFallback || false,
    error,
    loading,
    refresh: getNewLocation
  };
};

