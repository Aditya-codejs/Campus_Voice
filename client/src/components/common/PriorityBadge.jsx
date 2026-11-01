import React from 'react';
import { AlertCircle, AlertTriangle, Clock, Info } from 'lucide-react';

export const PriorityBadge = ({ priority, className = '' }) => {
  const norm = (priority || '').toLowerCase();

  const configs = {
    critical: {
      label: 'Critical',
      style: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />,
    },
    high: {
      label: 'High',
      style: 'bg-orange-50 text-orange-700 border-orange-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
    },
    medium: {
      label: 'Medium',
      style: 'bg-amber-50 text-amber-700 border-amber-300',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    low: {
      label: 'Low',
      style: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
    },
  };

  const current = configs[norm] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${current.style} ${className}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
};

