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
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A9A7A8]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by token (e.g. A-104), name, or phone..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#A9A7A8]/60 text-[#2D3441] placeholder-[#A9A7A8] text-sm focus:outline-none focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/20 transition-all"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-[#6C7380] text-sm bg-white/60 rounded-xl border border-dashed border-[#A9A7A8]/40">
              No matching tickets found for "{searchTerm}".
            </div>
          ) : (
            filteredTokens.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectToken(t.id);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white hover:bg-[#EDECEB]/50 border border-[#A9A7A8]/35 hover:border-[#E07015] flex items-center justify-between cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#2D3441] border border-[#2D3441] font-mono font-black text-white flex items-center justify-center text-sm shadow-sm group-hover:bg-[#E07015] transition-colors">
                    {t.tokenNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2D3441]">{t.customerName}</span>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                    <div className="text-xs text-[#6C7380] mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-[#2D3441]">{t.serviceName}</span>
                      <span>•</span>
                      <span>{t.contact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-[#A9A7A8] group-hover:text-[#E07015] transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
