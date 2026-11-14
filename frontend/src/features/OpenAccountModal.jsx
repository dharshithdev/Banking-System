import { useState } from 'react';
import { accountsApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { useToast } from '../components/Toast';

const ACCOUNT_TYPES = ['Savings', 'Current', 'Fixed Deposit'];

export default function OpenAccountModal({ customers, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ customerId: '', type: 'Savings', balance: '0' });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await accountsApi.open({
        customerId: form.customerId,
        type: form.type,
        balance: parseFloat(form.balance) || 0
      });
      toast.success('Account opened successfully.');
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Open New Account"
      subtitle="Create an account for an existing customer."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="account-form" loading={saving}>
            Open Account
          </Button>
        </>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Customer">
          <Select value={form.customerId} onChange={update('customerId')} required>
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Account type">
            <Select value={form.type} onChange={update('type')} required>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Initial balance (₹)">
            <Input type="number" min="0" step="0.01" value={form.balance} onChange={update('balance')} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
