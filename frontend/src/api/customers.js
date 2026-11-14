import { request } from './client';

export const customersApi = {
  list: (params) => request('/customers', { params }),
  get: (id) => request(`/customers/${id}`),
  create: (payload) => request('/customers', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/customers/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => request(`/customers/${id}`, { method: 'DELETE' })
};
