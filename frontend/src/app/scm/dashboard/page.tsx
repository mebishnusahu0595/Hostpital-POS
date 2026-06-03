'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Wallet,
  Boxes,
  AlertTriangle,
  PackageX,
  CalendarClock,
  Users,
  Truck,
  Clock,
  Snowflake,
  Target,
  Warehouse,
  Gauge,
} from 'lucide-react';

const COLORS = ['#0EA5E9', '#06B6D4', '#2DD4BF', '#F59E0B', '#8B5CF6', '#F43F5E'];

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent || 'bg-blue-50 text-medical-blue'}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-medical-navy">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function ScmDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['scm-overview'],
    queryFn: async () => {
      const res = await api.get('/scm/analytics/overview');
      return res.data.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading supply chain overview...</p>
      </div>
    );

  const s = data?.stats || {};
  const c = data?.charts || {};
  const usd = (n: number) => `$${(n || 0).toLocaleString('en-US')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1">Supply Chain Overview</h1>
        <p className="text-slate-500 text-sm">Executive snapshot across inventory, procurement and logistics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={<Wallet size={18} />} label="Inventory Value" value={usd(s.inventoryValue)} />
        <Kpi icon={<Boxes size={18} />} label="Total Items" value={s.totalItems ?? 0} />
        <Kpi icon={<AlertTriangle size={18} />} label="Low Stock" value={s.lowStock ?? 0} accent="bg-amber-50 text-amber-600" />
        <Kpi icon={<PackageX size={18} />} label="Out of Stock" value={s.outOfStock ?? 0} accent="bg-red-50 text-red-600" />
        <Kpi icon={<CalendarClock size={18} />} label="Expiring ≤ 30d" value={s.expiringSoon ?? 0} accent="bg-amber-50 text-amber-600" />
        <Kpi icon={<Users size={18} />} label="Active Suppliers" value={`${s.activeSuppliers ?? 0}/${s.totalSuppliers ?? 0}`} />
        <Kpi icon={<Wallet size={18} />} label="Procurement Spend" value={usd(s.procurementSpend)} />
        <Kpi icon={<Clock size={18} />} label="Open POs" value={s.openPurchaseOrders ?? 0} />
        <Kpi icon={<Truck size={18} />} label="In Transit" value={s.shipmentsInTransit ?? 0} />
        <Kpi icon={<AlertTriangle size={18} />} label="Delayed Shipments" value={s.delayedShipments ?? 0} accent="bg-red-50 text-red-600" />
        <Kpi icon={<Snowflake size={18} />} label="Cold Chain Breaches" value={s.coldChainBreaches ?? 0} accent="bg-red-50 text-red-600" />
        <Kpi icon={<Target size={18} />} label="Forecast Accuracy" value={`${s.forecastAccuracy ?? 0}%`} accent="bg-green-50 text-green-600" />
        <Kpi icon={<Warehouse size={18} />} label="Warehouse Utilization" value={`${s.warehouseUtilization ?? 0}%`} />
        <Kpi icon={<Gauge size={18} />} label="Service Level" value={`${s.serviceLevel ?? 0}%`} accent="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-medical-navy mb-4">Purchase Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={c.poByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-medical-navy mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={c.inventoryByCategory || []} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {(c.inventoryByCategory || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-medical-navy mb-4">Shipments by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={c.shipmentByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2DD4BF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-medical-navy mb-4">Demand: Forecast vs Actual</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={c.forecastVsActual || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#0EA5E9" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(s.lowStock > 0 || s.outOfStock > 0 || s.delayedShipments > 0 || s.coldChainBreaches > 0) && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">Attention needed</p>
            <p>
              {s.outOfStock > 0 && `${s.outOfStock} item(s) out of stock. `}
              {s.lowStock > 0 && `${s.lowStock} item(s) low on stock. `}
              {s.delayedShipments > 0 && `${s.delayedShipments} shipment(s) delayed. `}
              {s.coldChainBreaches > 0 && `${s.coldChainBreaches} cold chain breach(es) logged. `}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
