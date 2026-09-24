import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import type { Token } from '../../types/queue';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import {
  Search,
  Clock,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  Phone,
  HeartHandshake,
} from 'lucide-react';

export const QueueTable: React.FC = () => {
  const { tokens, services, cancelToken, transferToken } = useQueue();

  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in_service' | 'completed' | 'priority'>('waiting');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [seniorOnly, setSeniorOnly] = useState<boolean>(false);
  const [transferModalToken, setTransferModalToken] = useState<Token | null>(null);

  const filteredTokens = tokens.filter((t) => {
    if (activeTab === 'waiting' && t.status !== 'waiting') return false;
    if (activeTab === 'in_service' && t.status !== 'in_service' && t.status !== 'called') return false;
    if (activeTab === 'completed' && t.status !== 'completed' && t.status !== 'no_show') return false;
    if (activeTab === 'priority' && (t.priority === 'regular' || t.status !== 'waiting')) return false;

    if (seniorOnly && t.priority !== 'senior_disabled') return false;
    if (serviceFilter !== 'all' && t.serviceId !== serviceFilter) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Direct senior keyword matching
    if (term === 'senior' || term === 'seniors' || term === 'elderly' || term === 'elder' || term === 'assisted') {
      return t.priority === 'senior_disabled';
    }

    return (
      t.tokenNumber.toLowerCase().includes(term) ||
      t.customerName.toLowerCase().includes(term) ||
      t.contact.toLowerCase().includes(term) ||
      t.serviceName.toLowerCase().includes(term) ||
      (t.notes && t.notes.toLowerCase().includes(term)) ||
      (t.priority === 'senior_disabled' && (term.includes('sen') || term.includes('elder') || term.includes('assist')))
    );
  });

  const getElapsedString = (timestamp: number) => {
    const elapsedMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
    return `${elapsedMinutes}m ago`;
  };

  const seniorsCount = tokens.filter((t) => t.priority === 'senior_disabled').length;

  return (
    <div className="bg-[#F8F8F6] rounded-2xl border border-[#A9A7A8]/40 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-[#A9A7A8]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {[
            { id: 'waiting', label: 'Waiting', count: tokens.filter((t) => t.status === 'waiting').length },
            { id: 'in_service', label: 'In Service', count: tokens.filter((t) => t.status === 'in_service' || t.status === 'called').length },
            { id: 'priority', label: 'VIP / Urgent', count: tokens.filter((t) => t.status === 'waiting' && (t.priority === 'vip' || t.priority === 'urgent')).length },
            { id: 'completed', label: 'Completed', count: tokens.filter((t) => t.status === 'completed').length },
            { id: 'all', label: 'All Records', count: tokens.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#E07015] text-white shadow-sm'
                  : 'text-[#6C7380] hover:text-[#2D3441] hover:bg-[#EDECEB]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  activeTab === tab.id ? 'bg-[#C75D0D] text-white' : 'bg-[#EDECEB] text-[#6C7380]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Controls (Single place for Seniors search option) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token, name, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#A9A7A8]/60 text-[#2D3441] placeholder-[#A9A7A8] text-xs focus:outline-none focus:border-[#E07015] transition-all"
            />
          </div>

          {/* Search Option for Seniors (The single dedicated place) */}
          <button
            type="button"
            onClick={() => setSeniorOnly(!seniorOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
              seniorOnly
                ? 'bg-[#E07015] text-white border-[#E07015] ring-2 ring-[#E07015]/30'
                : 'bg-white hover:bg-[#EDECEB] text-[#2D3441] border-[#A9A7A8]/60 hover:border-[#E07015]'
            }`}
            title="Filter queue manifest for senior citizens only"
          >
            <HeartHandshake className={`w-3.5 h-3.5 ${seniorOnly ? 'text-white' : 'text-[#E07015]'}`} />
            <span>Seniors ({seniorsCount})</span>
          </button>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white border border-[#A9A7A8]/60 text-[#2D3441] text-xs focus:outline-none focus:border-[#E07015] transition-all cursor-pointer font-medium"
          >
            <option value="all">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#2D3441]">
          <thead className="bg-[#EDECEB]/80 text-[11px] uppercase tracking-wider text-[#2D3441] font-bold border-b border-[#A9A7A8]/30">
            <tr>
              <th className="py-3.5 px-4">Token #</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Service Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Wait Time</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A9A7A8]/20 bg-white">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6C7380]">
                  No queue records found for this filter.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => (
                <tr
                  key={token.id}
                  className={`transition-colors group ${
                    token.priority === 'senior_disabled'
                      ? 'bg-[#DF9B60]/8 hover:bg-[#DF9B60]/15'
                      : 'hover:bg-[#EDECEB]/40'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-[#2D3441] bg-[#F8F8F6] px-2.5 py-1 rounded-lg border border-[#A9A7A8]/40 shadow-xs">
                      {token.tokenNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-[#2D3441] flex items-center gap-1.5">
                        <span>{token.customerName}</span>
                        {token.priority === 'senior_disabled' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#DF9B60]/25 text-[#2D3441] border border-[#DF9B60]/40">
                            <HeartHandshake className="w-2.5 h-2.5 text-[#E07015]" />
                            <span>Senior</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6C7380] font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#A9A7A8]" />
                        <span>{token.contact}</span>
                      </div>
                      {token.notes && (
                        <span className="text-[10px] text-[#6C7380] italic block mt-0.5 max-w-xs truncate">
                          "{token.notes}"
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-[#2D3441]">
                    {token.serviceName}
                  </td>

                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={token.priority} size="sm" />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={token.status} size="sm" />
                    {token.counterName && (
                      <div className="text-[10px] text-[#E07015] mt-1 font-semibold">
                        {token.counterName} ({token.staffName})
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#6C7380]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A9A7A8]" />
                      <span>{getElapsedString(token.createdAt)}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {token.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => setTransferModalToken(token)}
                            className="p-1.5 rounded-lg bg-[#EDECEB] hover:bg-[#DFCAB2]/50 text-[#2D3441] border border-[#A9A7A8]/50 text-xs transition-all cursor-pointer"
                            title="Transfer to another service"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#E07015]" />
                          </button>
                          <button
                            onClick={() => cancelToken(token.id)}
                            className="p-1.5 rounded-lg bg-[#EDECEB] hover:bg-rose-100 text-[#6C7380] hover:text-rose-700 border border-[#A9A7A8]/50 hover:border-rose-300 text-xs transition-all cursor-pointer"
                            title="Cancel Token"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {token.status === 'completed' && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {transferModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232932]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#F8F8F6] rounded-2xl p-6 border border-[#A9A7A8]/40 shadow-2xl">
            <h3 className="text-base font-bold text-[#2D3441] mb-1">
              Transfer Ticket: {transferModalToken.tokenNumber}
            </h3>
            <p className="text-xs text-[#6C7380] mb-4">
              Select the new service category for customer {transferModalToken.customerName}.
            </p>

            <div className="space-y-2 mb-6">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    transferToken(transferModalToken.id, service.id);
                    setTransferModalToken(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    transferModalToken.serviceId === service.id
                      ? 'bg-[#E07015]/15 border-[#E07015] text-[#E07015]'
                      : 'bg-white border-[#A9A7A8]/40 text-[#2D3441] hover:border-[#E07015]'
                  }`}
                >
                  <div className="font-bold">{service.name}</div>
                  <div className="text-[10px] text-[#6C7380] font-normal mt-0.5">{service.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTransferModalToken(null)}
                className="px-4 py-2 rounded-xl bg-[#EDECEB] hover:bg-[#DFCAB2]/50 text-[#2D3441] text-xs font-semibold cursor-pointer border border-[#A9A7A8]/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
