'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      
      setAuth(data, data.accessToken);
      toast.success(`Welcome back, ${data.name}!`);

      // Redirect based on role
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        if (data.role === 'super_admin') {
          router.push('/super/dashboard');
        } else if (data.role === 'scm_manager') {
          router.push('/scm/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
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
          placeholder="name@hospital.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="rounded-xl h-12 border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-medical-navy">Password</label>
          <Link href="/forgot-password" className="text-xs text-medical-blue font-bold hover:underline">
            Forgot Password?
          </Link>
        </div>
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
        className="w-full bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-medical-navy/20"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/image.png" alt="CMS Logo" className="h-10 w-auto" />
            </Link>
            <Link href="/">
               <Button variant="ghost" size="sm" className="text-slate-500 gap-2 rounded-xl">
                 <ArrowLeft size={16} /> Back to Home
               </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-medical-navy mb-2">Welcome Back</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your facility dashboard.</p>

          <Suspense fallback={<div className="py-10 text-center text-slate-400">Loading form...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account yet? <br />
              <Link href="/#contact" className="text-medical-blue font-bold hover:underline">
                Contact your administrator or request a demo
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 medical-gradient items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-medical-blue rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8 mx-auto overflow-hidden">
            <img src="/images/image.png" alt="CMS Logo" className="w-12 h-12 object-contain brightness-0 invert" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Centralized Medical Solutions</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            "The simplest way to manage mission-critical equipment and ensure patient safety across your entire network."
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-2 text-white/50 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-medical-navy bg-slate-800"></div>
              ))}
            </div>
            <span>Trusted by 100+ Hospitals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
