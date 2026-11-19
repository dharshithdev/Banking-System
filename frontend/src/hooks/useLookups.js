import { useCallback, useEffect, useMemo, useState } from 'react';
import { customersApi, accountsApi } from '../api';

/**
 * Loads customers and accounts once so tables can show names and account
 * numbers instead of raw ids, and forms can offer them as select options.
 */
export function useLookups() {
  const [state, setState] = useState({ customers: [], accounts: [] });
  const [version, setVersion] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([
      customersApi.list({ page: 1, limit: 100 }),
      accountsApi.list({ page: 1, limit: 100 })
    ])
      .then(([c, a]) => {
        if (!cancelled) setState({ customers: c.data, accounts: a.data });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load customer and account options.');
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const customerMap = useMemo(
    () => Object.fromEntries(state.customers.map((c) => [c.id, c])),
    [state.customers]
  );
  const accountMap = useMemo(
    () => Object.fromEntries(state.accounts.map((a) => [a.id, a])),
    [state.accounts]
  );
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, customerMap, accountMap, reload, error };
}
