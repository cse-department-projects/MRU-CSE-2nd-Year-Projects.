import axiosInstance from './axios';

export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data;
};
