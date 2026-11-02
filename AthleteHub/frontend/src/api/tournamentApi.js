import api from './axios';

export const tournamentApi = {
  getTournaments: async (params) => {
    const response = await api.get('/tournaments', { params });
    return response.data;
  },
  getTournamentById: async (id) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },
  createTournament: async (data) => {
    const response = await api.post('/tournaments', data);
    return response.data;
  },
  updateTournament: async (id, data) => {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },
  getRegistrations: async (id, params) => {
    const response = await api.get(`/tournaments/${id}/registrations`, { params });
    return response.data;
  },
  registerAthlete: async (id, data) => {
    const response = await api.post(`/tournaments/${id}/registrations`, data);
    return response.data;
  },
  updateRegistrationStatus: async (regId, status, remarks) => {
    const response = await api.put(`/tournaments/registrations/${regId}/status`, null, { params: { status, remarks } });
    return response.data;
  },
  deleteTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },
  deleteRegistration: async (regId) => {
    const response = await api.delete(`/tournaments/registrations/${regId}`);
    return response.data;
  },
  generateBracket: async (id) => {
    const response = await api.post(`/tournaments/${id}/generate-bracket`);
    return response.data;
  },
  getBracket: async (id) => {
    const response = await api.get(`/tournaments/${id}/bracket`);
    return response.data;
  },
  // Tournament Teams
  getTournamentTeams: async (id) => {
    const response = await api.get(`/tournaments/${id}/teams`);
    return response.data;
  },
  addTeamToTournament: async (id, data) => {
    const response = await api.post(`/tournaments/${id}/teams`, data);
    return response.data;
  },
  removeTeamFromTournament: async (id, teamId) => {
    const response = await api.delete(`/tournaments/${id}/teams/${teamId}`);
    return response.data;
  },
};
