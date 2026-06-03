'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Boxes, ArrowLeft, Truck, Thermometer, TrendingUp } from 'lucide-react';

function ScmLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      setAuth(data, data.accessToken);
      toast.success(`Welcome back, ${data.name}!`);
      router.push('/scm/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-medical-navy">Email Address</label>
        <Input
          type="email"
          placeholder="name@facility.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl h-12 border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-medical-navy">Password</label>
        <PasswordInput
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-xl h-12 border-slate-200"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-medical-blue/20"
      >
        {loading ? 'Signing in...' : 'Access Supply Chain'}
      </Button>
    </form>
  );
}

export default function ScmLoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center">
                <Boxes size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-medical-navy leading-tight">OncOrg SCM</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Supply Chain Module</p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-500 gap-2 rounded-xl">
                <ArrowLeft size={16} /> Main Login
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-medical-navy mb-2">Supply Chain Control</h1>
          <p className="text-slate-500 mb-8">Sign in to manage inventory, procurement, and logistics.</p>

          <Suspense fallback={<div className="py-10 text-center text-slate-400">Loading form...</div>}>
            <ScmLoginForm />
          </Suspense>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 medical-gradient items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-medical-blue rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8 mx-auto">
            <Boxes size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">End-to-End Oncology Supply Chain</h2>
          <p className="text-white/70 text-lg leading-relaxed mb-12">
            Drugs & chemotherapy inventory, cold chain integrity, supplier performance, and demand forecasting — in one platform.
          </p>
          <div className="flex items-center justify-center gap-8 text-white/60">
            <div className="flex flex-col items-center gap-2">
              <Truck size={24} />
              <span className="text-xs">Logistics</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Thermometer size={24} />
              <span className="text-xs">Cold Chain</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp size={24} />
              <span className="text-xs">Forecasting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
