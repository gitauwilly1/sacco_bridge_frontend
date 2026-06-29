import apiClient from '../../../lib/apiClient';

export const chamaApi = {
  // Chama CRUD
  getChamaDashboard: (id) => apiClient.get(`/chamas/${id}/dashboard/`),
  getChamaDetail: (id) => apiClient.get(`/chamas/${id}/`),
  createChama: (data) => apiClient.post('/chamas/', data),
  updateChama: (id, data) => apiClient.patch(`/chamas/${id}/`, data),
  
  // Members
  getMembers: (id, params) => apiClient.get(`/chamas/${id}/members/`, { params }),
  
  // Contributions
  getContributions: (id, params) => apiClient.get(`/chamas/${id}/contributions/`, { params }),
  recordContribution: (id, data) => {
    const payload = {
      ...data,
      chama: id,
      member: data.member_id,
    };
    return apiClient.post(`/chamas/${id}/contributions/`, payload);
  },
  bulkRecordContributions: (id, data) => apiClient.post(`/chamas/${id}/contributions/bulk/`, data),
  
  // Loans
  getLoans: (id, params) => apiClient.get(`/chamas/${id}/loans/`, { params }),
  applyLoan: (id, data) => {
    const payload = {
      principal: data.amount,
      duration_months: data.term_months,
      purpose: data.purpose,
      guarantors: data.guarantor_id ? [data.guarantor_id] : [],
    };
    return apiClient.post(`/chamas/${id}/loans/`, payload);
  },
  
  // Meetings
  getMeetings: (id, params) => apiClient.get(`/chamas/${id}/meetings/`, { params }),
  
  // Polls
  getPolls: (id, params) => apiClient.get(`/chamas/${id}/polls/`, { params }),
  votePoll: (chamaId, pollId, data) => apiClient.post(`/chamas/${chamaId}/polls/${pollId}/vote/`, data),
  
  // Invites
  getInviteLink: (id) => apiClient.get(`/chamas/${id}/invite_link/`),
};