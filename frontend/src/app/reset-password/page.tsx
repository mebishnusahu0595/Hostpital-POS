'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Invalid or missing reset token.');
    if (password !== confirm) return toast.error('Passwords do not match.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset! You can now log in.');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-medical-navy mb-2">Password updated</h2>
        <p className="text-slate-500 mb-8 text-sm">Redirecting you to the login page...</p>
        <Link href="/login" className="text-medical-blue font-bold text-sm hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-medical-navy mb-2">Invalid reset link</h2>
        <p className="text-slate-500 mb-6 text-sm">This link is missing its token or has expired.</p>
        <Link href="/forgot-password" className="text-medical-blue font-bold text-sm hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-medical-navy mb-2 text-center">Set a new password</h1>
      <p className="text-slate-500 mb-8 text-center text-sm">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-medical-navy">New Password</label>
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-12 border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-medical-navy">Confirm New Password</label>
          <PasswordInput
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="rounded-xl h-12 border-slate-200"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl h-12 text-base font-bold"
        >
          {loading ? 'Updating...' : 'Reset Password'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/image.png" alt="CMS Logo" className="h-10 w-auto" />
            <span className="font-heading text-2xl font-extrabold tracking-tighter text-medical-navy">CMS</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-500 gap-2 rounded-xl">
              <ArrowLeft size={16} /> Back to Login
            </Button>
          </Link>
        </div>

        <Suspense fallback={<div className="py-10 text-center text-slate-400">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
