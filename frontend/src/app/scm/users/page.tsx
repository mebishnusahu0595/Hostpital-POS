'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Warehouse, 
  Search, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Building2,
  Mail,
  KeyRound,
  Shield
} from 'lucide-react';

export default function ScmUsersManagementPage() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const queryClient = useQueryClient();

  // Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['scm-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    }
  });

  // Fetch SCM Facilities / Hospitals
  const { data: facilities } = useQuery({
    queryKey: ['scm-facilities-list'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data.data;
    }
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await api.post('/users', formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('SCM Administrator created successfully!');
      queryClient.invalidateQueries({ queryKey: ['scm-users'] });
      setIsAddModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/users/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['scm-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update user');
    }
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await api.post(`/users/${id}/reset-password`, { newPassword: password });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setResetPasswordUser(null);
      setNewPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User removed');
      queryClient.invalidateQueries({ queryKey: ['scm-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  });

  const filteredUsers = users?.filter((u: any) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.hospitalId?.name?.toLowerCase().includes(q)
    );
  });

  const superAdmins = filteredUsers?.filter((u: any) => u.role === 'super_admin') || [];
  const scmManagers = filteredUsers?.filter((u: any) => u.role === 'scm_manager') || [];
  const otherUsers = filteredUsers?.filter((u: any) => u.role !== 'super_admin' && u.role !== 'scm_manager') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-medical-blue/10 text-medical-blue uppercase tracking-wider">
              Control Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-medical-navy mt-1">SCM Administrators & Staff</h1>
          <p className="text-slate-500 text-sm">
            Create, assign facilities, and manage access credentials for Supply Chain managers and operators.
          </p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11 px-6 shadow-lg shadow-medical-blue/20">
              <UserPlus size={18} /> Add SCM Administrator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-2xl">
            <div className="bg-medical-navy p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-medical-blue" /> Create SCM Administrator
                </DialogTitle>
              </DialogHeader>
              <p className="text-slate-400 text-xs mt-1">
                New user will be granted permissions to control SCM inventory, logistics & procurement.
              </p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  name: fd.get('name'),
                  email: fd.get('email'),
                  phone: fd.get('phone') || undefined,
                  password: fd.get('password'),
                  role: fd.get('role'),
                  hospitalId: fd.get('hospitalId') || undefined
                });
              }}
              className="p-6 space-y-4 bg-white"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <Input name="name" placeholder="e.g. John Doe" required className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <Input name="email" type="email" placeholder="scm.admin@facility.com" required className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <PasswordInput name="password" placeholder="••••••••" required className="rounded-xl mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role</label>
                  <select 
                    name="role" 
                    defaultValue="scm_manager"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-medical-blue"
                  >
                    <option value="scm_manager">SCM Manager</option>
                    <option value="super_admin">SCM Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Facility</label>
                  <select 
                    name="hospitalId" 
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-medical-blue"
                  >
                    <option value="">All / Global Facility</option>
                    {facilities?.map((f: any) => (
                      <option key={f._id} value={f._id}>{f.name} ({f.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl h-11 font-bold shadow-lg shadow-medical-blue/20"
                >
                  {createMutation.isPending ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SCM Super Admins</p>
            <h3 className="text-2xl font-bold text-medical-navy">{superAdmins.length}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-medical-blue/10 text-medical-blue flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SCM Managers</p>
            <h3 className="text-2xl font-bold text-medical-navy">{scmManagers.length}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Warehouse size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Facilities</p>
            <h3 className="text-2xl font-bold text-medical-navy">{facilities?.length || 1}</h3>
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <Input 
          placeholder="Search by name, email or facility..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl bg-white border-slate-200"
        />
      </div>

      {/* Users List */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-12 text-center text-slate-400 animate-pulse font-bold">
              Loading SCM User Directory...
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No users found matching "{search}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Facility / Center</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredUsers?.map((u: any) => {
                    const isSuper = u.role === 'super_admin';
                    const isScmManager = u.role === 'scm_manager';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSuper ? 'bg-purple-100 text-purple-700' : 'bg-medical-blue/10 text-medical-blue'
                            }`}>
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-medical-navy">{u.name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail size={12} /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isSuper 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : isScmManager
                              ? 'bg-medical-blue/10 text-medical-blue border border-medical-blue/20'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <Building2 size={14} className="text-slate-400" />
                            {u.hospitalId?.name || 'Global Logistics Center'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {u.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetPasswordUser(u)}
                            className="rounded-xl h-8 px-3 text-xs gap-1.5 text-slate-600"
                          >
                            <KeyRound size={13} /> Reset Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActiveMutation.mutate({ id: u._id, isActive: !u.isActive })}
                            className={`rounded-xl h-8 px-2 text-xs ${u.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          {!isSuper && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${u.name}?`)) {
                                  deleteMutation.mutate(u._id);
                                }
                              }}
                              className="rounded-xl h-8 px-2 text-xs text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <Dialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
          <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-2xl">
            <div className="bg-medical-navy p-6 text-white">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-medical-blue" /> Reset Password
              </DialogTitle>
              <p className="text-slate-400 text-xs mt-1">
                Enter a new password for <span className="text-white font-bold">{resetPasswordUser.name}</span> ({resetPasswordUser.email}).
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetPasswordMutation.mutate({
                  id: resetPasswordUser._id,
                  password: newPassword
                });
              }}
              className="p-6 space-y-4 bg-white"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                <PasswordInput
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-xl mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setResetPasswordUser(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl"
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
