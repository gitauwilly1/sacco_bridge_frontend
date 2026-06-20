import apiClient from '../../../lib/apiClient';

export const chatbotApi = {
  getSessions: (params) => apiClient.get('/chatbot/sessions/', { params }),
  createSession: (data) => apiClient.post('/chatbot/sessions/', data),
  getMessages: (sessionId, params) =>
    apiClient.get(`/chatbot/sessions/${sessionId}/messages/`, { params }),
  sendMessage: (sessionId, data) =>
    apiClient.post(`/chatbot/sessions/${sessionId}/send_message/`, data),
  setContext: (data) => apiClient.post('/chatbot/context/', data),
  deleteSession: (sessionId) =>
    apiClient.delete(`/chatbot/sessions/${sessionId}/`),
};