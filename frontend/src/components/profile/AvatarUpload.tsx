'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { mediaUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function AvatarUpload() {
  const { user, updateUser } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB.');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Profile picture updated.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload picture.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-medical-blue/10 flex items-center justify-center ring-4 ring-white shadow-sm">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(user.avatar)}
              alt={user?.name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-medical-blue">{initials || '?'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-medical-navy text-white flex items-center justify-center shadow-md hover:bg-medical-blue transition-colors disabled:opacity-60"
          title="Change picture"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        </button>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-medical-navy">{user?.name}</p>
        <p className="text-xs text-slate-400">{user?.email}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
