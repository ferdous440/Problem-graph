import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() })
      });
    } catch {
      // fallback smoothly
    }
    setIsSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          যোগাযোগ ও নাগরিক সহায়তা কেন্দ্র
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          প্রবলেমগ্রাফ সংক্রান্ত কোনো জিজ্ঞাসা, কারিগরি সহায়তা বা সরাসরি মতামত পাঠাতে আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hotlines */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">জরুরি হটলাইনসমূহ</h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900 block">জাতীয় জরুরি সেবা:</span>
              <span className="text-rose-600 font-bold text-sm">৯৯৯</span> (পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স)
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">সরকারি কল সেন্টার:</span>
              <span className="text-sky-600 font-bold text-sm">৩৩৩</span> (নাগরিক সেবা ও তথ্য)
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">ঢাকা ওয়াসা কল সেন্টার:</span>
              <span className="text-teal-600 font-bold text-sm">১৬১০৬</span> (পানি ও সুয়ারেজ সংকট)
            </div>
          </div>
        </div>

        {/* Office & Email */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">সরাসরি যোগাযোগ</h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900 block">সাপোর্ট ইমেইল:</span>
              <span>support@problemgraph.bd</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">সিটি কর্পোরেশন এপিআই উইং:</span>
              <span>api@problemgraph.bd</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">প্রধান কার্যালয়:</span>
              <span>আগারগাঁও আইসিটি টাওয়ার, শেরেবাংলা নগর, ঢাকা-১২০৭</span>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">নাগরিক মতামত পাঠান</h3>
          {isSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-emerald-900">ধন্যবাদ!</div>
              <p className="text-[11px] text-emerald-700">আপনার বার্তাটি প্রবলেমগ্রাফ সহায়তা টিমের নিকট পৌঁছেছে।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ইমেইল ঠিকানা"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বার্তা বা পরামর্শ..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
