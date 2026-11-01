import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  Tag,
  MapPin,
  FileText,
  MessageSquare,
  History,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  User,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Timeline } from '../../components/complaints/Timeline';
import { ComplaintComments } from '../../components/complaints/ComplaintComments';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const StaffComplaintDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments'); // comments, timeline, attachments
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    note: '',
    resolution_summary: '',
    rejection_reason: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setData(res.data.data);
        setStatusFormData((prev) => ({
          ...prev,
          status: res.data.data.complaint.status,
        }));
      }
    } catch (err) {
      toast.error('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();

    if (statusFormData.status === 'resolved' && !statusFormData.resolution_summary.trim()) {
      toast.error('Resolution summary is required when marking resolved.');
      return;
    }

    if (statusFormData.status === 'rejected' && !statusFormData.rejection_reason.trim()) {
      toast.error('A rejection reason must be stated.');
      return;
    }

    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/complaints/${id}/status`, statusFormData);
      if (res.data.success) {
        toast.success(`Complaint updated to ${statusFormData.status.replace('_', ' ')}`);
        setStatusModalOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading complaint...</div>;
  }

  if (!data || !data.complaint) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Complaint Not Found</h2>
        <Link to="/staff/complaints" className="text-xs text-brand-600 font-bold">
          &larr; Back to Department Queue
        </Link>
      </div>
    );
  }

  const { complaint, attachments, timeline, comments } = data;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/staff/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Department Queue</span>
        </Link>

        {/* Update Status Button */}
        <button
          onClick={() => setStatusModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-400" />
          <span>Update Status & Actions</span>
        </button>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {complaint.complaint_code}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.is_anonymous ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> 100% Anonymous Filing
              </span>
            ) : (
              <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                Student: <strong>{complaint.student?.name}</strong> ({complaint.student?.enrollment_number})
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Submitted {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {complaint.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Department</span>
            <span className="font-semibold text-slate-800">{complaint.department?.name || 'Department'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Category</span>
            <span className="font-semibold text-slate-800">{complaint.category?.name || 'Category'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Venue / Location</span>
            <span className="font-semibold text-slate-800">{complaint.location || 'Campus Wide'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Resolution Due (SLA)</span>
            <span className={`font-semibold ${new Date(complaint.due_date) < new Date() && complaint.status !== 'resolved' ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
              {new Date(complaint.due_date).toLocaleString()}
            </span>
          </div>
        </div>

        {complaint.resolution_summary && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolution Summary Recorded
            </span>
            <p className="text-xs text-emerald-900 leading-relaxed">{complaint.resolution_summary}</p>
          </div>
        )}

        {complaint.rejection_reason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" /> Rejection Justification
            </span>
            <p className="text-xs text-rose-900 leading-relaxed">{complaint.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 gap-6">
          {[
            { id: 'comments', label: 'Investigation Notes & Replies', icon: MessageSquare, count: comments.length },
            { id: 'timeline', label: 'Timeline History', icon: History, count: timeline.length },
            { id: 'attachments', label: 'Attachments', icon: FileText, count: attachments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'comments' && (
            <ComplaintComments
              complaintId={complaint._id}
              comments={comments}
              onCommentAdded={(newComment) => {
                setData((prev) => ({
                  ...prev,
                  comments: [...prev.comments, newComment],
                }));
              }}
            />
          )}

          {activeTab === 'timeline' && <Timeline history={timeline} />}

          {activeTab === 'attachments' && (
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No files uploaded for this grievance.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((file) => (
                    <div
                      key={file._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-white rounded-xl shadow-xs text-brand-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{file.file_name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(file.file_size / 1024).toFixed(1)} KB &bull; Uploaded by {file.uploaded_by?.name || 'User'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Update Status */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Update Complaint Status</h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Status</label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs capitalize"
                >
                  <option value="under_review">Under Review (Assessing problem)</option>
                  <option value="in_progress">In Progress (Work underway)</option>
                  <option value="need_more_info">Need More Info (Waiting for student reply)</option>
                  <option value="resolved">Resolved (Fix completed)</option>
                  <option value="rejected">Rejected (Invalid / Duplicate / Out of Scope)</option>
                </select>
              </div>

              {statusFormData.status === 'resolved' && (
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Resolution Summary (Mandatory) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={statusFormData.resolution_summary}
                    onChange={(e) => setStatusFormData({ ...statusFormData, resolution_summary: e.target.value })}
                    placeholder="Describe the solution applied (e.g. replaced valve, updated grades, fixed Wi-Fi access point)..."
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {statusFormData.status === 'rejected' && (
                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Rejection Reason (Mandatory) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={statusFormData.rejection_reason}
                    onChange={(e) => setStatusFormData({ ...statusFormData, rejection_reason: e.target.value })}
                    placeholder="Explain why this complaint is rejected (e.g. duplicate of SCT-..., out of jurisdiction)..."
                    className="w-full bg-rose-50/50 border border-rose-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Timeline Note (Sent to Student)
                </label>
                <textarea
                  rows={2}
                  value={statusFormData.note}
                  onChange={(e) => setStatusFormData({ ...statusFormData, note: e.target.value })}
                  placeholder="e.g. Technician dispatched to site for inspection..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  {updatingStatus ? 'Updating...' : 'Save & Publish Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

