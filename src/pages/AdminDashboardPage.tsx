import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ProblemReport,
  AdminStats,
  AdminInsights,
  AuditLog,
  Category
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  ShieldAlert,
  Sparkles,
  BarChart3,
  Layers,
  FileCheck2,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Search,
  Filter,
  UserCheck,
  Settings,
  RefreshCw,
  Building2,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'insights' | 'recommendations' | 'audit' | 'settings'>('analytics');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);

  // Recommendations state
  const [selectedProbForRec, setSelectedProbForRec] = useState<string>('');
  const [recommendationResult, setRecommendationResult] = useState<any>(null);
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);

  // Filter state for reports tab
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';

  const loadData = async () => {
    try {
      const [statsRes, reportsRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getProblems(),
        api.getAuditLogs()
      ]);
      setStats(statsRes.stats);
      setReports(reportsRes.reports);
      setAuditLogs(auditRes.logs);
      if (reportsRes.reports.length > 0 && !selectedProbForRec) {
        setSelectedProbForRec(reportsRes.reports[0].id);
      }
    } catch (e) {
      console.error('Failed to load admin dashboard:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await api.getAdminInsights();
      setInsights(res.insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!selectedProbForRec) return;
    setIsGeneratingRec(true);
    try {
      const res = await api.getAdminRecommendation(selectedProbForRec);
      setRecommendationResult(res.recommendation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingRec(false);
    }
  };

  const handleQuickStatusChange = async (reportId: string, status: string) => {
    try {
      const res = await api.updateProblemStatus(
        reportId,
        status,
        `অ্যাডমিন প্যানেল থেকে সরাসরি অবস্থা পরিবর্তন: ${status}`
      );
      setReports(prev => prev.map(r => r.id === reportId ? res.report : r));
      setActionFeedback(`রিপোর্ট ${res.report.tracking_code} এর অবস্থা হালনাগাদ হয়েছে!`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadData();
    } catch (e: any) {
      alert(`ত্রুটি: ${e.message}`);
    }
  };

  // Recharts Data Prep
  const categoryChartData = stats
    ? Object.entries(stats.categoryCounts).map(([name, count]) => ({ name, count }))
    : [];

  const districtChartData = stats
    ? Object.entries(stats.districtCounts).map(([name, count]) => ({ name, value: count }))
    : [];

  const severityChartData = stats
    ? [
        { name: 'জরুরি', value: stats.severityCounts.critical, color: '#dc2626' },
        { name: 'উচ্চ', value: stats.severityCounts.high, color: '#ea580c' },
        { name: 'মাঝারি', value: stats.severityCounts.medium, color: '#0284c7' },
        { name: 'কম', value: stats.severityCounts.low, color: '#64748b' },
      ]
    : [];

  const PIE_COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.tracking_code.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? 'সুপার অ্যাডমিন সেন্ট্রাল কন্ট্রোল' : 'পৌর ও সিটি কর্পোরেশন অ্যাডমিন ড্যাশবোর্ড'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            প্রশাসনিক অ্যানালিটিক্স ও এআই ডিসিশন সাপোর্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            দায়িত্বপ্রাপ্ত কর্মকর্তা: {user?.full_name} ({user?.area}, {user?.district})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ ডেটা</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in">
          <span>✓ {actionFeedback}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>অ্যানালিটিক্স ওভারভিউ</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>রিপোর্ট যাচাই ও ব্যবস্থাপনা ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'insights'
              ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs'
              : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>এআই ইনসাইটস ইঞ্জিন</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>সরকারি সমাধান সুপারিশপত্র</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>অডিট লগ ({auditLogs.length})</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>সুপার অ্যাডমিন সেটিংস</span>
          </button>
        )}
      </div>

      {/* Tab 1: Analytics Overview */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">মোট নিবন্ধিত সমস্যা</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.total} টি</div>
              <span className="text-[11px] text-slate-400">সর্বমোট জমা</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-amber-600">অপেক্ষমাণ (যাচাইহীন)</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending} টি</div>
              <span className="text-[11px] text-amber-700">অবিলম্বে যাচাই প্রয়োজন</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-sky-600">যাচাইকৃত সমস্যা</span>
              <div className="text-2xl font-black text-sky-600 mt-1">{stats.verified} টি</div>
              <span className="text-[11px] text-slate-500">পাবলিক করিডোরে দৃশ্যমান</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-600">সমাধানকৃত সমস্যা</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved} টি</div>
              <span className="text-[11px] text-emerald-700">কার্যকর সমাধান সম্পন্ন</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                ক্যাটাগরি অনুযায়ী সমস্যার বিস্তার (Bar Chart)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                সমস্যার গুরুত্বের অনুপাত (Severity Distribution)
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs">
                {severityChartData.map((s, i) => (
                  <span key={i} className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Top Problem Areas Ranking */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              সবচেয়ে সমস্যাপ্রবণ এলাকা ও হটস্পটসমূহ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.areaCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([area, cnt], idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-teal-600">র‍্যাংক #{idx + 1}</div>
                    <div className="font-bold text-sm text-slate-900 mt-1 truncate">{area}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{cnt} টি নিবন্ধিত সমস্যা</div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Reports Management Table */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="all">সব অবস্থা</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="verified">যাচাইকৃত (Verified)</option>
                <option value="in_progress">চলমান (In Progress)</option>
                <option value="resolved">সমাধানকৃত (Resolved)</option>
                <option value="rejected">খারিজ (Rejected)</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="খুঁজুন..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <span className="text-xs text-slate-500">
              মোট {filteredReports.length} টি রিপোর্ট প্রদর্শিত
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">কোড</th>
                  <th className="px-4 py-3">শিরোনাম ও এলাকা</th>
                  <th className="px-4 py-3">ক্যাটাগরি</th>
                  <th className="px-4 py-3">গুরুত্ব</th>
                  <th className="px-4 py-3">বর্তমান অবস্থা</th>
                  <th className="px-4 py-3 text-right">অ্যাডমিন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {report.tracking_code}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div
                        onClick={() => setSelectedReport(report)}
                        className="font-semibold text-slate-900 truncate hover:text-teal-600 cursor-pointer"
                      >
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        📍 {report.area}, {report.district} • রিপোর্টার: {report.user_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-800">
                        {report.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SeverityBadge severity={report.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleQuickStatusChange(report.id, 'verified')}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          >
                            যাচাই করুন
                          </button>
                        )}
                        {report.status === 'verified' && (
                          <button
                            onClick={() => handleQuickStatusChange(report.id, 'in_progress')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          >
                            কাজ চলমান
                          </button>
                        )}
                        {report.status === 'in_progress' && (
                          <button
                            onClick={() => handleQuickStatusChange(report.id, 'resolved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          >
                            সমাধান চিহ্নিত করুন
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: AI Insights Engine */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-sm space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>এআই ইনসাইটস ও পলিসি অ্যানালাইসিস ইঞ্জিন</span>
              </h3>
              <p className="text-xs text-slate-500">
                প্ল্যাটফর্মের প্রকৃত ডেটাবেজ পরিসংখ্যান পর্যালোচনা করে জেমিনি ৩.৮ ফ্ল্যাশ দ্বারা গভীর অন্তর্দৃষ্টি প্রস্তুত
              </p>
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingInsights ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ইনসাইট জেনারেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>নতুন এআই ইনসাইটস বের করুন</span>
                </>
              )}
            </button>
          </div>

          {insights ? (
            <div className="space-y-6">
              
              {/* Executive Summary */}
              <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  প্রশাসনিক নির্বাহী সারসংক্ষেপ
                </h4>
                <p className="text-sm leading-relaxed font-normal">
                  {insights.executiveSummary}
                </p>
              </div>

              {/* Grid of Key Analytical Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                    ১. শীর্ষ সমস্যাপ্রবণ এলাকা ও কারণ
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {insights.topProblemAreas}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                    ২. প্রধান সমস্যা ক্যাটাগরি ও বিস্তার
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {insights.dominantCategories}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    ৩. সমস্যা বৃদ্ধির প্রবণতা (Surging Trends)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {insights.surgingTrends}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    ৪. দীর্ঘদিনের অমীমাংসিত সমস্যা ও ঝুঁকি
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {insights.longPendingIssues}
                  </p>
                </div>

              </div>

              {/* Priority Action Items */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  অবিলম্বে পদক্ষেপ নেওয়ার মতো অগ্রাধিকারসমূহ (Priority Action Items)
                </h4>
                <ul className="space-y-2">
                  {insights.priorityActionItems?.map((item, idx) => (
                    <li key={idx} className="text-xs text-indigo-950 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  কমিউনিটি ও সিটি কর্পোরেশন সমন্বয়ের কৌশলগত সুপারিশ
                </h4>
                <ul className="space-y-2">
                  {insights.strategicRecommendations?.map((rec, idx) => (
                    <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">এআই ইনসাইট এখনো প্রস্তুত নয়</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                উপরের 'নতুন এআই ইনসাইটস বের করুন' বাটনে ক্লিক করে ডেটাবেজ বিশ্লেষণ করুন।
              </p>
            </div>
          )}

        </div>
      )}

      {/* Tab 4: AI Solution Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              <span>সংশ্লিষ্ট কর্তৃপক্ষের জন্য এআই সমাধান সুপারিশপত্র প্রণয়ন</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              যেকোনো জটিল নাগরিক সমস্যার জন্য ঢাকা সিটি কর্পোরেশন, ওয়াসা, বা ট্রাফিক পুলিশের নিকট প্রেরণের উপযোগী ফরমাল সুপারিশ তৈরি করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সমস্যাটি নির্বাচন করুন:
              </label>
              <select
                value={selectedProbForRec}
                onChange={(e) => setSelectedProbForRec(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.tracking_code}] {r.title} ({r.area})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateRecommendation}
              disabled={isGeneratingRec || !selectedProbForRec}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 shrink-0"
            >
              {isGeneratingRec ? 'সুপারিশপত্র তৈরি হচ্ছে...' : 'সুপারিশপত্র তৈরি করুন'}
            </button>
          </div>

          {recommendationResult && (
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-300 space-y-4 font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase">
                    ফরমাল ডিসপ্যাচ ড্রাফট
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {recommendationResult.clusterOrTitle}
                  </h4>
                </div>
                <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-lg">
                  অগ্রাধিকার: {recommendationResult.priority}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">সমস্যার সম্ভাব্য মূল কারণ:</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{recommendationResult.rootCauseBn}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">জনজীবনে ক্ষতিকর প্রভাব:</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{recommendationResult.impactAssessmentBn}</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 text-xs">প্রস্তাবিত প্রযুক্তিগত সমাধান:</div>
                <p className="text-slate-700 text-xs leading-relaxed">{recommendationResult.recommendedSolutionBn}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-700">
                  <span className="font-bold">প্রেরণীয় কর্তৃত্বশীল সংস্থা: </span>
                  <span className="text-teal-700 font-semibold">{recommendationResult.targetAuthorityBn}</span>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  * {recommendationResult.disclaimerBn}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              প্রশাসনিক কার্যকলাপের অডিট লগ (Audit Log)
            </h3>
            <span className="text-xs text-slate-400">নিরাপত্তা ও দায়বদ্ধতা ট্র্যাকিং</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">সময় ও তারিখ</th>
                  <th className="px-4 py-3">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                  <th className="px-4 py-3">অ্যাকশন টাইপ</th>
                  <th className="px-4 py-3">টার্গেট</th>
                  <th className="px-4 py-3">বিস্তারিত বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {log.admin_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 font-mono text-[10px] px-2 py-0.5 rounded text-slate-700">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {log.target_id}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600 truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Super Admin Settings */}
      {activeTab === 'settings' && isSuperAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <span>সুপার অ্যাডমিন প্ল্যাটফর্ম কনফিগারেশন</span>
            </h3>
            <p className="text-xs text-slate-500">
              রোল অনুমোদন, এআই কনফিগারেশন এবং প্ল্যাটফর্ম নিরাপত্তা নিয়ন্ত্রণ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                এআই ইঞ্জিন প্যারামিটার
              </h4>
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>মডেল:</span>
                  <span className="font-mono font-bold text-teal-700">Gemini 3.8 Flash</span>
                </div>
                <div className="flex justify-between">
                  <span>সার্ভার সাইড প্রক্সি:</span>
                  <span className="text-emerald-700 font-semibold">সক্রিয় (নিরাপদ)</span>
                </div>
                <div className="flex justify-between">
                  <span>ডিফল্ট করিডোর বাফার:</span>
                  <span className="font-mono">800 মিটার</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                ডেটাবেজ ও আরএলএস নিরাপত্তা
              </h4>
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>রো-লেভেল সিকিউরিটি (RLS):</span>
                  <span className="text-emerald-700 font-semibold">এনফোর্সড</span>
                </div>
                <div className="flex justify-between">
                  <span>পোস্টজিআইএস স্থানিক ইনডেক্সিং:</span>
                  <span className="text-emerald-700 font-semibold">সক্রিয়</span>
                </div>
                <div className="flex justify-between">
                  <span>ক্লিপিং এবং অডিট লগ ক্যাপাসিটি:</span>
                  <span className="font-mono">৫০০ রেকর্ডস</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ProblemDetailModal
          problem={selectedReport}
          onClose={() => setSelectedReport(null)}
          onProblemUpdated={(updated) => {
            setReports(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedReport(updated);
            loadData();
          }}
        />
      )}

    </div>
  );
};
