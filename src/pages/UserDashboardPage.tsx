import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProblemReport } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import { LeafletMap } from '../components/LeafletMap';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  Bell,
  User,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface UserDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { user, notifications, markAsRead } = useAuth();
  const [myReports, setMyReports] = useState<ProblemReport[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'notifications' | 'profile'>('reports');
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserReports() {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await api.getProblems({ userId: user.id });
        setMyReports(res.reports);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserReports();
  }, [user]);

  const totalReports = myReports.length;
  const pendingReports = myReports.filter(r => r.status === 'pending').length;
  const verifiedReports = myReports.filter(r => r.status === 'verified').length;
  const resolvedReports = myReports.filter(r => r.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.full_name}</h1>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                নাগরিক প্রোফাইল
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>✉️ {user?.email}</span>
              <span>📍 {user?.area}, {user?.district}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('submit')}
          className="self-start md:self-auto bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন সমস্যা জানান</span>
        </button>
      </div>

      {/* 4 Bangla Civic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট রিপোর্ট</span>
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalReports}</div>
          <span className="text-[11px] text-slate-400">আমার সাবমিট করা</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600">অপেক্ষমাণ রিপোর্ট</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingReports}</div>
          <span className="text-[11px] text-slate-400">যাচাই প্রক্রিয়ায় রয়েছে</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600">যাচাইকৃত রিপোর্ট</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">{verifiedReports}</div>
          <span className="text-[11px] text-slate-400">কর্তৃপক্ষ নিশ্চিত করেছে</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">সমাধান হওয়া সমস্যা</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{resolvedReports}</div>
          <span className="text-[11px] text-slate-400">সফল নাগরিক উদ্যোগ</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>আমার জমা দেওয়া রিপোর্ট ({totalReports})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>বিজ্ঞপ্তি ও আপডেট ({notifications.length})</span>
        </button>
      </div>

      {/* Tab 1: Reports List */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {myReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReports.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  {problem.images && problem.images[0] && (
                    <div className="h-40 overflow-hidden bg-slate-100 relative">
                      <img
                        src={problem.images[0]}
                        alt={problem.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/90 text-slate-800 shadow-xs">
                          {problem.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <SeverityBadge severity={problem.severity} size="sm" />
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-mono">{problem.tracking_code}</span>
                        <StatusBadge status={problem.status} size="sm" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {problem.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>📍 {problem.area}</span>
                      <span className="flex items-center gap-1 font-semibold text-teal-600">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {problem.upvotes_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">এখনো কোনো রিপোর্ট জমা দেননি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার এলাকার রাস্তাঘাট, পানি বা যানজটের সমস্যা রিপোর্ট করে একটি বাসযোগ্য কমিউনিটি গড়ে তুলতে সাহায্য করুন।
              </p>
              <button
                onClick={() => onNavigate('submit')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4" />
                <span>প্রথম রিপোর্ট জমা দিন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">সর্বশেষ নোটিফিকেশনসমূহ</h3>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-teal-50/70 border-teal-200 text-teal-900 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{n.title_bn}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{n.message_bn}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">কোনো বিজ্ঞপ্তি নেই।</p>
          )}
        </div>
      )}

      {/* Selected Problem Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onProblemUpdated={(updated) => {
            setMyReports(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProblem(updated);
          }}
        />
      )}

    </div>
  );
};
