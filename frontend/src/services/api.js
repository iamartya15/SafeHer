const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

import axios from 'axios';

const api = axios.create({
  baseURL: getBaseUrl(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  withCredentials: true, // For HTTP-only cookie transfers
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto Token Refresh on 401 Expired
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is an authentication route (login, register, forgot/reset password, email verification)
    const isAuthRoute = originalRequest.url && (
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/auth/register') ||
      originalRequest.url.includes('/api/auth/forgot-password') ||
      originalRequest.url.includes('/api/auth/reset-password') ||
      originalRequest.url.includes('/api/auth/verify-email')
    );

    // Check if error is 401, not already retried, and not an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        // Post request to refresh access token
        const res = await axios.post(
          `${getBaseUrl()}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        if (res.data.success && res.data.accessToken) {
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh token invalid or expired -> Logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
