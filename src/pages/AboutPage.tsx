import React from 'react';
import { Sparkles, ShieldCheck, MapPin, Compass, CheckCircle2, Heart } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>নাগরিক ক্ষমতায়ন ও স্মার্ট সিটি উদ্যোগ</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          প্রবলেমগ্রাফ (ProblemGraph) পরিচিতি
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          অবস্থানভিত্তিক কমিউনিটি সমস্যা চিহ্নিতকরণ এবং কৃত্রিম বুদ্ধিমত্তার মাধ্যমে নিরাপদ ও ঝামেলামুক্ত যাত্রাপথ নিশ্চিত করার এক সমন্বিত ডিজিটাল প্ল্যাটফর্ম।
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <span>আমাদের লক্ষ্য (Our Mission)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            বাংলাদেশের প্রতিটি নাগরিক যাতে তাদের নিজ এলাকার রাস্তাঘাট, ড্রেনেজ, পানি বা ট্রাফিক সংক্রান্ত সমস্যাগুলো সুনির্দিষ্ট জিপিএস লোকেশন ও ফটোগ্রাফিক প্রমাণের মাধ্যমে সরাসরি সংশ্লিষ্ট সিটি কর্পোরেশন ও প্রশাসনের নজরে আনতে পারেন।
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span>এআই যাত্রাপথ উদ্ভাবন</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            গুগল জেমিনি এআই ও ওপেন রাউটিং আর্কিটেকচারের মাধ্যমে যেকোনো ভ্রমণের পূর্বে যাত্রাপথের পুরো করিডোর স্ক্যান করে সক্রিয় সমস্যা, খানাখন্দ ও জলাবদ্ধতার রিয়েল-টাইম বাংলা সতর্কতা প্রদান করা।
          </p>
        </div>
      </div>

      {/* 4 Pillars of ProblemGraph */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
          প্ল্যাটফর্মের মূল ৪টি স্তম্ভ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-teal-600 font-bold text-lg">০১</div>
            <h4 className="font-bold text-slate-900 text-sm">সঠিক অবস্থান ট্র্যাকিং</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              লিফলেট ম্যাপ ও পোস্টজিআইএস স্থানিক বাফারিংয়ের মাধ্যমে নিখুঁত জিপিএস পিনপয়েন্ট নির্ধারণ।
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-sky-600 font-bold text-lg">০২</div>
            <h4 className="font-bold text-slate-900 text-sm">এআই বিশ্লেষণ</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              স্বয়ংক্রিয় ক্যাটাগরি শনাক্তকরণ, তীব্রতা যাচাই এবং সিটি কর্পোরেশনের উপযোগী সমাধান সুপারিশ।
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-indigo-600 font-bold text-lg">০৩</div>
            <h4 className="font-bold text-slate-900 text-sm">কর্তৃপক্ষের দায়বদ্ধতা</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              অ্যাডমিন যাচাই, স্ট্যাটাস ট্র্যাকিং এবং সমাধানের আলোকচিত্রসহ সুনির্দিষ্ট অডিট লগ।
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-rose-600 font-bold text-lg">০৪</div>
            <h4 className="font-bold text-slate-900 text-sm">কমিউনিটি নিরাপত্তা</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ভ্রমণকারী ও পথচারীদের জন্য সতর্কবার্তা, বিকল্প রুট পরিকল্পনা এবং নিরাপদ সড়ক সচেতনতা।
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-6">
        <button
          onClick={() => onNavigate('submit')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all"
        >
          আজই আপনার এলাকার সমস্যা জানান
        </button>
      </div>

    </div>
  );
};
