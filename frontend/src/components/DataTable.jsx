import Icon from './Icon';
import Pagination from './Pagination';

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-3">{action}</div>}
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 ${className}`}>{children}</td>;
}

function SkeletonRows({ columns }) {
  return Array.from({ length: 5 }, (_, row) => (
    <tr key={row}>
      {Array.from({ length: columns }, (_, col) => (
        <td key={col} className="px-4 py-4">
          <div className="h-4 animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}

/**
 * Card-wrapped table with loading, error and empty states plus pagination.
 * `paged` is the object returned from usePaginated.
 */
export default function DataTable({ columns, paged, emptyMessage, renderRow, limit }) {
  const { data, meta, loading, error, setPage } = paged;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <Th key={col.key || col.label} className={col.className}>
                  {col.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && data.length === 0 ? (
              <SkeletonRows columns={columns.length} />
            ) : (
              data.map(renderRow)
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
          <Icon name="warning" className="h-4 w-4" />
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center text-slate-500">
          <Icon name="inbox" className="h-10 w-10 text-slate-300" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
