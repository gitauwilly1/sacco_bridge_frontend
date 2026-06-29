import apiClient from '../../../lib/apiClient';

export const notificationApi = {
  getNotifications: (params) => apiClient.get('/notifications/', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread_count/'),
  markAsRead: (id) => apiClient.post(`/notifications/${id}/mark_read/`),
  markAllAsRead: () => apiClient.post('/notifications/mark_all_read/'),
  getPreferences: () => apiClient.get('/notifications/preferences/'),
  updatePreferences: (data) => apiClient.post('/notifications/preferences/', data),
  registerDevice: (data) => apiClient.post('/notifications/devices/', data),
};