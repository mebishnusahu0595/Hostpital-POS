'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Globe, Plus, BadgeCheck } from 'lucide-react';
import api from '@/lib/axios';
import { mediaUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const TIMEZONES = ['Asia/Kolkata', 'America/Chicago', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'UTC'];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const hospitalId = user?.hospitalId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['my-hospital', hospitalId],
    enabled: !!hospitalId,
    queryFn: async () => {
      const res = await api.get(`/hospitals/${hospitalId}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (hospital) {
      setForm({
        name: hospital.name || '',
        contactEmail: hospital.contactEmail || '',
        contactPhone: hospital.contactPhone || '',
        street: hospital.address?.street || '',
        city: hospital.address?.city || '',
        state: hospital.address?.state || '',
        pincode: hospital.address?.pincode || '',
        timezone: hospital.settings?.timezone || 'Asia/Kolkata',
      });
      setLogoPreview(hospital.logo ? mediaUrl(hospital.logo) : null);
    }
  }, [hospital]);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId) return toast.error('No facility linked to your account.');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        settings: { timezone: form.timezone },
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(payload));
      if (logoFile) fd.append('logo', logoFile);

      await api.patch(`/hospitals/${hospitalId}`, fd);
      toast.success('Facility settings saved.');
      queryClient.invalidateQueries({ queryKey: ['my-hospital', hospitalId] });
      setLogoFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!hospitalId) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-medical-navy mb-1">Settings</h1>
        <p className="text-slate-500 text-sm">No facility is linked to your account.</p>
      </div>
    );
  }

  if (isLoading || !form)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1">Facility Settings</h1>
        <p className="text-slate-500 text-sm">Manage your hospital profile, logo and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 size={18} className="text-medical-blue" /> Facility Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-white relative">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Plus className="text-slate-300" size={24} />
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-medical-navy">Hospital Logo</h4>
                <p className="text-xs text-slate-500 mt-1">Click the box to upload. Leave unchanged to keep current.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Code</label>
                <Input value={hospital.code} disabled className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
                <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin size={18} className="text-medical-blue" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">State</label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PIN / ZIP</label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe size={18} className="text-medical-blue" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription</label>
              <div className="h-11 px-3 flex items-center gap-2 bg-slate-50 rounded-xl text-sm text-slate-600 capitalize">
                <BadgeCheck size={16} className="text-medical-blue" />
                {hospital.subscriptionPlan} • {hospital.subscriptionStatus}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-medical-navy text-white rounded-xl px-8 h-11">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
