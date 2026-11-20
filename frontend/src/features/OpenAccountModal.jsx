import { useRef, useState } from 'react';
import { accountsApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { useToast } from '../components/Toast';
import { ACCOUNT_TYPES, validateAccountField } from '../utils/validation';

const INITIAL_FORM = { customerId: '', type: 'Savings', balance: '0' };
export default function OpenAccountModal({ customers, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  function update(field) {
    return (event) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setServerError('');
      if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validateAccountField(field, value) }));
    };
  }
  function blur(field) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors((current) => ({ ...current, [field]: validateAccountField(field, form[field]) }));
    };
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(['customerId', 'type', 'balance'].map((field) => [field, validateAccountField(field, form[field])]).filter(([, error]) => error));
    setErrors(nextErrors); setTouched({ customerId: true, type: true, balance: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`account-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setServerError('');
    try {
      await accountsApi.open({ customerId: form.customerId, type: form.type, balance: Number(form.balance) });
      toast.success('Account opened successfully.'); onSaved();
    } catch (error) { setServerError(error.message); toast.error(error.message); }
    finally { submitting.current = false; setSaving(false); }
  }
  return <Modal title="Open New Account" subtitle="Create an account for an existing customer." onClose={onClose} footer={<><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" type="submit" form="account-form" loading={saving}>Open Account</Button></>}>
    {serverError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
    <form id="account-form" noValidate onSubmit={handleSubmit} className="space-y-4">
      <Field label="Customer" id="account-customerId" error={errors.customerId}><Select value={form.customerId} onChange={update('customerId')} onBlur={blur('customerId')}><option value="">Select a customer…</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} — {customer.email}</option>)}</Select></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Account type" id="account-type" error={errors.type}><Select value={form.type} onChange={update('type')} onBlur={blur('type')}>{ACCOUNT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select></Field>
        <Field label="Initial deposit (₹)" id="account-balance" error={errors.balance}><Input type="text" inputMode="decimal" value={form.balance} onChange={update('balance')} onBlur={blur('balance')} placeholder="0.00" /></Field>
      </div>
      <p className="text-xs text-slate-500">Enter 0 or a finite amount up to ₹100,000,000 with at most 2 decimal places.</p>
    </form>
  </Modal>;
}
