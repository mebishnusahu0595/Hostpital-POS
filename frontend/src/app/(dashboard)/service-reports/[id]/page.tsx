'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  User as UserIcon,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const priorityColor: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-100',
  high: 'text-orange-600 bg-orange-50 border-orange-100',
  medium: 'text-amber-600 bg-amber-50 border-amber-100',
  low: 'text-blue-600 bg-blue-50 border-blue-100',
};

export default function ServiceReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'hospital_admin';
  const canResolve = isAdmin || user?.role === 'engineer';

  const [resolution, setResolution] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['service-report', id],
    queryFn: async () => {
      const res = await api.get(`/service-reports/${id}`);
      return res.data.data;
    },
  });

  const { data: engineers } = useQuery({
    queryKey: ['engineers'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/users');
      return (res.data.data as any[]).filter((u) => u.role === 'engineer');
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['service-report', id] });
    queryClient.invalidateQueries({ queryKey: ['service-reports'] });
  };

  const handleAssign = async () => {
    if (!engineerId) return toast.error('Select an engineer first.');
    setBusy(true);
    try {
      await api.patch(`/service-reports/${id}/assign`, { engineerId });
      toast.success('Report assigned.');
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) return toast.error('Describe the resolution first.');
    setBusy(true);
    try {
      await api.patch(`/service-reports/${id}/resolve`, { resolution });
      toast.success('Report resolved.');
      setResolution('');
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resolve.');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
      </div>
    );

  if (!report)
    return (
      <div className="text-center py-20 text-slate-400">
        <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
        <p>Service report not found.</p>
        <Button variant="outline" onClick={() => router.push('/service-reports')} className="mt-4 rounded-xl">
          Back to reports
        </Button>
      </div>
    );

  const resolved = report.status === 'resolved' || report.status === 'closed';

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => router.push('/service-reports')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-medical-blue">
        <ArrowLeft size={16} /> Back to Service Reports
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">{report.title || report.equipmentId?.name}</h1>
          <p className="text-slate-500 text-sm">
            {report.equipmentId?.name} • <span className="font-mono uppercase">{report.equipmentId?.equipmentCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${priorityColor[report.priority] || ''}`}>
            {report.priority}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            {resolved ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-amber-500" />}
            {report.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                <p className="text-sm text-slate-700 capitalize">{report.issueType}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.description || report.issueDescription || '—'}</p>
              </div>
              {report.resolution && (
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Resolution
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.resolution}</p>
                  {report.resolvedAt && (
                    <p className="text-xs text-slate-400 mt-2">Resolved {new Date(report.resolvedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {canResolve && !resolved && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench size={18} className="text-medical-blue" /> Resolve Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  placeholder="Describe the work done to resolve this issue..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
                />
                <Button onClick={handleResolve} disabled={busy} className="bg-medical-navy text-white rounded-xl">
                  {busy ? 'Saving...' : 'Mark as Resolved'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Report Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reported by</span>
                <span className="font-medium text-slate-700">{report.reportedBy?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned to</span>
                <span className="font-medium text-slate-700">{report.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-slate-700">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              {report.sla?.targetTime && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SLA target</span>
                  <span className={`font-medium ${report.sla.breached ? 'text-red-500' : 'text-slate-700'}`}>
                    {new Date(report.sla.targetTime).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin && !resolved && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserIcon size={16} className="text-medical-blue" /> Assign Engineer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={engineerId}
                  onChange={(e) => setEngineerId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
                >
                  <option value="">Select engineer</option>
                  {(engineers || []).map((eng: any) => (
                    <option key={eng._id} value={eng._id}>
                      {eng.name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAssign} disabled={busy} variant="outline" className="w-full rounded-xl">
                  {busy ? 'Assigning...' : 'Assign'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
