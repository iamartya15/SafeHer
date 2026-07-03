import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Toast warning if session expired redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      toast.error('Session expired. Please log in again.');
    }
  }, [location]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await login(data);
      if (res.success) {
        toast.success('Logged in successfully!');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-full border border-purple-500/20 mb-2">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to SafeHer</h2>
          <p className="text-xs text-slate-400">Welcome back. Enter your credentials to access your safety command center.</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-purple-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`glass-input pl-10 pr-10 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-400 block">{errors.password.message}</span>
            )}
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
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2">
          New to SafeHer?{' '}
          <Link to="/register" className="text-purple-400 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
