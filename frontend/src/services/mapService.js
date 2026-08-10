import api from './api';
import axios from 'axios';

const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await api({ url, ...options });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) throw error; // Don't retry cancelled requests
      if (i === retries) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
};

export const getSafePlaces = async (bbox, signal) => {
  return fetchWithRetry(`/map/safe-places?bbox=${bbox}`, { signal });
};

