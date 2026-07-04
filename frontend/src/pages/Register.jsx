import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export const Register = () => {
  const { register: signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setApiError('');
    console.log('[GOOGLE AUTH FRONTEND] handleGoogleSuccess triggered.');
    console.log('[GOOGLE AUTH FRONTEND] Credential response object:', credentialResponse);
    console.log('[GOOGLE AUTH FRONTEND] ID Token received (length):', credentialResponse?.credential ? credentialResponse.credential.length : 0);
    
    try {
      console.log('[GOOGLE AUTH FRONTEND] Sending POST request to /api/auth/google...');
      const res = await loginWithGoogle(credentialResponse.credential);
      console.log('[GOOGLE AUTH FRONTEND] API Response received:', res);
      if (res.success) {
        console.log('[GOOGLE AUTH FRONTEND] Login success. User:', res.user);
        toast.success('Registration successful! Welcome to SafeHer AI.');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[GOOGLE AUTH FRONTEND] Login failed with error:', err);
      if (err.response) {
        console.error('[GOOGLE AUTH FRONTEND] Error status code:', err.response.status);
        console.error('[GOOGLE AUTH FRONTEND] Error response body:', err.response.data);
      } else {
        console.error('[GOOGLE AUTH FRONTEND] Error message (no response):', err.message);
      }
      const msg = err.response?.data?.message || err.message || 'Google Sign In failed.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('[GOOGLE AUTH FRONTEND] Google Sign-In error callback triggered. Error details:', error);
    const msg = 'Google popup blocked or authentication failed. Please try again.';
    setApiError(msg);
    toast.error(msg);
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
 
        {/* OR Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700/50"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-semibold">OR</span>
          <div className="flex-grow border-t border-slate-700/50"></div>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            text="continue_with"
            shape="rectangular"
            width="384"
          />
        </div>

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
