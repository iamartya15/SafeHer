const axios = require('axios');

// Simple memory cache
const cache = {
  gdacs: { data: null, timestamp: 0 },
  usgs: { data: null, timestamp: 0 },
  safePlaces: {}, // Keyed by bbox
  firms: {},      // Keyed by location/bbox
  weather: {}     // Keyed by lat_lon
};

const CACHE_DURATIONS = {
  gdacs: 5 * 60 * 1000,       // 5 mins
  usgs: 5 * 60 * 1000,        // 5 mins
  safePlaces: 30 * 60 * 1000, // 30 mins
  firms: 10 * 60 * 1000,      // 10 mins
  weather: 10 * 60 * 1000     // 10 mins
};

// Generic fetch with timeout and retries
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios({
        url,
        timeout: 10000,
        ...options,
        headers: {
          'User-Agent': 'SafeHerAI/1.0 (amartyakushwaha30@gmail.com)',
          ...(options.headers || {})
        }
      });
      return response.data;
    } catch (error) {
      if (i === retries) throw error;
      // Exponential backoff
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
};

/**
 * @route GET /api/map/gdacs
 */
exports.getGdacsData = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cache.gdacs.data && now - cache.gdacs.timestamp < CACHE_DURATIONS.gdacs) {
      return res.status(200).json({ success: true, cached: true, data: cache.gdacs.data });
    }

    const data = await fetchWithRetry('https://www.gdacs.org/datareport/resources/JRC/gdacs_geojson.json');
    cache.gdacs = { data, timestamp: now };
    
    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    console.error('GDACS Fetch Error:', error.message);
    if (cache.gdacs.data) {
      return res.status(200).json({ success: true, cached: true, stale: true, data: cache.gdacs.data });
    }
    res.status(502).json({ success: false, message: 'Failed to fetch GDACS data' });
  }
};

/**
 * @route GET /api/map/usgs
 */
exports.getUsgsData = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cache.usgs.data && now - cache.usgs.timestamp < CACHE_DURATIONS.usgs) {
      return res.status(200).json({ success: true, cached: true, data: cache.usgs.data });
    }

    const data = await fetchWithRetry('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
    cache.usgs = { data, timestamp: now };
    
    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    console.error('USGS Fetch Error:', error.message);
    if (cache.usgs.data) {
      return res.status(200).json({ success: true, cached: true, stale: true, data: cache.usgs.data });
    }
    res.status(502).json({ success: false, message: 'Failed to fetch USGS data' });
  }
};

/**
 * @route GET /api/map/safe-places
 * @query bbox=minLon,minLat,maxLon,maxLat
 */
exports.getSafePlaces = async (req, res, next) => {
  try {
    const { bbox } = req.query;
    if (!bbox) return res.status(400).json({ success: false, message: 'bbox parameter required' });

    const now = Date.now();
    if (cache.safePlaces[bbox] && now - cache.safePlaces[bbox].timestamp < CACHE_DURATIONS.safePlaces) {
      return res.status(200).json({ success: true, cached: true, data: cache.safePlaces[bbox].data });
    }

    const [s, w, n, e] = bbox.split(',').map(Number);
    // Overpass takes (south, west, north, east)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](${s},${w},${n},${e});
        node["amenity"="hospital"](${s},${w},${n},${e});
        node["amenity"="pharmacy"](${s},${w},${n},${e});
        node["amenity"="fire_station"](${s},${w},${n},${e});
        node["amenity"="fuel"](${s},${w},${n},${e});
      );
      out body;
    `;

    const data = await fetchWithRetry('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `data=${encodeURIComponent(overpassQuery)}`
    });

    cache.safePlaces[bbox] = { data, timestamp: now };
    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    console.error('Overpass Fetch Error:', error.message);
    const { bbox } = req.query;
    if (cache.safePlaces[bbox]) {
      return res.status(200).json({ success: true, cached: true, stale: true, data: cache.safePlaces[bbox].data });
    }
    res.status(502).json({ success: false, message: 'Failed to fetch safe places from OSM' });
  }
};

/**
 * @route GET /api/map/firms
 * @query bbox=minLon,minLat,maxLon,maxLat
 */
exports.getFirmsData = async (req, res, next) => {
  try {
    const apiKey = process.env.NASA_FIRMS_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: false, message: 'API key not configured.' });
    }

    const { bbox } = req.query;
    if (!bbox) return res.status(400).json({ success: false, message: 'bbox parameter required' });

    const now = Date.now();
    if (cache.firms[bbox] && now - cache.firms[bbox].timestamp < CACHE_DURATIONS.firms) {
      return res.status(200).json({ success: true, cached: true, data: cache.firms[bbox].data });
    }

    // NASA FIRMS API expects MAP_KEY, SOURCE, AREA (bbox), DAY_RANGE
    // Example: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/VIIRS_SNPP_NRT/[BBOX]/1
    const data = await fetchWithRetry(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${bbox}/1`);
    
    cache.firms[bbox] = { data, timestamp: now };
    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    console.error('NASA FIRMS Fetch Error:', error.message);
    const { bbox } = req.query;
    if (cache.firms[bbox]) {
      return res.status(200).json({ success: true, cached: true, stale: true, data: cache.firms[bbox].data });
    }
    res.status(502).json({ success: false, message: 'Failed to fetch NASA FIRMS data' });
  }
};

/**
 * @route GET /api/map/weather
 * @query lat=latitude&lon=longitude
 */
exports.getWeatherData = async (req, res, next) => {
  try {
    const apiKey = process.env.OPENWEATHER_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: false, message: 'API key not configured.' });
    }

    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon parameters required' });

    const cacheKey = `${lat}_${lon}`;
    const now = Date.now();
    if (cache.weather[cacheKey] && now - cache.weather[cacheKey].timestamp < CACHE_DURATIONS.weather) {
      return res.status(200).json({ success: true, cached: true, data: cache.weather[cacheKey].data });
    }

    const data = await fetchWithRetry(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    
    cache.weather[cacheKey] = { data, timestamp: now };
    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    console.error('OpenWeather Fetch Error:', error.message);
    const { lat, lon } = req.query;
    const cacheKey = `${lat}_${lon}`;
    if (cache.weather[cacheKey]) {
      return res.status(200).json({ success: true, cached: true, stale: true, data: cache.weather[cacheKey].data });
    }
    res.status(502).json({ success: false, message: 'Failed to fetch weather data' });
  }
};
