import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads a paginated resource.
 * `fetcher` receives `{ page, limit }` and must resolve to the API response
 * shape `{ data, total, page, limit, totalPages }`. Pass `deps` for values
 * (e.g. filters) that should trigger a reload.
 */
export function usePaginated(fetcher, { limit = 8, deps = [] } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    data: [],
    meta: { page: 1, totalPages: 1, total: 0, limit },
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current({ page, limit })
      .then((result) => {
        if (cancelled) return;
        // The current page no longer exists (e.g. last row removed): step back.
        if (result.data.length === 0 && page > 1) {
          setPage(Math.max(result.totalPages, 1));
          return;
        }
        setState({
          data: result.data,
          meta: {
            page: result.page,
            totalPages: result.totalPages,
            total: result.total,
            limit: result.limit
          },
          loading: false,
          error: null
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, data: [], loading: false, error: err.message }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, reloadKey, ...deps]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, setPage, refresh };
}
