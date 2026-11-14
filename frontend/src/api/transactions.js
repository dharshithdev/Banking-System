import { request } from './client';

export const transactionsApi = {
  list: (params) => request('/transactions', { params }),
  listByAccount: (accountId, params) => request(`/transactions/account/${accountId}`, { params })
};
