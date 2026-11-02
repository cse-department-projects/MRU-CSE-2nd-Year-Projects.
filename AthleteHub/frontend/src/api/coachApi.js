import api from './axios';

const BASE_URL = '/coaches';

export const coachApi = {
  // Create a new coach
  createCoach: async (coachData) => {
    const response = await api.post(BASE_URL, coachData);
    return response.data;
  },

  // Get a paginated list of coaches with search and filters
  getCoaches: async (params) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get a specific coach by ID
  getCoachById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Update a coach
  updateCoach: async ({ id, data }) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a coach (Soft delete)
  deleteCoach: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get Dashboard Stats for coaches
  getDashboardStats: async () => {
    const response = await api.get(`${BASE_URL}/dashboard/stats`);
    return response.data;
  },
};
