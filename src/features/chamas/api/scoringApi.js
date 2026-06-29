import apiClient from '../../../lib/apiClient';

export const scoringApi = {
  // Get my credit score
  getMyCreditScore: () => apiClient.get('/scoring/my-score/'),

  // Get underwriting decision for a loan amount
  getUnderwritingDecision: (params) => apiClient.get('/scoring/underwriting/', { params }),
  // params: { chama_id, requested_amount }

  // Admin: Override underwriting decision
  overrideUnderwriting: (data) => apiClient.post('/scoring/override/', data),
  // data: { loan_application_id, decision, reason }
};
