import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';
import api from '../../services/api';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints?limit=10');
        if (res.data.success) {
          setComplaints(res.data.data.complaints);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const assignedToMe = complaints.filter(
    (c) => String(c.assigned_to?._id || c.assigned_to) === String(user?._id || user?.id)
  ).length;
  const inProgress = complaints.filter((c) =>
    ['assigned', 'in_progress', 'under_review'].includes(c.status)
  ).length;
  const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
  const overdue = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed' && new Date(c.due_date) < new Date()
  ).length;

  return (
    <div className="min-w-0 space-y-8">
      {/* Staff Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-700/60">
            <Building className="w-3.5 h-3.5" />
            {user?.department_name || 'Department'} Grievance Desk
          </div>
          <h1 className="break-words text-2xl sm:text-3xl font-extrabold tracking-tight">
            Officer Portal &bull; {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Review student tickets allocated to your department, log investigation findings, communicate with students, and record resolution outcomes.
          </p>
        </div>

        <Link
          to="/staff/complaints"
          className="shrink-0 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <span>Open Department Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department Total</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          <span className="text-[11px] text-slate-400">Total assigned to dept</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned to You</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{assignedToMe}</p>
          <span className="text-[11px] text-slate-400">Your direct tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{inProgress}</p>
          <span className="text-[11px] text-slate-400">Active investigation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolved}</p>
          <span className="text-[11px] text-slate-400">Fixed & confirmed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue SLA</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{overdue}</p>
          <span className="text-[11px] text-rose-500 font-semibold">Immediate attention needed</span>
        </div>
      </div>

      {/* Assigned Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Department Queue</h2>
            <p className="text-xs text-slate-400">Select any ticket to post progress updates or record a fix.</p>
          </div>
          <Link
            to="/staff/complaints"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading department queue...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No active grievances assigned to your department queue right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => {
              const isDirect = String(c.assigned_to?._id || c.assigned_to) === String(user?._id || user?.id);

              return (
                <Link
                  key={c._id}
                  to={`/staff/complaints/${c._id}`}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {c.complaint_code}
                      </span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      {isDirect && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                          Assigned to You
                        </span>
                      )}
                      {c.is_anonymous && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Anonymous Student
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 text-right">
                    <div className="text-xs text-slate-400 hidden sm:block">
                      <p className="text-slate-700 font-medium">{c.category?.name || 'General'}</p>
                      <p>SLA Due: {new Date(c.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
