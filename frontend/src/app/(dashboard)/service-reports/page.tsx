'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ServiceReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['service-reports'],
    queryFn: async () => {
      const res = await api.get('/service-reports');
      return res.data.data;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-100';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-red-500" />;
      case 'assigned': return <Clock size={16} className="text-amber-500" />;
      case 'resolved': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Service Reports</h1>
          <p className="text-slate-500 text-sm">Track equipment issues, breakdowns, and repairs.</p>
        </div>
        <Link href="/service-reports/raise">
          <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11">
            <Plus size={18} /> Raise New Issue
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
             <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   placeholder="Search reports..." 
                   className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-blue/20 outline-none"
                 />
               </div>
               <Button variant="outline" className="rounded-xl gap-2 h-10">
                 <Filter size={18} /> Filters
               </Button>
             </div>

             <div className="divide-y divide-slate-50">
               {isLoading ? (
                 <div className="p-8 text-center text-slate-400 animate-pulse">Loading reports...</div>
               ) : reports?.length === 0 ? (
                 <div className="p-20 text-center text-slate-400">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No service reports found.</p>
                 </div>
               ) : (
                 reports?.map((report: any) => (
                   <Link key={report._id} href={`/service-reports/${report._id}`} className="block hover:bg-slate-50 transition-colors">
                     <div className="px-6 py-5 flex items-center justify-between">
                       <div className="flex gap-4">
                         <div className={`w-2 h-12 rounded-full ${
                           report.priority === 'critical' ? 'bg-red-500' : 
                           report.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                         }`}></div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-sm font-bold text-medical-navy">{report.equipmentId?.name}</span>
                             <span className="text-[10px] text-slate-400">•</span>
                             <span className="text-[10px] font-mono text-slate-500 uppercase">{report.equipmentId?.equipmentCode}</span>
                           </div>
                           <p className="text-sm text-slate-600 line-clamp-1">{report.issueDescription}</p>
                           <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                               {getStatusIcon(report.status)}
                               {report.status}
                             </div>
                             <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(report.priority)}`}>
                               {report.priority}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                               <Clock size={12} />
                               {new Date(report.createdAt).toLocaleDateString()}
                             </div>
                           </div>
                         </div>
                       </div>
                       <ChevronRight size={20} className="text-slate-300" />
                     </div>
                   </Link>
                 ))
               )}
             </div>
          </CardContent>
        </Card>

        {/* Filters/Stats Sidebar */}
        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="text-sm">Quick Filters</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-between text-xs font-medium text-slate-600 hover:text-medical-blue hover:bg-medical-blue/5 h-9 rounded-lg px-3">
                  Open Reports <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">
                    {reports?.filter((r: any) => r.status === 'open').length || 0}
                  </span>
                </Button>
                <Button variant="ghost" className="w-full justify-between text-xs font-medium text-slate-600 hover:text-medical-blue hover:bg-medical-blue/5 h-9 rounded-lg px-3">
                  Assigned <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px]">
                    {reports?.filter((r: any) => r.status === 'assigned').length || 0}
                  </span>
                </Button>
                <Button variant="ghost" className="w-full justify-between text-xs font-medium text-slate-600 hover:text-medical-blue hover:bg-medical-blue/5 h-9 rounded-lg px-3">
                  Resolved <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px]">
                    {reports?.filter((r: any) => r.status === 'resolved').length || 0}
                  </span>
                </Button>
             </CardContent>
           </Card>

           <Card className="bg-medical-blue text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <AlertCircle size={60} />
             </div>
             <CardContent className="p-6">
               <h4 className="font-bold mb-2">Need immediate help?</h4>
               <p className="text-xs text-white/80 mb-6">Contact our 24/7 technical support line for critical breakdowns.</p>
               <Button className="w-full bg-white text-medical-blue hover:bg-slate-100 font-bold text-xs h-10 rounded-lg">
                 Call Support
               </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
