import apiClient from '../../../lib/apiClient';

export const transactionApi = {
  // Settlements
  getMySettlements: (params) => apiClient.get('/transactions/settlements/', { params }),
  getSettlementDetail: (id) => apiClient.get(`/transactions/settlements/${id}/`),
  getSettlementEvents: (id) => apiClient.get(`/transactions/settlements/${id}/events/`),
  getSettlementTimeline: (id) => apiClient.get(`/transactions/settlements/${id}/timeline/`),
  getLedgerEntry: (id) => apiClient.get(`/transactions/settlements/${id}/ledger/`),
  getLedgerEntries: (params) => apiClient.get('/transactions/ledger/', { params }),
  cancelSettlement: (id) => apiClient.post(`/transactions/settlements/${id}/cancel/`),
  retrySettlement: (id) => apiClient.post(`/transactions/settlements/${id}/retry/`),
  getSettlementSummary: () => apiClient.get('/transactions/settlements/summary/'),

  // Disputes
  raiseDispute: (id, data) => apiClient.post(`/transactions/settlements/${id}/dispute/`, data),
  getMyDisputes: () => apiClient.get('/transactions/disputes/mine/'),
  getDisputeDetail: (id) => apiClient.get(`/transactions/disputes/${id}/`),

  // Validation
  validateTransaction: (data) =>
    apiClient.post('/transactions/settlements/validate_transaction/', data),
};