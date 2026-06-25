import apiClient from '../../../lib/apiClient';

export const receiptApi = {
  getReceiptDetail: (id) => apiClient.get(`/receipts/${id}/`),
  downloadReceipt: (id) =>
    apiClient.get(`/receipts/${id}/download/`, { responseType: 'blob' }),
};
