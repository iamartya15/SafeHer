import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put('/admin/users/role', { userId, role });
  return response.data;
};

export const deleteFakeReport = async (reportId) => {
  const response = await api.delete(`/admin/reports/${reportId}`);
  return response.data;
};

export const getSOSLogs = async () => {
  const response = await api.get('/admin/sos-logs');
  return response.data;
};
