import apiClient from '../../../lib/apiClient';

export const chamaApi = {
  getChamaDashboard: (id) => apiClient.get(`/chamas/${id}/dashboard/`),
  getChamaDetail: (id) => apiClient.get(`/chamas/${id}/`),
  getMembers: (id, params) => apiClient.get(`/chamas/${id}/members/`, { params }),
  getContributions: (id, params) => apiClient.get(`/chamas/${id}/contributions/`, { params }),
  getLoans: (id, params) => apiClient.get(`/chamas/${id}/loans/`, { params }),
  getMeetings: (id, params) => apiClient.get(`/chamas/${id}/meetings/`, { params }),
  getPolls: (id) => apiClient.get(`/chamas/${id}/polls/`),
  recordContribution: (id, data) => apiClient.post(`/chamas/${id}/contributions/`, data),
  applyLoan: (id, data) => apiClient.post(`/chamas/${id}/loans/`, data),
  votePoll: (chamaId, pollId, data) => apiClient.post(`/chamas/${chamaId}/polls/${pollId}/vote/`, data),
  getInviteLink: (id) => apiClient.get(`/chamas/${id}/invite_link/`),
};