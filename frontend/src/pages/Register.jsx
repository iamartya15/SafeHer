import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await signup(data);
      if (res.success) {
        toast.success(res.message || 'Registration successful!');
        // Dev mode: backend returns tokens → auto-login, go to dashboard
        if (res.accessToken && res.user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Production: show email verification screen
          setRegisteredEmail(data.email);
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Render Success Screen
  if (registeredEmail) {
    const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl text-center space-y-6">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Registration Successful!</h2>
            {isDev ? (
              <>
                <p className="text-sm text-slate-300">
                  Development Mode: Your account has been <strong className="text-purple-400">automatically verified</strong>.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                  You can skip email activation and sign in immediately to start exploring the SafeHer safety command center.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  We've sent a verification link to <strong className="text-purple-400">{registeredEmail}</strong>.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                  Please check your inbox and click the verification link to activate your SafeHer AI account. If you do not receive it in 2 minutes, check your spam folder.
                </p>
              </>
            )}
          </div>
          <div className="pt-4">
            <Link to="/login" className="btn-primary w-full block py-3 text-sm">
              Proceed to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-full border border-purple-500/20 mb-2">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create SafeHer Account</h2>
          <p className="text-xs text-slate-400">Join our community to activate your safety network.</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Jane Doe"
                className={`glass-input pl-10 ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <span className="text-[10px] text-red-400 block">{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className={`glass-input pl-10 ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please provide a valid email'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-400 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className={`glass-input pl-10 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-400 block">{errors.password.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                placeholder="+91 9876543210"
                className="glass-input pl-10"
                {...register('phone')}
              />
            </div>
          </div>

          {/* Account Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">I am registering as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer transition-colors text-xs font-medium">
                <span>User (Monitored)</span>
                <input
                  type="radio"
                  value="user"
                  className="accent-purple-500 w-4 h-4"
                  {...register('role')}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer transition-colors text-xs font-medium">
                <span>Guardian (Monitor)</span>
                <input
                  type="radio"
                  value="guardian"
                  className="accent-purple-500 w-4 h-4"
                  {...register('role')}
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
