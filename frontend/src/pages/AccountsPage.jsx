import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../api';
import { usePaginated } from '../hooks/usePaginated';
import { useLookups } from '../hooks/useLookups';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable, { PageHeader, Td } from '../components/DataTable';
import OpenAccountModal from '../features/OpenAccountModal';
import AmountModal from '../features/AmountModal';
import { formatDate, formatMoney } from '../utils/format';

const LIMIT = 8;

const COLUMNS = [
  { label: 'Account No.' },
  { label: 'Customer' },
  { label: 'Type' },
  { label: 'Balance', className: 'text-right' },
  { label: 'Status' },
  { label: 'Opened' },
  { label: 'Actions', className: 'text-right' }
];

export default function AccountsPage() {
  const navigate = useNavigate();
  const paged = usePaginated(accountsApi.list, { limit: LIMIT });
  const lookups = useLookups();

  const [opening, setOpening] = useState(false);
  const [amountDialog, setAmountDialog] = useState(null); // { mode, account }

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Open accounts and record deposits and withdrawals."
        action={
          <Button variant="primary" icon="plus" onClick={() => setOpening(true)}>
            Open Account
          </Button>
        }
      />
      {lookups.error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{lookups.error}</p>}

      <DataTable
        columns={COLUMNS}
        paged={paged}
        limit={LIMIT}
        emptyMessage="No accounts found."
        renderRow={(a) => (
          <tr key={a.id} className="hover:bg-slate-50/70">
            <Td className="font-medium text-navy-900">{a.accountNumber}</Td>
            <Td>{lookups.customerMap[a.customerId]?.name || '—'}</Td>
            <Td>{a.type}</Td>
            <Td className="text-right font-semibold tabular-nums text-slate-900">{formatMoney(a.balance)}</Td>
            <Td>
              <Badge value={a.status} />
            </Td>
            <Td>{formatDate(a.openedAt)}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outlineSuccess"
                  onClick={() => setAmountDialog({ mode: 'deposit', account: a })}
                >
                  Deposit
                </Button>
                <Button
                  size="sm"
                  variant="outlineDanger"
                  onClick={() => setAmountDialog({ mode: 'withdraw', account: a })}
                >
                  Withdraw
                </Button>
                <Button size="sm" icon="clock" onClick={() => navigate(`/transactions?account=${a.id}`)}>
                  History
                </Button>
              </div>
            </Td>
          </tr>
        )}
      />

      {opening && (
        <OpenAccountModal
          customers={lookups.customers}
          onClose={() => setOpening(false)}
          onSaved={() => {
            setOpening(false);
            paged.refresh();
            lookups.reload();
          }}
        />
      )}

      {amountDialog && (
        <AmountModal
          mode={amountDialog.mode}
          account={amountDialog.account}
          onClose={() => setAmountDialog(null)}
          onDone={() => {
            setAmountDialog(null);
            paged.refresh();
            lookups.reload();
          }}
        />
      )}
    </>
  );
}
