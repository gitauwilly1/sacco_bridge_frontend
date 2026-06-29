import apiClient from '../../../lib/apiClient';

export const dashboardApi = {
  getUserDashboard: () => apiClient.get('/analytics/dashboard/user/'),
  getDashboardSummary: () => apiClient.get('/dashboard/summary/'),
  getRecentActivity: (params) => apiClient.get('/activity/', { params }),
  getNotifications: () => apiClient.get('/notifications/unread_count/'),
  getPortfolioSummary: () => apiClient.get('/investments/holdings/'),
  getMyChamas: () => apiClient.get('/chamas/'),
  getChamaAnalytics: (chamaId, params) => apiClient.get(`/analytics/chama/${chamaId}/`, { params }),
  getLoginHistory: (params) => apiClient.get('/users/login-history/', { params }),
};