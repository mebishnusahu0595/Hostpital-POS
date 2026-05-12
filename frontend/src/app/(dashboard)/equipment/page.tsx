'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  QrCode,
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import { AddEquipmentModal } from '@/components/equipment/AddEquipmentModal';

export default function EquipmentListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', searchTerm],
    queryFn: async () => {
      const res = await api.get('/equipment', {
        params: searchTerm ? { search: searchTerm } : {}
      });
      console.log('Equipment Data:', res.data.data);
      return res.data.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'under_maintenance': return 'bg-amber-100 text-amber-700';
      case 'out_of_service': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Equipment Registry</h1>
          <p className="text-slate-500 text-sm">Manage and track all medical assets in your facility.</p>
        </div>
        <AddEquipmentModal />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search by name, code, or department..." 
                className="pl-10 h-11 rounded-xl bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-xl h-11 gap-2 bg-white">
              <Filter size={18} /> Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Equipment Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Next Maintenance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                             <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                             <div className="h-3 bg-slate-50 rounded w-1/4"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (!Array.isArray(equipment) || equipment.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                       <div className="max-w-xs mx-auto">
                          <Search className="mx-auto mb-4 text-slate-200" size={48} />
                          <h3 className="text-lg font-bold text-medical-navy mb-1">No Assets Found</h3>
                          <p className="text-slate-400 text-sm">We couldn't find any equipment matching your criteria or facility.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  equipment.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-medical-blue/5 text-medical-blue flex items-center justify-center font-black text-xs shrink-0 border border-medical-blue/10">
                            {item.category?.substring(0, 2).toUpperCase() || 'EQ'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-medical-navy group-hover:text-medical-blue transition-colors line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">{item.equipmentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-xs font-bold text-slate-600">{item.department || 'General Facility'}</div>
                         <div className="text-[10px] text-slate-400 mt-0.5">
                           {typeof item.location === 'object' 
                             ? (item.location.room || item.location.building || 'All Blocks') 
                             : (item.location || 'All Blocks')}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <CalendarIcon size={14} className="text-slate-300" />
                          {item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Scheduled'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <Link href={`/equipment/${item._id}`}>
                           <Button variant="ghost" size="sm" className="rounded-xl hover:bg-medical-blue/5 text-medical-blue font-bold text-xs gap-1">
                             View <ChevronRight size={14} />
                           </Button>
                         </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
