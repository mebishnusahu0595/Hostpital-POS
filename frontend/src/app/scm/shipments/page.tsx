'use client';

import { Truck } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

const statusColor: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_transit: 'bg-blue-50 text-blue-600',
  delivered: 'bg-green-50 text-green-600',
  delayed: 'bg-red-50 text-red-600',
  cancelled: 'bg-slate-100 text-slate-400',
};

export default function ShipmentsPage() {
  return (
    <ResourceManager
      title="Shipments"
      subtitle="Logistics and real-time delivery tracking."
      icon={<Truck className="text-medical-blue" />}
      endpoint="/scm/shipments"
      queryKey="scm-shipments"
      addLabel="Add Shipment"
      columns={[
        { header: 'Shipment #', render: (r) => <span className="font-bold text-medical-navy">{r.shipmentNumber}</span> },
        { header: 'Carrier', render: (r) => r.carrier || '—' },
        { header: 'Route', render: (r) => `${r.origin || '—'} → ${r.destination || '—'}` },
        {
          header: 'Status',
          render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusColor[r.status] || ''}`}>
              {r.status?.replace('_', ' ')}
            </span>
          ),
        },
        { header: 'ETA', render: (r) => (r.expectedDelivery ? new Date(r.expectedDelivery).toLocaleDateString() : '—') },
        { header: 'Cost', render: (r) => `$${(r.cost || 0).toLocaleString('en-US')}` },
      ]}
      fields={[
        { name: 'purchaseOrderId', label: 'Linked PO', type: 'select', optionsEndpoint: '/scm/purchase-orders', optionLabel: 'poNumber' },
        { name: 'carrier', label: 'Carrier', type: 'text' },
        { name: 'trackingNumber', label: 'Tracking Number', type: 'text' },
        { name: 'origin', label: 'Origin', type: 'text' },
        { name: 'destination', label: 'Destination', type: 'text' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'delayed', label: 'Delayed' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
        { name: 'dispatchedAt', label: 'Dispatched At', type: 'date' },
        { name: 'expectedDelivery', label: 'Expected Delivery', type: 'date' },
        { name: 'deliveredAt', label: 'Delivered At', type: 'date' },
        { name: 'cost', label: 'Transport Cost ($)', type: 'number' },
      ]}
    />
  );
}
