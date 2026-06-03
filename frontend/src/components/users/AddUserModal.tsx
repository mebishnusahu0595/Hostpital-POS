'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Shield, Mail, Phone, Lock, User as UserIcon } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/users', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User added successfully');
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        password: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-medical-navy p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-medical-blue/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <UserPlus className="text-medical-blue" size={28} />
              Add Facility Staff
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-2">
              Create a new user account for your hospital staff or engineers.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Dr. John Doe" 
                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-medical-blue/20 transition-all"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="john@hospital.com" 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="+91 98765 43210" 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">User Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-medical-blue/20 transition-all appearance-none"
                >
                  <option value="staff">Staff / Nurse</option>
                  <option value="engineer">Service Engineer</option>
                  <option value="scm_manager">Supply Chain Manager</option>
                  <option value="hospital_admin">Department Admin</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="flex-[2] bg-medical-blue hover:bg-medical-blue/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-medical-blue/20 transition-all"
            >
              {mutation.isPending ? 'Adding...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
