import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Modal } from '../common/Modal';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Search, ArrowRight } from 'lucide-react';

interface TokenLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (tokenId: string) => void;
}

export const TokenLookupModal: React.FC<TokenLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
}) => {
  const { tokens } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = tokens.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      t.tokenNumber.toLowerCase().includes(term) ||
      t.customerName.toLowerCase().includes(term) ||
      t.contact.toLowerCase().includes(term)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Find & Track Your Ticket"
      subtitle="Enter your Token Number, Name or Phone Number to view your live queue pass."
    >
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by token (e.g. A-104), name, or phone..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No matching tickets found.
            </div>
          ) : (
            filteredTokens.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectToken(t.id);
                  onClose();
                }}
                className="p-3.5 rounded-xl glass-card-interactive flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-white flex items-center justify-center text-sm">
                    {t.tokenNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{t.customerName}</span>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{t.serviceName}</span>
                      <span>•</span>
                      <span>{t.contact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
