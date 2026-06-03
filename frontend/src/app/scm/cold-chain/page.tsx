'use client';

import { Thermometer } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

export default function ColdChainPage() {
  return (
    <ResourceManager
      title="Cold Chain"
      subtitle="Temperature monitoring logs and breach alerts."
      icon={<Thermometer className="text-medical-blue" />}
      endpoint="/scm/cold-chain"
      queryKey="scm-cold-chain"
      addLabel="Log Reading"
      columns={[
        { header: 'Unit', render: (r) => <span className="font-bold text-medical-navy">{r.unitName}</span> },
        { header: 'Warehouse', render: (r) => r.warehouseId?.name || '—' },
        { header: 'Temp (°C)', render: (r) => <span className="font-bold">{r.temperature}°</span> },
        { header: 'Range', render: (r) => `${r.minThreshold}° – ${r.maxThreshold}°` },
        {
          header: 'Status',
          render: (r) =>
            r.breach ? (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">Breach</span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">Normal</span>
            ),
        },
        { header: 'Recorded', render: (r) => (r.recordedAt ? new Date(r.recordedAt).toLocaleString() : '—') },
      ]}
      fields={[
        { name: 'unitName', label: 'Unit / Fridge Name', type: 'text', required: true },
        { name: 'warehouseId', label: 'Warehouse', type: 'select', optionsEndpoint: '/scm/warehouses', optionLabel: 'name' },
        { name: 'temperature', label: 'Temperature (°C)', type: 'number', required: true },
        { name: 'minThreshold', label: 'Min Threshold (°C)', type: 'number' },
        { name: 'maxThreshold', label: 'Max Threshold (°C)', type: 'number' },
        { name: 'recordedAt', label: 'Recorded At', type: 'date' },
        { name: 'notes', label: 'Notes', type: 'textarea', full: true },
      ]}
    />
  );
}
