import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  UserCheck,
  Building,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sliders,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignStaff, setAssignStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');

  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState('medium');

  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (deptFilter) params.append('department', deptFilter);
      params.append('page', page);
      params.append('limit', 12);

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

  const fetchMeta = async () => {
    try {
      const [deptRes, staffRes] = await Promise.all([
        api.get('/departments'),
        api.get('/admin/users?role=staff&limit=100'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data.departments);
      if (staffRes.data.success) setStaffList(staffRes.data.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, priorityFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignDept(complaint.department?._id || '');
    setAssignStaff(complaint.assigned_to?._id || '');
    setAssignNote('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setActionLoading(true);
      const res = await api.patch(`/complaints/${selectedComplaint._id}/assign`, {
        department_id: assignDept,
        staff_id: assignStaff || null,
        note: assignNote,
      });

      if (res.data.success) {
        toast.success(`Complaint assigned successfully.`);
        setAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const openPriorityModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewPriority(complaint.priority || 'medium');
    setPriorityModalOpen(true);
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setActionLoading(true);
      const res = await api.patch(`/complaints/${selectedComplaint._id}/priority`, {
        priority: newPriority,
      });

      if (res.data.success) {
        toast.success(`Priority updated to ${newPriority}`);
        setPriorityModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Grievances Registry</h1>
          <p className="text-xs text-slate-500">
            Search, filter, assign officers, and monitor resolution SLA for every institutional ticket.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-brand-300" />
          <span>Export All to CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, student, or location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="under_review">Under Review</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading complaints registry...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No complaints matching the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Tracking Code</th>
                  <th className="p-4">Title & Subject</th>
                  <th className="p-4">Department & Category</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Assigned Officer</th>
                  <th className="p-4">Priority & SLA</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {c.complaint_code}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.location || 'Campus Wide'}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-700">{c.department?.name || 'Unassigned'}</p>
                      <p className="text-[11px] text-slate-400">{c.category?.name || 'General'}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {c.is_anonymous ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Anonymous
                        </span>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-800">{c.student?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.student?.enrollment_number}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {c.assigned_to ? (
                        <p className="font-semibold text-indigo-700">{c.assigned_to.name}</p>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap space-y-1">
                      <PriorityBadge priority={c.priority} />
                      <p className="text-[10px] text-slate-400">Due: {new Date(c.due_date).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => openAssignModal(c)}
                        className="px-2.5 py-1 text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                        title="Assign Department / Staff"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => openPriorityModal(c)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                        title="Change Priority SLA"
                      >
                        Priority
                      </button>

                      <Link
                        to={`/staff/complaints/${c._id}`}
                        className="inline-block p-1 text-slate-400 hover:text-slate-800"
                        title="View Full Detail"
                      >
                        <ExternalLink className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-500">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} records)
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

      {/* Modal: Assign Complaint */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Assign Grievance &bull; {selectedComplaint.complaint_code}
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Specific Officer (Optional)
                </label>
                <select
                  value={assignStaff}
                  onChange={(e) => setAssignStaff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                >
                  <option value="">Assign to Department Pool</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department?.name || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Directive / Note</label>
                <textarea
                  rows={2}
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="e.g. Please prioritize inspection before 5 PM..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Assigning...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Priority */}
      {priorityModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Change Priority SLA</h3>

            <form onSubmit={handlePrioritySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs capitalize"
                >
                  <option value="low">Low (14 Days SLA)</option>
                  <option value="medium">Medium (7 Days SLA)</option>
                  <option value="high">High (3 Days SLA)</option>
                  <option value="critical">Critical (24 Hours SLA)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriorityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Updating...' : 'Update SLA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

