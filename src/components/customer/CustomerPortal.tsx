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
  BellRing,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    activeCustomerTokenId,
    setActiveCustomerToken,
    customerTokens,
    tokens,
    stats,
    counters,
    isMuted,
    toggleMute,
  } = useQueue();

  const [activeSubView, setActiveSubView] = useState<'form' | 'pass'>(() => {
    return activeCustomerTokenId || customerTokens.length > 0 ? 'pass' : 'form';
  });
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const activeToken = tokens.find((t) => t.id === activeCustomerTokenId) || customerTokens[0];
  const activeCounters = counters.filter((c) => c.status === 'active').length;
  const anyCalledToken = customerTokens.find((t) => t.status === 'called');

  const handleTokenCreated = (tokenId: string) => {
    setActiveCustomerToken(tokenId);
    setActiveSubView('pass');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EDECEB] text-[#2D3441] selection:bg-[#E07015] selection:text-white">
      {/* Top Customer Header in Deep Navy Charcoal */}
      <header className="sticky top-0 z-40 w-full border-b border-[#232932]/10 bg-[#2D3441] text-[#FFFFFF] shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07015] to-[#DF9B60] flex items-center justify-center shadow-md shadow-[#E07015]/30 border border-[#DFCAB2]/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-[#DF9B60]">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E07015]/20 text-[#DFCAB2] border border-[#DFCAB2]/30">
                  Customer Desk
                </span>
              </div>
              <p className="text-[11px] text-[#A9A7A8] font-medium">
                Self-Service Digital Ticket & Live Wait Tracking
              </p>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Turn On Audio Chimes' : 'Mute Audio Chimes'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-[#232932] border-[#6C7380]/40 text-[#A9A7A8] hover:text-white'
                  : 'bg-[#E07015]/20 border-[#E07015]/50 text-[#DF9B60] hover:bg-[#E07015]/30'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Customer User Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#232932] border border-[#6C7380]/30 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#DF9B60]" />
              <span className="text-slate-100 font-semibold">{user?.name || 'Customer'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232932] hover:bg-rose-500/20 text-[#A9A7A8] hover:text-rose-300 border border-[#6C7380]/30 hover:border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
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
        {/* Welcome & How It Works Banner (Easy to Understand for Any Customer) */}
        <div className="bg-[#F8F8F6] rounded-2xl p-5 sm:p-6 border border-[#A9A7A8]/30 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DF9B60]/15 text-[#E07015] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <BellRing className="w-3 h-3 text-[#E07015]" />
                <span>Smart Queue Kiosk</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2D3441] tracking-tight">
                Welcome to Fast-Track Self Service
              </h1>
              <p className="text-xs sm:text-sm text-[#6C7380] mt-0.5 max-w-xl">
                Take a digital ticket in 10 seconds, monitor your turn live without standing in line, and receive a chime notification when called.
              </p>
            </div>

            {/* Quick Live System Overview Pill */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#EDECEB] border border-[#A9A7A8]/30 shrink-0">
              <div className="text-center pr-3 border-r border-[#A9A7A8]/40">
                <div className="text-lg font-black font-mono text-[#E07015]">{stats.totalWaiting}</div>
                <div className="text-[10px] text-[#6C7380] font-bold uppercase">In Queue</div>
              </div>
              <div className="text-center pr-3 border-r border-[#A9A7A8]/40">
                <div className="text-lg font-black font-mono text-[#2D3441]">{activeCounters}</div>
                <div className="text-[10px] text-[#6C7380] font-bold uppercase">Counters Open</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black font-mono text-[#2D3441]">~{stats.avgWaitMinutes}m</div>
                <div className="text-[10px] text-[#6C7380] font-bold uppercase">Avg Wait</div>
              </div>
            </div>
          </div>

          {/* 3 Step Visual Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#A9A7A8]/20">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#E07015] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D3441]">Choose Service</h4>
                <p className="text-[11px] text-[#6C7380]">Select your need and priority.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#DF9B60] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D3441]">Get Digital Ticket</h4>
                <p className="text-[11px] text-[#6C7380]">Instant pass with wait time & position.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#2D3441] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D3441]">Hear Announcement</h4>
                <p className="text-[11px] text-[#6C7380]">Proceed to counter when screen chimes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#F8F8F6] border border-[#A9A7A8]/30 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveSubView('form')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'form'
                  ? 'bg-[#E07015] text-white shadow-md shadow-[#E07015]/25'
                  : 'text-[#6C7380] hover:text-[#2D3441] hover:bg-[#EDECEB]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Get a New Ticket</span>
            </button>

            <button
              onClick={() => setActiveSubView('pass')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                activeSubView === 'pass'
                  ? 'bg-[#E07015] text-white shadow-md shadow-[#E07015]/25'
                  : 'text-[#6C7380] hover:text-[#2D3441] hover:bg-[#EDECEB]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>
                {customerTokens.length > 1
                  ? `My Passes (${customerTokens.length})`
                  : 'My Ticket Pass'}
              </span>
              {activeToken && (
                <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-mono">
                  {activeToken.tokenNumber}
                </span>
              )}
              {anyCalledToken && (
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsLookupOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F8F8F6] hover:bg-white border border-[#A9A7A8]/40 text-[#2D3441] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:border-[#E07015]/40 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#E07015]" />
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
