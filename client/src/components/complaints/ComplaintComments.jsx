import React, { useState } from 'react';
import { Send, Lock, User, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ComplaintComments = ({ complaintId, comments = [], onCommentAdded }) => {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const canPostInternal = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'superadmin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/complaints/${complaintId}/comments`, {
        message: message.trim(),
        is_internal: isInternal,
      });

      if (res.data.success) {
        toast.success(isInternal ? 'Internal note recorded.' : 'Comment posted.');
        setMessage('');
        setIsInternal(false);
        if (onCommentAdded) {
          onCommentAdded(res.data.data.comment);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No discussion messages yet. Start the conversation below.
          </div>
        ) : (
          comments.map((c) => {
            const isMe = String(c.user?._id || c.user) === String(user?._id || user?.id);

            return (
              <div
                key={c._id}
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
                  c.is_internal
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : isMe
                    ? 'bg-brand-50/60 border-brand-200 text-slate-800 ml-4'
                    : 'bg-white border-slate-200 text-slate-800 mr-4'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{c.user_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                      {c.user_role}
                    </span>
                    {c.is_internal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <Lock className="w-2.5 h-2.5" /> Internal Note (Staff Only)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap">{c.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-3">
        {canPostInternal && (
          <div className="flex items-center space-x-2 mb-2">
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Mark as Internal Staff Note (Hidden from Student)</span>
            </label>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isInternal
                ? 'Type confidential internal note for staff & admin...'
                : 'Write an update, question, or clarification...'
            }
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

