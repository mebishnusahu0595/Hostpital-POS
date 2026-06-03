'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Building2, Activity, ShieldAlert, CreditCard, Users, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#0EA5E9', '#0A1628', '#22C55E', '#F59E0B', '#EF4444'];

export default function SuperAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('6m');

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['super-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data.data;
    }
  });

  const { data: platformData, isLoading: platformLoading } = useQuery({
    queryKey: ['super-platform-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/platform');
      return res.data.data;
    }
  });

  if (dashboardLoading || platformLoading) return <div className="p-12 text-center animate-pulse text-medical-navy font-bold">Aggregating Platform Intelligence...</div>;

  const stats = dashboardData?.stats;
  const charts = platformData;

  // Format registration trend for AreaChart
  const regTrendData = charts?.registrationTrend?.map((item: any) => ({
    name: `${item._id.month}/${item._id.year}`,
    hospitals: item.count
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Platform Intelligence</h1>
          <p className="text-slate-500 text-sm">Real-time SaaS metrics, hospital growth, and infrastructure health.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {['1m', '3m', '6m', '1y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t ? 'bg-white text-medical-navy shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-medical-navy text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Building2 size={80} />
          </div>
          <CardContent className="p-6 relative">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Network</p>
            <h3 className="text-3xl font-bold">{stats?.totalHospitals || 0}</h3>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+{stats?.newHospitalsThisMonth || 0} This Month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Estimated MRR</p>
                <h3 className="text-3xl font-bold text-medical-navy">$ {stats?.mrr?.toLocaleString() || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-medical-blue w-[75%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-medical-navy">{stats?.totalUsers || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} /> Global Faculty
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">System Health</p>
                <h3 className="text-3xl font-bold text-emerald-500">99.9%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert size={20} />
              </div>
            </div>
            <p className="mt-4 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">All systems nominal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-medical-navy">Growth Velocity</CardTitle>
              <p className="text-xs text-slate-400">Hospital registration trend across the platform</p>
            </div>
            <Calendar className="text-slate-300" size={20} />
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regTrendData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} stroke="#94a3b8" />
                <YAxis fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hospitals" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-medical-navy">Plan Distribution</CardTitle>
            <p className="text-xs text-slate-400">Hospitals by subscription tier</p>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.planDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {(charts?.planDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-medical-navy">Asset Leaderboard</CardTitle>
            <p className="text-xs text-slate-400">Hospitals with the highest equipment inventory</p>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {charts?.topHospitals?.map((h: any, idx: number) => (
                 <div key={h._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-medical-navy text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-medical-navy">{h.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{h.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-medical-blue">{h.count}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Assets</p>
                    </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-medical-navy">System Activity</CardTitle>
            <p className="text-xs text-slate-400">Total platform interactions (Last 30 days)</p>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={charts?.activityTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#0A1628" radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
