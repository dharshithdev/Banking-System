import { useState } from 'react';
import { customersApi } from '../api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Field, Input, Textarea } from '../components/Field';
import { useToast } from '../components/Toast';

export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await customersApi.update(customer.id, form);
        toast.success('Customer updated successfully.');
      } else {
        await customersApi.create(form);
        toast.success('Customer created successfully.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Customer' : 'Add Customer'}
      subtitle={isEdit ? 'Update the customer’s contact details.' : 'Register a new bank customer.'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="customer-form" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <Input value={form.name} onChange={update('name')} required placeholder="e.g. Rahul Sharma" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input type="email" value={form.email} onChange={update('email')} required placeholder="name@email.com" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={update('phone')} required placeholder="10-digit number" />
          </Field>
        </div>
        <Field label="Address">
          <Textarea value={form.address} onChange={update('address')} placeholder="Street, city, state" />
        </Field>
      </form>
    </Modal>
  );
}
