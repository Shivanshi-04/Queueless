import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { TokenGenerationForm } from './TokenGenerationForm';
import { LiveTokenPass } from './LiveTokenPass';
import { TokenLookupModal } from './TokenLookupModal';
import {
  Layers,
  LogOut,
  Search,
  PlusCircle,
  QrCode,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeCustomerTokenId, setActiveCustomerToken, tokens, isMuted, toggleMute } = useQueue();

  const [activeSubView, setActiveSubView] = useState<'form' | 'pass'>(() => {
    return activeCustomerTokenId ? 'pass' : 'form';
  });
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const activeToken = tokens.find((t) => t.id === activeCustomerTokenId);

  const handleTokenCreated = (tokenId: string) => {
    setActiveCustomerToken(tokenId);
    setActiveSubView('pass');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Customer Header Bar (Isolated) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-indigo-400">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Customer Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                Self-Service Digital Ticket Desk
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Customer Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-slate-300 font-semibold">{user?.name || 'Customer'}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md font-mono">
                {user?.role || 'Customer'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all"
              title="Sign Out of Customer Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Customer Portal Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Sub-Navigation: Get Token vs Live Tracker */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Digital Check-In & Live Queue Pass</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Generate a queue token or track your current queue position and estimated callout time.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Lookup Modal Trigger */}
            <button
              onClick={() => setIsLookupOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Find My Ticket</span>
            </button>

            {/* Sub-Switch: Token Form vs Live Tracker */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveSubView('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSubView === 'form'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Get Token</span>
              </button>
              <button
                onClick={() => setActiveSubView('pass')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSubView === 'pass'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Live Tracker</span>
                {activeToken && activeToken.status === 'called' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="transition-all duration-300">
          {activeSubView === 'form' ? (
            <TokenGenerationForm onTokenCreated={handleTokenCreated} />
          ) : (
            <LiveTokenPass
              onNewTokenRequest={() => setActiveSubView('form')}
              onOpenLookup={() => setIsLookupOpen(true)}
            />
          )}
        </div>

        {/* Lookup Modal */}
        <TokenLookupModal
          isOpen={isLookupOpen}
          onClose={() => setIsLookupOpen(false)}
          onSelectToken={(tokenId) => {
            setActiveCustomerToken(tokenId);
            setActiveSubView('pass');
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>QueueLess Digital Customer Service Portal</span>
          </div>
          <span>Automatic real-time WebSocket state synchronization</span>
        </div>
      </footer>
    </div>
  );
};
