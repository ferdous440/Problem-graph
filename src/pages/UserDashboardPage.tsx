import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProblemReport } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import { LeafletMap } from '../components/LeafletMap';
import { DashboardSidebar, SidebarGroup } from '../components/DashboardSidebar';
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
  ArrowRight,
  Menu,
  ChevronDown,
  Check,
  Compass,
  FileText,
  Mail,
  Phone,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Edit3,
  KeyRound,
  Lock,
  Save,
  RefreshCw,
  Building
} from 'lucide-react';

interface UserDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { user, notifications, unreadCount, markAsRead, switchDemoRole, updateProfile, changePassword, logout } = useAuth();
  const [myReports, setMyReports] = useState<ProblemReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'map' | 'notifications' | 'profile'>('overview');
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
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

  const sidebarGroups: SidebarGroup[] = [
    {
      title: 'নাগরিক সেবা ও ট্র্যাকিং',
      items: [
        { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard },
        {
          id: 'reports',
          label: 'আমার জমা দেওয়া রিপোর্ট',
          icon: FileText,
          badge: totalReports > 0 ? `${totalReports}` : undefined,
          badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
        },
        { id: 'map', label: 'এলাকার সমস্যা ম্যাপ', icon: Compass }
      ]
    },
    {
      title: 'বিজ্ঞপ্তি ও প্রোফাইল',
      items: [
        {
          id: 'notifications',
          label: 'নোটিফিকেশন ও বার্তা',
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount} নতুন` : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold'
        },
        { id: 'profile', label: 'প্রোফাইল তথ্য ও সেটিংস', icon: User }
      ]
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'নাগরিক ড্যাশবোর্ড ওভারভিউ', desc: 'আপনার এলাকার সমস্যা ও সাম্প্রতিক কার্যকলাপের সামগ্রিক সারসংক্ষেপ' };
      case 'reports':
        return { title: 'আমার জমাকৃত রিপোর্টসমূহ', desc: 'আপনার দাখিল করা সমস্যার বর্তমান অবস্থা ও অগ্রগতির ইতিহাস' };
      case 'map':
        return { title: 'আমার এলাকার সমস্যা ম্যাপ', desc: 'আপনার ওয়ার্ড ও আশেপাশের সক্রিয় সমস্যার অবস্থান' };
      case 'notifications':
        return { title: 'নোটিফিকেশন ও সিস্টেম আপডেট', desc: 'রিপোর্ট যাচাই ও সমাধান সংক্রান্ত সর্বশেষ বার্তা' };
      case 'profile':
        return { title: 'প্রোফাইল তথ্য ও নাগরিক পরিচিতি', desc: 'আপনার অ্যাকাউন্ট তথ্য ও যোগাযোগের ঠিকানা' };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="flex min-h-screen bg-slate-100/70 font-['Hind_Siliguri',sans-serif]">
      
      {/* Smart City Left Sidebar */}
      <DashboardSidebar
        portalTitle="নাগরিক ড্যাশবোর্ড"
        portalSubtitle="কমিউনিটি সমস্যা পোর্টাল"
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
                <span>নাগরিক পোর্টাল</span>
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
            
            {/* Submit New Problem Button */}
            <button
              onClick={() => onNavigate('submit')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>সমস্যা জানান</span>
            </button>

            {/* Test Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="hidden md:inline">রোল:</span>
                <span>সাধারণ নাগরিক</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-[100] animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    টেস্ট রোল পরিবর্তন
                  </div>
                  <button
                    onClick={() => { switchDemoRole('user'); setIsRoleMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-teal-50 text-teal-800 font-bold"
                  >
                    <span>সাধারণ নাগরিক</span>
                    <Check className="w-4 h-4 text-teal-600" />
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setIsRoleMenuOpen(false); onNavigate('admin-dashboard'); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-50 text-slate-700"
                  >
                    <span>দায়িত্বপ্রাপ্ত অ্যাডমিন</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('super_admin'); setIsRoleMenuOpen(false); onNavigate('admin-dashboard'); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-50 text-slate-700"
                  >
                    <span>সুপার অ্যাডমিন</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer group"
                title="প্রোফাইল মেনু খুলুন"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
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
                      নাগরিক অ্যাকাউন্ট
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
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>আমার রিপোর্টসমূহ ({totalReports})</span>
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
          
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-500">
              {currentTabInfo.desc}
            </p>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">মোট রিপোর্ট</span>
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{totalReports}</div>
                  <span className="text-[11px] text-slate-400">আমার সাবমিট করা</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">অপেক্ষমাণ রিপোর্ট</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 mt-2">{pendingReports}</div>
                  <span className="text-[11px] text-amber-700">যাচাই প্রক্রিয়ায় রয়েছে</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-sky-200 bg-sky-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-700">যাচাইকৃত রিপোর্ট</span>
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-black text-sky-600 mt-2">{verifiedReports}</div>
                  <span className="text-[11px] text-sky-700">কর্তৃপক্ষ নিশ্চিত করেছে</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">সমাধান হওয়া সমস্যা</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">{resolvedReports}</div>
                  <span className="text-[11px] text-emerald-700">সফল সমাধান সম্পন্ন</span>
                </div>
              </div>

              {/* Recent Reports Highlights */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    আমার সাম্প্রতিক দাখিলকৃত সমস্যাসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-teal-600 font-bold hover:underline"
                  >
                    সবগুলো দেখুন ({totalReports}) ➔
                  </button>
                </div>

                {myReports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myReports.slice(0, 3).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem)}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-500 font-semibold">{problem.tracking_code}</span>
                          <StatusBadge status={problem.status} size="sm" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                          {problem.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span>📍 {problem.area}</span>
                          <span className="font-semibold text-teal-700">{problem.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                    <p>আপনি এখনো কোনো সমস্যা দাখিল করেননি।</p>
                    <button
                      onClick={() => onNavigate('submit')}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs"
                    >
                      প্রথম সমস্যা জানান
                    </button>
                  </div>
                )}
              </div>

              {/* Area Map Teaser */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      আমার এলাকার সমস্যা ম্যাপ ভিউ
                    </h3>
                    <p className="text-xs text-slate-500">আপনার এলাকার অন্যান্য সক্রিয় রিপোর্ট</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-teal-600 font-bold hover:underline"
                  >
                    বড় ম্যাপ খুলুন ➔
                  </button>
                </div>

                <LeafletMap
                  mode="explorer"
                  height="360px"
                  problems={myReports}
                  selectedProblem={selectedProblem}
                  onSelectProblem={(p) => setSelectedProblem(p)}
                />
              </div>

            </div>
          )}

          {/* TAB 2: MY SUBMITTED REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-500">মোট {myReports.length} টি রিপোর্ট জমা দিয়েছেন</span>
                <button
                  onClick={() => onNavigate('submit')}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  + নতুন সমস্যা জমা দিন
                </button>
              </div>

              {myReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myReports.map((problem) => (
                    <div
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                    >
                      {problem.images && problem.images[0] && (
                        <div className="h-44 overflow-hidden bg-slate-100 relative">
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

          {/* TAB 3: AREA PROBLEMS MAP */}
          {activeTab === 'map' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    এলাকার সমস্যা ম্যাপ
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার রিপোর্ট করা সমস্যার সঠিক অবস্থান ও স্ট্যাটাস মার্কার
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('explorer')}
                  className="text-xs text-teal-600 font-bold hover:underline"
                >
                  সার্বজনীন পাবলিক ম্যাপ এক্সপ্লোরার ➔
                </button>
              </div>

              <LeafletMap
                mode="explorer"
                height="540px"
                problems={myReports}
                selectedProblem={selectedProblem}
                onSelectProblem={(p) => setSelectedProblem(p)}
              />
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  বিজ্ঞপ্তি ও সিস্টেম আপডেট ({notifications.length})
                </h3>
                <span className="text-xs text-slate-400">ক্লিক করে পঠিত চিহ্নিত করুন</span>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        n.is_read
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-teal-50/70 border-teal-200 text-teal-900 font-medium shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                          {n.title_bn}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(n.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{n.message_bn}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-8 text-center">কোনো বিজ্ঞপ্তি নেই।</p>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in">
              {/* Profile Banner Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="relative group shrink-0">
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.full_name}
                      className="w-20 h-20 rounded-3xl object-cover border-2 border-teal-500 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 truncate">{user?.full_name}</h3>
                      <span className="text-[11px] bg-teal-50 text-teal-800 font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                        যাচাইকৃত নাগরিক
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{user?.email}</span>
                      <span>•</span>
                      <span>{user?.phone || 'ফোন নম্বর সেট করা নেই'}</span>
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
                    <h4 className="text-sm font-bold text-slate-900">ব্যক্তিগত ও যোগাযোগ তথ্য</h4>
                    <p className="text-xs text-slate-500 mt-0.5">আপনার নাম, মোবাইল নম্বর ও ঠিকানার বিবরণ হালনাগাদ করুন</p>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">ওয়ার্ড / এলাকা</label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">বিস্তারিত ঠিকানা</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="বাসা নং, রোড নং, সেক্টর/ব্লক..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">প্রোফাইল ছবির লিঙ্ক (Avatar URL)</label>
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-slate-400">অথবা প্রস্তুতকৃত ছবি নির্বাচন করুন:</span>
                        {[
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
                        ].map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Preset"
                            onClick={() => setEditAvatarUrl(url)}
                            className={`w-7 h-7 rounded-full object-cover border cursor-pointer hover:scale-110 transition-transform ${
                              editAvatarUrl === url ? 'border-teal-500 ring-2 ring-teal-500/40' : 'border-slate-300'
                            }`}
                          />
                        ))}
                      </div>
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
                    <h4 className="text-sm font-bold text-slate-900">গোপন পাসওয়ার্ড পরিবর্তন</h4>
                    <p className="text-xs text-slate-500 mt-0.5">আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নতুন পাসওয়ার্ড সেট করুন</p>
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
