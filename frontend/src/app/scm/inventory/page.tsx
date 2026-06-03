'use client';

import { Boxes, Snowflake } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

const stockBadge = (r: any) => {
  if (r.quantity <= 0) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">Out of stock</span>;
  if (r.reorderLevel > 0 && r.quantity <= r.reorderLevel)
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">Low stock</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">In stock</span>;
};

export default function InventoryPage() {
  return (
    <ResourceManager
      title="Inventory"
      subtitle="Drugs, chemotherapy, consumables and lab reagents."
      icon={<Boxes className="text-medical-blue" />}
      endpoint="/scm/inventory"
      queryKey="scm-inventory"
      addLabel="Add Item"
      columns={[
        {
          header: 'Item',
          render: (r) => (
            <div className="flex items-center gap-2">
              <span className="font-bold text-medical-navy">{r.name}</span>
              {r.requiresColdChain && <Snowflake size={14} className="text-sky-500" />}
            </div>
          ),
        },
        { header: 'SKU', render: (r) => <span className="text-slate-400 text-xs">{r.sku}</span> },
        { header: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
        { header: 'Qty', render: (r) => `${r.quantity} ${r.unit || ''}` },
        { header: 'Status', render: (r) => stockBadge(r) },
        { header: 'Expiry', render: (r) => (r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—') },
        { header: 'Supplier', render: (r) => r.supplierId?.name || '—' },
      ]}
      fields={[
        { name: 'name', label: 'Item Name', type: 'text', required: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { value: 'drug', label: 'Drug' },
            { value: 'chemotherapy', label: 'Chemotherapy' },
            { value: 'consumable', label: 'Consumable' },
            { value: 'reagent', label: 'Lab Reagent' },
            { value: 'other', label: 'Other' },
          ],
        },
        { name: 'unit', label: 'Unit (vial, box...)', type: 'text' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'reorderLevel', label: 'Reorder Level', type: 'number' },
        { name: 'unitCost', label: 'Unit Cost ($)', type: 'number' },
        { name: 'batchNumber', label: 'Batch Number', type: 'text' },
        { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
        { name: 'supplierId', label: 'Supplier', type: 'select', optionsEndpoint: '/scm/suppliers', optionLabel: 'name' },
        { name: 'warehouseId', label: 'Warehouse', type: 'select', optionsEndpoint: '/scm/warehouses', optionLabel: 'name' },
        { name: 'storageTempMin', label: 'Storage Temp Min (°C)', type: 'number' },
        { name: 'storageTempMax', label: 'Storage Temp Max (°C)', type: 'number' },
        { name: 'requiresColdChain', label: 'Requires cold chain', type: 'checkbox' },
      ]}
    />
  );
}
