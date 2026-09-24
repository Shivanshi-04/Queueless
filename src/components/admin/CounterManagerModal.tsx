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
    <div className="p-4 rounded-xl bg-white border border-[#A9A7A8]/40 space-y-3 relative group shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Code & Editable Name */}
        <div className="flex items-center gap-2 flex-1">
          <span className="px-2 py-0.5 rounded bg-[#E07015]/15 text-[#E07015] font-mono font-bold text-xs border border-[#E07015]/30 shrink-0">
            {counter.code}
          </span>

          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1 max-w-xs">
              <input
                type="text"
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="w-full px-2 py-0.5 rounded bg-[#EDECEB] border border-[#E07015] text-xs text-[#2D3441] focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleNameSave}
                className="p-1 rounded bg-[#E07015] hover:bg-[#DF9B60] text-white text-xs cursor-pointer"
                title="Save Desk Name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/name">
              <span className="font-bold text-[#2D3441] text-sm">{counter.name}</span>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="opacity-60 group-hover/name:opacity-100 p-0.5 text-[#6C7380] hover:text-[#E07015] transition-all cursor-pointer"
                title="Edit Desk Name"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Staff Input & Delete Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#EDECEB] px-2.5 py-1 rounded-lg border border-[#A9A7A8]/40">
            <User className="w-3.5 h-3.5 text-[#6C7380] shrink-0" />
            <input
              type="text"
              value={staffName}
              onChange={handleStaffChange}
              placeholder="Staff Officer Name"
              className="bg-transparent border-none text-xs text-[#2D3441] focus:outline-none w-28 sm:w-36 placeholder:text-[#A9A7A8]"
            />
          </div>

          {/* Remove Desk Action */}
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-300 animate-in fade-in duration-150">
              <span className="text-[10px] text-rose-700 font-bold px-1">Delete?</span>
              <button
                type="button"
                onClick={() => onDelete(counter.id)}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all shadow cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 rounded bg-[#EDECEB] text-[#6C7380] hover:text-[#2D3441] text-[10px] cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-[#6C7380] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title="Remove Desk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Services Tag Selector */}
      <div>
        <span className="text-[11px] text-[#6C7380] font-semibold block mb-1.5">
          Supported Service Specializations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => toggleServiceForCounter('*')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              counter.supportedServiceIds?.includes('*')
                ? 'bg-[#E07015] text-white font-bold shadow-xs'
                : 'bg-[#EDECEB] text-[#6C7380] hover:text-[#2D3441] border border-[#A9A7A8]/40'
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
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  isSupported && !counter.supportedServiceIds?.includes('*')
                    ? 'bg-[#E07015]/15 text-[#E07015] border border-[#E07015]/40 font-bold'
                    : 'bg-[#EDECEB] text-[#6C7380] hover:text-[#2D3441] border border-[#A9A7A8]/40'
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
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#EDECEB] border border-[#A9A7A8]/40 text-xs">
          <div className="flex items-center gap-2 text-[#2D3441] font-semibold">
            <Layers className="w-4 h-4 text-[#E07015]" />
            <span>Configured Desks: <span className="font-mono text-[#E07015] font-bold">{counters.length}</span></span>
          </div>
          <span className="text-[11px] text-[#6C7380]">
            Changes save instantly to the live system
          </span>
        </div>

        {/* Counter List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {counters.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#EDECEB]/50 border border-dashed border-[#A9A7A8]/60">
              <AlertCircle className="w-8 h-8 text-[#A9A7A8] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#2D3441]">No service desks available</p>
              <p className="text-xs text-[#6C7380] mt-1">Add a new counter desk to start dispatching tickets.</p>
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
            className="w-full py-3 rounded-xl border border-dashed border-[#A9A7A8]/70 hover:border-[#E07015] text-[#E07015] hover:text-[#DF9B60] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-[#EDECEB]/50"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Counter Desk</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-white border border-[#E07015]/40 space-y-4 shadow-sm animate-in fade-in duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E07015] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Service Desk Setup</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6C7380] mb-1 font-semibold">Counter / Desk Name</label>
                <input
                  type="text"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  placeholder="e.g. Counter 5 (Express Desk)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F8F6] border border-[#A9A7A8]/60 text-xs text-[#2D3441] focus:outline-none focus:border-[#E07015]"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#6C7380] mb-1 font-semibold">Assigned Staff Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F8F6] border border-[#A9A7A8]/60 text-xs text-[#2D3441] focus:outline-none focus:border-[#E07015]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#A9A7A8]/30">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-[#EDECEB] hover:bg-[#DFCAB2]/50 text-[#2D3441] text-xs font-semibold transition-all cursor-pointer border border-[#A9A7A8]/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newCounterName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#E07015] hover:bg-[#DF9B60] text-white text-xs font-bold shadow-md shadow-[#E07015]/30 transition-all disabled:opacity-50 cursor-pointer"
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
