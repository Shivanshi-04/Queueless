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
} from 'lucide-react';

export const QueueTable: React.FC = () => {
  const { tokens, services, cancelToken, transferToken } = useQueue();

  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in_service' | 'completed' | 'priority'>('waiting');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [transferModalToken, setTransferModalToken] = useState<Token | null>(null);

  const filteredTokens = tokens.filter((t) => {
    if (activeTab === 'waiting' && t.status !== 'waiting') return false;
    if (activeTab === 'in_service' && t.status !== 'in_service' && t.status !== 'called') return false;
    if (activeTab === 'completed' && t.status !== 'completed' && t.status !== 'no_show') return false;
    if (activeTab === 'priority' && (t.priority === 'regular' || t.status !== 'waiting')) return false;

    if (serviceFilter !== 'all' && t.serviceId !== serviceFilter) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      t.tokenNumber.toLowerCase().includes(term) ||
      t.customerName.toLowerCase().includes(term) ||
      t.contact.toLowerCase().includes(term) ||
      t.serviceName.toLowerCase().includes(term)
    );
  });

  const getElapsedString = (timestamp: number) => {
    const elapsedMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
    return `${elapsedMinutes}m ago`;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {[
            { id: 'waiting', label: 'Waiting', count: tokens.filter((t) => t.status === 'waiting').length },
            { id: 'in_service', label: 'In Service', count: tokens.filter((t) => t.status === 'in_service' || t.status === 'called').length },
            { id: 'priority', label: 'VIP / Urgent', count: tokens.filter((t) => t.status === 'waiting' && t.priority !== 'regular').length },
            { id: 'completed', label: 'Completed', count: tokens.filter((t) => t.status === 'completed').length },
            { id: 'all', label: 'All Records', count: tokens.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  activeTab === tab.id ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token, name, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-all"
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
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Token #</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Service Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Wait Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No queue records found for this filter.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => (
                <tr
                  key={token.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      {token.tokenNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{token.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{token.contact}</span>
                      </div>
                      {token.notes && (
                        <span className="text-[10px] text-slate-500 italic block mt-0.5 max-w-xs truncate">
                          "{token.notes}"
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {token.serviceName}
                  </td>

                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={token.priority} size="sm" />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={token.status} size="sm" />
                    {token.counterName && (
                      <div className="text-[10px] text-indigo-400 mt-1 font-medium">
                        {token.counterName} ({token.staffName})
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{getElapsedString(token.createdAt)}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {token.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => setTransferModalToken(token)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
                            title="Transfer to another service"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => cancelToken(token.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs transition-all"
                            title="Cancel Token"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {token.status === 'completed' && (
                        <span className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Transfer Ticket: {transferModalToken.tokenNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
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
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    transferModalToken.serviceId === service.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{service.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{service.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTransferModalToken(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
