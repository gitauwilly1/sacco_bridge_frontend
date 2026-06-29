import apiClient from '../../../lib/apiClient';

export const mpesaApi = {
  // Initiate STK Push (M-Pesa payment prompt)
  initiateSTKPush: (data) => apiClient.post('/payments/mpesa/stk-push/', data),
  // data: { phone_number, amount, reference, description, transaction_type }

  // List M-Pesa transactions
  getTransactions: (params) => apiClient.get('/payments/mpesa/transactions/', { params }),

  // Get a specific M-Pesa transaction
  getTransaction: (id) => apiClient.get(`/payments/mpesa/transactions/${id}/`),

  // Check STK Push status (polling)
  checkSTKStatus: (checkoutRequestId) =>
    apiClient.get(`/payments/mpesa/stk-push/${checkoutRequestId}/status/`),
};
