import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setSuccess(false);
        setMessage('Verification token is missing. Please check your verification link.');
        setLoading(false);
        return;
      }

      try {
        const res = await verifyEmail(token);
        if (res.success) {
          setSuccess(true);
          setMessage(res.message || 'Email verified successfully! You can now log in.');
        }
      } catch (err) {
        console.error(err);
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 shadow-2xl text-center space-y-6">
        
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying Email...</h2>
            <p className="text-xs text-slate-400">Please wait while we validate your activation token.</p>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Email Verified!</h2>
              <p className="text-sm text-slate-300">{message}</p>
            </div>
            <div className="pt-4">
              <Link to="/login" className="btn-primary w-full block py-3 text-sm">
                Proceed to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Verification Failed</h2>
              <p className="text-sm text-slate-300">{message}</p>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/register" className="btn-secondary w-full block py-3 text-sm">
                Register Again
              </Link>
              <Link to="/login" className="text-xs text-purple-400 font-semibold hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VerifyEmail;
