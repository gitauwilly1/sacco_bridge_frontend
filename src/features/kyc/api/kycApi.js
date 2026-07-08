import apiClient from '../../../lib/apiClient';

export const kycApi = {
  getStatus: () => apiClient.get('/users/kyc/status/'),
  uploadDocument: (formData) =>
    apiClient.post('/users/kyc/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (docId) => apiClient.delete(`/users/kyc/documents/${docId}/`),
  submitForReview: () => apiClient.post('/users/kyc/submit/'),
};
