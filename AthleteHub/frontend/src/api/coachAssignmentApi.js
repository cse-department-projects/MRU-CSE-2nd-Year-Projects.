import api from './axios';

export const coachAssignmentApi = {
  createAssignment: async (data) => {
    const response = await api.post('/coach-assignments', data);
    return response.data;
  },

  getAssignments: async (params) => {
    const response = await api.get('/coach-assignments', { params });
    return response.data;
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/coach-assignments/${id}`);
    return response.data;
  },

  updateAssignment: async ({ id, data }) => {
    const response = await api.put(`/coach-assignments/${id}`, data);
    return response.data;
  },

  cancelAssignment: async (id) => {
    const response = await api.delete(`/coach-assignments/${id}`);
    return response.data;
  },

  getByCoach: async (coachId) => {
    const response = await api.get(`/coach-assignments/by-coach/${coachId}`);
    return response.data;
  },

  getByAthlete: async (athleteId) => {
    const response = await api.get(`/coach-assignments/by-athlete/${athleteId}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/coach-assignments/dashboard/stats');
    return response.data;
  },

  getCandidates: async (coachId) => {
    const response = await api.get('/coach-assignments/candidates', { params: { coachId } });
    return response.data;
  },

  createBulkAssignments: async (data) => {
    const response = await api.post('/coach-assignments/bulk', data);
    return response.data;
  }
};
