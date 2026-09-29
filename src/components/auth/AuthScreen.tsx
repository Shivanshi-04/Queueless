import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import {
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  ArrowRight,
  Tv,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (userRole: UserRole) => {
    const selectedDashboard = userRole === 'Admin' ? '/admin' : userRole === 'LoungeManager' ? '/lounge' : '/customer';
    console.log('[ROUTING] user.role:', userRole);
    console.log('[ROUTING] selected dashboard:', selectedDashboard);
    navigate(selectedDashboard, { replace: true });
  };

  // Automatically redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      handleRoleRedirect(user.role);
    }
  }, [isLoading, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        // Public registrations are strictly created with Customer role
        const res = await register({ name, email, password, role: 'Customer' });
        if (res.success) {
          handleRoleRedirect(res.user?.role || 'Customer');
        } else {
          setErrorMessage(res.error || 'Registration failed');
        }
      } else {
        const res = await login({ email, password });
        if (res.success && res.user) {
          handleRoleRedirect(res.user.role);
        } else if (res.success) {
          const saved = localStorage.getItem('queueless_auth_user');
          const parsed = saved ? JSON.parse(saved) : null;
          handleRoleRedirect(parsed?.role || 'Customer');
        } else {
          setErrorMessage(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Direct Access for Public Lounge TV Display (no authentication required)
  const handleLoungeDirectAccess = () => {
    navigate('/lounge');
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
          Smart, Real-Time Queue & Lounge Experience
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8F8F6] p-6 sm:p-8 rounded-2xl border border-[#A9A7A8]/40 shadow-xl">
          {/* Form Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#EDECEB] p-1 border border-[#A9A7A8]/30 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`w-1/2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-[#E07015] text-white shadow-sm'
                  : 'text-[#6C7380] hover:text-[#2D3441]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`w-1/2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-[#E07015] text-white shadow-sm'
                  : 'text-[#6C7380] hover:text-[#2D3441]'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#6C7380] mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-[#A9A7A8]/50 rounded-xl text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15 transition-all"
                  />
                </div>
              </div>
            )}

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
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-[#A9A7A8]/50 rounded-xl text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#6C7380]">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[11px] font-semibold text-[#E07015] hover:text-[#C75D0D] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-[#A9A7A8]/50 rounded-xl text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E07015] hover:bg-[#C75D0D] shadow-md shadow-[#E07015]/25 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create My Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Area */}
          <div className="mt-6 pt-5 border-t border-[#A9A7A8]/30 space-y-4">
            {/* Direct Lounge TV Button - 100% direct access without login */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D3441] flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-[#E07015]" />
                  Direct Access
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  No Login Required
                </span>
              </div>
              <button
                type="button"
                onClick={handleLoungeDirectAccess}
                className="w-full p-3 rounded-xl bg-[#2D3441] hover:bg-[#1C2128] text-white border border-[#232932] active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E07015] flex items-center justify-center text-white shadow-md">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>Lounge TV Display</span>
                      <span className="text-[10px] text-[#DF9B60] font-normal">• Live Public Screen</span>
                    </div>
                    <div className="text-[10px] text-[#A9A7A8]">
                      Instant 1-click access for waiting area & TV monitors
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#DF9B60] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
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
