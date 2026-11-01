import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Building, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Timeline } from '../../components/complaints/Timeline';
import api from '../../services/api';

export const TrackComplaintPage = () => {
  const { code } = useParams();
  const [searchInput, setSearchInput] = useState(code || '');
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchTracking = async (searchCode) => {
    if (!searchCode) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/complaints/track/${searchCode.trim().toUpperCase()}`);
      if (res.data.success) {
        setComplaint(res.data.data.complaint);
        setTimeline(res.data.data.timeline || []);
      }
    } catch (err) {
      setComplaint(null);
      setTimeline([]);
      setErrorMsg(err.response?.data?.error || 'No complaint found matching this code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      setSearchInput(code);
      fetchTracking(code);
    }
  }, [code]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Public Grievance Tracker</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your unique Tracking Code to view real-time investigation updates and resolution milestones.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Tracking ID (e.g. SCT-2026-000001)..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm uppercase font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchInput.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-brand-500/20 whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Error state */}
      {errorMsg && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Card */}
      {complaint && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          {/* Card Top Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                  {complaint.complaint_code}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{complaint.title}</h2>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1">
              <p>Submitted: <strong>{new Date(complaint.created_at).toLocaleDateString()}</strong></p>
              <p>Target SLA: <strong>{new Date(complaint.due_date).toLocaleDateString()}</strong></p>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Meta details */}
            <div className="space-y-4 md:border-r border-slate-100 md:pr-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Department</span>
                    <strong className="text-slate-800">{complaint.department}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Category</span>
                    <strong className="text-slate-800">{complaint.category}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Resolution Due</span>
                    <strong className="text-slate-800">{new Date(complaint.due_date).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {complaint.resolution_summary && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Resolution Summary
                  </div>
                  <p className="text-xs leading-relaxed">{complaint.resolution_summary}</p>
                </div>
              )}
            </div>

            {/* Visual Timeline */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress Timeline</h3>
              <Timeline history={timeline} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

