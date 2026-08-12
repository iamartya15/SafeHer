import { useState, useEffect, useCallback, useRef } from 'react';

// Default fallback coordinates (New Delhi, India) if browser GPS and IP lookup are unavailable
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 5000,
  isFallback: true,
  locationSource: 'default'
};

/**
 * Fast HTTPS IP-based Geolocation fallback for devices/desktops without hardware GPS
 */
const fetchIPLocation = async () => {
  // Primary IP geolocation service (ipwho.is)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 5000,
        city: data.city || '',
        region: data.region || '',
        isFallback: true,
        locationSource: 'ip'
      };
    }
  } catch (e) {
    // Silent catch, proceed to secondary service
  }

  // Secondary IP geolocation service (ipapi.co)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 5000,
        city: data.city || '',
        region: data.region || '',
        isFallback: true,
        locationSource: 'ip'
      };
    }
  } catch (e) {
    // Silent catch
  }

  return null;
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
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getNewLocation = useCallback(async () => {
    setLoading(true);

    const updateLocation = (newLoc) => {
      setLocation(newLoc);
      setError(null);
      setLoading(false);
      try {
        localStorage.setItem('safeher_last_location', JSON.stringify(newLoc));
      } catch (e) {}
    };

    const handleFallback = async () => {
      // 1. Try IP Geolocation lookup
      const ipLoc = await fetchIPLocation();
      if (ipLoc) {
        updateLocation(ipLoc);
        return;
      }

      // 2. Try stored localStorage location or hardcoded DEFAULT_LOCATION
      try {
        const saved = localStorage.getItem('safeher_last_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          updateLocation({ ...parsed, isFallback: true, locationSource: parsed.locationSource || 'cache' });
          return;
        }
      } catch (e) {}

      updateLocation(DEFAULT_LOCATION);
    };

    if (!navigator.geolocation) {
      handleFallback();
      return;
    }

    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30000,
      ...optionsRef.current
    };

    const coarseAccuracyOptions = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000,
      ...optionsRef.current
    };

    // Attempt 1: High Accuracy GPS
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionDenied(false);
        updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isFallback: false,
          locationSource: 'gps'
        });
      },
      (err1) => {
        if (err1 && err1.code === err1.PERMISSION_DENIED) {
          setPermissionDenied(true);
          handleFallback();
          return;
        }

        // Attempt 2: Coarse Accuracy GPS
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissionDenied(false);
            updateLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              isFallback: false,
              locationSource: 'gps-coarse'
            });
          },
          (err2) => {
            if (err2 && err2.code === err2.PERMISSION_DENIED) {
              setPermissionDenied(true);
            }
            handleFallback();
          },
          coarseAccuracyOptions
        );
      },
      highAccuracyOptions
    );
  }, []);

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
    locationSource: location?.locationSource || 'default',
    permissionDenied,
    error,
    loading,
    refresh: getNewLocation
  };
};
