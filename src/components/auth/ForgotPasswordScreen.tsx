import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPasswordForEmail(trimmedEmail);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to request password reset. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDECEB] text-[#2D3441] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E07015] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E07015] to-[#DF9B60] flex items-center justify-center shadow-lg shadow-[#E07015]/30 border border-[#DFCAB2]/40">
            <Layers className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-[#2D3441] font-mono">
          Queue<span className="text-[#E07015]">Less</span>
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-[#6C7380]">
          Password Recovery
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8F8F6] p-6 sm:p-8 rounded-2xl border border-[#A9A7A8]/40 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-[#2D3441]">Reset your password</h2>
            <p className="mt-1 text-xs text-[#6C7380]">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900 mb-0.5">Check your email</div>
                  <p>Check your email for the password reset link.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E07015] hover:bg-[#C75D0D] shadow-md shadow-[#E07015]/25 transition-all cursor-pointer"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#6C7380] mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    disabled={isSubmitting}
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-[#A9A7A8]/50 rounded-xl text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E07015] hover:bg-[#C75D0D] shadow-md shadow-[#E07015]/25 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C7380] hover:text-[#E07015] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#6C7380]">
          <Shield className="w-3.5 h-3.5 text-[#E07015]" />
          <span>Role-Guarded Enterprise Queue System</span>
        </div>
      </div>
    </div>
  );
};
