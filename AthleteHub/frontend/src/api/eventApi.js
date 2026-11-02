import api from './axios';

export const eventApi = {
  getEvents: async (params) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  createEvent: async (data) => {
    const response = await api.post('/events', data);
    return response.data;
  },
  updateEvent: async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  startEvent: async (id) => {
    const response = await api.post(`/events/${id}/start`);
    return response.data;
  },
  endEvent: async (id) => {
    const response = await api.post(`/events/${id}/end`);
    return response.data;
  },
  startRegistration: async (id) => {
    const response = await api.post(`/events/${id}/start-registration`);
    return response.data;
  },
  endRegistration: async (id) => {
    const response = await api.post(`/events/${id}/end-registration`);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  // Athlete Event Registration
  registerForEvent: async (id, data) => {
    const response = await api.post(`/events/${id}/registrations`, data);
    return response.data;
  },
  getEventRegistrations: async (id, params) => {
    const response = await api.get(`/events/${id}/registrations`, { params });
    return response.data;
  },
  getMyEventRegistration: async (id) => {
    const response = await api.get(`/events/${id}/my-registration`);
    return response.data;
  },
  updateRegistrationStatus: async (regId, status, remarks) => {
    const response = await api.put(`/events/registrations/${regId}/status`, null, { params: { status, remarks } });
    return response.data;
  },
  withdrawEventRegistration: async (regId) => {
    const response = await api.delete(`/events/registrations/${regId}`);
    return response.data;
  },
};
