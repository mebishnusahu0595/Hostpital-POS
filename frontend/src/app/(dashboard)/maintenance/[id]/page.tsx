'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function MaintenanceDetailPage() {
  const { id } = useParams();

  const { data: log, isLoading } = useQuery({
    queryKey: ['maintenance-log', id],
    queryFn: async () => {
      const res = await api.get(`/maintenance/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading maintenance details...</div>;
  if (!log) return <div className="p-8 text-center text-red-500">Log not found.</div>;

  const handleDownload = async () => {
    try {
      const response = await api.get(`/maintenance/${id}/report`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-medical-navy">Maintenance Record</h1>
          <p className="text-slate-500 text-sm">Ref: {log._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Service Information</CardTitle>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {log.status === 'completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {log.status}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Equipment</label>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-medical-blue font-bold">
                   {log.equipmentId?.name?.charAt(0)}
                 </div>
                 <div>
                    <Link href={`/equipment/${log.equipmentId?._id}`} className="hover:underline text-medical-navy font-bold">
                      {log.equipmentId?.name}
                    </Link>
                    <p className="text-xs text-slate-500">{log.equipmentId?.equipmentCode}</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Type</label>
                <p className="text-sm font-medium">{log.type.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Scheduled Date</label>
                <p className="text-sm font-medium">{format(new Date(log.scheduledDate), 'PPP')}</p>
              </div>
              {log.completedAt && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Completed At</label>
                  <p className="text-sm font-medium text-green-600">{format(new Date(log.completedAt), 'PPP p')}</p>
                </div>
              )}
              {log.cost > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Cost</label>
                  <p className="text-sm font-medium">$ {log.cost}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Service Description</label>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 min-h-[100px]">
                {log.description || 'No description provided.'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Service Engineer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-medical-blue">
                   <User size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-medical-navy">{log.engineerId?.name || 'Unassigned'}</p>
                    <p className="text-xs text-slate-500">{log.engineerId?.email}</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-medical-navy text-white">
            <CardContent className="pt-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                   <FileText size={20} />
                 </div>
                 <h4 className="font-bold">Service Report</h4>
               </div>
               <p className="text-xs text-slate-400 mb-6">
                 {log.status === 'completed' 
                   ? 'Download the official digitally signed maintenance report.' 
                   : 'The report will be available once the maintenance is marked as completed.'}
               </p>
               <Button 
                 onClick={handleDownload}
                 disabled={log.status !== 'completed'}
                 className="w-full bg-medical-blue hover:bg-blue-600 text-white gap-2 font-bold"
               >
                 <Download size={16} /> Download PDF
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
