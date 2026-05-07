'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const COLORS = ['#0EA5E9', '#06B6D4', '#2DD4BF', '#F43F5E', '#F59E0B', '#8B5CF6'];

export default function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        console.log('Hospital Analytics Data:', res.data.data);
        return res.data.data;
      } catch (err) {
        console.error('Error fetching analytics:', err);
        throw err;
      }
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
      <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold animate-pulse">Generating performance analytics...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
        <AlertTriangle size={32} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-medical-navy mb-2">Analytics Connection Failed</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We encountered a 401 Unauthorized error. This usually happens when your session has expired after a system update.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Retry</Button>
        <Button onClick={() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }} className="bg-medical-blue text-white rounded-xl">Re-login</Button>
      </div>
    </div>
  );

  const statusData = analytics?.charts?.statusDistribution?.map((item: any) => ({
    name: item._id.replace('_', ' ').toUpperCase(),
    value: item.count
  })) || [];

  const conditionData = analytics?.charts?.conditionDistribution?.map((item: any) => ({
    name: item._id.toUpperCase(),
    value: item.count
  })) || [];

  const monthlyCostData = analytics?.charts?.monthlyCosts?.map((item: any) => ({
    name: `${item._id.month}/${item._id.year}`,
    cost: item.totalCost
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-medical-navy tracking-tight mb-2">Hospital Analytics</h1>
        <p className="text-slate-500">Comprehensive overview of asset performance and facility efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Zap size={20} />
               </div>
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">Live</span>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Equipment Uptime</p>
             <h3 className="text-3xl font-black text-medical-navy">
               {analytics?.charts?.uptimeTrend?.length > 0 
                 ? (analytics.charts.uptimeTrend.reduce((acc: number, curr: any) => acc + curr.uptime, 0) / analytics.charts.uptimeTrend.length).toFixed(1)
                 : '100'}%
             </h3>
             <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
               <TrendingUp size={12} /> Real-time tracking active
             </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                 <ShieldCheck size={20} />
               </div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Rate</p>
             <h3 className="text-3xl font-black text-medical-navy">{Math.round(analytics?.stats?.complianceScore || 0)}%</h3>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${analytics?.stats?.complianceScore}%` }}></div>
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                 <AlertTriangle size={20} />
               </div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Open Reports</p>
             <h3 className="text-3xl font-black text-medical-navy">{analytics?.stats?.openReports || 0}</h3>
             <p className="text-[10px] text-red-500 font-bold mt-2">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                 <Activity size={20} />
               </div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assets Out of Service</p>
             <h3 className="text-3xl font-black text-medical-navy">{analytics?.stats?.outOfService || 0}</h3>
             <p className="text-[10px] text-slate-400 font-bold mt-2">Check maintenance logs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-medical-navy">Maintenance Cost Trend</CardTitle>
            <CardDescription>Expenditure across last 6 months in INR</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCostData}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-medical-navy">Asset Health Index</CardTitle>
            <CardDescription>Uptime trend by percentage</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.charts?.uptimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line type="monotone" dataKey="uptime" stroke="#2DD4BF" strokeWidth={4} dot={{ r: 4, fill: '#2DD4BF', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-medical-navy">Status Distribution</CardTitle>
            <CardDescription>Real-time equipment availability</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 flex justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-medical-navy">Asset Condition</CardTitle>
            <CardDescription>Physical state assessment global distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 flex justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conditionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '12px', border: 'none'}}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {conditionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
