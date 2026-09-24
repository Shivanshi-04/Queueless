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
  Sparkles,
  Users,
  LayoutDashboard,
  Tv,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (userRole: UserRole) => {
    if (userRole === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (userRole === 'LoungeManager') {
      navigate('/lounge', { replace: true });
    } else {
      navigate('/customer', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const res = await register({ name, email, password, role });
        if (res.success) {
          handleRoleRedirect(role);
        } else {
          setErrorMessage(res.error || 'Registration failed');
        }
      } else {
        const res = await login({ email, password });
        if (res.success) {
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

  // Direct instant one-click login and navigation to the respective dashboard
  const handleQuickLogin = (targetRole: UserRole) => {
    setErrorMessage(null);
    quickLoginAs(targetRole);
    if (targetRole === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (targetRole === 'LoungeManager') {
      navigate('/lounge', { replace: true });
    } else {
      navigate('/customer', { replace: true });
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
              <label className="block text-xs font-semibold text-[#6C7380] mb-1">Password</label>
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

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#6C7380] mb-1.5">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Customer', label: 'Customer', icon: Users },
                    { id: 'Admin', label: 'Admin', icon: LayoutDashboard },
                    { id: 'LoungeManager', label: 'Lounge TV', icon: Tv },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as UserRole)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E07015]/15 border-[#E07015] text-[#E07015]'
                            : 'bg-white border-[#A9A7A8]/40 text-[#6C7380] hover:text-[#2D3441]'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

          {/* Quick 1-Click Demo Logins Bar */}
          <div className="mt-6 pt-5 border-t border-[#A9A7A8]/30">
            <div className="flex items-center gap-1.5 mb-2.5 text-[#2D3441]">
              <Sparkles className="w-3.5 h-3.5 text-[#E07015]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Instant Demo Access (One-Click)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Customer')}
                className="p-2.5 rounded-xl bg-white border border-[#A9A7A8]/40 hover:border-[#E07015] hover:bg-[#EDECEB]/50 text-[#2D3441] active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E07015]/15 flex items-center justify-center mb-1 group-hover:bg-[#E07015] group-hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5 text-[#E07015] group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-[#2D3441]">Customer</span>
                <span className="text-[9px] text-[#6C7380] mt-0.5 leading-tight">Get ticket pass</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="p-2.5 rounded-xl bg-white border border-[#A9A7A8]/40 hover:border-[#2D3441] hover:bg-[#EDECEB]/50 text-[#2D3441] active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2D3441]/10 flex items-center justify-center mb-1 group-hover:bg-[#2D3441] group-hover:text-white transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#2D3441] group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-[#2D3441]">Admin</span>
                <span className="text-[9px] text-[#6C7380] mt-0.5 leading-tight">Call & manage</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('LoungeManager')}
                className="p-2.5 rounded-xl bg-white border border-[#A9A7A8]/40 hover:border-[#DF9B60] hover:bg-[#EDECEB]/50 text-[#2D3441] active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#DF9B60]/20 flex items-center justify-center mb-1 group-hover:bg-[#DF9B60] group-hover:text-white transition-colors">
                  <Tv className="w-3.5 h-3.5 text-[#E07015] group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-[#2D3441]">Lounge TV</span>
                <span className="text-[9px] text-[#6C7380] mt-0.5 leading-tight">Big screen kiosk</span>
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
