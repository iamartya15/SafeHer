import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export const Register = () => {
  const { register: signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 64; // subtracted padding p-8 (2 * 32)
      const width = rect.width - padding;
      setButtonWidth(Math.max(200, Math.min(400, Math.floor(width))));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        toast.success('Registration successful! Welcome to SafeHer AI.');
        navigate('/dashboard', { replace: true });
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setApiError('');
      try {
        const res = await loginWithGoogle(tokenResponse.access_token);
        if (res.success) {
          toast.success('Registration successful! Welcome to SafeHer AI.');
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Google Sign In failed.';
        setApiError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In error:', error);
      const msg = 'Google popup blocked or authentication failed. Please try again.';
      setApiError(msg);
      toast.error(msg);
    }
  });


  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <div ref={containerRef} className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
        
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
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: 'Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number'
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
 
        {/* OR Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700/50"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-semibold">OR</span>
          <div className="flex-grow border-t border-slate-700/50"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 transition-all font-semibold shadow-sm rounded-xl"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          <span>Continue with Google</span>
        </button>

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
