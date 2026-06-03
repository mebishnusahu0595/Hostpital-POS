'use client';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Search, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { mediaUrl } from '@/lib/utils';
import NotificationPanel from './NotificationPanel';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      logout(); // Force local logout anyway
      router.push('/login');
    }
  };

  return (
    <header className="h-16 border-b border-slate-100 bg-white sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="lg:hidden text-slate-500"
        >
          <Menu size={24} />
        </Button>
        
        <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search equipment, tickets, or users..." 
          className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
        />
      </div>
    </div>

      <div className="flex items-center gap-4 ml-auto">
        <NotificationPanel />

        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-medical-navy">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.hospitalId ? 'Hospital Portal' : 'Platform Control'}</p>
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden bg-medical-blue/10 flex items-center justify-center shrink-0">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(user.avatar)} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-medical-blue">
                {user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
