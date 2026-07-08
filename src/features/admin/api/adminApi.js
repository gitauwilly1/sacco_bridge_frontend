import apiClient from '../../../lib/apiClient';

export const adminApi = {
  // Dashboard
  getPlatformAnalytics: () => apiClient.get('/analytics/dashboard/platform/'),

  // Users
  getUsers: (params) => apiClient.get('/users/admin/manage/', { params }),
  manageUser: (userId, data) => apiClient.post(`/users/admin/manage/`, { user_id: userId, ...data }),
  bulkManageUsers: (ids, action) =>
    Promise.all(ids.map((id) => apiClient.post('/users/admin/manage/', { user_id: id, action }))),

  // SACCOs
  getSACCOsAdmin: (params) => apiClient.get('/investments/admin/saccos/', { params }),
  verifySACCO: (id) => apiClient.post(`/investments/admin/saccos/${id}/verify/`),
  suspendSACCO: (id, data) => apiClient.post(`/investments/admin/saccos/${id}/suspend/`, data),
  reactivateSACCO: (id) => apiClient.post(`/investments/admin/saccos/${id}/reactivate/`),
  softDeleteSACCO: (id) => apiClient.delete(`/investments/admin/saccos/${id}/`),
  uploadSACCOLogo: (id, formData) =>
    apiClient.post(`/investments/admin/saccos/${id}/upload_logo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  bulkSuspendsSACCOS: (ids, reason) =>
    Promise.all(ids.map((id) => apiClient.post(`/investments/admin/saccos/${id}/suspend/`, { reason }))),
  bulkReactivateSACCOS: (ids) =>
    Promise.all(ids.map((id) => apiClient.post(`/investments/admin/saccos/${id}/reactivate/`))),

  // Chamas
  getChamasAdmin: (params) => apiClient.get('/chamas/admin/manage/', { params }),
  manageChama: (chamaId, data) =>
    apiClient.post('/chamas/admin/manage/', { chama_id: chamaId, ...data }),
  bulkManageChamas: (ids, action) =>
    Promise.all(ids.map((chamaId) => apiClient.post('/chamas/admin/manage/', { chama_id: chamaId, action }))),

  // Disputes
  getDisputesAdmin: (params) => apiClient.get('/transactions/disputes/', { params }),
  resolveDispute: (id, data) => apiClient.post(`/transactions/disputes/${id}/resolve/`, data),
  bulkResolveDisputes: (ids, data) =>
    Promise.all(ids.map((id) => apiClient.post(`/transactions/disputes/${id}/resolve/`, data))),

  // Fraud
  getFraudAssessments: (params) => apiClient.get('/fraud/assessments/', { params }),
  reviewFraudAssessment: (id, data) =>
    apiClient.post(`/fraud/assessments/${id}/review/`, data),
  bulkReviewFraud: (ids, action) =>
    Promise.all(ids.map((id) => apiClient.post(`/fraud/assessments/${id}/review/`, { action }))),

  // Escrow
  getEscrowAccounts: (params) => apiClient.get('/escrow/held/', { params }),
  releaseEscrow: (id, data) => apiClient.post(`/escrow/accounts/${id}/release/`, data),

  // Audit
  getAuditLog: (params) => apiClient.get('/users/admin/audit/', { params }),
  getUnifiedAudit: (params) => apiClient.get('/users/admin/unified-audit/', { params, responseType: 'blob' }),
  getDeletionRequests: (params) => apiClient.get('/users/admin/deletion-requests/', { params }),
  getDeletionRequestDetail: (id) => apiClient.get(`/users/admin/deletion-requests/${id}/`),
  reviewDeletionRequest: (id, data) =>
    apiClient.post(`/users/admin/deletion-requests/${id}/review/`, data),
  bulkReviewDeletionRequests: (ids, status, notes) =>
    Promise.all(ids.map((id) =>
      apiClient.post(`/users/admin/deletion-requests/${id}/review/`, { status, review_notes: notes })
    )),

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

  // Overview & Health
  getAdminOverview: () => apiClient.get('/analytics/admin/overview/'),
  getAdminHealth: () => apiClient.get('/analytics/admin/health/'),
  getAdminVolume: (params) => apiClient.get('/analytics/admin/volume/', { params }),
  getAdminSettlements: (params) => apiClient.get('/analytics/admin/settlements/', { params }),
  getAdminExport: (params) => apiClient.get('/analytics/admin/export/', { params, responseType: 'blob' }),
  refreshAnalytics: () => apiClient.post('/analytics/refresh/'),

  // Admin Notification Summary
  getAdminNotificationSummary: () => apiClient.get('/notifications/admin/summary/'),

  // Admin Approval Workflow
  getApprovals: (params) => apiClient.get('/admin/approvals/', { params }),
  createApproval: (data) => apiClient.post('/admin/approvals/', data),
  reviewApproval: (id, action, notes) =>
    apiClient.post(`/admin/approvals/${id}/review/`, { action, notes }),

  // Reports
  getReports: () => apiClient.get('/reports/'),
  createReport: (data) => apiClient.post('/reports/', data),
  getReportStatus: (id) => apiClient.get(`/reports/${id}/status/`),
  downloadReport: (id) => apiClient.get(`/reports/${id}/download/`, { responseType: 'blob' }),
};