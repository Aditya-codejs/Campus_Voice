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
  Star,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  User,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Timeline } from '../../components/complaints/Timeline';
import { ComplaintComments } from '../../components/complaints/ComplaintComments';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, comments, attachments, resolution
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setData(res.data.data);
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

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      toast.error('Please state the reason for reopening.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/complaints/${id}/reopen`, { reason: reopenReason.trim() });
      if (res.data.success) {
        toast.success('Complaint reopened successfully.');
        setReopenModalOpen(false);
        setReopenReason('');
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reopen complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post(`/complaints/${id}/feedback`, {
        rating,
        feedback: feedbackText.trim(),
      });
      if (res.data.success) {
        toast.success('Thank you for rating your resolution.');
        setFeedbackModalOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading complaint records...
      </div>
    );
  }

  if (!data || !data.complaint) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Complaint Not Found</h2>
        <Link to="/student/complaints" className="text-xs text-brand-600 font-bold">
          &larr; Back to my complaints
        </Link>
      </div>
    );
  }

  const { complaint, attachments, timeline, comments } = data;

  // Check 7-day reopen eligibility
  let canReopen = false;
  if (['resolved', 'closed'].includes(complaint.status)) {
    if (complaint.resolved_at) {
      const daysSince = (Date.now() - new Date(complaint.resolved_at).getTime()) / (1000 * 60 * 60 * 24);
      canReopen = daysSince <= 7;
    } else {
      canReopen = true;
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {canReopen && (
            <button
              onClick={() => setReopenModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Grievance (7-Day SLA)</span>
            </button>
          )}

          {['resolved', 'closed'].includes(complaint.status) && !complaint.rating && (
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Rate Resolution</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grievance Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
              {complaint.complaint_code}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.is_anonymous && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                <ShieldCheck className="w-3 h-3 text-slate-500" /> Anonymous
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Logged on {new Date(complaint.createdAt).toLocaleDateString()}</span>
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

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Department</span>
            <span className="font-semibold text-slate-800">{complaint.department?.name || 'Assigned Dept'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Category</span>
            <span className="font-semibold text-slate-800">{complaint.category?.name || 'General'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Location</span>
            <span className="font-semibold text-slate-800">{complaint.location || 'Campus Wide'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Target SLA Due</span>
            <span className="font-semibold text-slate-800">{new Date(complaint.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* If resolved summary is present */}
        {complaint.resolution_summary && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Resolution Summary</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">{complaint.resolution_summary}</p>
          </div>
        )}

        {/* If rated */}
        {complaint.rating && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">Your Feedback Rating</span>
              <p className="text-xs text-amber-800 mt-0.5 italic">"{complaint.feedback || 'No written feedback'}"</p>
            </div>
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < complaint.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex min-w-0 overflow-x-auto border-b border-slate-100 bg-slate-50/50 px-4 sm:px-6 gap-4 sm:gap-6">
          {[
            { id: 'timeline', label: 'Timeline & History', icon: History, count: timeline.length },
            { id: 'comments', label: 'Discussion & Updates', icon: MessageSquare, count: comments.length },
            { id: 'attachments', label: 'Attachments', icon: FileText, count: attachments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-max py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
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

        <div className="p-4 sm:p-6">
          {activeTab === 'timeline' && <Timeline history={timeline} />}

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

          {activeTab === 'attachments' && (
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No files or images were uploaded with this complaint.
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
                            {(file.file_size / 1024).toFixed(1)} KB &bull; {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Download Attachment"
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

      {/* Modal: Reopen Grievance */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reopen Grievance</h3>
                <p className="text-xs text-slate-400">Explain why the resolution did not fix the problem.</p>
              </div>
            </div>

            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Reopening</label>
                <textarea
                  required
                  rows={4}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain what is still broken or unresolved..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rate & Feedback */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Rate Grievance Resolution</h3>
              <p className="text-xs text-slate-400">How satisfied are you with the resolution provided?</p>
            </div>

            <div className="flex justify-center items-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      starVal <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <form onSubmit={handleFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Feedback (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share details on response time, conduct, or fix quality..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
