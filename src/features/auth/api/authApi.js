import apiClient from '../../../lib/apiClient';

export const authApi = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  verify2FA: (data) => apiClient.post('/auth/2fa/verify/', data),
  googleAuth: (data) => apiClient.post('/auth/google/', data),
  verifyEmail: (data) => apiClient.post('/auth/verify/email/', data),
  verifyPhone: (data) => apiClient.post('/auth/verify/phone/', data),
  resendCode: (data) => apiClient.post('/auth/verify/resend/', data),
  requestPasswordReset: (data) => apiClient.post('/auth/password/reset/', data),
  confirmPasswordReset: (data) => apiClient.post('/auth/password/reset/confirm/', data),
  checkAvailability: (params) => apiClient.get('/auth/check-availability/', { params }),
  checkPasswordStrength: (data) => apiClient.post('/auth/password-strength/', data),
};