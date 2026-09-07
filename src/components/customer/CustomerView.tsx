import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { TokenGenerationForm } from './TokenGenerationForm';
import { LiveTokenPass } from './LiveTokenPass';
import { TokenLookupModal } from './TokenLookupModal';
import { QrCode, PlusCircle, Search } from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { activeCustomerTokenId, setActiveCustomerToken, tokens } = useQueue();
  const [activeTab, setActiveTab] = useState<'form' | 'pass'>(() => {
    return activeCustomerTokenId ? 'pass' : 'form';
  });
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const activeToken = tokens.find((t) => t.id === activeCustomerTokenId);

  const handleTokenCreated = (tokenId: string) => {
    setActiveCustomerToken(tokenId);
    setActiveTab('pass');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Top Customer Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Customer Service Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Check-in digitally, generate instant service tokens, and monitor wait times in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Lookup Modal Button */}
          <button
            onClick={() => setIsLookupOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Find My Ticket</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Get Token</span>
            </button>
            <button
              onClick={() => setActiveTab('pass')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pass'
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

      {/* Main Content Area */}
      <div className="transition-all duration-300">
        {activeTab === 'form' ? (
          <TokenGenerationForm onTokenCreated={handleTokenCreated} />
        ) : (
          <LiveTokenPass
            onNewTokenRequest={() => setActiveTab('form')}
            onOpenLookup={() => setIsLookupOpen(true)}
          />
        )}
      </div>

      {/* Search / Lookup Modal */}
      <TokenLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onSelectToken={(tokenId) => {
          setActiveCustomerToken(tokenId);
          setActiveTab('pass');
        }}
      />
    </div>
  );
};
