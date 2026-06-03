'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Stethoscope, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  FileText,
  Building2,
  Megaphone,
  PlusCircle,
  Boxes,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role;

  const getNavItems = () => {
    if (role === 'super_admin') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/super/dashboard' },
        { label: 'Hospitals', icon: Building2, href: '/super/hospitals' },
        { label: 'Users', icon: Users, href: '/super/users' },
        { label: 'Analytics', icon: BarChart3, href: '/super/analytics' },
        { label: 'Announcements', icon: Megaphone, href: '/super/announcements' },
      ];
    }

    const items = [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'Equipment', icon: Stethoscope, href: '/equipment' },
    ];

    if (role === 'hospital_admin' || role === 'engineer') {
      items.push({ label: 'Maintenance', icon: ClipboardList, href: '/maintenance' });
      items.push({ label: 'Service Reports', icon: FileText, href: '/service-reports' });
    }

    if (role === 'hospital_admin') {
      items.push({ label: 'Supply Chain', icon: Boxes, href: '/scm/dashboard' });
      items.push({ label: 'Users', icon: Users, href: '/users' });
      items.push({ label: 'Analytics', icon: BarChart3, href: '/analytics' });
      items.push({ label: 'Settings', icon: Settings, href: '/settings' });
    }

    if (role === 'staff') {
       // Staff only has basic views, but can raise reports
       items.push({ label: 'Raise Issue', icon: PlusCircle, href: '/service-reports/raise' });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "w-64 bg-medical-navy text-white h-screen fixed left-0 top-0 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/" className="flex flex-col items-center gap-4">
          <img 
            src="/images/image.png" 
            alt="CMS Logo" 
            className="h-12 lg:h-16 w-auto object-contain transition-transform hover:scale-105"
          />
        </Link>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-white/50 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-medical-blue text-white shadow-lg shadow-medical-blue/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-white" : "text-slate-500 group-hover:text-white"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <Link 
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all",
            pathname === '/profile' && "text-white bg-white/5"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{role?.replace('_', ' ')}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
