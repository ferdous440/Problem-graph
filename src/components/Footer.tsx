import React from 'react';
import { Phone, Shield, Sparkles, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hotlines Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-teal-950 to-slate-800 border border-teal-900/40 rounded-3xl p-6 mb-12 shadow-inner">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                জরুরি নাগরিক সহায়তা
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                নাগরিক সেবা ও জরুরি হটলাইনসমূহ
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700">
                <Phone className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-[10px] text-slate-400">জাতীয় জরুরি সেবা</div>
                  <div className="text-sm font-bold text-white">৯৯৯</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700">
                <Phone className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-400">সরকারি তথ্য ও সেবা</div>
                  <div className="text-sm font-bold text-white">৩৩৩</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700">
                <Phone className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] text-slate-400">ওয়াসা অভিযোগ সেবা</div>
                  <div className="text-sm font-bold text-white">১৬১০৬</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">প্রবলেমগ্রাফ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              নাগরিক সচেতনতা ও কৃত্রিম বুদ্ধিমত্তার সমন্বয়ে অবস্থানভিত্তিক গণসমস্যা চিহ্নিতকরণ এবং নিরাপদ যাত্রাপথ বিশ্লেষণ প্ল্যাটফর্ম।
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">প্রধান ফিচারসমূহ</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('route-intel')} className="hover:text-teal-400 transition-colors">
                  AI যাত্রাপথ বিশ্লেষণ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explorer')} className="hover:text-teal-400 transition-colors">
                  পাবলিক সমস্যা এক্সপ্লোরার
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('submit')} className="hover:text-teal-400 transition-colors">
                  সমস্যা রিপোর্ট করুন
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-teal-400 transition-colors">
                  অ্যাডমিন ইনসাইটস ও সুপারিশ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">নীতিমালা ও স্বচ্ছতা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors">
                  আমাদের লক্ষ্য ও প্রযুক্তি
                </button>
              </li>
              <li>
                <span className="text-slate-500">গোপনীয়তা ও ডেটা নিরাপত্তা নীতি</span>
              </li>
              <li>
                <span className="text-slate-500">এআই এভিডেন্স গাইডলাইন</span>
              </li>
              <li>
                <span className="text-slate-500">সিটি কর্পোরেশন এপিআই পার্টনারশিপ</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">কমিউনিটি যোগাযোগ</h4>
            <p className="text-xs text-slate-400 mb-2">
              ঢাকা ও চট্টগ্রামের সব সচেতন নাগরিকদের একত্রিত করে একটি বাসযোগ্য ও নিরাপদ পরিবেশ গড়ার প্রত্যয়।
            </p>
            <div className="text-xs text-teal-400 font-semibold">
              ইমেইল: support@problemgraph.bd
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} প্রবলেমগ্রাফ (ProblemGraph)। সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>নাগরিকদের ভালোবাসায় নির্মিত</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>বাংলাদেশ</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
