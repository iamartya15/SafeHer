import axios from 'axios';

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
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
  (response) => {
    if (response.data && response.data.success && response.data.data !== undefined) {
      const dataPayload = response.data.data;
      if (typeof dataPayload === 'object' && dataPayload !== null && !Array.isArray(dataPayload)) {
        Object.keys(dataPayload).forEach(key => {
          if (response.data[key] === undefined) {
            response.data[key] = dataPayload[key];
          }
        });
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if this is an authentication route (login, register, forgot/reset password, email verification)
    // NOTE: originalRequest.url is RELATIVE to baseURL (e.g. '/auth/login'), NOT the full URL
    const isAuthRoute = originalRequest.url && (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/google') ||
      originalRequest.url.includes('/auth/forgot-password') ||
      originalRequest.url.includes('/auth/reset-password') ||
      originalRequest.url.includes('/auth/verify-email') ||
      originalRequest.url.includes('/auth/logout') ||
      originalRequest.url.includes('/auth/refresh-token')
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

        const resData = res.data;
        const dataPayload = resData.data;
        const success = resData.success;
        const accessToken = resData.accessToken || (dataPayload && dataPayload.accessToken);
        const refreshToken = resData.refreshToken || (dataPayload && dataPayload.refreshToken);

        if (success && accessToken) {
          localStorage.setItem('accessToken', accessToken);
          
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
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
