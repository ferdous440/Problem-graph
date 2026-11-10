import React, { useState } from 'react';
import { ProblemReport, UserProfile } from '../types';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ProblemDetailModalProps {
  problem: ProblemReport | null;
  onClose: () => void;
  onProblemUpdated?: (updated: ProblemReport) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  onClose,
  onProblemUpdated
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<ProblemReport | null>(problem);

  // Admin status update state
  const [selectedStatus, setSelectedStatus] = useState<string>(problem?.status || 'pending');
  const [statusReason, setStatusReason] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!problem) return null;

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const activeReport = currentProblem || problem;
  const isSupported = user && activeReport.supported_by?.includes(user.id);

  const handleSupport = async () => {
    if (!user) {
      alert('সমর্থন জানাতে অনুগ্রহ করে লগইন করুন।');
      return;
    }
    setIsUpvoting(true);
    try {
      const res = await api.toggleSupport(activeReport.id);
      const updated: ProblemReport = {
        ...activeReport,
        upvotes_count: res.upvotesCount,
        supported_by: res.supported
          ? [...(activeReport.supported_by || []), user.id]
          : (activeReport.supported_by || []).filter(id => id !== user.id)
      };
      setCurrentProblem(updated);
      if (onProblemUpdated) onProblemUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      alert('মন্তব্য করতে অনুগ্রহ করে লগইন করুন।');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await api.addComment(activeReport.id, commentText);
      const updated: ProblemReport = {
        ...activeReport,
        comments_count: (activeReport.comments_count || 0) + 1,
        comments: [...(activeReport.comments || []), res.comment]
      };
      setCurrentProblem(updated);
      setCommentText('');
      if (onProblemUpdated) onProblemUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!isAdmin) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await api.updateProblemStatus(
        activeReport.id,
        selectedStatus,
        statusReason,
        resolutionNotes
      );
      setCurrentProblem(res.report);
      setStatusMessage('অবস্থা সফলভাবে হালনাগাদ হয়েছে!');
      if (onProblemUpdated) onProblemUpdated(res.report);
    } catch (err: any) {
      setStatusMessage(`ত্রুটি: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-200/80 text-slate-800 rounded-lg">
              {activeReport.tracking_code}
            </span>
            <StatusBadge status={activeReport.status} size="md" />
            <SeverityBadge severity={activeReport.severity} size="md" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Title & Metadata */}
          <div>
            <div className="text-xs font-semibold text-teal-600 tracking-wide uppercase mb-1">
              {activeReport.category} {activeReport.subcategory ? `• ${activeReport.subcategory}` : ''}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              {activeReport.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeReport.address || `${activeReport.area}, ${activeReport.district}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(activeReport.reported_at).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                রিপোর্টার: {activeReport.user_name}
              </span>
            </div>
          </div>

          {/* Photos */}
          {activeReport.images && activeReport.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={activeReport.images[0]}
                alt={activeReport.title}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              সমস্যার বিস্তারিত বিবরণ
            </h4>
            <p className="text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {activeReport.description}
            </p>
          </div>

          {/* AI Analysis Card */}
          {activeReport.ai_analysis && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-sky-50/60 to-white p-5 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>এআই প্রাথমিক মূল্যায়ন ও বিশ্লেষণ</span>
                </div>
                {activeReport.ai_analysis.urgencyScore && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                    জরুরি সূচক: {activeReport.ai_analysis.urgencyScore}/১০
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {activeReport.ai_analysis.summaryBn}
              </p>
              {activeReport.ai_analysis.potentialHazards && activeReport.ai_analysis.potentialHazards.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-medium text-slate-500">সম্ভাব্য ঝুঁকি:</span>
                  {activeReport.ai_analysis.potentialHazards.map((hz, idx) => (
                    <span key={idx} className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      ⚠️ {hz}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resolution Evidence (If resolved) */}
          {activeReport.status === 'resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>সমাধানের বিবরণ ও প্রমাণ</span>
              </div>
              <p className="text-sm text-emerald-800">
                {activeReport.resolution_notes || 'কর্তৃপক্ষ কর্তৃক সমস্যাটির কার্যকর সমাধান সম্পন্ন হয়েছে।'}
              </p>
              {activeReport.resolution_evidence_url && (
                <div className="pt-2">
                  <img
                    src={activeReport.resolution_evidence_url}
                    alt="Resolution Evidence"
                    className="h-44 w-auto rounded-xl object-cover border border-emerald-300"
                  />
                </div>
              )}
            </div>
          )}

          {/* Community Actions: Upvote & Stats */}
          <div className="flex items-center justify-between py-3 border-y border-slate-100">
            <button
              onClick={handleSupport}
              disabled={isUpvoting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isSupported
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
              <span>{isSupported ? 'সমর্থন দেওয়া হয়েছে' : 'সমর্থন দিন'}</span>
              <span className="ml-1 px-1.5 py-0.2 bg-black/10 rounded-full text-xs">
                {activeReport.upvotes_count || 0}
              </span>
            </button>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {activeReport.comments_count || 0} টি মন্তব্য
              </span>
              <span>👁️ {activeReport.views_count || 1} বার দেখা হয়েছে</span>
            </div>
          </div>

          {/* Admin Management Section (Visible to Admin & Super Admin) */}
          {isAdmin && (
            <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  অ্যাডমিন অ্যাকশন ও অবস্থা যাচাইকরণ
                </h4>
                <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                  {user.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    অবস্থা নির্বাচন করুন
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                    <option value="verified">যাচাইকৃত (Verified)</option>
                    <option value="in_progress">কাজ চলমান (In Progress)</option>
                    <option value="resolved">সমাধানকৃত (Resolved)</option>
                    <option value="rejected">খারিজ/বাতিল (Rejected)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    যাচাইকরণ/পরিবর্তনের কারণ
                  </label>
                  <input
                    type="text"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="যেমন: মাঠপর্যায়ে সত্যতা নিশ্চিত"
                    className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {selectedStatus === 'resolved' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    সমাধানের বিবরণ ও নোট
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="কী পদক্ষেপ নিয়ে সমাধান করা হয়েছে..."
                    className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {statusMessage && (
                  <span className="text-xs font-medium text-teal-700">{statusMessage}</span>
                )}
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'হালনাগাদ হচ্ছে...' : 'অবস্থা সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              নাগরিক মতামত ও আপডেট ({activeReport.comments?.length || 0})
            </h4>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="আপনার মন্তব্য বা এলাকার সর্বশেষ আপডেট লিখুন..."
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>পাঠান</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {activeReport.comments && activeReport.comments.length > 0 ? (
                activeReport.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{c.user_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.comment_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।</p>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
