import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  Layers,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Shield,
  KeyRound,
} from 'lucide-react';

export const ResetPasswordScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const { updatePassword, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // 1. Check existing active session (established by Supabase from recovery link)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setHasValidSession(true);
          setIsCheckingSession(false);
          return;
        }
      } catch (err) {
        console.warn('[RESET PASSWORD] Error getting session:', err);
      }

      // If no session found immediately, wait briefly for Supabase to parse hash/tokens
      const timeout = setTimeout(async () => {
        if (!isMounted) return;
        const { data: { session: delayedSession } } = await supabase.auth.getSession();
        if (delayedSession && isMounted) {
          setHasValidSession(true);
        } else if (isMounted) {
          setHasValidSession(false);
        }
        setIsCheckingSession(false);
      }, 1000);

      return () => clearTimeout(timeout);
    };

    // 2. Listen for Supabase PASSWORD_RECOVERY or SIGNED_IN auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setHasValidSession(true);
          setIsCheckingSession(false);
        }
      }
    });

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setIsSuccess(true);
        // Cleanly sign out recovery session so user logs in cleanly with new credentials
        logout();
      } else {
        setErrorMessage(res.error || 'Failed to update password. Your reset link may be invalid or expired.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while updating your password.');
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
          Create New Password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8F8F6] p-6 sm:p-8 rounded-2xl border border-[#A9A7A8]/40 shadow-xl">
          {isCheckingSession ? (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#E07015] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#6C7380]">
                Verifying password recovery session...
              </p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900 mb-0.5">Password Updated</div>
                  <p>Your password has been successfully updated. You can now sign in with your new credentials.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E07015] hover:bg-[#C75D0D] shadow-md shadow-[#E07015]/25 transition-all cursor-pointer"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !hasValidSession ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900 mb-0.5">Invalid or Expired Link</div>
                  <p>
                    This password reset link is invalid or has already expired. Please request a new recovery link.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E07015] hover:bg-[#C75D0D] shadow-md shadow-[#E07015]/25 transition-all cursor-pointer"
              >
                <span>Request New Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C7380] hover:text-[#E07015] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#E07015]/10 text-[#E07015] flex items-center justify-center mx-auto mb-2 border border-[#E07015]/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#2D3441]">Set new password</h2>
                <p className="mt-1 text-xs text-[#6C7380]">
                  Please enter and confirm your new password below.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-[#6C7380] mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-[#A9A7A8]/50 rounded-xl text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15 transition-all disabled:opacity-60"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#A9A7A8]">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6C7380] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
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
                      <span>Update Password</span>
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
            </>
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
