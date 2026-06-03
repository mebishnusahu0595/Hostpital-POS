'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { User, Lock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/profile/AvatarUpload';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/me', { name: profile.name, phone: profile.phone });
      updateUser({ name: res.data.data.name, phone: res.data.data.phone });
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    setPassLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated! Please login again.');
      logout();
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your personal account and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={18} className="text-medical-blue" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <Input defaultValue={user?.email} disabled className="rounded-xl bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button disabled={loading} className="bg-medical-navy text-white rounded-xl px-8">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-sm">
             <CardContent className="p-6">
               <AvatarUpload />
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-medical-navy text-white">
             <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Facility</p>
                    <p className="text-sm font-bold truncate">{user?.hospitalId || 'Facility Portal'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/50 uppercase">Your Role</span>
                    <span className="text-[10px] font-bold uppercase">{user?.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/50 uppercase">Status</span>
                    <span className="text-[10px] font-bold uppercase text-green-400">Verified</span>
                  </div>
                </div>
             </CardContent>
           </Card>
        </div>

        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={18} className="text-medical-blue" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                <PasswordInput 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  placeholder="••••••••" 
                  required
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <PasswordInput 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  placeholder="••••••••" 
                  required
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <PasswordInput 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  placeholder="••••••••" 
                  required
                  className="rounded-xl" 
                />
              </div>
              <div className="pt-4">
                <Button disabled={passLoading} type="submit" variant="outline" className="rounded-xl px-8">
                  {passLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
