'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Stethoscope, 
  ShieldAlert, 
  ExternalLink,
  History,
  Activity,
  MapPin,
  Mail,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import { EditHospitalModal } from '@/components/super/EditHospitalModal';
import { mediaUrl } from '@/lib/utils';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: hospital, isLoading: hospitalLoading } = useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      const res = await api.get(`/hospitals/${id}`);
      return res.data.data;
    }
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['hospital-staff', id],
    queryFn: async () => {
      const res = await api.get(`/users?hospitalId=${id}`);
      return res.data.data;
    }
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['hospital-logs', id],
    queryFn: async () => {
      const res = await api.get(`/audit-logs?hospitalId=${id}`);
      return res.data.data;
    }
  });

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/hospitals/${id}/suspend`);
      toast.success(hospital?.isActive ? 'Facility suspended' : 'Facility activated');
      router.refresh();
      // Refetch the query
      queryClient.invalidateQueries({ queryKey: ['hospital', id] });
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hospital?.logo) {
      setLogoUrl(mediaUrl(hospital.logo));
    } else {
      setLogoUrl(null);
    }
  }, [hospital?.logo, hospital?.updatedAt]);

  if (hospitalLoading) return <div className="p-12 text-center animate-pulse text-medical-navy font-bold">⚕️ Retrieving Facility Dossier...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-medical-blue/5 text-slate-400 hover:text-medical-blue transition-colors">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-medical-navy">{hospital?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                hospital?.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {hospital?.isActive ? 'Operational' : 'Suspended'}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">Onboarded: {new Date(hospital?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className={`rounded-xl h-11 px-6 border-slate-100 font-bold transition-all ${hospital?.isActive ? 'text-red-600 hover:bg-red-50 hover:border-red-100' : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'}`}
           >
             {hospital?.isActive ? 'Suspend Facility' : 'Activate Facility'}
           </Button>
           <EditHospitalModal hospital={hospital} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden group">
            <div className="h-32 medical-gradient relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)]" />
            </div>
            <CardContent className="p-6 -mt-12 relative">
              <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-medical-navy/5 border border-slate-100 flex items-center justify-center text-medical-navy mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Building2 size={40} className="text-slate-200" />
                )}
              </div>
              <h3 className="text-xl font-bold text-medical-navy">{hospital?.name}</h3>
              <p className="text-xs font-bold text-medical-blue uppercase tracking-widest mt-1">{hospital?.code}</p>
              
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{hospital?.address?.city}, {hospital?.address?.state}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{hospital?.contactEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <ShieldAlert size={16} className="text-slate-400" />
                  <span className="capitalize font-bold text-medical-navy">{hospital?.subscriptionPlan} Subscription</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-400">Inventory Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-medical-blue flex items-center justify-center">
                     <Stethoscope size={16} />
                   </div>
                   <span className="text-sm font-medium">Total Assets</span>
                 </div>
                 <span className="text-sm font-bold text-medical-navy">{hospital?.stats?.total || 0}</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                     <ShieldAlert size={16} />
                   </div>
                   <span className="text-sm font-medium">Out of Service</span>
                 </div>
                 <span className="text-sm font-bold text-medical-navy">{hospital?.stats?.outOfService || 0}</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Section */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} className="text-medical-blue" /> Authorized Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                 {staffLoading ? (
                   <div className="p-6 text-center animate-pulse">Loading staff...</div>
                 ) : staff?.length === 0 ? (
                   <div className="p-8 text-center text-slate-400">No staff accounts registered.</div>
                 ) : (
                   staff?.map((s: any) => (
                     <div key={s._id} className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                           {s.name.substring(0, 1)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-medical-navy">{s.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{s.role.replace('_', ' ')}</p>
                         </div>
                       </div>
                       <span className="text-xs text-slate-500">{s.email}</span>
                     </div>
                   ))
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Logs Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <History size={18} className="text-medical-blue" /> Facility Audit Logs
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-medical-blue font-bold">
                Export Logs
              </Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                 {logsLoading ? (
                   <div className="p-8 text-center animate-pulse">Loading activity...</div>
                 ) : auditLogs?.length === 0 ? (
                   <div className="p-12 text-center text-slate-400">No recent activity logged.</div>
                 ) : (
                   auditLogs?.map((log: any) => (
                     <div key={log._id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-slate-200 mt-2 shrink-0" />
                        <div className="flex-1">
                           <div className="flex items-center justify-between">
                             <p className="text-sm text-medical-navy font-bold">
                               <span className="text-medical-blue capitalize">{log.userId?.name || 'System'}</span> 
                               {' '}{log.action.replace('_', ' ')}
                             </p>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                               {new Date(log.timestamp).toLocaleString()}
                             </span>
                           </div>
                           <p className="text-xs text-slate-500 mt-1">Resource: {log.resource} • IP: {log.ipAddress}</p>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
