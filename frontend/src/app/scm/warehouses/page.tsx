'use client';

import { Warehouse } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

export default function WarehousesPage() {
  const util = (r: any) => (r.capacity > 0 ? Math.round((r.usedCapacity / r.capacity) * 100) : 0);

  return (
    <ResourceManager
      title="Warehouses"
      subtitle="Storage locations and capacity utilization."
      icon={<Warehouse className="text-medical-blue" />}
      endpoint="/scm/warehouses"
      queryKey="scm-warehouses"
      addLabel="Add Warehouse"
      columns={[
        { header: 'Name', render: (r) => <span className="font-bold text-medical-navy">{r.name}</span> },
        { header: 'Code', render: (r) => <span className="text-slate-400 text-xs">{r.code}</span> },
        { header: 'Type', render: (r) => <span className="capitalize">{r.type?.replace('_', ' ')}</span> },
        { header: 'Location', render: (r) => r.location || '—' },
        {
          header: 'Utilization',
          render: (r) => (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-medical-blue" style={{ width: `${Math.min(100, util(r))}%` }} />
              </div>
              <span className="text-xs text-slate-500">{util(r)}%</span>
            </div>
          ),
        },
      ]}
      fields={[
        { name: 'name', label: 'Warehouse Name', type: 'text', required: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          options: [
            { value: 'central', label: 'Central Store' },
            { value: 'pharmacy', label: 'Pharmacy' },
            { value: 'lab', label: 'Laboratory' },
            { value: 'cold_storage', label: 'Cold Storage' },
            { value: 'ward', label: 'Ward' },
          ],
        },
        { name: 'location', label: 'Location', type: 'text', full: true },
        { name: 'capacity', label: 'Total Capacity', type: 'number' },
        { name: 'usedCapacity', label: 'Used Capacity', type: 'number' },
        { name: 'manager', label: 'Manager', type: 'text' },
      ]}
    />
  );
}
