'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit3, 
  History, 
  Wrench, 
  QrCode, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EquipmentDetailPage() {
  const { id } = useParams();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await api.get(`/equipment/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="w-8 h-8 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm font-medium">Loading details...</p>
    </div>
  );

  if (error || !item) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <AlertCircle size={48} className="text-red-200 mb-4" />
      <h3 className="text-lg font-bold text-medical-navy">Equipment Not Found</h3>
      <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto mb-6">The equipment ID might be incorrect or you don't have access to this record.</p>
      <Link href="/equipment">
        <Button variant="outline" className="rounded-xl px-6">Back to Registry</Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/equipment">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-medical-navy">{item.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.status?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 font-mono text-sm">{item.equipmentCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl gap-2">
            <QrCode size={18} /> View QR
          </Button>
          <Link href={`/equipment/${id}/edit`}>
            <Button className="bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl gap-2">
              <Edit3 size={18} /> Edit Details
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Manufacturer</p>
                  <p className="text-sm font-medium text-medical-navy">{item.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Model Number</p>
                  <p className="text-sm font-medium text-medical-navy">{item.modelNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Serial Number</p>
                  <p className="text-sm font-medium text-medical-navy">{item.serialNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm font-medium text-medical-navy">{item.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-medium text-medical-navy">
                    {typeof item.location === 'object' 
                      ? (item.location.room || item.location.building || 'N/A') 
                      : (item.location || 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-medium text-medical-navy">{item.category || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Maintenance History</CardTitle>
              <Link href={`/maintenance?equipmentId=${id}`}>
                <Button variant="ghost" size="sm" className="text-medical-blue font-bold text-xs">View Full History</Button>
              </Link>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                 {/* Placeholder for maintenance logs */}
                 <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <History size={40} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">No maintenance records found for this asset.</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="bg-medical-navy text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wrench size={80} />
            </div>
            <CardHeader>
              <CardTitle className="text-white">Maintenance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Next Scheduled PM</p>
                <p className="text-xl font-bold">{item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString() : 'Not Scheduled'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Maintenance Frequency</p>
                <p className="text-lg font-bold capitalize">{item.maintenanceFrequency}</p>
              </div>
              <Button className="w-full bg-white text-medical-navy hover:bg-slate-100 font-bold h-11 rounded-xl">
                Schedule Service
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {item.qrCode ? (
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-inner mb-4">
                  <img src={item.qrCode} alt="Equipment QR Code" className="w-40 h-40" />
                </div>
              ) : (
                <div className="w-40 h-40 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 mb-4">
                  <p className="text-xs text-slate-400">No QR Generated</p>
                </div>
              )}
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Scan to report issue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
