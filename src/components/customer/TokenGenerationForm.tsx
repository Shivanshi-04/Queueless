import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import type { PriorityLevel } from '../../types/queue';
import {
  User,
  Phone,
  Clock,
  Users,
  Sparkles,
  ShieldCheck,
  Crown,
  HeartHandshake,
  AlertCircle,
  CreditCard,
  UserCheck,
  Cpu,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface TokenGenerationFormProps {
  onTokenCreated?: (tokenId: string) => void;
}

export const TokenGenerationForm: React.FC<TokenGenerationFormProps> = ({ onTokenCreated }) => {
  const { services, tokens, counters, generateToken } = useQueue();

  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'account_services');
  const [priority, setPriority] = useState<PriorityLevel>('regular');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ customerName?: string; contact?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const waitingInSelected = tokens.filter(
    (t) => t.status === 'waiting' && t.serviceId === selectedServiceId
  ).length;

  const activeCountersForService = counters.filter(
    (c) =>
      c.status === 'active' &&
      (c.supportedServiceIds.includes('*') || c.supportedServiceIds.includes(selectedServiceId))
  ).length;

  const previewEstimatedMins = Math.max(
    2,
    Math.ceil(
      ((waitingInSelected + 1) *
        selectedService.avgDurationMins *
        (priority === 'urgent' ? 0.3 : priority === 'vip' ? 0.5 : priority === 'senior_disabled' ? 0.7 : 1)) /
        Math.max(1, activeCountersForService)
    )
  );

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return CreditCard;
      case 'Crown':
        return Crown;
      case 'Cpu':
        return Cpu;
      case 'Zap':
        return Zap;
      default:
        return UserCheck;
    }
  };

  const validate = () => {
    const errs: { customerName?: string; contact?: string } = {};
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your full name.';
    }
    if (!contact.trim()) {
      errs.contact = 'Please provide a phone number or email for SMS/call alerts.';
    } else if (contact.trim().length < 5) {
      errs.contact = 'Please enter a valid contact format.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const token = await generateToken({
        customerName,
        contact,
        serviceId: selectedServiceId,
        priority,
        notes,
      });

      setIsSubmitting(false);
      if (onTokenCreated) {
        onTokenCreated(token.id);
      }
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Kiosk Check-In</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Take Your Service Token
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Avoid standing in line. Join the real-time queue and track your position live from your phone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 relative">
          {/* Step 1: Customer Info */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">
                1
              </span>
              <span>Your Information</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: undefined });
                    }}
                    placeholder="e.g. Marcus Vance"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border ${
                      errors.customerName ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-700/80 focus:border-indigo-500'
                    } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Contact Number / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (errors.contact) setErrors({ ...errors, contact: undefined });
                    }}
                    placeholder="e.g. +1 (555) 019-2834"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border ${
                      errors.contact ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-700/80 focus:border-indigo-500'
                    } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.contact}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Service Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>Select Service Category</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const IconComponent = getServiceIcon(service.iconName);
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 text-indigo-400">
                        <CheckCircle2 className="w-4 h-4 fill-indigo-400/20" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 leading-tight">
                          {service.name}
                        </h4>
                        <span className="text-[11px] font-mono text-indigo-400">
                          Prefix: {service.prefix}-XXX
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
                      {service.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        ~{service.avgDurationMins}m / person
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Priority Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">
                3
              </span>
              <span>Priority Status (If Applicable)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'regular', label: 'Standard', desc: 'Normal queue ordering', icon: UserCheck },
                { id: 'senior_disabled', label: 'Senior / Assisted', desc: 'Priority counter access', icon: HeartHandshake },
                { id: 'vip', label: 'VIP Member', desc: 'Premium fast-track', icon: Crown },
                { id: 'urgent', label: 'Urgent Need', desc: 'Critical immediate attention', icon: AlertCircle },
              ].map((p) => {
                const isSelected = priority === p.id;
                const PIcon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as PriorityLevel)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-400 shadow-md ring-1 ring-indigo-400/40 text-slate-100'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <PIcon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-200">{p.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Special Request or Notes <span className="text-slate-500 text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need document printout, wheelchair accessibility..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Live Preview Bar */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Estimated Wait Time for {selectedService.name}
                </div>
                <div className="text-lg font-bold text-indigo-300 font-mono">
                  ~{previewEstimatedMins} Minutes{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    ({waitingInSelected} {waitingInSelected === 1 ? 'person' : 'people'} ahead)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeCountersForService} Open Counters</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Token...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Get Token & Join Live Queue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
