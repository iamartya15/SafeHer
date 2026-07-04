import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import { User, Phone, Mail, Camera, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';

export const Profile = () => {
  const { user, updateProfile, updateAvatarState } = useAuth();
  
  const userRoles = user?.roles && user?.roles.length > 0 ? user.roles : [user?.role || 'user'];
  const [actAsGuardian, setActAsGuardian] = useState(userRoles.includes('guardian'));
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const toastId = toast.loading('Syncing profile details...');
    try {
      const selectedRoles = ['user'];
      if (userRoles.includes('admin')) {
        selectedRoles.push('admin');
      }
      if (actAsGuardian) {
        selectedRoles.push('guardian');
      }

      const res = await updateProfile({
        name: data.name,
        phone: data.phone,
        roles: selectedRoles
      });
      if (res.success) {
        toast.success('Profile details updated successfully!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update details.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    const toastId = toast.loading('Uploading avatar photo...');
    try {
      const res = await authService.uploadAvatar(formData);
      if (res.success) {
        updateAvatarState(res.avatar);
        toast.success('Avatar photo updated!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo.', { id: toastId });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">Manage your handle, avatar photo, and contact information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Avatar Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center gap-4">
          <div className="relative group">
            <img
              src={getAvatarSrc(user?.avatar, user?.name)}
              alt={user?.name}
              className="w-28 h-28 rounded-full object-cover border-2 border-purple-500 shadow-xl"
              onError={(e) => {
                e.target.src = getAvatarSrc('', user?.name);
              }}
            />
            
            {/* Upload overlay */}
            <label className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[9px] text-white mt-1 font-bold">Edit Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
                className="hidden"
              />
            </label>
            
            {/* Spinner overlay if uploading */}
            {avatarLoading && (
              <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white leading-tight">{user?.name}</h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold uppercase tracking-wider block w-fit mx-auto">
              {user?.role}
            </span>
          </div>

          <div className="w-full text-left text-xs space-y-2 pt-4 border-t border-white/5 text-slate-400">
            <div className="flex justify-between">
              <span>Account ID</span>
              <code className="text-white font-mono text-[10px] truncate max-w-[120px]" title={user?.id}>{user?.id}</code>
            </div>
            <div className="flex justify-between">
              <span>Role Level</span>
              <span className="text-white">{user?.role === 'admin' ? 'Super Administrator' : user?.role === 'guardian' ? 'Active Guardian' : 'Monitored User'}</span>
            </div>
          </div>
        </div>

        {/* Details Form Column */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Profile Details</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Email Address (Cannot change)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="glass-input pl-10 bg-slate-950/40 text-slate-500 border-white/5 cursor-default focus:ring-0 focus:border-white/5 text-xs"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className={`glass-input pl-10 text-xs ${errors.name ? 'border-red-500/50' : ''}`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] text-red-400 block">{errors.name.message}</span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phone Contact</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="glass-input pl-10 text-xs"
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Roles Option */}
            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5 mt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account Workspaces</h4>
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={actAsGuardian}
                  onChange={(e) => setActAsGuardian(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/20"
                />
                <div>
                  <span className="font-bold text-white block">Also act as a Safety Guardian</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Enabling this grants access to the Guardian Command Center to protect others and receive emergency alerts.</span>
                </div>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-6 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
export default Profile;
