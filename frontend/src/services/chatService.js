import api from './api';

export const sendChatMessage = async (message, locationContext = '') => {
  try {
    const payload = { message };
    if (locationContext) {
      payload.locationContext = locationContext;
    }
    const response = await api.post('/chat/message', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await api.delete('/chat/history');
  return response.data;
};
export const getNotifications = async (signal) => {
  const response = await api.get(`/notifications?_t=${Date.now()}`, { signal });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
