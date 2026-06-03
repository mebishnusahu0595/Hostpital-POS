'use client';

import { TrendingUp } from 'lucide-react';
import ResourceManager from '@/components/scm/ResourceManager';

export default function ForecastingPage() {
  const accuracy = (r: any) => {
    if (!r.forecastQty || !r.actualQty) return '—';
    const err = Math.abs(r.forecastQty - r.actualQty) / r.forecastQty;
    return `${Math.max(0, Math.round((1 - err) * 100))}%`;
  };

  return (
    <ResourceManager
      title="Demand Forecasting"
      subtitle="Patient demand forecasts vs actual consumption."
      icon={<TrendingUp className="text-medical-blue" />}
      endpoint="/scm/forecasts"
      queryKey="scm-forecasts"
      addLabel="Add Forecast"
      columns={[
        { header: 'Item', render: (r) => <span className="font-bold text-medical-navy">{r.itemName}</span> },
        { header: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
        { header: 'Period', render: (r) => r.period },
        { header: 'Forecast', render: (r) => r.forecastQty },
        { header: 'Actual', render: (r) => r.actualQty },
        { header: 'Accuracy', render: (r) => <span className="font-bold text-medical-blue">{accuracy(r)}</span> },
      ]}
      fields={[
        { name: 'itemName', label: 'Item Name', type: 'text', required: true },
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
        { name: 'period', label: 'Period (e.g. 2026-06)', type: 'text', required: true },
        { name: 'forecastQty', label: 'Forecast Quantity', type: 'number' },
        { name: 'actualQty', label: 'Actual Quantity', type: 'number' },
      ]}
    />
  );
}
