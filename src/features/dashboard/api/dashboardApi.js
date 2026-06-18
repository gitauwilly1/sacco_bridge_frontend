import apiClient from '../../../lib/apiClient';

export const dashboardApi = {
  getUserDashboard: () => apiClient.get('/analytics/dashboard/user/'),
  getRecentActivity: (params) => apiClient.get('/activity/', { params }),
  getNotifications: () => apiClient.get('/notifications/unread_count/'),
  getPortfolioSummary: () => apiClient.get('/investments/holdings/'),
  getMyChamas: () => apiClient.get('/chamas/'),
};