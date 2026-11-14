import { useEffect, useState } from 'react';
import { customersApi } from '../api';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { formatDate, formatMoney, initials } from '../utils/format';

function Section({ title, count, children }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{count}</span>
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function CustomerDetailDrawer({ customerId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    customersApi
      .get(customerId)
      .then((c) => !cancelled && setCustomer(c))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Customer details"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-900">Customer Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!customer && !error && <p className="text-sm text-slate-500">Loading…</p>}

          {customer && (
            <>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-800 text-lg font-semibold text-white">
                  {initials(customer.name)}
                </span>
                <div>
                  <p className="text-xl font-semibold text-navy-900">{customer.name}</p>
                  <p className="text-sm text-slate-500">Customer since {formatDate(customer.createdAt)}</p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
                {[
                  ['Email', customer.email],
                  ['Phone', customer.phone],
                  ['Address', customer.address || '—']
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>

              <Section title="Accounts" count={customer.accounts?.length || 0}>
                {(customer.accounts || []).map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-navy-900">{a.accountNumber}</p>
                      <Badge value={a.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{a.type}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{formatMoney(a.balance)}</p>
                  </div>
                ))}
                {!customer.accounts?.length && <p className="text-sm text-slate-500">No accounts yet.</p>}
              </Section>

              <Section title="Loans" count={customer.loans?.length || 0}>
                {(customer.loans || []).map((l) => (
                  <div key={l.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-navy-900">{l.loanNumber}</p>
                      <Badge value={l.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{l.type} loan</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{formatMoney(l.principal)}</p>
                  </div>
                ))}
                {!customer.loans?.length && <p className="text-sm text-slate-500">No loans yet.</p>}
              </Section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
