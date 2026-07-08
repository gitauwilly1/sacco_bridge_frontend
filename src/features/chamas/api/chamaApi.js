import apiClient from '../../../lib/apiClient';

export const chamaApi = {
  // Chama CRUD
  getChamaDashboard: (id) => apiClient.get(`/chamas/${id}/dashboard/`),
  getChamaDetail: (id) => apiClient.get(`/chamas/${id}/`),
  createChama: (data) => apiClient.post('/chamas/', data),
  updateChama: (id, data) => apiClient.patch(`/chamas/${id}/`, data),
  deleteChama: (id) => apiClient.delete(`/chamas/${id}/`),
  
  // Members
  getMembers: (id, params) => apiClient.get(`/chamas/${id}/members/`, { params }),
  addMember: (id, data) => apiClient.post(`/chamas/${id}/members/`, data),
  updateMemberRole: (chamaId, memberId, data) => apiClient.patch(`/chamas/${chamaId}/members/${memberId}/`, data),
  removeMember: (chamaId, memberId) => apiClient.delete(`/chamas/${chamaId}/members/${memberId}/`),
  
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
  updateContribution: (chamaId, contributionId, data) => apiClient.patch(`/chamas/${chamaId}/contributions/${contributionId}/`, data),
  deleteContribution: (chamaId, contributionId) => apiClient.delete(`/chamas/${chamaId}/contributions/${contributionId}/`),
  
  // Loans
  getLoans: (id, params) => apiClient.get(`/chamas/${id}/loans/`, { params }),
  getLoan: (chamaId, loanId) => apiClient.get(`/chamas/${chamaId}/loans/${loanId}/`),
  applyLoan: (id, data) => {
    const payload = {
      principal: data.amount,
      duration_months: data.term_months,
      purpose: data.purpose,
      guarantors: data.guarantor_id ? [data.guarantor_id] : [],
    };
    return apiClient.post(`/chamas/${id}/loans/`, payload);
  },
  cancelLoan: (chamaId, loanId) => apiClient.delete(`/chamas/${chamaId}/loans/${loanId}/`),

  // Meetings
  getMeetings: (id, params) => apiClient.get(`/chamas/${id}/meetings/`, { params }),
  getMeeting: (chamaId, meetingId) => apiClient.get(`/chamas/${chamaId}/meetings/${meetingId}/`),
  createMeeting: (id, data) => apiClient.post(`/chamas/${id}/meetings/`, data),
  rsvpMeeting: (chamaId, meetingId, data) => apiClient.post(`/chamas/${chamaId}/meetings/${meetingId}/attendance/`, data),

  // Polls
  getPolls: (id, params) => apiClient.get(`/chamas/${id}/polls/`, { params }),
  getPoll: (chamaId, pollId) => apiClient.get(`/chamas/${chamaId}/polls/${pollId}/`),
  createPoll: (id, data) => apiClient.post(`/chamas/${id}/polls/`, data),
  votePoll: (chamaId, pollId, data) => apiClient.post(`/chamas/${chamaId}/polls/${pollId}/vote/`, data),
  
  // Invites
  getInviteLink: (id) => apiClient.get(`/chamas/${id}/invite_link/`),

  // Analytics
  getChamaAnalytics: (id, params) => apiClient.get(`/analytics/chama/${id}/`, { params }),
};