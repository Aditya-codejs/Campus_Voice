import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, User, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        No lifecycle status records logged yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((step, idx) => {
        const isLatest = idx === history.length - 1;

        return (
          <div key={step._id || idx} className="relative group">
            {/* Timeline bullet */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-all ${
                isLatest
                  ? 'border-brand-600 ring-4 ring-brand-100'
                  : 'border-slate-300'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isLatest ? 'bg-brand-600' : 'bg-slate-400'
                }`}
              />
            </div>

            {/* Content box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 shadow-xs hover:border-slate-200 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {step.old_status && (
                    <>
                      <StatusBadge status={step.old_status} />
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                  <StatusBadge status={step.new_status} />
                </div>

                <div className="flex items-center text-[11px] text-slate-400 space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(step.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {step.note && (
                <p className="text-xs text-slate-700 mt-2 font-medium bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  "{step.note}"
                </p>
              )}

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <User className="w-3 h-3" />
                  Updated by: {step.changed_by_name || 'System'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

