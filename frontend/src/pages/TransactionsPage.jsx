import { useSearchParams } from 'react-router-dom';
import { transactionsApi } from '../api';
import { usePaginated } from '../hooks/usePaginated';
import { useLookups } from '../hooks/useLookups';
import Badge from '../components/Badge';
import DataTable, { PageHeader, Td } from '../components/DataTable';
import { Select } from '../components/Field';
import { formatDateTime, formatMoney } from '../utils/format';

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

  const paged = usePaginated(
    (params) =>
      accountId ? transactionsApi.listByAccount(accountId, params) : transactionsApi.list(params),
    { limit: LIMIT, deps: [accountId] }
  );

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
            <Select
              value={accountId}
              onChange={(e) => changeAccount(e.target.value)}
              aria-label="Filter by account"
            >
              <option value="">All accounts</option>
              {lookups.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} — {lookups.customerMap[a.customerId]?.name || a.type}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <DataTable
        columns={COLUMNS}
        paged={paged}
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
