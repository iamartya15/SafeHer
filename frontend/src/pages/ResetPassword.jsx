import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { Shield, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setApiError('Invalid password reset link. Missing token.');
      toast.error('Missing reset token');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' }
  });

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    if (!token) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await resetPassword(token, data.password);
      if (res.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to reset password. Link might be expired.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
        
        {success ? (
          <div className="text-center space-y-6">
            <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Password Updated!</h2>
              <p className="text-sm text-slate-300">
                Your password has been successfully reset. You can now sign in using your new credentials.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/login" className="btn-primary w-full block py-3 text-sm">
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-purple-500/10 rounded-full border border-purple-500/20 mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Set New Password</h2>
              <p className="text-xs text-slate-400">Choose a strong, secure password for your account.</p>
            </div>

            {apiError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled={!token}
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled={!token}
                    className={`glass-input pl-10 ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Confirm your password',
                      validate: (value) => value === watchPassword || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-[10px] text-red-400 block">{errors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
