'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SuperAdminRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/scm/login');
    } else if (user?.role === 'super_admin') {
      router.replace('/scm/users');
    } else {
      router.replace('/scm/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-medical-navy font-bold text-sm">
        Redirecting to SCM Super Admin Control Panel...
      </div>
    </div>
  );
}
