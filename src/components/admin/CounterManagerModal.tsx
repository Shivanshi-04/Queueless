import React, { useState, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Modal } from '../common/Modal';
import { Plus, User, Trash2, Edit3, Check, Layers, AlertCircle } from 'lucide-react';
import type { Counter } from '../../types/queue';

interface CounterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CounterRowProps {
  counter: Counter;
  onDelete: (id: string) => void;
}

const CounterRow: React.FC<CounterRowProps> = ({ counter, onDelete }) => {
  const { services, updateCounterStaff, updateCounterName, updateCounterServices } = useQueue();

  const [staffName, setStaffName] = useState(counter.staffName || '');
  const [counterName, setCounterName] = useState(counter.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setStaffName(counter.staffName || '');
  }, [counter.staffName]);

  useEffect(() => {
    setCounterName(counter.name || '');
  }, [counter.name]);

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStaffName(val);
    updateCounterStaff(counter.id, val);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (counterName.trim() && counterName !== counter.name) {
      updateCounterName(counter.id, counterName.trim());
    }
  };

  const toggleServiceForCounter = (serviceId: string) => {
    let updated: string[];
    const currentServices = counter.supportedServiceIds || ['*'];
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
    updateCounterServices(counter.id, updated);
  };

  return (
    <div className="p-4 rounded-xl glass-panel-light border border-slate-700/80 space-y-3 relative group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Code & Editable Name */}
        <div className="flex items-center gap-2 flex-1">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30 shrink-0">
            {counter.code}
          </span>

          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1 max-w-xs">
              <input
                type="text"
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="w-full px-2 py-0.5 rounded bg-slate-900 border border-indigo-500 text-xs text-white focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleNameSave}
                className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                title="Save Desk Name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/name">
              <span className="font-bold text-slate-100 text-sm">{counter.name}</span>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="opacity-60 group-hover/name:opacity-100 p-0.5 text-slate-400 hover:text-indigo-300 transition-all"
                title="Edit Desk Name"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Staff Input & Delete Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={staffName}
              onChange={handleStaffChange}
              placeholder="Staff Officer Name"
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-28 sm:w-36 placeholder:text-slate-500"
            />
          </div>

          {/* Remove Desk Action */}
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-lg border border-rose-600/60 animate-in fade-in duration-150">
              <span className="text-[10px] text-rose-300 font-bold px-1">Delete?</span>
              <button
                type="button"
                onClick={() => onDelete(counter.id)}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all shadow"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
              title="Remove Desk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Services Tag Selector */}
      <div>
        <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
          Supported Service Specializations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => toggleServiceForCounter('*')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              counter.supportedServiceIds?.includes('*')
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Services (*)
          </button>

          {services.map((s) => {
            const isSupported =
              counter.supportedServiceIds?.includes('*') ||
              counter.supportedServiceIds?.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleServiceForCounter(s.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  isSupported && !counter.supportedServiceIds?.includes('*')
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
  );
};

export const CounterManagerModal: React.FC<CounterManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { counters, addNewCounter, deleteCounter } = useQueue();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newSelectedServices, setNewSelectedServices] = useState<string[]>(['*']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;

    setIsSubmitting(true);
    await addNewCounter(
      newCounterName.trim(),
      newStaffName.trim() || 'Officer on Duty',
      newSelectedServices
    );

    setNewCounterName('');
    setNewStaffName('');
    setNewSelectedServices(['*']);
    setIsAddingNew(false);
    setIsSubmitting(false);
  };

  const handleDelete = (counterId: string) => {
    deleteCounter(counterId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Counter & Staff Desk Management"
      subtitle="Configure counter capacity, assign duty officers, set service specializations, and remove desks."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Active Counters Count Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Configured Desks: <span className="font-mono text-indigo-300">{counters.length}</span></span>
          </div>
          <span className="text-[11px] text-slate-500">
            Changes save instantly to the live system
          </span>
        </div>

        {/* Counter List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {counters.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No service desks available</p>
              <p className="text-xs text-slate-500 mt-1">Add a new counter desk to start dispatching tickets.</p>
            </div>
          ) : (
            counters.map((counter) => (
              <CounterRow
                key={counter.id}
                counter={counter}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Add New Counter Toggle & Form */}
        {!isAddingNew ? (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-900/30 hover:bg-slate-900/60"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Counter Desk</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Service Desk Setup</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Counter / Desk Name</label>
                <input
                  type="text"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  placeholder="e.g. Counter 5 (Express Desk)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Assigned Staff Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newCounterName.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Desk'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
