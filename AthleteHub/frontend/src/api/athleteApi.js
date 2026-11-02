import api from './axios';

export const athleteApi = {
  getAthletes: async ({ 
    page = 1, pageSize = 10, search = '', sportId = '', status = '',
    gender = '', minAge = '', maxAge = '', 
    minHeight = '', maxHeight = '', minWeight = '', maxWeight = '', medicalStatus = '',
    forSquad = false, forComparison = false
  } = {}) => {
    const params = {
      page,
      page_size: pageSize,
    };
    if (forSquad) params.forSquad = true;
    if (forComparison) params.forComparison = true;
    if (search) params.search = search;
    if (sportId && sportId !== 'all') params.sport_id = sportId;
    if (status && status !== 'all') params.status = status;
    if (gender && gender !== 'all') params.gender = gender;
    if (medicalStatus && medicalStatus !== 'all') params.medicalStatus = medicalStatus;
    if (minAge) params.minAge = minAge;
    if (maxAge) params.maxAge = maxAge;
    if (minHeight) params.minHeight = minHeight;
    if (maxHeight) params.maxHeight = maxHeight;
    if (minWeight) params.minWeight = minWeight;
    if (maxWeight) params.maxWeight = maxWeight;

    const response = await api.get('/athletes', { params });
    // Return the whole object to access data and pagination
    return response.data || {};
  },
  
  getAthleteById: async (id) => {
    const response = await api.get(`/athletes/${id}`);
    return response.data?.data || response.data;
  },
  
  createAthlete: async (athleteData) => {
    const response = await api.post('/athletes', athleteData);
    return response.data?.data || response.data;
  },
  
  updateAthlete: async (id, athleteData) => {
    const response = await api.put(`/athletes/${id}`, athleteData);
    return response.data?.data || response.data;
  },
  
  deleteAthlete: async (id) => {
    const response = await api.delete(`/athletes/${id}`);
    return response.data?.data || response.data;
  }
};
