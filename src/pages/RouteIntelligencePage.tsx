import React, { useState } from 'react';
import { api } from '../services/api';
import { RouteAnalysisData, ProblemReport } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import {
  Sparkles,
  MapPin,
  Navigation,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  Hammer,
  CloudRain,
  HardHat,
  ShieldAlert,
  Info,
  ChevronRight,
  ExternalLink,
  Share2,
  Printer,
  Compass
} from 'lucide-react';

export const RouteIntelligencePage: React.FC = () => {
  const [origin, setOrigin] = useState<string>('মিরপুর ১০');
  const [destination, setDestination] = useState<string>('মতিঝিল');
  const [travelTime, setTravelTime] = useState<string>('');
  const [corridorBuffer, setCorridorBuffer] = useState<number>(800);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<RouteAnalysisData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);

  // Quick preset corridor routes in Dhaka & Chittagong
  const presetRoutes = [
    { from: 'মিরপুর ১০', to: 'মতিঝিল', label: 'মিরপুর ১০ ➔ মতিঝিল' },
    { from: 'ধানমন্ডি ২৭', to: 'উত্তরা', label: 'ধানমন্ডি ➔ উত্তরা' },
    { from: 'ফার্মগেট', to: 'বিমানবন্দর', label: 'ফার্মগেট ➔ বিমানবন্দর' },
    { from: 'চট্টগ্রাম আগ্রাবাদ', to: 'জিইসি মোড়', label: 'আগ্রাবাদ ➔ জিইসি (চট্টগ্রাম)' }
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setErrorMessage('অনুগ্রহ করে যাত্রা শুরুর স্থান ও গন্তব্য উভয়ই প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await api.analyzeRoute(origin.trim(), destination.trim(), corridorBuffer);
      setAnalysisData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'যাত্রাপথ বিশ্লেষণ প্রক্রিয়াকরণে ত্রুটি হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>জেমিনি এআই চালিত স্মার্ট লোকেশন ইন্টেলিজেন্স</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            AI যাত্রাপথ বিশ্লেষণ ও সমস্যা করিডোর অনুসন্ধান
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            আপনার যাত্রাপথ নির্ধারণ করুন। আমাদের এআই ইঞ্জিন সমগ্র করিডোরের উভয় পাশে সক্রিয় নাগরিক সমস্যা, খানাখন্দ, যানজট ও জলাবদ্ধতার রিপোর্ট স্ক্যান করে বিস্তারিত বাংলা ট্রাভেল অ্যাডভাইজরি প্রস্তুত করবে।
          </p>
        </div>
      </div>

      {/* Query Form & Buffer Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Preset Quick Selectors */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            জনপ্রিয় যাত্রাপথ থেকে বেছে নিন:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetRoutes.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPreset(p.from, p.to)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                  origin === p.from && destination === p.to
                    ? 'bg-teal-50 text-teal-800 border-teal-400 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                📍 {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              যাত্রা শুরুর স্থান (Starting Point) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="যেমন: মিরপুর ১০, উত্তরা, ধানমন্ডি"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              গন্তব্য (Destination) *
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-rose-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="যেমন: মতিঝিল, শাহবাগ, বিমানবন্দর"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              করিডোর ব্যাসার্ধ (বাফার)
            </label>
            <select
              value={corridorBuffer}
              onChange={(e) => setCorridorBuffer(parseInt(e.target.value, 10))}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={500}>৫০০ মিটার (সরাসরি সড়ক)</option>
              <option value={800}>৮০০ মিটার (প্রস্তাবিত)</option>
              <option value={1200}>১.২ কি.মি. (সংলগ্ন গলি সহ)</option>
              <option value={2000}>২ কি.মি. (বিস্তৃত করিডোর)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>বিশ্লেষণ চলছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>বিশ্লেষণ করুন</span>
                </>
              )}
            </button>
          </div>

        </form>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {analysisData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Quick Route Highlights Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">মোট আনুমানিক দূরত্ব</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {analysisData.route.distanceKm} কি.মি.
              </div>
              <span className="text-[10px] text-teal-600">গড় সময়: ~{analysisData.route.durationMinutes} মিনিট</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">করিডোরে প্রাপ্ত সমস্যা</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {analysisData.corridorReports.length} টি
              </div>
              <span className="text-[10px] text-slate-500">বাফার: {analysisData.corridorBufferMeters} মিটার</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">অতি-জরুরি সমস্যা</span>
              <div className="text-xl font-black text-rose-600 mt-1">
                {analysisData.evidenceSummary.criticalCount} টি
              </div>
              <span className="text-[10px] text-rose-500 font-medium">বিশেষ সতর্কতা আবশ্যক</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">যাচাইকৃত রিপোর্ট</span>
              <div className="text-xl font-black text-sky-600 mt-1">
                {analysisData.evidenceSummary.verifiedCount} টি
              </div>
              <span className="text-[10px] text-slate-500">মাঠপর্যায়ে নিশ্চিত তথ্য</span>
            </div>
          </div>

          {/* Map + Problem Markers on Corridor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                <span>ইন্টারেক্টিভ রুট করিডোর ও সমস্যা চিহ্নিতকরণ ম্যাপ</span>
              </h3>
              <span className="text-xs text-slate-500">
                সবুজ মার্কার (শুরু) ➔ লাল মার্কার (গন্তব্য)
              </span>
            </div>

            <LeafletMap
              mode="route"
              height="480px"
              problems={analysisData.corridorReports}
              routePolyline={analysisData.route.polyline}
              originCoords={analysisData.route.originCoords}
              destCoords={analysisData.route.destinationCoords}
              originName={analysisData.route.origin}
              destName={analysisData.route.destination}
              corridorBufferMeters={analysisData.corridorBufferMeters}
              onSelectProblem={(p) => setSelectedProblem(p)}
            />
          </div>

          {/* Complete 9-Point Gemini AI Intelligence Report */}
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-teal-50/30 rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-sm space-y-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    এআই যাত্রাপথ মূল্যায়ন ও ঝুঁকি বিশ্লেষণ প্রতিবেদন
                  </h3>
                  <p className="text-xs text-slate-500">
                    মডেল: Gemini 3.8 Flash • প্রবলেমগ্রাফ কমিউনিটি ভেরিফাইড এভিডেন্স
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Route Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                ১. যাত্রাপথের সার্বিক সারসংক্ষেপ
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed">
                {analysisData.aiAnalysis.routeSummary}
              </p>
            </div>

            {/* 2. Vulnerable Areas */}
            {analysisData.aiAnalysis.vulnerableAreas && analysisData.aiAnalysis.vulnerableAreas.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  ২. সম্ভাব্য সমস্যাপ্রবণ এলাকা ও স্পট
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysisData.aiAnalysis.vulnerableAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl"
                    >
                      📍 {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3, 4, 5, 6 Category Breakdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 3. Traffic */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                  <Car className="w-4 h-4" />
                  <span>৩. যানজট পরিস্থিতি ও ট্রাফিক স্থবিরতা</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisData.aiAnalysis.trafficIssues}
                </p>
              </div>

              {/* 4. Road Damage */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-orange-700 text-xs font-bold uppercase tracking-wider">
                  <Hammer className="w-4 h-4" />
                  <span>৪. রাস্তার খানাখন্দ ও কার্পেটিং ক্ষতি</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisData.aiAnalysis.roadDamageIssues}
                </p>
              </div>

              {/* 5. Waterlogging */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
                  <CloudRain className="w-4 h-4" />
                  <span>৫. জলাবদ্ধতা ও ড্রেনেজ নিষ্কাশন</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisData.aiAnalysis.waterloggingIssues}
                </p>
              </div>

              {/* 6. Construction */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <HardHat className="w-4 h-4" />
                  <span>৬. চলমান নির্মাণকাজ ও রাস্তা খোঁড়াখুঁড়ি</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisData.aiAnalysis.constructionIssues}
                </p>
              </div>

            </div>

            {/* 7 & 8 Criticality & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-rose-100 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>৭. কোন সমস্যাগুলো বেশি গুরুতর?</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {analysisData.aiAnalysis.criticalIssues}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>৮. সমস্যাগুলোর সর্বশেষ রিপোর্টের তারিখ</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisData.aiAnalysis.latestReportDates}
                </p>
              </div>
            </div>

            {/* 9. Traveler Advisories */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ৯. ব্যবহারকারী ও পথচারীদের জন্য সতর্কতা ও পরামর্শ
              </h4>
              <ul className="space-y-2">
                {analysisData.aiAnalysis.travelerAdvisories?.map((adv, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Coverage Note */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">ডেটা কভারেজ সংক্রান্ত স্বচ্ছতা নোট: </span>
                <span>{analysisData.aiAnalysis.dataCoverageNote}</span>
              </div>
            </div>

          </div>

          {/* Corridor Problem Evidence Reports List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                করিডোরে প্রাপ্ত সহায়ক রিপোর্টসমূহ ({analysisData.corridorReports.length})
              </h3>
              <span className="text-xs text-slate-500">
                রুট থেকে দূরত্বের ক্রমানুসারে সাজানো
              </span>
            </div>

            {analysisData.corridorReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisData.corridorReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedProblem(report)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {report.category}
                        </span>
                        <SeverityBadge severity={report.severity} size="sm" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                        {report.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {report.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>📍 {report.area}</span>
                      <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        দূরত্ব: {report.distanceFromRouteMeters} মি.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                এই করিডোরে কোনো সক্রিয় সমস্যা তালিকাভুক্ত নেই।
              </div>
            )}
          </div>

        </div>
      )}

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onProblemUpdated={(updated) => {
            if (analysisData) {
              setAnalysisData({
                ...analysisData,
                corridorReports: analysisData.corridorReports.map(p => p.id === updated.id ? updated : p)
              });
            }
            setSelectedProblem(updated);
          }}
        />
      )}

    </div>
  );
};
