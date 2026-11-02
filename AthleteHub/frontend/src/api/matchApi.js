import api from './axios';

export const matchApi = {
  getMatches: async (params) => {
    const response = await api.get('/matches', { params });
    return response.data;
  },
  getMatchById: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
  createMatch: async (data) => {
    const response = await api.post('/matches', data);
    return response.data;
  },
  updateMatch: async (id, data) => {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
  },
  getMatchResults: async (id) => {
    const response = await api.get(`/matches/${id}/results`);
    return response.data;
  },
  getMatchResultsByAthlete: async (athleteId) => {
    const response = await api.get(`/matches/results/athlete/${athleteId}`);
    return response.data;
  },
  addMatchResult: async (id, data) => {
    const response = await api.post(`/matches/${id}/results`, data);
    return response.data;
  },
  updateMatchResult: async (resultId, data) => {
    const response = await api.put(`/matches/results/${resultId}`, data);
    return response.data;
  },
  deleteMatch: async (id) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  },
  deleteMatchResult: async (resultId) => {
    const response = await api.delete(`/matches/results/${resultId}`);
    return response.data;
  },
};
