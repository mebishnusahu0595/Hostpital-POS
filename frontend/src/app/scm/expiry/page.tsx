'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Inbox } from 'lucide-react';
import api from '@/lib/axios';
import { differenceInCalendarDays } from 'date-fns';

export default function ExpiryPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['scm-inventory', 'expiry'],
    queryFn: async () => {
      const res = await api.get('/scm/inventory');
      return res.data.data as any[];
    },
  });

  const withExpiry = (items || [])
    .filter((i) => i.expiryDate)
    .map((i) => ({ ...i, daysLeft: differenceInCalendarDays(new Date(i.expiryDate), new Date()) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const expired = withExpiry.filter((i) => i.daysLeft < 0);
  const soon = withExpiry.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30);
  const later = withExpiry.filter((i) => i.daysLeft > 30);

  const badge = (d: number) => {
    if (d < 0) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">Expired {Math.abs(d)}d ago</span>;
    if (d <= 30) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">{d}d left</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">{d}d left</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1 flex items-center gap-2">
          <CalendarClock className="text-medical-blue" /> Expiry Monitoring
        </h1>
        <p className="text-slate-500 text-sm">Items past or nearing their expiry date.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{expired.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiring ≤ 30 days</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">{soon.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracked Items</p>
          <p className="text-3xl font-bold text-medical-navy mt-1">{withExpiry.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : withExpiry.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
            <Inbox size={40} />
            <p className="font-medium">No items with expiry dates yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Item', 'Category', 'Batch', 'Qty', 'Expiry Date', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...expired, ...soon, ...later].map((i) => (
                <tr key={i._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-bold text-medical-navy">{i.name}</td>
                  <td className="px-5 py-3.5 capitalize">{i.category}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{i.batchNumber || '—'}</td>
                  <td className="px-5 py-3.5">{i.quantity} {i.unit}</td>
                  <td className="px-5 py-3.5">{new Date(i.expiryDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">{badge(i.daysLeft)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
