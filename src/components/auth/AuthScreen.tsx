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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-500/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
          Queue<span className="text-indigo-400">Less</span>
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-400">
          Smart, Real-Time Queue & Lounge Experience
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/95 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Form Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              className={`w-1/2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`w-1/2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Role</label>
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
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
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
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
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
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-2.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Instant Demo Access (One-Click)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Customer')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-300 hover:text-indigo-300 active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-slate-200">Customer</span>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Get ticket pass</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-violet-950/20 text-slate-300 hover:text-violet-300 active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center mb-1 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5 text-violet-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-slate-200">Admin</span>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Call & manage</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('LoungeManager')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-300 hover:text-emerald-300 active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Tv className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-slate-200">Lounge TV</span>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Big screen kiosk</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Role-Guarded Enterprise Queue System</span>
        </div>
      </div>
    </div>
  );
};
