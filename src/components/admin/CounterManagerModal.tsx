import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Modal } from '../common/Modal';
import { Plus, User } from 'lucide-react';

interface CounterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounterManagerModal: React.FC<CounterManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { counters, services, addNewCounter, updateCounterStaff, updateCounterServices } = useQueue();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newSelectedServices, setNewSelectedServices] = useState<string[]>(['*']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName.trim() || !newStaffName.trim()) return;

    addNewCounter(newCounterName, newStaffName, newSelectedServices);
    setNewCounterName('');
    setNewStaffName('');
    setNewSelectedServices(['*']);
    setIsAddingNew(false);
  };

  const toggleServiceForCounter = (counterId: string, currentServices: string[], serviceId: string) => {
    let updated: string[];
    if (serviceId === '*') {
      updated = ['*'];
    } else {
      const withoutAll = currentServices.filter((s) => s !== '*');
      if (withoutAll.includes(serviceId)) {
        updated = withoutAll.filter((s) => s !== serviceId);
        if (updated.length === 0) updated = ['*'];
      } else {
        updated = [...withoutAll, serviceId];
      }
    }
    updateCounterServices(counterId, updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Counter & Staff Desk Management"
      subtitle="Configure counter capacity, assign duty officers, and set service specializations."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {counters.map((counter) => (
            <div
              key={counter.id}
              className="p-4 rounded-xl glass-panel-light border border-slate-700/80 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                    {counter.code}
                  </span>
                  <span className="font-bold text-slate-100 text-sm">{counter.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={counter.staffName}
                    onChange={(e) => updateCounterStaff(counter.id, e.target.value)}
                    placeholder="Staff Officer Name"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  Supported Service Types:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleServiceForCounter(counter.id, counter.supportedServiceIds, '*')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                      counter.supportedServiceIds.includes('*')
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    All Services (*)
                  </button>

                  {services.map((s) => {
                    const isSupported =
                      counter.supportedServiceIds.includes('*') ||
                      counter.supportedServiceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleServiceForCounter(counter.id, counter.supportedServiceIds, s.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          isSupported && !counter.supportedServiceIds.includes('*')
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isAddingNew ? (
          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Counter Desk</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              New Service Desk Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Counter Name</label>
                <input
                  type="text"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  placeholder="e.g. Counter 5 (Express Desk)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Assigned Staff Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
              >
                Save Desk
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
