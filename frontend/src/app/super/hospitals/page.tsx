'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Building2, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AddHospitalModal } from '@/components/super/AddHospitalModal';
import { mediaUrl } from '@/lib/utils';

export default function HospitalsManagementPage() {
  const [search, setSearch] = useState('');

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['super-hospitals'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Hospital Management</h1>
          <p className="text-slate-500 text-sm">Onboard, monitor, and manage all hospitals on the platform.</p>
        </div>
        <AddHospitalModal />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search by hospital name or code..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-blue/20 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="p-8 text-center animate-pulse">Loading hospitals...</div>
            ) : hospitals?.length === 0 ? (
              <div className="p-20 text-center text-slate-400">No hospitals registered yet.</div>
            ) : (
              hospitals?.map((h: any) => (
                <div key={h._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-medical-navy shrink-0 overflow-hidden">
                      {h.logo ? (
                        <img 
                          src={mediaUrl(h.logo)} 
                          alt="Logo" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Building2 size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-medical-navy">{h.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                          h.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {h.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Globe size={12} /> {h.code}</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={12} /> {h.subscriptionPlan} Plan</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/super/hospitals/${h._id}`}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 group-hover:text-medical-blue transition-colors">
                      <ChevronRight size={20} />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
