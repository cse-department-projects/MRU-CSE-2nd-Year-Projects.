import api from './axios';

export const referenceApi = {
  getSports: async () => {
    const response = await api.get('/sports');
    return response.data?.data || response.data;
  },
  
  getOrganizations: async () => {
    const response = await api.get('/organizations');
    return response.data?.data || response.data;
  }
};
