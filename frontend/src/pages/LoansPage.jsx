import { useState } from 'react';
import { loansApi } from '../api';
import { usePaginated } from '../hooks/usePaginated';
import { useLookups } from '../hooks/useLookups';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { PageHeader, Td } from '../components/DataTable';
import { useToast } from '../components/Toast';
import ApplyLoanModal from '../features/ApplyLoanModal';
import { formatMoney } from '../utils/format';

const LIMIT = 8;

const COLUMNS = [
  { label: 'Loan No.' },
  { label: 'Customer' },
  { label: 'Type' },
  { label: 'Principal', className: 'text-right' },
  { label: 'Rate / Tenure' },
  { label: 'EMI', className: 'text-right' },
  { label: 'Outstanding', className: 'text-right' },
  { label: 'Status' },
  { label: 'Actions', className: 'text-right' }
];

export default function LoansPage() {
  const toast = useToast();
  const paged = usePaginated(loansApi.list, { limit: LIMIT });
  const lookups = useLookups();

  const [applying, setApplying] = useState(false);
  const [approving, setApproving] = useState(null);
  const [approveBusy, setApproveBusy] = useState(false);

  async function confirmApprove() {
    setApproveBusy(true);
    try {
      await loansApi.approve(approving.id);
      toast.success(`Loan ${approving.loanNumber} approved.`);
      setApproving(null);
      paged.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApproveBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Loans"
        description="Review loan applications and approve pending requests."
        action={
          <Button variant="primary" icon="plus" onClick={() => setApplying(true)}>
            Apply for Loan
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        paged={paged}
        limit={LIMIT}
        emptyMessage="No loans found."
        renderRow={(l) => (
          <tr key={l.id} className="hover:bg-slate-50/70">
            <Td className="font-medium text-navy-900">{l.loanNumber}</Td>
            <Td>{lookups.customerMap[l.customerId]?.name || '—'}</Td>
            <Td>{l.type}</Td>
            <Td className="text-right tabular-nums">{formatMoney(l.principal)}</Td>
            <Td>
              {l.interestRate}% · {l.tenureMonths} mo
            </Td>
            <Td className="text-right tabular-nums">{l.emi != null ? formatMoney(l.emi) : '—'}</Td>
            <Td className="text-right tabular-nums">{formatMoney(l.outstanding)}</Td>
            <Td>
              <Badge value={l.status} />
            </Td>
            <Td>
              <div className="flex justify-end">
                {l.status === 'Pending' && (
                  <Button size="sm" variant="success" icon="check" onClick={() => setApproving(l)}>
                    Approve
                  </Button>
                )}
              </div>
            </Td>
          </tr>
        )}
      />

      {applying && (
        <ApplyLoanModal
          customers={lookups.customers}
          accounts={lookups.accounts}
          onClose={() => setApplying(false)}
          onSaved={() => {
            setApplying(false);
            paged.refresh();
          }}
        />
      )}

      {approving && (
        <ConfirmDialog
          title="Approve loan"
          message={`Approve loan ${approving.loanNumber} for ${formatMoney(approving.principal)}?`}
          confirmLabel="Approve"
          variant="primary"
          loading={approveBusy}
          onConfirm={confirmApprove}
          onCancel={() => setApproving(null)}
        />
      )}
    </>
  );
}
