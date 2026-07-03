import api from './api';

export const sendChatMessage = async (message) => {
  const response = await api.post('/chat/message', { message });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await api.delete('/chat/history');
  return response.data;
};
export const getNotifications = async () => {
  const response = await api.get('/notifications');
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
