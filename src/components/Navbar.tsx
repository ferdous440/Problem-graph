import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Sparkles,
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Info,
  PhoneCall,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, notifications, unreadCount, markAsRead, switchDemoRole, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isSuperAdmin = user?.role === 'super_admin';

  const navLinks = [
    { id: 'home', label: 'হোম', icon: MapPin },
    { id: 'explorer', label: 'সমস্যা এক্সপ্লোরার', icon: Compass },
    {
      id: 'route-intel',
      label: 'এআই যাত্রাপথ বিশ্লেষণ',
      icon: Sparkles,
      highlight: true
    },
    { id: 'submit', label: 'সমস্যা জানান', icon: PlusCircle },
    { id: 'user-dashboard', label: 'আমার ড্যাশবোর্ড', icon: LayoutDashboard },
    ...(isAdmin
      ? [{ id: 'admin-dashboard', label: isSuperAdmin ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন প্যানেল', icon: ShieldAlert }]
      : []),
    { id: 'about', label: 'পরিচিতি', icon: Info },
    { id: 'contact', label: 'যোগাযোগ', icon: PhoneCall },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'সুপার অ্যাডমিন';
      case 'admin': return 'অ্যাডমিন';
      default: return 'সাধারণ নাগরিক';
    }
  };

  return (
    <header className="sticky top-0 z-[1100] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-slate-900 tracking-tight">প্রবলেমগ্রাফ</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">
                কমিউনিটি সমস্যা ও ট্রাভেল ইন্টেলিজেন্স
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;

              if (link.highlight) {
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-sm'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                    <span>{link.label}</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
                  </button>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Demo Role Switcher, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                title="রোল পরিবর্তন করে টেস্ট করুন"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="hidden md:inline">রোল:</span>
                <span>{getRoleLabel(user?.role)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[1200] animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    টেস্ট রোল পরিবর্তন
                  </div>
                  <button
                    onClick={() => { switchDemoRole('user'); setIsRoleMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${user?.role === 'user' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>সাধারণ নাগরিক</span>
                    {user?.role === 'user' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setIsRoleMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${user?.role === 'admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>দায়িত্বপ্রাপ্ত অ্যাডমিন</span>
                    {user?.role === 'admin' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('super_admin'); setIsRoleMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${user?.role === 'super_admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>সুপার অ্যাডমিন</span>
                    {user?.role === 'super_admin' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="বিজ্ঞপ্তি"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-[1200] animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                    <span className="text-sm font-bold text-slate-900">বিজ্ঞপ্তিসমূহ</span>
                    <span className="text-xs text-slate-500">{unreadCount} টি অপঠিত</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-teal-50/80 text-teal-900 font-medium border border-teal-100'}`}
                        >
                          <div className="font-semibold text-slate-900 mb-0.5">{n.title_bn}</div>
                          <div className="text-slate-600 line-clamp-2">{n.message_bn}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-4">কোনো নতুন বিজ্ঞপ্তি নেই</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[1200]">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { handleNavClick('user-dashboard'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>আমার ড্যাশবোর্ড</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { handleNavClick('admin-dashboard'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          <span>অ্যাডমিন ম্যানেজমেন্ট</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 space-y-0.5">
                      <button
                        onClick={() => { handleNavClick('login'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>অন্য অ্যাকাউন্টে প্রবেশ</span>
                      </button>
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  লগইন
                </button>
                <button
                  onClick={() => handleNavClick('login')}
                  className="hidden sm:inline-block bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  রেজিস্ট্রেশন
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${link.highlight ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
