import apiClient from '../../../lib/apiClient';

export const legalApi = {
  getTerms: () => apiClient.get('/legal/terms/'),
  getPrivacy: () => apiClient.get('/legal/privacy/'),
  getAcceptanceStatus: () => apiClient.get('/legal/status/'),
  acceptDocument: (documentId) => apiClient.post('/legal/accept/', { document_id: documentId }),
};