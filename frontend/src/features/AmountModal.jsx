import { useState } from 'react';
import { accountsApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input } from '../components/Field';
import { useToast } from '../components/Toast';
import { formatMoney } from '../utils/format';

const CONFIG = {
  deposit: {
    title: 'Deposit Funds',
    submit: 'Deposit',
    variant: 'success',
    defaultDescription: 'Cash Deposit',
    success: 'Deposit successful.',
    call: accountsApi.deposit
  },
  withdraw: {
    title: 'Withdraw Funds',
    submit: 'Withdraw',
    variant: 'danger',
    defaultDescription: 'Cash Withdrawal',
    success: 'Withdrawal successful.',
    call: accountsApi.withdraw
  }
};

export default function AmountModal({ mode, account, onClose, onDone }) {
  const toast = useToast();
  const config = CONFIG[mode];
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(config.defaultDescription);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await config.call(account.id, { amount: Number(amount), description });
      toast.success(config.success);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={config.title}
      subtitle={`${account.accountNumber} · ${account.type}`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant={config.variant} type="submit" form="amount-form" loading={saving}>
            {config.submit}
          </Button>
        </>
      }
    >
      <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">Current balance</p>
        <p className="text-xl font-semibold text-navy-900">{formatMoney(account.balance)}</p>
      </div>
      <form id="amount-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Amount (₹)">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            placeholder="0.00"
          />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
