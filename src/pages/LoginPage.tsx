import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, UserCheck, ArrowRight, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('মিরপুর');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isRegisterMode) {
        await register({ full_name: fullName, email, phone, district, area });
      } else {
        await login(email);
      }
      onNavigate('home');
    } catch (err: any) {
      setErrorMsg(err.message || 'লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRole = async (role: 'user' | 'admin' | 'super_admin') => {
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      onNavigate(role === 'user' ? 'user-dashboard' : 'admin-dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-6 h-6 text-teal-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {isRegisterMode ? 'প্রবলেমগ্রাফে নতুন একাউন্ট খুলুন' : 'প্রবলেমগ্রাফে সাইন ইন করুন'}
        </h1>
        <p className="text-xs text-slate-500">
          কমিউনিটি সমস্যা রিপোর্ট এবং এআই ট্রাভেল ইন্টেলিজেন্সে স্বাগতম
        </p>
      </div>

      {/* 1-Click Fast Test Switcher */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 p-5 rounded-3xl text-white shadow-lg space-y-3">
        <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>১-ক্লিকে টেস্ট প্রোফাইলে ঢুকুন:</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickRole('user')}
            disabled={isSubmitting}
            className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between"
          >
            <div>
              <div className="font-bold">সাধারণ নাগরিক (User)</div>
              <div className="text-[10px] text-slate-300">তানভীর আহমেদ • user@problemgraph.bd</div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickRole('admin')}
            disabled={isSubmitting}
            className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between"
          >
            <div>
              <div className="font-bold">দায়িত্বপ্রাপ্ত অ্যাডমিন (Admin)</div>
              <div className="text-[10px] text-slate-300">প্রকৌশলী রফিকুল ইসলাম • admin@problemgraph.bd</div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickRole('super_admin')}
            disabled={isSubmitting}
            className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center justify-between"
          >
            <div>
              <div className="font-bold">সুপার অ্যাডমিন (Super Admin)</div>
              <div className="text-[10px] text-slate-300">কাজী শাহরিয়ার রহমান • superadmin@problemgraph.bd</div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার পুরো নাম লিখুন"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              required
            />
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">এলাকা</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md mt-2"
          >
            {isSubmitting ? 'প্রসেসিং হচ্ছে...' : isRegisterMode ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'লগইন করুন'}
          </button>

        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg(null);
            }}
            className="text-xs text-teal-700 font-semibold hover:underline"
          >
            {isRegisterMode ? 'ইতিমধ্যে একাউন্ট আছে? সাইন ইন করুন' : 'নতুন ব্যবহারকারী? রেজিস্ট্রেশন করুন'}
          </button>
        </div>

      </div>

    </div>
  );
};
