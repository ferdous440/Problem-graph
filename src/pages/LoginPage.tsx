import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Compass,
  FileText,
  KeyRound,
  Shield,
  HelpCircle,
  X,
  ExternalLink
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register, forgotPassword, switchDemoRole } = useAuth();
  
  // Tab state: 'login' | 'register'
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDivision, setRegDivision] = useState('ঢাকা');
  const [regDistrict, setRegDistrict] = useState('ঢাকা');
  const [regArea, setRegArea] = useState('মিরপুর ১০');
  const [regAddress, setRegAddress] = useState('');
  const [regNid, setRegNid] = useState('');
  const [regAccountType, setRegAccountType] = useState<'user' | 'admin'>('user');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Common UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Available divisions and districts
  const BD_DIVISIONS = [
    'ঢাকা',
    'চট্টগ্রাম',
    'রাজশাহী',
    'খুলনা',
    'বরিশাল',
    'সিলেট',
    'রংপুর',
    'ময়মনসিংহ'
  ];

  const POPULAR_DISTRICTS: Record<string, string[]> = {
    'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'টাঙ্গাইল', 'নরসিংদী', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ'],
    'চট্টগ্রাম': ['চট্টগ্রাম', 'কুমিল্লা', 'কক্সবাজার', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'নোয়াখালী'],
    'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নাটোর'],
    'খুলনা': ['খুলনা', 'যশোর', 'কুষ্টিয়া', 'সাতক্ষীরা'],
    'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা'],
    'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
    'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম'],
    'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা']
  };

  const AVATAR_PRESETS = [
    { label: 'নাগরিক ১', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
    { label: 'নাগরিক ২', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80' },
    { label: 'নাগরিক ৩', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { label: 'নাগরিক ৪', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
  ];

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'দুর্বল পাসওয়ার্ড', color: 'bg-rose-500 text-rose-600' };
    if (score <= 2) return { score: 2, text: 'মাঝারি পাসওয়ার্ড', color: 'bg-amber-500 text-amber-600' };
    return { score: 3, text: 'শক্তিশালী পাসওয়ার্ড', color: 'bg-emerald-500 text-emerald-600' };
  };

  const passStrength = getPasswordStrength(regPassword);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('অনুগ্রহ করে ইমেইল ঠিকানা অথবা মোবাইল নম্বর দিন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login({
        email: loginIdentifier.trim(),
        password: loginPassword || undefined
      });
      setSuccessMessage('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        onNavigate('home');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim() || !regEmail.trim()) {
      setErrorMessage('পূর্ণ নাম ও ইমেইল ঠিকানা প্রদান আবশ্যক।');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('অনুগ্রহ করে প্রবলেমগ্রাফের নীতিমালা ও শর্তাবলীতে সম্মতি দিন।');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        full_name: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        division: regDivision,
        district: regDistrict,
        area: regArea.trim(),
        address: regAddress.trim(),
        nid: regNid.trim(),
        role: regAccountType,
        avatar_url: regAvatar
      });

      setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম প্রবলেমগ্রাফে।');
      setTimeout(() => {
        onNavigate(regAccountType === 'admin' ? 'admin-dashboard' : 'user-dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-click Demo Role switcher
  const handleQuickDemo = async (role: 'user' | 'admin' | 'super_admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await switchDemoRole(role);
      onNavigate(role === 'user' ? 'user-dashboard' : 'admin-dashboard');
    } catch (err: any) {
      setErrorMessage('ডেমো লগইনে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsForgotSubmitting(true);
    setForgotStatus(null);

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotStatus(res.message);
    } catch (err: any) {
      setForgotStatus(err.message || 'অনুরোধ ব্যর্থ হয়েছে।');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Hind_Siliguri',sans-serif]">
      
      {/* Outer Shell */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in duration-300">
        
        {/* Left Visual Brand Panel (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl text-white tracking-tight">প্রবলেমগ্রাফ</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-teal-400 font-medium -mt-0.5">
                  কমিউনিটি সমস্যা ও ট্রাভেল ইন্টেলিজেন্স
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                নাগরিক সচেতনতায় নিরাপদ বাংলাদেশ গড়ার অঙ্গীকার
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                আপনার এলাকার খানাখন্দ, ড্রেনেজ বা যানজটের সমস্যা জিপিএস লোকেশন ও ছবিসহ সরাসরি রিপোর্ট করুন। বের হওয়ার পূর্বে ব্যবহার করুন এআই রুট করিডোর বিশ্লেষণ।
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="space-y-3 pt-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>লাইভ জিপিএস লোকেশন ও মাঠপর্যায়ের ছবিযুক্ত নাগরিক রিপোর্ট</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>জেমিনি ৩.৮ ফ্ল্যাশ দ্বারা ৯-পয়েন্ট যাত্রাপথ ঝুঁকি ও সতর্কতা বিশ্লেষণ</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>সিটি কর্পোরেশন, ওয়াসা ও ট্রাফিকের জন্য আনুষ্ঠানিক সুপারিশ ড্রাফট</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>রোল-ভিত্তিক নাগরিক ও প্রশাসনিক একাউন্ট স্বচ্ছতা নিশ্চিতকরণ</span>
              </div>
            </div>
          </div>

          {/* 1-Click Fast Demo Testing Box */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>তাৎক্ষণিক টেস্ট একাউন্ট সুইচার</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">১-ক্লিক লগইন</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                disabled={isLoading}
                className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    সাধারণ নাগরিক (User)
                  </div>
                  <div className="text-[10px] text-slate-400">user@problemgraph.bd • pass123</div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={isLoading}
                className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    দায়িত্বপ্রাপ্ত অ্যাডমিন (DNCC)
                  </div>
                  <div className="text-[10px] text-slate-400">admin@problemgraph.bd • admin123</div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('super_admin')}
                disabled={isLoading}
                className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    সুপার অ্যাডমিন (Super Admin)
                  </div>
                  <div className="text-[10px] text-slate-400">superadmin@problemgraph.bd • super123</div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          
          {/* Top Switcher Tabs */}
          <div className="flex items-center justify-center">
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 w-full max-w-sm border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  authTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সাইন ইন (লগইন)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  authTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                নতুন নাগরিক একাউন্ট
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: USER LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  আপনার অ্যাকাউন্টে সাইন ইন করুন
                </h3>
                <p className="text-xs text-slate-500">
                  নাগরিক সেবা, সমস্যা ট্র্যাকিং ও এআই অ্যানালাইসিসে স্বাগতম
                </p>
              </div>

              {/* Identifier (Email or Phone) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ইমেইল ঠিকানা অথবা মোবাইল নম্বর *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="user@problemgraph.bd বা 017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    গোপন পাসওয়ার্ড *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  * ডেমো অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড: <span className="font-mono font-bold text-slate-600">pass123</span>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span>পরবর্তী প্রবেশের জন্য পাসওয়ার্ড মনে রাখুন</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাইকরণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>

              <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>নতুন ব্যবহারকারী? </span>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  এখনই বিনামূল্যে অ্যাকাউন্ট খুলুন
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: USER REGISTRATION FORM */}
          {authTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  নতুন নাগরিক হিসেবে নিবন্ধন করুন
                </h3>
                <p className="text-xs text-slate-500">
                  আপনার এলাকার সমস্যাসমূহ সরাসরি সিটি কর্পোরেশনের নজরে আনুন
                </p>
              </div>

              {/* Full Name & Phone in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার পূর্ণ নাম *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল ঠিকানা *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@citizen.bd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাসওয়ার্ড (অন্তত ৬ অক্ষর) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regPassword && (
                    <div className="text-[10px] mt-1 flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${passStrength.color.split(' ')[0]}`} />
                      <span className={passStrength.color.split(' ')[1]}>{passStrength.text}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Geographic Information (Division, District, Area) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ *</label>
                  <select
                    value={regDivision}
                    onChange={(e) => {
                      setRegDivision(e.target.value);
                      const districts = POPULAR_DISTRICTS[e.target.value];
                      if (districts && districts.length > 0) setRegDistrict(districts[0]);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
                  >
                    {BD_DIVISIONS.map((div, i) => (
                      <option key={i} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জেলা *</label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
                  >
                    {(POPULAR_DISTRICTS[regDivision] || ['ঢাকা']).map((dist, i) => (
                      <option key={i} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">থানা / এলাকা *</label>
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    placeholder="যেমন: মিরপুর ১০"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Detailed Address & NID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিস্তারিত সড়ক / বাসার ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="রোড নম্বর, ব্লক, বাসা..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-[10px] text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={regNid}
                    onChange={(e) => setRegNid(e.target.value)}
                    placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Type (Citizen vs Municipal Officer) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অ্যাকাউন্টের ধরন নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegAccountType('user')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      regAccountType === 'user'
                        ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>সাধারণ নাগরিক</span>
                      {regAccountType === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">সমস্যা রিপোর্ট ও ট্রাভেল এলার্ট</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegAccountType('admin')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      regAccountType === 'admin'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>পৌর / সিটি কর্পোরেশন প্রতিনিধি</span>
                      {regAccountType === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">মাঠপর্যায়ে যাচাই ও সমাধান ব্যবস্থাপনা</div>
                  </button>
                </div>
              </div>

              {/* Avatar Presets Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  নাগরিক প্রোফাইল ছবি নির্বাচন করুন:
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRegAvatar(p.url)}
                      className={`relative rounded-xl p-0.5 transition-all ${
                        regAvatar === p.url
                          ? 'ring-2 ring-teal-500 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-9 h-9 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-0.5 shrink-0"
                  />
                  <span>
                    আমি প্রবলেমগ্রাফ এর <span className="text-teal-700 font-bold">নাগরিক সেবা নীতিমালা</span> ও তথ্য সংরক্ষণ শর্তাবলীতে সম্মতি জানাচ্ছি।
                  </span>
                </label>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>নিবন্ধন সম্পন্ন করুন</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>ইতিমধ্যে একাউন্ট রয়েছে? </span>
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  সাইন ইন করুন
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-600" />
                <span>পাসওয়ার্ড পুনর্নির্ধারণ (Reset Password)</span>
              </h3>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStatus(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ঠিকানা বা মোবাইল নম্বর দিন। আমরা তাৎক্ষণিক পাসওয়ার্ড রিসেট লিংক ও নির্দেশনাবলী পাঠাবো।
            </p>

            {forgotStatus ? (
              <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>অনুরোধ সফল হয়েছে!</span>
                </div>
                <p className="font-normal">{forgotStatus}</p>
                <button
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotStatus(null);
                  }}
                  className="w-full mt-2 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs"
                >
                  লগইন পাতায় ফিরে যান
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল বা ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@problemgraph.bd"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isForgotSubmitting ? 'প্রসেসিং হচ্ছে...' : 'রিসেট নির্দেশিকা পাঠান'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
