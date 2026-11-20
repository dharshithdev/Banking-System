import { useRef, useState } from 'react';
import { accountsApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input } from '../components/Field';
import { useToast } from '../components/Toast';
import { formatMoney } from '../utils/format';
import { validateAmountField } from '../utils/validation';

const CONFIG = {
  deposit: { title: 'Deposit Funds', submit: 'Deposit', variant: 'success', defaultDescription: 'Cash Deposit', success: 'Deposit successful.', call: accountsApi.deposit },
  withdraw: { title: 'Withdraw Funds', submit: 'Withdraw', variant: 'danger', defaultDescription: 'Cash Withdrawal', success: 'Withdrawal successful.', call: accountsApi.withdraw }
};
export default function AmountModal({ mode, account, onClose, onDone }) {
  const toast = useToast(); const config = CONFIG[mode];
  const [form, setForm] = useState({ amount: '', description: config.defaultDescription });
  const [errors, setErrors] = useState({}); const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(''); const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  function validate(field, value) { return validateAmountField(field, value, { mode, balance: account.balance }); }
  function update(field) {
    return (event) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value })); setServerError('');
      if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validate(field, value) }));
    };
  }
  function blur(field) {
    return () => { setTouched((current) => ({ ...current, [field]: true })); setErrors((current) => ({ ...current, [field]: validate(field, form[field]) })); };
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(['amount', 'description'].map((field) => [field, validate(field, form[field])]).filter(([, error]) => error));
    setErrors(nextErrors); setTouched({ amount: true, description: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`amount-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setServerError('');
    try {
      await config.call(account.id, { amount: Number(form.amount), description: form.description.trim() });
      toast.success(config.success); onDone();
    } catch (error) { setServerError(error.message); toast.error(error.message); }
    finally { submitting.current = false; setSaving(false); }
  }
  return <Modal title={config.title} subtitle={`${account.accountNumber} · ${account.type}`} onClose={onClose} size="sm" footer={<><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant={config.variant} type="submit" form="amount-form" loading={saving}>{config.submit}</Button></>}>
    <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-wide text-slate-500">Current balance</p><p className="text-xl font-semibold text-navy-900">{formatMoney(account.balance)}</p></div>
    {serverError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
    <form id="amount-form" noValidate onSubmit={handleSubmit} className="space-y-4">
      <Field label="Amount (₹)" id="amount-amount" error={errors.amount}><Input type="text" inputMode="decimal" value={form.amount} onChange={update('amount')} onBlur={blur('amount')} autoFocus placeholder="0.00" /></Field>
      <Field label="Description" id="amount-description" error={errors.description}><Input value={form.description} onChange={update('description')} onBlur={blur('description')} maxLength={140} /></Field>
      <p className="text-xs text-slate-500">Positive amount up to ₹10,000,000, with at most 2 decimal places.</p>
    </form>
  </Modal>;
}
