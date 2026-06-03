'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ScmSidebar from './ScmSidebar';
import Topbar from '@/components/layout/Topbar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

const ALLOWED = ['scm_manager', 'hospital_admin', 'super_admin'];

export default function ScmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  // The SCM login page must render without the authenticated shell.
  if (pathname === '/scm/login') {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      {user && !ALLOWED.includes(user.role) ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-medical-navy">No access to Supply Chain</h2>
          <p className="text-slate-500 text-sm max-w-md">
            Your account role does not have permission to view the Supply Chain module.
          </p>
          <Link href="/dashboard" className="text-medical-blue font-bold text-sm hover:underline">
            Back to your dashboard
          </Link>
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 flex">
          <ScmSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-medical-navy/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}
          <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full">
            <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
