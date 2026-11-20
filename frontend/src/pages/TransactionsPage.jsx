import { useSearchParams } from 'react-router-dom';
import { transactionsApi } from '../api';
import { usePaginated } from '../hooks/usePaginated';
import { useLookups } from '../hooks/useLookups';
import Badge from '../components/Badge';
import DataTable, { PageHeader, Td } from '../components/DataTable';
import { Field, Select } from '../components/Field';
import { formatDateTime, formatMoney } from '../utils/format';
import { isValidObjectId } from '../utils/validation';

const LIMIT = 10;

const COLUMNS = [
  { label: 'Date & Time' },
  { label: 'Account' },
  { label: 'Type' },
  { label: 'Description' },
  { label: 'Amount', className: 'text-right' },
  { label: 'Balance After', className: 'text-right' }
];

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountId = searchParams.get('account') || '';
  const lookups = useLookups();
  const filterError = accountId && !isValidObjectId(accountId) ? 'Select a valid account filter.' : '';

  const paged = usePaginated(
    (params) => filterError
      ? Promise.resolve({ data: [], total: 0, page: 1, limit: LIMIT, totalPages: 1 })
      : accountId ? transactionsApi.listByAccount(accountId, params) : transactionsApi.list(params),
    { limit: LIMIT, deps: [accountId] }
  );
  const tablePaged = filterError ? { ...paged, data: [], error: filterError, loading: false } : paged;

  function changeAccount(value) {
    setSearchParams(value ? { account: value } : {});
    paged.setPage(1);
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Browse the ledger across all accounts or filter by a single account."
        action={
          <div className="w-64">
            <Field label="Filter by account" id="transactions-account" error={filterError}>
            <Select
              value={accountId}
              onChange={(e) => changeAccount(e.target.value)}
              onBlur={(e) => {
                if (e.target.value && !isValidObjectId(e.target.value)) e.target.setCustomValidity('Select a valid account.');
                else e.target.setCustomValidity('');
              }}
              aria-label="Filter by account"
            >
              <option value="">All accounts</option>
              {lookups.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} — {lookups.customerMap[a.customerId]?.name || a.type}
                </option>
              ))}
            </Select>
            </Field>
          </div>
        }
      />
      {lookups.error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{lookups.error}</p>}

      <DataTable
        columns={COLUMNS}
        paged={tablePaged}
        limit={LIMIT}
        emptyMessage="No transactions found."
        renderRow={(t) => (
          <tr key={t.id} className="hover:bg-slate-50/70">
            <Td>{formatDateTime(t.timestamp)}</Td>
            <Td className="font-medium text-navy-900">{lookups.accountMap[t.accountId]?.accountNumber || '—'}</Td>
            <Td>
              <Badge value={t.type} />
            </Td>
            <Td className="max-w-[18rem] truncate">{t.description}</Td>
            <Td
              className={`text-right font-semibold tabular-nums ${
                t.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {t.type === 'Credit' ? '+' : '−'}
              {formatMoney(t.amount)}
            </Td>
            <Td className="text-right tabular-nums">{formatMoney(t.balanceAfter)}</Td>
          </tr>
        )}
      />
    </>
  );
}
