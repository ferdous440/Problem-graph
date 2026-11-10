import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  FileCheck2,
  Sparkles,
  Building2,
  Clock,
  Settings,
  LayoutDashboard,
  Bell,
  MapPin,
  Compass,
  PlusCircle,
  LogOut,
  ChevronRight,
  ShieldAlert,
  User,
  ArrowLeft,
  X,
  ExternalLink
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  isAi?: boolean;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  portalTitle: string;
  portalSubtitle: string;
  groups: SidebarGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onNavigateHome: () => void;
  onNavigateExplorer?: () => void;
  onNavigateSubmit?: () => void;
  onNavigateRouteIntel?: () => void;
  onLogout?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  portalTitle,
  portalSubtitle,
  groups,
  activeId,
  onSelect,
  isOpenMobile,
  onCloseMobile,
  onNavigateHome,
  onNavigateExplorer,
  onNavigateSubmit,
  onNavigateRouteIntel,
  onLogout
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onCloseMobile();
    if (onLogout) {
      onLogout();
    } else {
      onNavigateHome();
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'সুপার অ্যাডমিন', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' };
      case 'admin':
        return { label: 'দায়িত্বপ্রাপ্ত অ্যাডমিন', bg: 'bg-teal-500/20 text-teal-300 border-teal-400/30' };
      default:
        return { label: 'সাধারণ নাগরিক', bg: 'bg-sky-500/20 text-sky-300 border-sky-400/30' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1300] lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 z-[1400] lg:z-10 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Portal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">প্রবলেমগ্রাফ</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-teal-400 font-medium -mt-0.5">{portalTitle}</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Badge (Clickable) */}
        <div
          onClick={() => {
            onSelect('profile');
            onCloseMobile();
          }}
          className="px-5 py-4 border-b border-slate-800/80 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer transition-all group"
          title="প্রোফাইল তথ্য ও সেটিংস দেখতে ক্লিক করুন"
        >
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
              alt={user?.full_name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm group-hover:border-teal-400 transition-colors shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate group-hover:text-teal-300 transition-colors flex items-center justify-between">
                <span className="truncate">{user?.full_name || 'নাগরিক ব্যবহারকারী'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                📍 {user?.area || 'এলাকা'}, {user?.district || 'ঢাকা'}
              </div>
              <span
                className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${roleInfo.bg}`}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.title && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-600 to-sky-700 text-white font-bold shadow-md shadow-teal-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.isAi
                            ? 'text-amber-400 group-hover:text-amber-300'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Badge */}
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="w-1 h-5 bg-teal-300 rounded-full absolute -left-1 top-1/2 -translate-y-1/2" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick Actions in Sidebar */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              দ্রুত সেবা
            </div>

            {onNavigateSubmit && (
              <button
                onClick={onNavigateSubmit}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>নতুন সমস্যা জানান</span>
              </button>
            )}

            {onNavigateRouteIntel && (
              <button
                onClick={onNavigateRouteIntel}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI যাত্রাপথ বিশ্লেষণ</span>
              </button>
            )}

            {onNavigateExplorer && (
              <button
                onClick={onNavigateExplorer}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Compass className="w-4 h-4" />
                <span>পাবলিক এক্সপ্লোরার ম্যাপ</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পাবলিক ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            প্রবলেমগ্রাফ v1.0 • বাংলা
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="লগআউট"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>
    </>
  );
};
