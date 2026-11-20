import { useMemo, useRef, useState } from 'react';
import { loansApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { useToast } from '../components/Toast';
import { formatMoney } from '../utils/format';
import { calculateEmi, LOAN_TYPES, validateLoan, validateLoanField } from '../utils/validation';

const INITIAL_FORM = { customerId: '', accountId: '', type: 'Personal', principal: '', interestRate: '', tenureMonths: '' };
export default function ApplyLoanModal({ customers, accounts, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({}); const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(''); const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const customerAccounts = useMemo(() => accounts.filter((account) => account.customerId === form.customerId), [accounts, form.customerId]);
  function validate(field, value, values = form) { return validateLoanField(field, value, values, { accounts }); }
  function update(field) {
    return (event) => {
      const value = event.target.value;
      const next = field === 'customerId' ? { ...form, customerId: value, accountId: '' } : { ...form, [field]: value };
      setForm(next); setServerError('');
      if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validate(field, value, next), ...(field === 'customerId' ? { accountId: '' } : {}) }));
      if (field === 'customerId') setErrors((current) => ({ ...current, accountId: '' }));
    };
  }
  function blur(field) {
    return () => { setTouched((current) => ({ ...current, [field]: true })); setErrors((current) => ({ ...current, [field]: validate(field, form[field]) })); };
  }
  const previewErrors = ['principal', 'interestRate', 'tenureMonths'].map((field) => validate(field, form[field]));
  const estimatedEmi = previewErrors.some(Boolean) ? null : calculateEmi(Number(form.principal), Number(form.interestRate), Number(form.tenureMonths));
  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLoan(form, accounts);
    setErrors(nextErrors); setTouched({ customerId: true, accountId: true, type: true, principal: true, interestRate: true, tenureMonths: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`loan-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setServerError('');
    try {
      await loansApi.apply({ customerId: form.customerId, accountId: form.accountId || null, type: form.type, principal: Number(form.principal), interestRate: Number(form.interestRate), tenureMonths: Number(form.tenureMonths) });
      toast.success('Loan application submitted.'); onSaved();
    } catch (error) { setServerError(error.message); toast.error(error.message); }
    finally { submitting.current = false; setSaving(false); }
  }
  return <Modal title="Apply for Loan" subtitle="Submit a new loan application for review." onClose={onClose} footer={<><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" type="submit" form="loan-form" loading={saving}>Submit Application</Button></>}>
    {serverError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
    <form id="loan-form" noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer" id="loan-customerId" error={errors.customerId}><Select value={form.customerId} onChange={update('customerId')} onBlur={blur('customerId')}><option value="">Select a customer…</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select></Field>
        <Field label="Linked account" id="loan-accountId" error={errors.accountId} hint="Optional; only accounts belonging to the selected customer are listed."><Select value={form.accountId} onChange={update('accountId')} onBlur={blur('accountId')} disabled={!form.customerId}><option value="">None</option>{customerAccounts.map((account) => <option key={account.id} value={account.id}>{account.accountNumber} ({account.type})</option>)}</Select></Field>
      </div>
      <Field label="Loan type" id="loan-type" error={errors.type}><Select value={form.type} onChange={update('type')} onBlur={blur('type')}>{LOAN_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Principal (₹)" id="loan-principal" error={errors.principal}><Input type="text" inputMode="decimal" value={form.principal} onChange={update('principal')} onBlur={blur('principal')} placeholder="100000.00" /></Field>
        <Field label="Interest (% p.a.)" id="loan-interestRate" error={errors.interestRate}><Input type="text" inputMode="decimal" value={form.interestRate} onChange={update('interestRate')} onBlur={blur('interestRate')} placeholder="12" /></Field>
        <Field label="Tenure (months)" id="loan-tenureMonths" error={errors.tenureMonths}><Input type="text" inputMode="numeric" value={form.tenureMonths} onChange={update('tenureMonths')} onBlur={blur('tenureMonths')} placeholder="12" /></Field>
      </div>
      <div aria-live="polite" className="rounded-lg border border-navy-100 bg-navy-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-600">Estimated Monthly EMI</p>
        <p className="mt-1 text-lg font-semibold text-navy-900">{estimatedEmi === null ? 'Enter valid principal, rate, and tenure' : formatMoney(estimatedEmi)}</p>
      </div>
      <p className="text-xs text-slate-500">Principal ₹1,000–₹50,000,000 (up to 2 decimals); rate 0–50%; tenure 1–360 whole months.</p>
    </form>
  </Modal>;
}
