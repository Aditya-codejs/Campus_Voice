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
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints?limit=5');
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

  // Compute metrics
  const total = complaints.length;
  const inProgress = complaints.filter((c) =>
    ['in_progress', 'assigned', 'under_review', 'reopened'].includes(c.status)
  ).length;
  const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
  const pending = complaints.filter((c) => c.status === 'submitted').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-brand-950/60 px-3 py-1 rounded-full border border-brand-700/60">
            Student Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your logged grievances, review updates from assigned department wardens, and provide resolution ratings.
          </p>
        </div>

        <Link
          to="/student/complaints/new"
          className="shrink-0 bg-white hover:bg-slate-100 text-brand-900 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 group"
        >
          <PlusCircle className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
          <span>Lodge Grievance</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Filed</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{total}</p>
          <span className="text-[11px] text-slate-400">All recorded grievances</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{inProgress}</p>
          <span className="text-[11px] text-slate-400">Under active investigation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{resolved}</p>
          <span className="text-[11px] text-slate-400">Completed & closed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{pending}</p>
          <span className="text-[11px] text-slate-400">Awaiting department triage</span>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-400">Your latest logged issues and their current progress.</p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your grievances...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No grievances filed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't submitted any complaints. Use the button below if you need campus assistance.
            </p>
            <Link
              to="/student/complaints/new"
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
            >
              <PlusCircle className="w-4 h-4" /> File New Grievance
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <Link
                key={c._id}
                to={`/student/complaints/${c._id}`}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                      {c.complaint_code}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.is_anonymous && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-right">
                  <div className="text-xs text-slate-400 hidden md:block">
                    <p className="text-slate-600 font-medium">{c.department?.name || 'Department'}</p>
                    <p>{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

