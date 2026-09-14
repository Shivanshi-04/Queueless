import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import type { PriorityLevel } from '../../types/queue';
import {
  User,
  Phone,
  Clock,
  Sparkles,
  CreditCard,
  UserCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  HeartHandshake,
  Crown,
} from 'lucide-react';

interface TokenGenerationFormProps {
  onTokenCreated?: (tokenId: string) => void;
}

export const TokenGenerationForm: React.FC<TokenGenerationFormProps> = ({ onTokenCreated }) => {
  const { services, tokens, counters, generateToken } = useQueue();

  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'general');
  const [priority, setPriority] = useState<PriorityLevel>('regular');
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
        (selectedService?.avgDurationMins || 5) *
        (priority === 'urgent' ? 0.3 : priority === 'vip' ? 0.5 : priority === 'senior_disabled' ? 0.7 : 1)) /
        Math.max(1, activeCountersForService)
    )
  );

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return CreditCard;
      case 'HelpCircle':
        return HelpCircle;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Zap':
        return Zap;
      default:
        return UserCheck;
    }
  };

  const validate = () => {
    const errs: { customerName?: string; contact?: string } = {};
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your name.';
    }
    if (!contact.trim()) {
      errs.contact = 'Please enter your phone or WhatsApp number.';
    } else if (contact.trim().length < 5) {
      errs.contact = 'Please enter a valid phone number.';
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
        customerName: customerName.trim(),
        contact: contact.trim(),
        serviceId: selectedServiceId,
        priority,
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Digital Kiosk Check-In</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Take Your Service Token
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Fill in your details below to get your digital queue pass and track your turn live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Customer Contact Info */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Your Contact Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border ${
                      errors.customerName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    } text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition-colors`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Phone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border ${
                      errors.contact ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    } text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition-colors`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.contact}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Choose Service */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Select Service Needed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const IconComponent = getServiceIcon(service.iconName);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {service.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {service.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Priority Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              3. Assistance / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'regular', label: 'Standard', icon: UserCheck },
                { id: 'senior_disabled', label: 'Senior / Assisted', icon: HeartHandshake },
                { id: 'vip', label: 'VIP Member', icon: Crown },
                { id: 'urgent', label: 'Urgent Need', icon: Zap },
              ].map((p) => {
                const isSelected = priority === p.id;
                const PIcon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as PriorityLevel)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PIcon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Wait Time Summary Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Estimated Wait Time:</span>
            </div>
            <span className="font-bold font-mono text-indigo-300 text-sm">
              ~{previewEstimatedMins} mins
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Generating Token...</span>
            ) : (
              <span>Join Queue & Get Ticket</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
