'use client';

import { Users } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

const riskColor: Record<string, string> = {
  low: 'bg-green-50 text-green-600',
  medium: 'bg-amber-50 text-amber-600',
  high: 'bg-red-50 text-red-600',
};

export default function SuppliersPage() {
  return (
    <ResourceManager
      title="Suppliers"
      subtitle="Vendor directory, performance and risk assessment."
      icon={<Users className="text-medical-blue" />}
      endpoint="/scm/suppliers"
      queryKey="scm-suppliers"
      addLabel="Add Supplier"
      columns={[
        { header: 'Name', render: (r) => <span className="font-bold text-medical-navy">{r.name}</span> },
        { header: 'Code', render: (r) => <span className="text-slate-400 text-xs">{r.code}</span> },
        { header: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
        { header: 'Lead Time', render: (r) => `${r.leadTimeDays} days` },
        { header: 'On-Time %', render: (r) => `${r.onTimeDeliveryRate}%` },
        {
          header: 'Risk',
          render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${riskColor[r.riskLevel] || ''}`}>
              {r.riskLevel}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'name', label: 'Supplier Name', type: 'text', required: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { value: 'pharmaceutical', label: 'Pharmaceutical' },
            { value: 'consumables', label: 'Consumables' },
            { value: 'reagents', label: 'Reagents' },
            { value: 'equipment', label: 'Equipment' },
            { value: 'logistics', label: 'Logistics' },
            { value: 'other', label: 'Other' },
          ],
        },
        { name: 'contactEmail', label: 'Contact Email', type: 'text' },
        { name: 'contactPhone', label: 'Contact Phone', type: 'text' },
        { name: 'address', label: 'Address', type: 'text', full: true },
        { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number' },
        { name: 'onTimeDeliveryRate', label: 'On-Time Delivery %', type: 'number' },
        { name: 'qualityScore', label: 'Quality Score', type: 'number' },
        {
          name: 'riskLevel',
          label: 'Risk Level',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
        },
      ]}
    />
  );
}
