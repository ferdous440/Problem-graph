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
import { LeafletMap } from '../components/LeafletMap';
import { DashboardSidebar, SidebarGroup } from '../components/DashboardSidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
  ExternalLink,
  Menu,
  ChevronDown,
  Check,
  MapPin,
  Compass,
  User,
  LogOut,
  ArrowLeft,
  KeyRound,
  Lock,
  Save,
  Edit3,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, switchDemoRole, logout, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'insights' | 'recommendations' | 'map' | 'audit' | 'settings' | 'profile'>('analytics');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState<'info' | 'security'>('info');

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setEditFullName(user.full_name || '');
      setEditPhone(user.phone || '');
      setEditDivision(user.division || 'ঢাকা');
      setEditDistrict(user.district || 'ঢাকা');
      setEditArea(user.area || '');
      setEditAddress(user.address || '');
      setEditAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      setProfileMessage({ type: 'error', text: 'পূর্ণ নাম প্রদান আবশ্যক।' });
      return;
    }
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await updateProfile({
        full_name: editFullName.trim(),
        phone: editPhone.trim(),
        division: editDivision.trim(),
        district: editDistrict.trim(),
        area: editArea.trim(),
        address: editAddress.trim(),
        avatar_url: editAvatarUrl.trim()
      });
      setProfileMessage({ type: 'success', text: res.message || 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
      return;
    }
    setIsChangingPass(true);
    setPassMessage(null);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPassMessage({ type: 'success', text: res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogoutAction = () => {
    logout();
    onNavigate('home');
  };

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
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const loadData = async () => {
    try {
      api.getSystemStatus().then(status => setSystemStatus(status)).catch(() => {});
      const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin';

      // 1. Fetch public civic reports (accessible to all)
      let reportsList: ProblemReport[] = [];
      try {
        const reportsRes = await api.getProblems();
        reportsList = reportsRes.reports || [];
        setReports(reportsList);
        if (reportsList.length > 0 && !selectedProbForRec) {
          setSelectedProbForRec(reportsList[0].id);
        }
      } catch (err) {
        console.warn('সমস্যার তালিকা লোড করতে ব্যর্থ:', err);
      }

      // 2. Fetch admin stats if authorized, else compute client fallback stats from reportsList
      let loadedStats: AdminStats | null = null;
      if (isAdminRole) {
        try {
          const statsRes = await api.getAdminStats();
          loadedStats = statsRes.stats;
        } catch (err) {
          console.warn('সার্ভার থেকে অ্যাডমিন পরিসংখ্যান আনা যায়নি, রিপোর্ট থেকে গণনা করা হচ্ছে:', err);
        }
      }

      if (!loadedStats && reportsList.length > 0) {
        const total = reportsList.length;
        const pending = reportsList.filter(r => r.status === 'pending').length;
        const verified = reportsList.filter(r => r.status === 'verified').length;
        const inProgress = reportsList.filter(r => r.status === 'in_progress').length;
        const resolved = reportsList.filter(r => r.status === 'resolved').length;
        const rejected = reportsList.filter(r => r.status === 'rejected').length;

        const categoryCounts: Record<string, number> = {};
        const districtCounts: Record<string, number> = {};
        const areaCounts: Record<string, number> = {};
        const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

        reportsList.forEach(r => {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
          districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
          const areaKey = `${r.area} (${r.district})`;
          areaCounts[areaKey] = (areaCounts[areaKey] || 0) + 1;
          if (r.severity in severityCounts) {
            severityCounts[r.severity as keyof typeof severityCounts]++;
          }
        });

        loadedStats = {
          total,
          pending,
          verified,
          inProgress,
          resolved,
          rejected,
          categoryCounts,
          districtCounts,
          areaCounts,
          severityCounts
        };
      }

      if (loadedStats) {
        setStats(loadedStats);
      }

      // 3. Fetch audit logs if authorized
      if (isAdminRole) {
        try {
          const auditRes = await api.getAuditLogs();
          setAuditLogs(auditRes.logs || []);
        } catch (err) {
          console.warn('অডিট লগ লোড ব্যর্থ:', err);
          setAuditLogs([]);
        }
      } else {
        setAuditLogs([]);
      }
    } catch (e) {
      console.warn('অ্যাডমিন ড্যাশবোর্ড ডেটা লোডিং সম্পন্ন:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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

  const severityChartData = stats
    ? [
        { name: 'জরুরি', value: stats.severityCounts.critical, color: '#dc2626' },
        { name: 'উচ্চ', value: stats.severityCounts.high, color: '#ea580c' },
        { name: 'মাঝারি', value: stats.severityCounts.medium, color: '#0284c7' },
        { name: 'কম', value: stats.severityCounts.low, color: '#64748b' },
      ]
    : [];

  const pendingCount = reports.filter(r => r.status === 'pending').length;

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

  // Sidebar Group Structure
  const sidebarGroups: SidebarGroup[] = [
    {
      title: 'মাঠপর্যায়ের নজরদারি ও উপাত্ত',
      items: [
        { id: 'analytics', label: 'অ্যানালিটিক্স ওভারভিউ', icon: BarChart3 },
        {
          id: 'reports',
          label: 'রিপোর্ট যাচাই ও সমাধান',
          icon: FileCheck2,
          badge: pendingCount > 0 ? `${pendingCount} নতুন` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold'
        },
        { id: 'map', label: 'ভৌগোলিক সমস্যা ম্যাপ', icon: Compass }
      ]
    },
    {
      title: 'এআই ইন্টেলিজেন্স ইঞ্জিন',
      items: [
        {
          id: 'insights',
          label: 'এআই ইনসাইটস ও পলিসি',
          icon: Sparkles,
          isAi: true,
          badge: 'Gemini',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        },
        {
          id: 'recommendations',
          label: 'সরকারি সমাধান সুপারিশ',
          icon: Building2
        }
      ]
    },
    {
      title: 'গভর্নেন্স ও নিরাপত্তা',
      items: [
        {
          id: 'audit',
          label: 'অডিট ও নিরাপত্তা লগ',
          icon: Clock,
          badge: auditLogs.length > 0 ? `${auditLogs.length}` : undefined
        },
        ...(isSuperAdmin
          ? [
              {
                id: 'settings',
                label: 'প্ল্যাটফর্ম ও সিস্টেম সেটিংস',
                icon: Settings
              }
            ]
          : []),
        {
          id: 'profile',
          label: 'প্রোফাইল ও সেটিংস',
          icon: User
        }
      ]
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return { title: 'অ্যানালিটিক্স ও মেট্রিক্স ওভারভিউ', desc: 'কমিউনিটি সমস্যাসমূহের রিয়েল-টাইম ট্রেন্ড ও পরিসংখ্যান' };
      case 'reports':
        return { title: 'রিপোর্ট ব্যবস্থাপনা ও মাঠপর্যায়ে যাচাইকরণ', desc: 'নাগরিকদের প্রেরিত সমস্যার অবস্থা পরিবর্তন, যাচাই ও খারিজ করুন' };
      case 'map':
        return { title: 'ভৌগোলিক হটস্পট ও সমস্যা ম্যাপ', desc: 'পুরো বাংলাদেশের সক্রিয় সমস্যা ক্লাস্টার ও অবস্থান' };
      case 'insights':
        return { title: 'এআই ইনসাইটস ইঞ্জিন (Gemini 3.8 Flash)', desc: 'ডেটাবেজের তথ্য বিশ্লেষণ করে সিটি কর্পোরেশনের জন্য কৌশলগত পরামর্শ' };
      case 'recommendations':
        return { title: 'সংশ্লিষ্ট সংস্থার জন্য এআই সমাধান সুপারিশপত্র', desc: 'ডিএনসিসি, ডিএসসিসি, ওয়াসা ও ট্রাফিকের নিকট আনুষ্ঠানিক সুপারিশ ড্রাফট' };
      case 'audit':
        return { title: 'প্রশাসনিক অডিট ও নিরাপত্তা লগ', desc: 'প্রতিটি পরিবর্তন ও সিদ্ধান্তের স্বচ্ছ ট্র্যাকিং রেকর্ড' };
      case 'settings':
        return { title: 'সুপার অ্যাডমিন প্ল্যাটফর্ম সেটিংস', desc: 'এআই প্যারামিটার, সিকিউরিটি এবং রোল অনুমোদন' };
      case 'profile':
        return { title: 'অ্যাডমিন প্রোফাইল ও নিরাপত্তা সেটিংস', desc: 'আপনার প্রোফাইল তথ্য, পাসওয়ার্ড ও অ্যাক্সেস রোল পরিচালনা করুন' };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="flex min-h-screen bg-slate-100/70 font-['Hind_Siliguri',sans-serif]">
      
      {/* Smart City Left Sidebar */}
      <DashboardSidebar
        portalTitle={isSuperAdmin ? 'সুপার অ্যাডমিন হাব' : 'অ্যাডমিন ড্যাশবোর্ড'}
        portalSubtitle="স্মার্ট সিটি নাগরিক সেবা"
        groups={sidebarGroups}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as any)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onNavigateHome={() => onNavigate('home')}
        onNavigateExplorer={() => onNavigate('explorer')}
        onNavigateSubmit={() => onNavigate('submit')}
        onNavigateRouteIntel={() => onNavigate('route-intel')}
        onLogout={handleLogoutAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar inside Dashboard */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="সাইডবার মেনু খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <span>প্রশাসন</span>
                <span>/</span>
                <span>{currentTabInfo.title.split(' ')[0]}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {currentTabInfo.title}
              </h2>
            </div>
          </div>

          {/* Right Action Icons in Topbar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Data Refresh */}
            <button
              onClick={loadData}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>রিফ্রেশ</span>
            </button>

            {/* Test Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="hidden md:inline">রোল:</span>
                <span>
                  {user?.role === 'super_admin' ? 'সুপার অ্যাডমিন' : user?.role === 'admin' ? 'অ্যাডমিন' : 'সাধারণ নাগরিক'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-[100] animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    টেস্ট রোল পরিবর্তন
                  </div>
                  <button
                    onClick={() => { switchDemoRole('user'); setIsRoleMenuOpen(false); onNavigate('user-dashboard'); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-50 text-slate-700"
                  >
                    <span>সাধারণ নাগরিক</span>
                    {user?.role === 'user' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setIsRoleMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl ${user?.role === 'admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>দায়িত্বপ্রাপ্ত অ্যাডমিন</span>
                    {user?.role === 'admin' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('super_admin'); setIsRoleMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl ${user?.role === 'super_admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>সুপার অ্যাডমিন</span>
                    {user?.role === 'super_admin' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer group"
                title="প্রশাসনিক প্রোফাইল মেনু"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                  alt={user?.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-teal-500 transition-colors shrink-0"
                />
                <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[130px] truncate group-hover:text-teal-700 transition-colors">
                  {user?.full_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-[100] animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                      {isSuperAdmin ? 'সুপার অ্যাডমিন' : 'দায়িত্বপ্রাপ্ত অ্যাডমিন'}
                    </span>
                  </div>

                  <div className="space-y-0.5 py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900 rounded-xl transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      <span>প্রোফাইল তথ্য ও সেটিংস</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-400" />
                      <span>রিপোর্ট যাচাই ও সমাধান</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('home');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-400" />
                      <span>পাবলিক ওয়েবসাইটে ফিরুন</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogoutAction();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>লগআউট করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
          
          {!isAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">আপনি বর্তমানে সাধারণ নাগরিক অ্যাকাউন্টে আছেন</h4>
                  <p className="text-xs text-amber-700">অ্যাডমিন হিসেবে সমস্যা ভেরিফিকেশন, স্ট্যাটাস পরিবর্তন ও এআই সুপারিশ তৈরি করতে অ্যাডমিন রোল সক্রিয় করুন।</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => switchDemoRole('admin')}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  অ্যাডমিন হিসেবে প্রবেশ
                </button>
                <button
                  onClick={() => switchDemoRole('super_admin')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  সুপার অ্যাডমিন
                </button>
              </div>
            </div>
          )}

          {actionFeedback && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in shadow-xs">
              <span>✓ {actionFeedback}</span>
            </div>
          )}

          {/* Subtitle bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-500">
              {currentTabInfo.desc}
            </p>
          </div>

          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
                  <span className="text-xs font-bold text-slate-500">মোট নিবন্ধিত সমস্যা</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stats.total} টি</div>
                  <span className="text-[11px] text-slate-400">সর্বমোট নাগরিক রিপোর্ট</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/30 shadow-xs">
                  <span className="text-xs font-bold text-amber-700">অপেক্ষমাণ (Pending)</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending} টি</div>
                  <span className="text-[11px] text-amber-700 font-medium">যাচাই করা প্রয়োজন</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-sky-200 bg-sky-50/30 shadow-xs">
                  <span className="text-xs font-bold text-sky-700">যাচাইকৃত (Verified)</span>
                  <div className="text-2xl font-black text-sky-600 mt-1">{stats.verified} টি</div>
                  <span className="text-[11px] text-sky-700 font-medium">পাবলিক করিডোরে সক্রিয়</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                  <span className="text-xs font-bold text-emerald-700">সমাধানকৃত (Resolved)</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved} টি</div>
                  <span className="text-[11px] text-emerald-700 font-medium">সফল সমাধান সম্পন্ন</span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Category Bar Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      ক্যাটাগরি অনুযায়ী সমস্যার বিস্তার (Bar Chart)
                    </h3>
                    <span className="text-xs text-slate-400">মোট {stats.total} টি</span>
                  </div>
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

                {/* Severity Pie Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      সমস্যার গুরুত্বের অনুপাত (Severity Breakdown)
                    </h3>
                    <span className="text-xs text-slate-400">ঝুঁকি মাত্রা</span>
                  </div>
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
                  <div className="flex flex-wrap justify-center gap-4 text-xs">
                    {severityChartData.map((s, i) => (
                      <span key={i} className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name} ({s.value})
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Area Hotspots Ranking */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    শীর্ষ সমস্যাপ্রবণ এলাকা ও হটস্পটসমূহ (Top Hotspots)
                  </h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-teal-600 font-bold hover:underline"
                  >
                    ম্যাপে দেখুন ➔
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.areaCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([area, cnt], idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-teal-600">হটস্পট #{idx + 1}</div>
                        <div className="font-bold text-sm text-slate-900 truncate">{area}</div>
                        <div className="text-xs text-slate-500">{cnt} টি নিবন্ধিত সমস্যা</div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REPORTS MANAGEMENT */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">সব অবস্থা</option>
                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                    <option value="verified">যাচাইকৃত (Verified)</option>
                    <option value="in_progress">কাজ চলমান (In Progress)</option>
                    <option value="resolved">সমাধানকৃত (Resolved)</option>
                    <option value="rejected">খারিজ (Rejected)</option>
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="কোড বা এলাকা দিয়ে খুঁজুন..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  মোট {filteredReports.length} টি রিপোর্ট
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">কোড</th>
                      <th className="px-4 py-3">শিরোনাম ও অবস্থান</th>
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
                                className="bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                যাচাই করুন
                              </button>
                            )}
                            {report.status === 'verified' && (
                              <button
                                onClick={() => handleQuickStatusChange(report.id, 'in_progress')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                কাজ চলমান
                              </button>
                            )}
                            {report.status === 'in_progress' && (
                              <button
                                onClick={() => handleQuickStatusChange(report.id, 'resolved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                সমাধানকৃত
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
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

          {/* TAB 3: GEOGRAPHIC MAP VIEW */}
          {activeTab === 'map' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-teal-600" />
                    <span>ভৌগোলিক সমস্যা ক্লাস্টার ও অবস্থান ম্যাপ</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ম্যাপে ক্লিক করে সমস্যা চিহ্নিত করুন এবং সরাসরি অবস্থা পর্যালোচনা করুন
                  </p>
                </div>
                <span className="text-xs text-slate-500">মোট {reports.length} টি মার্কার</span>
              </div>

              <LeafletMap
                mode="explorer"
                height="550px"
                problems={reports}
                selectedProblem={selectedReport}
                onSelectProblem={(p) => setSelectedReport(p)}
              />
            </div>
          )}

          {/* TAB 4: AI INSIGHTS ENGINE */}
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

                  {/* 4 Analytical Cards */}
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

                  {/* Priority Actions */}
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

          {/* TAB 5: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <span>সংশ্লিষ্ট কর্তৃপক্ষের জন্য এআই সমাধান সুপারিশপত্র প্রণয়ন</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  যেকোনো জটিল নাগরিক সমস্যার জন্য ঢাকা সিটি কর্পোরেশন, ওয়াসা, বা ট্রাফিক পুলিশের নিকট প্রেরণের উপযোগী ফরমাল সুপারিশ ড্রাফট তৈরি করুন।
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

          {/* TAB 6: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    প্রশাসনিক কার্যকলাপের অডিট লগ (Audit Log)
                  </h3>
                  <p className="text-xs text-slate-500">নিরাপত্তা ও জবাবদিহিতা ট্র্যাকিং রেকর্ড</p>
                </div>
                <span className="text-xs text-slate-400">{auditLogs.length} টি রেকর্ড</span>
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

          {/* TAB 7: SUPER ADMIN SETTINGS */}
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

              {/* Live Database Connection Status */}
              <div className={`p-5 rounded-2xl border ${systemStatus?.database?.supabase?.isConnected ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/70 border-amber-300'} space-y-3`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${systemStatus?.database?.supabase?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <h4 className="text-sm font-bold text-slate-900">
                      ডেটাবেজ কানেকশন স্ট্যাটাস ({systemStatus?.database?.provider || 'Supabase PostgreSQL'})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      api.getSystemStatus().then(status => {
                        setSystemStatus(status);
                        setActionFeedback('সিস্টেম ও ডেটাবেজ স্ট্যাটাস রিফ্রেশ হয়েছে!');
                        setTimeout(() => setActionFeedback(null), 3000);
                      });
                    }}
                    className="self-start sm:self-auto px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
                  >
                    পুনরায় চেক করুন
                  </button>
                </div>
                <p className="text-xs text-slate-700">
                  {systemStatus?.database?.supabase?.messageBn || 'ডেটাবেজ স্ট্যাটাস যাচাই করা হচ্ছে...'}
                </p>
                {systemStatus?.database?.supabase?.url && (
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">প্রজেক্ট এন্ডপয়েন্ট:</span>
                    <span>{systemStatus.database.supabase.url}</span>
                  </div>
                )}
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
                      <span>অডিট লগ বাফার সাইজ:</span>
                      <span className="font-mono">৫০০ রেকর্ডস</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in">
              {/* Profile Banner Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="relative group shrink-0">
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.full_name}
                      className="w-20 h-20 rounded-3xl object-cover border-2 border-teal-500 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full border-2 border-white">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 truncate">{user?.full_name}</h3>
                      <span className="text-[11px] bg-teal-50 text-teal-800 font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                        {isSuperAdmin ? 'সুপার অ্যাডমিন' : 'দায়িত্বপ্রাপ্ত অ্যাডমিন'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{user?.email}</span>
                      <span>•</span>
                      <span>{user?.phone || 'ফোন সেট করা নেই'}</span>
                      <span>•</span>
                      <span>📍 {user?.area || 'মিরপুর'}, {user?.district || 'ঢাকা'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      অ্যাকাউন্ট তৈরি: {new Date(user?.created_at || '').toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleLogoutAction}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Edit Profile & Password */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setProfileSubTab('info')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    profileSubTab === 'info'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>প্রোফাইল তথ্য সম্পাদন</span>
                </button>
                <button
                  onClick={() => setProfileSubTab('security')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    profileSubTab === 'security'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা</span>
                </button>
              </div>

              {/* SUBTAB 1: PROFILE EDIT */}
              {profileSubTab === 'info' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">প্রশাসনিক প্রোফাইল ও যোগাযোগের তথ্য</h4>
                    <p className="text-xs text-slate-500 mt-0.5">আপনার নাম, মোবাইল নম্বর ও প্রশাসনিক দায়িত্বের এলাকা হালনাগাদ করুন</p>
                  </div>

                  {profileMessage && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        profileMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {profileMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{profileMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          পূর্ণ নাম <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          মোবাইল নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">বিভাগ</label>
                        <input
                          type="text"
                          value={editDivision}
                          onChange={(e) => setEditDivision(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">জেলা</label>
                        <input
                          type="text"
                          value={editDistrict}
                          onChange={(e) => setEditDistrict(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">দায়িত্বপ্রাপ্ত এলাকা</label>
                        <input
                          type="text"
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                          placeholder="যেমন: মিরপুর ১০"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">অফিস / কার্যালয় ঠিকানা</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="অফিসের নাম ও ঠিকানা..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>সংরক্ষণ করা হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>পরিবর্তন সংরক্ষণ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUBTAB 2: PASSWORD & SECURITY */}
              {profileSubTab === 'security' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h4>
                    <p className="text-xs text-slate-500 mt-0.5">আপনার প্রশাসনিক পোর্টালে অননুমোদিত অ্যাক্সেস রোধে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন</p>
                  </div>

                  {passMessage && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        passMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{passMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs sm:text-sm">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">বর্তমান পাসওয়ার্ড</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="বর্তমান পাসওয়ার্ড দিন"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="নতুন পাসওয়ার্ড লিখুন"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        নতুন পাসওয়ার্ড নিশ্চিতকরণ <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isChangingPass ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>আপডেট হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>পাসওয়ার্ড আপডেট করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

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
