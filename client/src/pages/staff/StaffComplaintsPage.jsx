import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Calendar,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

export const StaffComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data.complaints);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const filteredComplaints = onlyMine
    ? complaints.filter(
        (c) => String(c.assigned_to?._id || c.assigned_to) === String(user?._id || user?.id)
      )
    : complaints;

  const statusTabs = [
    { label: 'All Dept Tickets', value: '' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Need More Info', value: 'need_more_info' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Department Grievance Queue</h1>
        <p className="text-xs text-slate-500">
          Showing complaints for {user?.department_name || 'your department'}.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code (SCT-...), subject, location, or keyword..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </form>

          {/* Toggle "Assigned to me" */}
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer shrink-0 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <UserCheck className="w-4 h-4 text-brand-600" />
            <span>Assigned to Me Only</span>
          </label>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
            Loading department complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800">No tickets found</h3>
            <p className="text-xs text-slate-400">No complaints matching the selected filter criteria.</p>
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const isDirect =
              String(c.assigned_to?._id || c.assigned_to) === String(user?._id || user?.id);

            return (
              <Link
                key={c._id}
                to={`/staff/complaints/${c._id}`}
                className="block bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-brand-400 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                      {c.is_anonymous ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          Anonymous Student
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">
                          Student: {c.student?.name} ({c.student?.enrollment_number || 'Enrolled'})
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 sm:border-l border-slate-100 sm:pl-6 shrink-0">
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="text-slate-700 font-medium">{c.category?.name || 'General'}</p>
                      <p className="text-[11px]">Due: {new Date(c.due_date).toLocaleDateString()}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-500">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

