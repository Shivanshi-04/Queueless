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
  Volume2,
  VolumeX,
  UserCheck,
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
      {/* Top Customer Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 border border-indigo-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-indigo-400">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Customer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Self-Service Digital Ticket Desk
              </p>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Chimes' : 'Mute Chimes'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Customer User Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-200 font-semibold">{user?.name || 'Customer'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Navigation Switcher between Form & Live Pass */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubView('form')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'form'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Take a Ticket</span>
            </button>

            <button
              onClick={() => setActiveSubView('pass')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                activeSubView === 'pass'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>My Ticket Pass</span>
              {activeToken && activeToken.status === 'called' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsLookupOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search Existing Ticket</span>
          </button>
        </div>

        {/* View Rendering */}
        {activeSubView === 'form' ? (
          <TokenGenerationForm onTokenCreated={handleTokenCreated} />
        ) : (
          <LiveTokenPass
            onNewTokenRequest={() => setActiveSubView('form')}
            onOpenLookup={() => setIsLookupOpen(true)}
          />
        )}
      </main>

      {/* Ticket Lookup Modal */}
      <TokenLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onSelectToken={(tokenId) => {
          setActiveCustomerToken(tokenId);
          setActiveSubView('pass');
          setIsLookupOpen(false);
        }}
      />
    </div>
  );
};
