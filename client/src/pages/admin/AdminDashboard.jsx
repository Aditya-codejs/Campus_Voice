import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Star,
  Users,
  Building,
  Download,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#026bc9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading university analytics...</div>;
  }

  const metrics = data?.metrics || {};
  const categoryStats = data?.categoryStats || [];
  const departmentStats = data?.departmentStats || [];
  const statusStats = data?.statusStats || [];

  return (
    <div className="min-w-0 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-brand-950/80 px-3 py-1 rounded-full border border-brand-700/60">
            Administrative Control Center
          </span>
          <h1 className="break-words text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Grievance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Live SLA telemetry, department workload distributions, resolution rates, and system registrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {metrics.pendingStaffCount > 0 && (
            <Link
              to="/admin/staff-approvals"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 animate-pulse"
            >
              <UserCheck className="w-4 h-4" />
              <span>{metrics.pendingStaffCount} Pending Staff</span>
            </Link>
          )}

          <button
            onClick={handleExportCsv}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Filed</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalComplaints}</p>
          <span className="text-[11px] text-slate-400">All-time tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New / Submitted</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.submittedCount}</p>
          <span className="text-[11px] text-slate-400">Needs assignment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{metrics.inProgressCount}</p>
          <span className="text-[11px] text-slate-400">Active investigations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.resolvedCount}</p>
          <span className="text-[11px] text-slate-400">Closed grievances</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Overdue</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{metrics.overdueCount}</p>
          <span className="text-[11px] text-rose-500 font-semibold">Overdue tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Satisfaction</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-1">
            <span>{metrics.avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
          </p>
          <span className="text-[11px] text-slate-400">{metrics.totalRated} ratings</span>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload Breakdown */}
        <div className="min-w-0 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Department</h3>
              <p className="text-xs text-slate-400">Volume distribution across campus offices.</p>
            </div>
            <Building className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#026bc9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="min-w-0 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-400">Grievance classification breakdown.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.slice(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/admin/complaints"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-500 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Manage All Grievances
            </h4>
            <p className="text-xs text-slate-500">Assign officers, escalate, or update priority</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/staff-approvals"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-500 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Staff Approvals Queue
            </h4>
            <p className="text-xs text-slate-500">Approve or reject new faculty accounts</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-500 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              System Audit Logs
            </h4>
            <p className="text-xs text-slate-500">Review security access and status changes</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
