import { useRef, useState } from 'react';
import { customersApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Textarea } from '../components/Field';
import { useToast } from '../components/Toast';
import { normalizeEmail, normalizePhone, validateCustomer, validateCustomerField } from '../utils/validation';

export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '', address: customer?.address || '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  function update(field) {
    return (event) => {
      const value = event.target.value;
      const next = { ...form, [field]: value };
      setForm(next);
      setServerError('');
      if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validateCustomerField(field, value) }));
    };
  }
  function blur(field) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors((current) => ({ ...current, [field]: validateCustomerField(field, form[field]) }));
    };
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateCustomer(form);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, address: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`customer-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setServerError('');
    const payload = { name: form.name.trim(), email: normalizeEmail(form.email), phone: normalizePhone(form.phone), address: form.address.trim() };
    try {
      if (isEdit) { await customersApi.update(customer.id, payload); toast.success('Customer updated successfully.'); }
      else { await customersApi.create(payload); toast.success('Customer created successfully.'); }
      onSaved();
    } catch (error) { setServerError(error.message); toast.error(error.message); }
    finally { submitting.current = false; setSaving(false); }
  }

  return <Modal title={isEdit ? 'Edit Customer' : 'Add Customer'} subtitle={isEdit ? 'Update the customer’s contact details.' : 'Register a new bank customer.'} onClose={onClose} footer={<><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" type="submit" form="customer-form" loading={saving}>{isEdit ? 'Save Changes' : 'Create Customer'}</Button></>}>
    {serverError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
    <form id="customer-form" noValidate onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name" id="customer-name" error={errors.name}><Input value={form.name} onChange={update('name')} onBlur={blur('name')} autoComplete="name" placeholder="e.g. Rahul Sharma" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" id="customer-email" error={errors.email}><Input type="email" inputMode="email" value={form.email} onChange={update('email')} onBlur={blur('email')} autoComplete="email" placeholder="name@email.com" /></Field>
        <Field label="Phone" id="customer-phone" error={errors.phone}><Input type="tel" inputMode="tel" value={form.phone} onChange={update('phone')} onBlur={blur('phone')} autoComplete="tel" placeholder="10–15 digits" /></Field>
      </div>
      <Field label="Address" id="customer-address" error={errors.address}><Textarea value={form.address} onChange={update('address')} onBlur={blur('address')} autoComplete="street-address" placeholder="Street, city, state" /></Field>
    </form>
  </Modal>;
}
