import api from './axios';

export const trainingApi = {
  getTrainingSessions: async ({ 
    page = 1, pageSize = 10, search = '', organizationId = '', coachId = '', athleteId = '', 
    trainingPlanId = '', startDate = '', endDate = '', status = '', intensity = ''
  } = {}) => {
    const params = {
      page: page - 1,
      size: pageSize,
    };
    if (search) params.search = search;
    if (organizationId) params.organizationId = organizationId;
    if (coachId) params.coachId = coachId;
    if (athleteId) params.athleteId = athleteId;
    if (trainingPlanId) params.trainingPlanId = trainingPlanId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status) params.status = status;
    if (intensity) params.intensity = intensity;

    const response = await api.get('/training-sessions', { params });
    return response.data?.data || {};
  },
};
