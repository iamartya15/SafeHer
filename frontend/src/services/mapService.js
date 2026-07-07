import axios from 'axios';

const BASE_URL = '/api/map';

const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios({ url, ...options });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) throw error; // Don't retry cancelled requests
      if (i === retries) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
};

export const getGdacs = async (signal) => {
  return fetchWithRetry(`${BASE_URL}/gdacs`, { signal });
};

export const getUsgs = async (signal) => {
  return fetchWithRetry(`${BASE_URL}/usgs`, { signal });
};

export const getSafePlaces = async (bbox, signal) => {
  return fetchWithRetry(`${BASE_URL}/safe-places?bbox=${bbox}`, { signal });
};

export const getFirms = async (bbox, signal) => {
  return fetchWithRetry(`${BASE_URL}/firms?bbox=${bbox}`, { signal });
};

export const getWeather = async (lat, lon, signal) => {
  return fetchWithRetry(`${BASE_URL}/weather?lat=${lat}&lon=${lon}`, { signal });
};
