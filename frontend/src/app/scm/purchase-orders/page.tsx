'use client';

import { ClipboardList } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

const statusColor: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-50 text-amber-600',
  approved: 'bg-blue-50 text-blue-600',
  rejected: 'bg-red-50 text-red-600',
  ordered: 'bg-indigo-50 text-indigo-600',
  received: 'bg-green-50 text-green-600',
};

export default function PurchaseOrdersPage() {
  return (
    <ResourceManager
      title="Purchase Orders"
      subtitle="Procurement requests and approval workflow."
      icon={<ClipboardList className="text-medical-blue" />}
      endpoint="/scm/purchase-orders"
      queryKey="scm-purchase-orders"
      addLabel="Create PO"
      columns={[
        { header: 'PO #', render: (r) => <span className="font-bold text-medical-navy">{r.poNumber}</span> },
        { header: 'Supplier', render: (r) => r.supplierId?.name || '—' },
        { header: 'Items', render: (r) => `${r.items?.length || 0} line(s)` },
        { header: 'Total', render: (r) => `$${(r.totalAmount || 0).toLocaleString('en-US')}` },
        {
          header: 'Status',
          render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusColor[r.status] || ''}`}>
              {r.status?.replace('_', ' ')}
            </span>
          ),
        },
        { header: 'Expected', render: (r) => (r.expectedDelivery ? new Date(r.expectedDelivery).toLocaleDateString() : '—') },
      ]}
      fields={[
        { name: 'supplierId', label: 'Supplier', type: 'select', optionsEndpoint: '/scm/suppliers', optionLabel: 'name' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'pending_approval', label: 'Pending Approval' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'ordered', label: 'Ordered' },
            { value: 'received', label: 'Received' },
          ],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
        },
        { name: 'expectedDelivery', label: 'Expected Delivery', type: 'date' },
        { name: 'items', label: 'Line Items', type: 'lineItems', full: true },
        { name: 'notes', label: 'Notes', type: 'textarea', full: true },
      ]}
    />
  );
}
