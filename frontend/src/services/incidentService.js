import api from './api';

export const createIncident = async (formData) => {
  const response = await api.post('/incidents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getIncidents = async (filters = {}) => {
  const { lat, lng, distance } = filters;
  let url = '/incidents';
  
  if (lat && lng) {
    url += `?lat=${lat}&lng=${lng}`;
    if (distance) {
      url += `&distance=${distance}`;
    }
  }
  
  const response = await api.get(url);
  return response.data;
};

export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const updateIncident = async (id, formData) => {
  const response = await api.put(`/incidents/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteIncident = async (id) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};
