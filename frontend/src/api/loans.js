import { request } from './client';

export const loansApi = {
  list: (params) => request('/loans', { params }),
  get: (id) => request(`/loans/${id}`),
  listByCustomer: (customerId) => request(`/loans/customer/${customerId}`),
  apply: (payload) => request('/loans', { method: 'POST', body: payload }),
  approve: (id) => request(`/loans/${id}/approve`, { method: 'POST' })
};
