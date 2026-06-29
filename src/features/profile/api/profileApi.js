import apiClient from '../../../lib/apiClient';

export const profileApi = {
  // Profile
  getProfile: () => apiClient.get('/users/profile/'),
  updateProfile: (data) => apiClient.patch('/users/profile/', data),
  getDetailedProfile: () => apiClient.get('/users/profile/detail/'),
  updateDetailedProfile: (data) => apiClient.patch('/users/profile/detail/', data),
  uploadProfilePicture: (formData) =>
    apiClient.post('/users/profile/picture/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeProfilePicture: () => apiClient.delete('/users/profile/picture/'),

  // Security
  changePassword: (data) => apiClient.post('/auth/password/change/', data),
  setup2FA: () => apiClient.get('/auth/2fa/setup/'),
  enable2FA: (data) => apiClient.post('/auth/2fa/setup/', data),
  disable2FA: (data) => apiClient.delete('/auth/2fa/setup/', { data }),

  // Sessions
  getSessions: () => apiClient.get('/users/sessions/'),
  terminateSession: (sessionId) => apiClient.delete(`/users/sessions/${sessionId}/`),

  // Notifications
  getNotificationPreferences: () => apiClient.get('/notifications/preferences/'),
  updateNotificationPreferences: (data) => apiClient.post('/notifications/preferences/', data),

  // Limits & Data
  getTransactionLimits: () => apiClient.get('/users/limits/'),
  exportData: () => apiClient.get('/users/export-data/'),

  // Account actions
  deactivateAccount: (data) => apiClient.post('/users/deactivate/', data),
  requestAccountDeletion: (data) => apiClient.post('/users/delete-account/', data),
  cancelAccountDeletion: () => apiClient.delete('/users/delete-account/'),

  // Verification
  resendVerification: (contact, method) =>
    apiClient.post('/auth/verify/resend/', { contact, method }),

  // Scoring
  getMyScore: () => apiClient.get('/scoring/my-score/'),

  // Digital Signatures
  requestSignature: (data) => apiClient.post('/legal/sign/request/', data),
  confirmSignature: (data) => apiClient.post('/legal/sign/confirm/', data),
  verifySignature: (hash) => apiClient.get(`/legal/sign/verify/${hash}/`),
};