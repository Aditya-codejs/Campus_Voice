import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase().replace(' ', '_');

  const configs = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    need_more_info: {
      label: 'Need More Info',
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
    },
    escalated: {
      label: 'Escalated',
      bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
      dot: 'bg-rose-500',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-400',
    },
    reopened: {
      label: 'Reopened',
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      dot: 'bg-cyan-500',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
  };

  const current = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </span>
  );
};

