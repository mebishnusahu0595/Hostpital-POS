'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Users,
  Warehouse,
  Thermometer,
  TrendingUp,
  ClipboardList,
  CalendarClock,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/scm/dashboard' },
  { label: 'Inventory', icon: Boxes, href: '/scm/inventory' },
  { label: 'Expiry Alerts', icon: CalendarClock, href: '/scm/expiry' },
  { label: 'Suppliers', icon: Users, href: '/scm/suppliers' },
  { label: 'Purchase Orders', icon: ClipboardList, href: '/scm/purchase-orders' },
  { label: 'Shipments', icon: Truck, href: '/scm/shipments' },
  { label: 'Cold Chain', icon: Thermometer, href: '/scm/cold-chain' },
  { label: 'Warehouses', icon: Warehouse, href: '/scm/warehouses' },
  { label: 'Forecasting', icon: TrendingUp, href: '/scm/forecasting' },
];

export default function ScmSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'w-64 bg-medical-navy text-white h-screen fixed left-0 top-0 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/scm/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center">
            <Boxes size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">OncOrg SCM</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Supply Chain</p>
          </div>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group',
                isActive ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={20} className={cn(isActive ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all',
            pathname === '/profile' && 'text-white bg-white/5'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">Supply Chain</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
