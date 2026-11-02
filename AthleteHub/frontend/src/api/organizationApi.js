import api from './axios';

const BASE_URL = '/organizations';

export const organizationApi = {
  getOrganizations: async (params) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },
  getOrganizationById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  createOrganization: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },
  updateOrganization: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  deleteOrganization: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  getOrganizationAthletes: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/athletes`);
    return response.data;
  },
  getOrganizationAdmin: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/admin`);
    return response.data;
  },
  assignOrganizationAdmin: async (id, data) => {
    const response = await api.post(`${BASE_URL}/${id}/admin`, data);
    return response.data;
  },
  getUnassignedAdmins: async () => {
    const response = await api.get(`${BASE_URL}/unassigned-admins`);
    return response.data;
  },
  getOrganizationCoaches: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/coaches`);
    return response.data;
  },
  getOrganizationTypes: async () => {
    const response = await api.get('/organization-types');
    return response.data;
  },
  getOverviewMatrix: async () => {
    const response = await api.get(`${BASE_URL}/overview-matrix`);
    return response.data;
  },
  allocateAthletes: async (data) => {
    const response = await api.post('/data-acquisition/allocate', data);
    return response.data;
  },
  getPoolFilters: async () => {
    const response = await api.get('/data-acquisition/pool-filters');
    return response.data;
  },
  getUnassignedAthletes: async (params) => {
    const response = await api.get('/data-acquisition/unassigned-athletes', { params });
    return response.data;
  },
  getAvailableOrganizations: async () => {
    const response = await api.get('/organization-requests/available-organizations');
    return response.data;
  },
  submitCoachJoinRequest: async (data) => {
    const response = await api.post('/organization-requests/coach', data);
    return response.data;
  },
  submitAthleteJoinRequest: async (data) => {
    const response = await api.post('/organization-requests/athlete', data);
    return response.data;
  },
  joinByOrganizationCode: async (organizationCode) => {
    const response = await api.post('/organization-requests/join-by-code', { organizationCode });
    return response.data;
  },
  getOrgCoachesForJoin: async (organizationId, sportId) => {
    const response = await api.get('/organization-requests/organization-coaches', {
      params: { organizationId, sportId }
    });
    return response.data;
  },
  getMyJoinRequests: async () => {
    const response = await api.get('/organization-requests/my');
    return response.data;
  },
  getMyActiveRequest: async () => {
    const response = await api.get('/organization-requests/my-active');
    return response.data;
  },
  cancelJoinRequest: async (id) => {
    const response = await api.delete(`/organization-requests/${id}`);
    return response.data;
  },
  getOrgJoinRequests: async (params) => {
    const response = await api.get('/organization-requests/organization', { params });
    return response.data;
  },
  approveJoinRequest: async (id) => {
    const response = await api.post(`/organization-requests/${id}/approve`);
    return response.data;
  },
  rejectJoinRequest: async (id, data) => {
    const response = await api.post(`/organization-requests/${id}/reject`, data);
    return response.data;
  }
};
