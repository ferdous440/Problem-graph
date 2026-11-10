import React, { useState, useEffect } from 'react';
import { ProblemReport } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import {
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Route,
  Activity,
  Layers
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [recentReports, setRecentReports] = useState<ProblemReport[]>([]);
  const [stats, setStats] = useState({ total: 8, pending: 2, verified: 4, resolved: 2 });
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getProblems();
        setRecentReports(res.reports.slice(0, 6));
        const total = res.reports.length;
        const pending = res.reports.filter(r => r.status === 'pending').length;
        const verified = res.reports.filter(r => r.status === 'verified').length;
        const resolved = res.reports.filter(r => r.status === 'resolved').length;
        setStats({ total, pending, verified, resolved });
      } catch (e) {
        console.error('Failed to load home problems:', e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-500/10 via-sky-500/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>এআই-চালিত নাগরিক প্ল্যাটফর্ম ও স্মার্ট ট্রাভেল ইন্টেলিজেন্স</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            আপনার এলাকার নাগরিক সমস্যা জানান, <br />
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              এআই দিয়ে নিরাপদ পথ বেছে নিন
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            প্রবলেমগ্রাফ নাগরিক সচেতনতা এবং কৃত্রিম বুদ্ধিমত্তার মাধ্যমে রাস্তাঘাট, ড্রেনেজ, ট্রাফিক ও জননিরাপত্তার সমস্যাগুলো চিহ্নিত করে। বের হওয়ার আগে জেনে নিন আপনার যাত্রাপথে কোথায় কী ঝুঁকি আছে।
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('route-intel')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>এআই দিয়ে যাত্রাপথ বিশ্লেষণ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('submit')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>সমস্যা রিপোর্ট করুন</span>
            </button>

            <button
              onClick={() => onNavigate('explorer')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>ম্যাপ এক্সপ্লোরার</span>
            </button>
          </div>

          {/* Real-time Civic Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400 mt-1">মোট নাগরিক রিপোর্ট</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.pending}</div>
              <div className="text-xs text-slate-400 mt-1">যাচাইয়ের অপেক্ষায়</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">{stats.verified}</div>
              <div className="text-xs text-slate-400 mt-1">কর্তৃপক্ষ কর্তৃক যাচাইকৃত</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolved}</div>
              <div className="text-xs text-slate-400 mt-1">সফলভাবে সমাধান হয়েছে</div>
            </div>
          </div>

        </div>
      </section>

      {/* Flagship Feature: AI Travel Intelligence Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 border border-teal-500/30 shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                ফ্ল্যাগশিপ ফিচার
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                যেকোনো গন্তব্যে যাওয়ার আগে এআই দিয়ে রুট পরীক্ষা করুন
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                রুট করিডোর এনালাইসিসের মাধ্যমে আপনার নির্বাচিত রাস্তার উভয় পাশে ৫০০ মিটার থেকে ২ কিলোমিটারের মধ্যে বিদ্যমান সড়ক ক্ষতি, যানজট, জলাবদ্ধতা ও নির্মাণকাজের সুনির্দিষ্ট তথ্য জেনে নিন।
              </p>
            </div>
            <button
              onClick={() => onNavigate('route-intel')}
              className="shrink-0 bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3.5 rounded-2xl text-sm shadow-lg flex items-center gap-2 transition-all"
            >
              <span>রুট টেস্ট শুরু করুন</span>
              <ArrowRight className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Problems Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              মাঠপর্যায়ের ডেটাবেজ
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              সাম্প্রতিক নাগরিক সমস্যা রিপোর্টসমূহ
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors self-start sm:self-auto"
          >
            <span>ম্যাপে সবগুলো সমস্যা দেখুন ({stats.total})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReports.map((problem) => (
            <div
              key={problem.id}
              onClick={() => setSelectedProblem(problem)}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
            >
              {/* Image Preview */}
              {problem.images && problem.images[0] && (
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={problem.images[0]}
                    alt={problem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/90 text-slate-800 shadow-xs">
                      {problem.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <SeverityBadge severity={problem.severity} size="sm" />
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono">{problem.tracking_code}</span>
                    <StatusBadge status={problem.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-600 transition-colors line-clamp-2">
                    {problem.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{problem.area}, {problem.district}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                    {problem.upvotes_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              কার্যপদ্ধতি
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              কীভাবে কাজ করে প্রবলেমগ্রাফ?
            </h2>
            <p className="text-sm text-slate-600">
              নাগরিকদের সক্রিয় অংশগ্রহণ এবং এআই প্রযুক্তির মেলবন্ধনে জনদুর্ভোগ লাঘব
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                ১
              </div>
              <h3 className="font-bold text-slate-900 text-lg">সমস্যার তথ্য ও ছবি দিন</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                রাস্তার গর্ত, ড্রেনেজ বা যানজটের ছবি তুলুন এবং ম্যাপে সঠিক জিপিএস লোকেশন নির্বাচন করে সহজে রিপোর্ট সাবমিট করুন।
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
                ২
              </div>
              <h3 className="font-bold text-slate-900 text-lg">এআই প্রাথমিক বিশ্লেষণ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                জেমিনি এআই ইঞ্জিন সাথে সাথে বিবরণ যাচাই করে ক্যাটাগরি, সম্ভাব্য ঝুঁকি এবং অগ্রাধিকারের মাত্রা নির্ধারণ করে।
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                ৩
              </div>
              <h3 className="font-bold text-slate-900 text-lg">যাচাই ও ট্রাভেল এলার্ট</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অ্যাডমিন কর্তৃক যাচাই হওয়ার পর সমস্যাটি পাবলিক ম্যাপ ও যাত্রীদের রুট অ্যানালাইসিস করিডোরে প্রদর্শিত হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onProblemUpdated={(updated) => {
            setRecentReports(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProblem(updated);
          }}
        />
      )}

    </div>
  );
};
