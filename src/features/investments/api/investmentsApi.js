import apiClient from '../../../lib/apiClient';

export const investmentsApi = {
  // SACCOs
  getSACCOs: (params) => apiClient.get('/investments/saccos/', { params }),
  getSACCODetail: (id) => apiClient.get(`/investments/saccos/${id}/`),
  getShareClasses: (saccoId, params) =>
    apiClient.get(`/investments/saccos/${saccoId}/share_classes/`, { params }),

  // Holdings
  getMyHoldings: (params) => apiClient.get('/investments/holdings/', { params }),
  getConcentrationCheck: () => apiClient.get('/investments/holdings/concentration_check/'),

  // Liquidity Requests
  getMyRequests: (params) => apiClient.get('/investments/requests/', { params }),
  createRequest: (data) => apiClient.post('/investments/requests/', data),
  updateRequest: (id, data) => apiClient.patch(`/investments/requests/${id}/`, data),
  cancelRequest: (id) => apiClient.post(`/investments/requests/${id}/cancel/`),

  // Opportunities (same-SACCO)
  getOpportunities: (params) => apiClient.get('/investments/opportunities/', { params }),
  expressInterest: (id, data) =>
    apiClient.post(`/investments/opportunities/${id}/express_interest/`, data),

  // Connections & Offers
  getMyConnections: (params) => apiClient.get('/investments/connections/', { params }),
  getConnectionDetail: (id) => apiClient.get(`/investments/connections/${id}/`),
  makeOffer: (connectionId, data) =>
    apiClient.post(`/investments/connections/${connectionId}/make_offer/`, data),
  acceptOffer: (connectionId, offerId) =>
    apiClient.post(`/investments/connections/${connectionId}/offers/${offerId}/accept/`),
  declineOffer: (connectionId, offerId) =>
    apiClient.post(`/investments/connections/${connectionId}/offers/${offerId}/decline/`),
  counterOffer: (connectionId, offerId, data) =>
    apiClient.post(`/investments/connections/${connectionId}/offers/${offerId}/counter/`, data),

  // Settlements
  getMySettlements: (params) => apiClient.get('/transactions/settlements/', { params }),
  getSettlementDetail: (id) => apiClient.get(`/transactions/settlements/${id}/`),
  getSettlementTimeline: (id) => apiClient.get(`/transactions/settlements/${id}/timeline/`),
};