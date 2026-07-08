import apiClient from '../../../lib/apiClient';

export const supportApi = {
  getMyTickets: (params) => apiClient.get('/support/tickets/', { params }),
  createTicket: (data) => apiClient.post('/support/tickets/create/', data),
  getTicket: (id) => apiClient.get(`/support/tickets/${id}/`),
  sendMessage: (ticketId, data) => apiClient.post(`/support/tickets/${ticketId}/messages/`, data),
  getFAQ: () => apiClient.get('/chatbot/faq/'),
};
