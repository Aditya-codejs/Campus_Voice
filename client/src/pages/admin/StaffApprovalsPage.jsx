import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Building,
  Hash,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const StaffApprovalsPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected, all
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/staff-registrations?status=${statusFilter}`);
      if (res.data.success) {
        setStaffList(res.data.data.staffList);
      }
    } catch (err) {
      toast.error('Failed to load staff registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [statusFilter]);

  const handleApprove = async (staff) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/staff-registrations/${staff._id}`, {
        status: 'approved',
      });
      if (res.data.success) {
        toast.success(`Staff account for ${staff.name} approved.`);
        fetchStaff();
      }
    } catch (err) {
      toast.error('Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/staff-registrations/${selectedStaff._id}`, {
        status: 'rejected',
        reason: rejectReason,
      });
      if (res.data.success) {
        toast.info(`Staff account registration rejected.`);
        setRejectModalOpen(false);
        setSelectedStaff(null);
        setRejectReason('');
        fetchStaff();
      }
    } catch (err) {
      toast.error('Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Account Approvals</h1>
        <p className="text-xs text-slate-500">
          Review, verify credentials, and activate staff access to departmental complaint queues.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Pending Approvals', value: 'pending' },
          { label: 'Approved Staff', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'All Registrations', value: 'all' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Staff Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading registrations...</div>
      ) : staffList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-2 shadow-xs">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No registrations found</h3>
          <p className="text-xs text-slate-400">There are no staff accounts under this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      staff.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : staff.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {staff.email}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1.5 border border-slate-100 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Employee ID:
                    </span>
                    <strong className="font-mono text-slate-800">{staff.employee_id}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3" /> Department:
                    </span>
                    <strong className="text-slate-800 truncate max-w-[130px]">
                      {staff.department?.name || staff.department_name || 'Assigned'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Pending Staff */}
              {staff.status === 'pending' ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(staff)}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStaff(staff);
                      setRejectModalOpen(true);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-right">
                  Registered: {new Date(staff.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reject Registration &bull; {selectedStaff.name}</h3>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Employee ID could not be verified with HR records..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

