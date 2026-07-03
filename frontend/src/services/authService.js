import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email?token=${token}`);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  } catch (err) {
    console.error('Logout error on backend:', err);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password?token=${token}`, { password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  if (response.data.success) {
    // Sync local storage user
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...existing, ...response.data.user }));
  }
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await api.put('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  if (response.data.success) {
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...existing, avatar: response.data.avatar }));
  }
  return response.data;
};
