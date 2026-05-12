'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Save, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

export function AddEquipmentModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    // Format data for backend
    const data = {
      ...rawData,
      location: {
        building: rawData.location as string
      },
      warrantyExpiry: rawData.warrantyExpirationDate
    };
    
    // Remove the old fields
    delete (data as any).warrantyExpirationDate;

    try {
      await api.post('/equipment', data);
      toast.success('Equipment registered successfully!');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11">
          <Plus size={18} /> Add Equipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-medical-navy flex items-center gap-2">
            <Stethoscope className="text-medical-blue" /> Register New Asset
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Equipment Name *</label>
              <Input name="name" placeholder="e.g. Philips MRI X2" required className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internal Asset Code *</label>
              <Input name="equipmentCode" placeholder="e.g. RAD-MRI-001" required className="rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category *</label>
              <select 
                name="category" 
                required
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
              >
                <option value="">Select Category</option>
                <option value="imaging">Imaging</option>
                <option value="monitoring">Monitoring</option>
                <option value="laboratory">Laboratory</option>
                <option value="surgical">Surgical</option>
                <option value="life_support">Life Support</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="sterilization">Sterilization</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
              <Input name="department" placeholder="e.g. Radiology" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
              <Input name="location" placeholder="e.g. Ground Floor" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manufacturer</label>
              <Input name="manufacturer" placeholder="e.g. GE Healthcare" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model Number</label>
              <Input name="modelNumber" placeholder="e.g. Signa V1" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Maintenance Frequency</label>
              <select 
                name="maintenanceFrequency" 
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Maintenance Date</label>
              <Input type="date" name="lastMaintenanceDate" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purchase Date</label>
              <Input type="date" name="purchaseDate" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Warranty Expiration</label>
              <Input type="date" name="warrantyExpirationDate" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1 rounded-xl h-11">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-medical-navy text-white rounded-xl h-11 gap-2">
              <Save size={18} /> {loading ? 'Saving...' : 'Register Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
