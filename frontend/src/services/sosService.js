import api from './api';

export const triggerSOS = async (sosData) => {
  const response = await api.post('/sos/trigger', sosData);
  return response.data;
};

export const resolveSOS = async (id) => {
  const response = await api.put(`/sos/resolve/${id}`);
  return response.data;
};

export const getActiveSOS = async () => {
  const response = await api.get('/sos/active');
  return response.data;
};

export const getSOSHistory = async () => {
  const response = await api.get('/sos/history');
  return response.data;
};
