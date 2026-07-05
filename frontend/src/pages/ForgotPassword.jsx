import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { Shield, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await forgotPassword(data.email);
      if (res.success) {
        setSuccess(true);
        toast.success('Request processed successfully.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to process request. Please try again.';
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
              <h2 className="text-2xl font-extrabold text-white">Request Processed</h2>
              <p className="text-sm text-slate-300">
                If an account with this email exists, a password reset link has been sent to your inbox.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/login" className="btn-primary w-full block py-3 text-sm">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-purple-500/10 rounded-full border border-purple-500/20 mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            {apiError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
