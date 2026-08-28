'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings2, Plus } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { mediaUrl } from '@/lib/utils';

interface EditHospitalModalProps {
  hospital: any;
}

export function EditHospitalModal({ hospital }: EditHospitalModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hospital?.logo) {
      setPreview(mediaUrl(hospital.logo));
    } else {
      setPreview(null);
    }
  }, [hospital?.logo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const logoFile = formData.get('logo') as File;

    const jsonData = {
      name: formData.get('name'),
      contactEmail: formData.get('contactEmail'),
      subscriptionPlan: formData.get('subscriptionPlan'),
      address: {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
      }
    };

    const finalData = new FormData();
    finalData.append('data', JSON.stringify(jsonData));
    if (logoFile) finalData.append('logo', logoFile);

    try {
      await api.patch(`/hospitals/${hospital._id}`, finalData);
      toast.success('Configuration updated!');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hospital', hospital._id] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-medical-navy text-white rounded-xl gap-2 h-11 px-6">
          <Settings2 size={18} /> Edit Configuration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-medical-navy">Edit Facility Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-white relative">
              {preview ? (
                <img src={preview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <Plus className="text-slate-300" size={24} />
              )}
              <input 
                type="file" 
                name="logo" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-medical-navy">Update Logo</h4>
              <p className="text-xs text-slate-500 mt-1">Change the hospital logo. Leave empty to keep existing.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Name</label>
              <Input name="name" defaultValue={hospital?.name} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Code (Read-only)</label>
              <Input value={hospital?.code} disabled className="rounded-xl bg-slate-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Plan</label>
              <select 
                name="subscriptionPlan" 
                defaultValue={hospital?.subscriptionPlan}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
              >
                <option value="free">Free Trial</option>
                <option value="basic">Basic</option>
                <option value="pro">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
              <Input name="contactEmail" type="email" defaultValue={hospital?.contactEmail} required className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-sm font-bold text-medical-navy uppercase tracking-widest">Location Details</h4>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <Input name="street" defaultValue={hospital?.address?.street} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                <Input name="city" defaultValue={hospital?.address?.city} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">State</label>
                <Input name="state" defaultValue={hospital?.address?.state} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ZIP</label>
                <Input name="pincode" defaultValue={hospital?.address?.pincode} className="rounded-xl" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-medical-navy text-white rounded-xl">
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
