import { request } from './client';

export const accountsApi = {
  list: (params) => request('/accounts', { params }),
  get: (id) => request(`/accounts/${id}`),
  listByCustomer: (customerId) => request(`/accounts/customer/${customerId}`),
  open: (payload) => request('/accounts', { method: 'POST', body: payload }),
  deposit: (id, payload) => request(`/accounts/${id}/deposit`, { method: 'POST', body: payload }),
  withdraw: (id, payload) => request(`/accounts/${id}/withdraw`, { method: 'POST', body: payload })
};
