import apiClient from '../../../lib/apiClient';

export const adminApi = {
  // Dashboard
  getPlatformAnalytics: () => apiClient.get('/analytics/dashboard/platform/'),

  // Users
  getUsers: (params) => apiClient.get('/users/admin/manage/', { params }),
  manageUser: (userId, data) => apiClient.post(`/users/admin/manage/`, { user_id: userId, ...data }),

  // SACCOs
  getSACCOsAdmin: (params) => apiClient.get('/investments/saccos/admin/', { params }),
  verifySACCO: (id) => apiClient.post(`/investments/saccos/${id}/verify/`),
  suspendSACCO: (id, data) => apiClient.post(`/investments/saccos/${id}/suspend/`, data),
  uploadSACCOLogo: (id, formData) =>
    apiClient.post(`/investments/saccos/${id}/upload_logo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Chamas
  getChamasAdmin: (params) => apiClient.get('/chamas/admin/manage/', { params }),
  manageChama: (chamaId, data) =>
    apiClient.post('/chamas/admin/manage/', { chama_id: chamaId, ...data }),

  // Disputes
  getDisputesAdmin: (params) => apiClient.get('/transactions/disputes/', { params }),
  resolveDispute: (id, data) => apiClient.post(`/transactions/disputes/${id}/resolve/`, data),

  // Fraud
  getFraudAssessments: (params) => apiClient.get('/fraud/assessments/', { params }),
  reviewFraudAssessment: (id, data) =>
    apiClient.post(`/fraud/assessments/${id}/review/`, data),

  // Escrow
  getEscrowAccounts: (params) => apiClient.get('/escrow/held/', { params }),
  releaseEscrow: (id, data) => apiClient.post(`/escrow/accounts/${id}/release/`, data),

  // Audit
  getAuditLog: (params) => apiClient.get('/users/admin/audit/', { params }),
  getUnifiedAudit: (params) => apiClient.get('/users/admin/unified-audit/', { params }),
  getDeletionRequests: (params) => apiClient.get('/users/admin/deletion-requests/', { params }),
  reviewDeletionRequest: (id, data) =>
    apiClient.post(`/users/admin/deletion-requests/${id}/review/`, data),

  // Webhooks
  getWebhooks: (params) => apiClient.get('/webhooks/subscriptions/', { params }),
  createWebhook: (data) => apiClient.post('/webhooks/subscriptions/', data),
  updateWebhook: (id, data) => apiClient.patch(`/webhooks/subscriptions/${id}/`, data),
  deleteWebhook: (id) => apiClient.delete(`/webhooks/subscriptions/${id}/`),
  getWebhookDeliveries: (id, params) =>
    apiClient.get(`/webhooks/subscriptions/${id}/deliveries/`, { params }),
  replayWebhookDelivery: (subId, deliveryId) =>
    apiClient.post(`/webhooks/subscriptions/${subId}/deliveries/${deliveryId}/replay/`),
  regenerateWebhookSecret: (id) =>
    apiClient.post(`/webhooks/subscriptions/${id}/regenerate_secret/`),

  // Legal
  getLegalDocuments: (type, params) => apiClient.get(`/legal/admin/`, { params: { type, ...params } }),
  createLegalVersion: (data) => apiClient.post('/legal/admin/', data),
  publishLegalVersion: (id) => apiClient.post(`/legal/admin/${id}/publish/`),

  // Knowledge Base
  getKnowledgeArticles: (params) => apiClient.get('/chatbot/knowledge/', { params }),
  createKnowledgeArticle: (data) => apiClient.post('/chatbot/knowledge/', data),
  updateKnowledgeArticle: (id, data) => apiClient.patch(`/chatbot/knowledge/${id}/`, data),

  // Reports
  getReports: () => apiClient.get('/reports/'),
};