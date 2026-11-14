import { useState } from 'react';
import { customersApi } from '../api';
import { usePaginated } from '../hooks/usePaginated';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { PageHeader, Td } from '../components/DataTable';
import { useToast } from '../components/Toast';
import CustomerFormModal from '../features/CustomerFormModal';
import CustomerDetailDrawer from '../features/CustomerDetailDrawer';
import { formatDate, initials } from '../utils/format';

const LIMIT = 8;

const COLUMNS = [
  { label: 'Customer' },
  { label: 'Email' },
  { label: 'Phone' },
  { label: 'Address' },
  { label: 'Joined' },
  { label: 'Actions', className: 'text-right' }
];

export default function CustomersPage() {
  const toast = useToast();
  const paged = usePaginated(customersApi.list, { limit: LIMIT });

  const [formState, setFormState] = useState(null); // { customer? }
  const [viewingId, setViewingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await customersApi.remove(deleting.id);
      toast.success(`${deleting.name} was deleted.`);
      setDeleting(null);
      paged.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage customer profiles and view their accounts and loans."
        action={
          <Button variant="primary" icon="plus" onClick={() => setFormState({})}>
            Add Customer
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        paged={paged}
        limit={LIMIT}
        emptyMessage="No customers found."
        renderRow={(c) => (
          <tr key={c.id} className="hover:bg-slate-50/70">
            <Td>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                  {initials(c.name)}
                </span>
                <span className="font-medium text-navy-900">{c.name}</span>
              </div>
            </Td>
            <Td>{c.email}</Td>
            <Td>{c.phone}</Td>
            <Td className="max-w-[16rem] truncate">{c.address || '—'}</Td>
            <Td>{formatDate(c.createdAt)}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <Button size="sm" icon="eye" onClick={() => setViewingId(c.id)}>
                  View
                </Button>
                <Button size="sm" icon="pencil" onClick={() => setFormState({ customer: c })}>
                  Edit
                </Button>
                <Button size="sm" variant="outlineDanger" icon="trash" onClick={() => setDeleting(c)}>
                  Delete
                </Button>
              </div>
            </Td>
          </tr>
        )}
      />

      {formState && (
        <CustomerFormModal
          customer={formState.customer}
          onClose={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            paged.refresh();
          }}
        />
      )}

      {viewingId && <CustomerDetailDrawer customerId={viewingId} onClose={() => setViewingId(null)} />}

      {deleting && (
        <ConfirmDialog
          title="Delete customer"
          message={`Are you sure you want to delete ${deleting.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
