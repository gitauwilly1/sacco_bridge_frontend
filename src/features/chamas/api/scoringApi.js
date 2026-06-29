import apiClient from '../../../lib/apiClient';

export const scoringApi = {
  // Get my credit score
  getMyCreditScore: () => apiClient.get('/scoring/my-score/'),

  // Get underwriting decision for a specific loan
  getUnderwritingDecision: (loanId) => apiClient.get(`/scoring/underwriting/${loanId}/`),

  // Admin: Override underwriting decision
  overrideUnderwriting: (loanId, data) => apiClient.post(`/scoring/underwriting/${loanId}/override/`, data),
  // data: { decision, reason }
};
