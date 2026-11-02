import api from './axios';

export const teamApi = {
  getTeams: async (params = {}) => {
    const response = await api.get('/teams', { params });
    return response.data?.data || [];
  },

  getTeamById: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data?.data || null;
  },

  createTeam: async (data) => {
    const response = await api.post('/teams', data);
    return response.data?.data || null;
  },

  updateTeam: async (id, data) => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data?.data || null;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  getTeamMembers: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data?.data || [];
  },

  addMember: async (teamId, data) => {
    const response = await api.post(`/teams/${teamId}/members`, data);
    return response.data?.data || null;
  },

  addMembersBatch: async (teamId, athleteIds, role = 'Player') => {
    const response = await api.post(`/teams/${teamId}/members/batch`, { athleteIds, role });
    return response.data?.data || [];
  },

  updateMember: async (teamId, athleteId, data) => {
    const response = await api.put(`/teams/${teamId}/members/${athleteId}`, data);
    return response.data?.data || null;
  },

  removeMember: async (teamId, athleteId) => {
    const response = await api.delete(`/teams/${teamId}/members/${athleteId}`);
    return response.data;
  },

  getAvailableAthletes: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/available-athletes`);
    return response.data?.data || [];
  },

  approveTeam: async (id) => {
    const response = await api.put(`/teams/${id}/approve`);
    return response.data?.data || null;
  },

  rejectTeam: async (id, reason) => {
    const response = await api.put(`/teams/${id}/reject`, { reason });
    return response.data?.data || null;
  },

  requestToJoinTeam: async (teamId, data = {}) => {
    const response = await api.post(`/teams/${teamId}/join-requests`, data);
    return response.data?.data || null;
  },

  getJoinRequests: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/join-requests`);
    return response.data?.data || [];
  },

  approveJoinRequest: async (teamId, athleteId) => {
    const response = await api.put(`/teams/${teamId}/join-requests/${athleteId}/approve`);
    return response.data?.data || null;
  },

  rejectJoinRequest: async (teamId, athleteId, reason = '') => {
    const response = await api.put(`/teams/${teamId}/join-requests/${athleteId}/reject`, { reason });
    return response.data?.data || null;
  },

  cancelJoinRequest: async (teamId, athleteId) => {
    const response = await api.delete(`/teams/${teamId}/join-requests`, {
      params: athleteId ? { athleteId } : {}
    });
    return response.data;
  },
};
