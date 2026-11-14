import { useMemo, useState } from 'react';
import { loansApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { useToast } from '../components/Toast';

const LOAN_TYPES = ['Personal', 'Home', 'Car', 'Education'];

export default function ApplyLoanModal({ customers, accounts, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    customerId: '',
    accountId: '',
    type: 'Personal',
    principal: '',
    interestRate: '',
    tenureMonths: ''
  });
  const [saving, setSaving] = useState(false);

  const customerAccounts = useMemo(
    () => accounts.filter((a) => a.customerId === form.customerId),
    [accounts, form.customerId]
  );

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await loansApi.apply({
        customerId: form.customerId,
        accountId: form.accountId || null,
        type: form.type,
        principal: parseFloat(form.principal),
        interestRate: parseFloat(form.interestRate),
        tenureMonths: parseInt(form.tenureMonths, 10)
      });
      toast.success('Loan application submitted.');
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Apply for Loan"
      subtitle="Submit a new loan application for review."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="loan-form" loading={saving}>
            Submit Application
          </Button>
        </>
      }
    >
      <form id="loan-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer">
            <Select
              value={form.customerId}
              onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value, accountId: '' }))}
              required
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Linked account" hint="Optional">
            <Select value={form.accountId} onChange={update('accountId')} disabled={!form.customerId}>
              <option value="">None</option>
              {customerAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} ({a.type})
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Loan type">
          <Select value={form.type} onChange={update('type')}>
            {LOAN_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Principal (₹)">
            <Input type="number" min="1000" required value={form.principal} onChange={update('principal')} />
          </Field>
          <Field label="Interest (% p.a.)">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.interestRate}
              onChange={update('interestRate')}
            />
          </Field>
          <Field label="Tenure (months)">
            <Input type="number" min="1" required value={form.tenureMonths} onChange={update('tenureMonths')} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
