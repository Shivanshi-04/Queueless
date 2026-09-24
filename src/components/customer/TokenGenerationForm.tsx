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
      <div className="bg-[#F8F8F6] rounded-2xl p-6 sm:p-8 border border-[#A9A7A8]/35 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DF9B60]/15 text-[#E07015] text-xs font-bold mb-2 border border-[#DF9B60]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E07015]" />
            <span>Digital Kiosk Check-In</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D3441] tracking-tight">
            Take Your Service Token
          </h2>
          <p className="text-[#6C7380] text-xs sm:text-sm mt-1">
            Fill in your contact details below to join the live queue and track your position on your phone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer Contact Info */}
          <div>
            <label className="block text-xs font-bold text-[#2D3441] uppercase tracking-wider mb-2">
              1. Your Contact Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6C7380] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
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
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border ${
                      errors.customerName ? 'border-rose-500' : 'border-[#A9A7A8]/60 focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15'
                    } text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none transition-all`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6C7380] mb-1">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A9A7A8]">
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
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border ${
                      errors.contact ? 'border-rose-500' : 'border-[#A9A7A8]/60 focus:border-[#E07015] focus:ring-2 focus:ring-[#E07015]/15'
                    } text-[#2D3441] placeholder-[#A9A7A8] text-xs sm:text-sm focus:outline-none transition-all`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.contact}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Choose Service */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#2D3441] uppercase tracking-wider">
                2. Select Service Needed
              </label>
              <span className="text-[11px] text-[#6C7380]">
                {services.length} available service desks
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const IconComponent = getServiceIcon(service.iconName);
                const waitingForThis = tokens.filter(
                  (t) => t.status === 'waiting' && t.serviceId === service.id
                ).length;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-[#E07015] ring-2 ring-[#E07015]/20 shadow-md'
                        : 'bg-white/80 border-[#A9A7A8]/40 hover:border-[#DF9B60] hover:bg-white text-[#6C7380]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#E07015] text-white shadow-sm shadow-[#E07015]/30'
                          : 'bg-[#EDECEB] text-[#6C7380]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#2D3441]' : 'text-[#2D3441]'}`}>
                          {service.name}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#E07015] shrink-0" />
                        ) : (
                          <span className="text-[10px] font-semibold text-[#A9A7A8]">
                            ~{service.avgDurationMins}m
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6C7380] line-clamp-1 mt-0.5">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-[#EDECEB] text-[#6C7380] font-medium">
                          {waitingForThis} waiting
                        </span>
                        <span className="text-[#A9A7A8]">•</span>
                        <span className="text-[#6C7380]">Avg ~{service.avgDurationMins} mins</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Priority Category */}
          <div>
            <label className="block text-xs font-bold text-[#2D3441] uppercase tracking-wider mb-2">
              3. Assistance / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'regular', label: 'Standard', desc: 'General queue', icon: UserCheck },
                { id: 'senior_disabled', label: 'Senior / Assisted', desc: 'Dedicated help', icon: HeartHandshake },
                { id: 'vip', label: 'VIP Member', desc: 'Loyalty member', icon: Crown },
                { id: 'urgent', label: 'Urgent Need', desc: 'Express lane', icon: Zap },
              ].map((p) => {
                const isSelected = priority === p.id;
                const PIcon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as PriorityLevel)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#DFCAB2]/30 border-[#E07015] text-[#2D3441] font-bold ring-2 ring-[#E07015]/20 shadow-sm'
                        : 'bg-white border-[#A9A7A8]/40 text-[#6C7380] hover:border-[#DF9B60] hover:text-[#2D3441]'
                    }`}
                  >
                    <PIcon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#E07015]' : 'text-[#6C7380]'}`} />
                    <span className="text-xs font-bold">{p.label}</span>
                    <span className="text-[10px] text-[#A9A7A8] mt-0.5 leading-tight">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Wait Time Summary Pill */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#EDECEB] border border-[#DFCAB2] text-xs">
            <div className="flex items-center gap-2 text-[#2D3441]">
              <div className="p-1.5 rounded-lg bg-[#E07015]/15 text-[#E07015]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">Live Dynamic Estimated Wait</span>
                <span className="text-[11px] text-[#6C7380]">
                  Based on {waitingInSelected} in queue and {activeCountersForService || 1} counter(s)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black font-mono text-[#E07015] text-lg sm:text-xl">
                ~{previewEstimatedMins} mins
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E07015] hover:bg-[#C75D0D] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#E07015]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Generating Your Digital Token...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Join Queue & Get Instant Ticket Pass</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
