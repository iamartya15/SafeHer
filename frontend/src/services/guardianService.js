import api from './api';

export const addGuardian = async (guardianData) => {
  const response = await api.post('/guardians/add', guardianData);
  return response.data;
};

export const getGuardians = async () => {
  const response = await api.get('/guardians');
  return response.data;
};

export const getGuardianRequests = async () => {
  const response = await api.get('/guardians/requests');
  return response.data;
};

export const respondToRequest = async (requestId, status) => {
  const response = await api.post('/guardians/requests/respond', {
    requestId,
    status // 'approved' or 'rejected'
  });
  return response.data;
};

export const getMonitoredUsers = async () => {
  const response = await api.get('/guardians/monitored-users');
  return response.data;
};

export const removeGuardian = async (id) => {
  const response = await api.delete(`/guardians/${id}`);
  return response.data;
};
