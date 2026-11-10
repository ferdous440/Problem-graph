import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Category, ProblemReport } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  PlusCircle,
  MapPin,
  Upload,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  Info
} from 'lucide-react';

interface SubmitProblemPageProps {
  onProblemSubmitted: (problem: ProblemReport) => void;
  onNavigate: (page: string) => void;
}

export const SubmitProblemPage: React.FC<SubmitProblemPageProps> = ({
  onProblemSubmitted,
  onNavigate
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('রাস্তার ক্ষতি');
  const [subcategory, setSubcategory] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('মিরপুর ১০');
  const [address, setAddress] = useState('মিরপুর ১০ নম্বর গোলচত্বর সংলগ্ন মূল সড়ক');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 23.8071, lng: 90.3685 });
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  ]);

  // AI Classification Preview State
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<ProblemReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setCategoryId(res.categories[0].id);
          setSelectedCategory(res.categories[0].name_bn);
          if (res.categories[0].subcategories && res.categories[0].subcategories.length > 0) {
            setSubcategory(res.categories[0].subcategories[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCats();
  }, []);

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.name_bn === catName);
    setSelectedCategory(catName);
    if (cat) {
      setCategoryId(cat.id);
      if (cat.subcategories && cat.subcategories.length > 0) {
        setSubcategory(cat.subcategories[0]);
      } else {
        setSubcategory('');
      }
    }
  };

  // Trigger AI preview classification on blur or button click
  const handleTriggerAiPreview = async () => {
    if (!title.trim()) return;
    setIsAiClassifying(true);
    try {
      const res = await api.classifyPreview(title, description, selectedCategory, severity);
      setAiPreview(res.classification);
      if (res.classification.suggestedCategory) {
        handleCategoryChange(res.classification.suggestedCategory);
      }
      if (res.classification.suggestedSeverity) {
        setSeverity(res.classification.suggestedSeverity);
      }
    } catch (e) {
      console.warn('AI preview failed:', e);
    } finally {
      setIsAiClassifying(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImages([reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('সমস্যা জমা দিতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }
    if (!title.trim() || !description.trim() || !district.trim() || !area.trim()) {
      setErrorMsg('অনুগ্রহ করে শিরোনাম, বিবরণ, জেলা ও এলাকা সঠিকভাবে পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitProblem({
        title,
        description,
        category_id: categoryId,
        category: selectedCategory,
        subcategory,
        severity,
        district,
        area,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        images
      });

      setSubmitSuccess(res.report);
      onProblemSubmitted(res.report);
    } catch (err: any) {
      setErrorMsg(err.message || 'সমস্যা জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Photo options for quick simulation
  const samplePhotos = [
    { label: 'ভাঙা রাস্তা', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { label: 'যানজট', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
    { label: 'জলাবদ্ধতা', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80' },
    { label: 'আবর্জনা স্তূপ', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80' },
  ];

  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            সমস্যা সফলভাবে জমা হয়েছে!
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            আপনার রিপোর্টটি সিস্টেমে যুক্ত হয়েছে। জেমিনি এআই স্বয়ংক্রিয়ভাবে শ্রেণিবিভাগ সম্পন্ন করেছে এবং প্রাথমিক অবস্থা 'অপেক্ষমাণ' (Pending) হিসেবে নির্ধারিত হয়েছে।
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">ট্র্যাকিং কোড</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {submitSuccess.tracking_code}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">ক্যাটাগরি</span>
            <span className="font-semibold text-teal-700">{submitSuccess.category}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">বর্তমান অবস্থা</span>
            <StatusBadge status={submitSuccess.status} size="sm" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">গুরুত্ব</span>
            <SeverityBadge severity={submitSuccess.severity} size="sm" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('explorer')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            ম্যাপে সমস্যাটি দেখুন
          </button>
          <button
            onClick={() => {
              setSubmitSuccess(null);
              setTitle('');
              setDescription('');
            }}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-all"
          >
            আরেকটি সমস্যা রিপোর্ট করুন
          </button>
        </div>
      </div>
    );
  }

  const currentCatObj = categories.find(c => c.name_bn === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-teal-600" />
          <span>নতুন নাগরিক সমস্যা রিপোর্ট করুন</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          আপনার এলাকার যেকোনো সড়ক ক্ষতি, যানজট, ড্রেনেজ বা নিরাপত্তা সমস্যা কর্তৃপক্ষ ও নাগরিকদের নজরে আনুন
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        
        {/* Section 1: Basic Problem Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span>১. সমস্যার বিবরণ ও প্রাথমিক তথ্য</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              সমস্যার শিরোনাম *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTriggerAiPreview}
              placeholder="যেমন: মিরপুর ১০ গোলচত্বরে গভীর গর্ত ও পিচ উঠে যাওয়া"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              বিস্তারিত বিবরণ *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleTriggerAiPreview}
              placeholder="সমস্যাটির বর্তমান অবস্থা, কতদিন ধরে চলছে, এবং চলাচলে কী অসুবিধা হচ্ছে বিস্তারিত লিখুন..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* AI Live Assistant Preview Trigger */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTriggerAiPreview}
              disabled={isAiClassifying || !title.trim()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-50 border border-indigo-100 transition-colors disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAiClassifying ? 'এআই মূল্যায়ন চলছে...' : 'এআই স্বয়ংক্রিয় শ্রেণিবিভাগ চালু করুন'}</span>
            </button>

            {aiPreview && (
              <span className="text-[11px] text-teal-700 font-medium">
                ✓ এআই রেকমেন্ডেশন: {aiPreview.suggestedCategory} • {aiPreview.suggestedSeverity}
              </span>
            )}
          </div>

          {/* Categories & Subcategories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সমস্যার ক্যাটাগরি *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name_bn}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                উপ-ক্যাটাগরি
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {currentCatObj?.subcategories?.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                )) || <option value="">প্রযোজ্য নয়</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সমস্যার গুরুত্ব (Severity) *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">কম গুরুত্ব (Low)</option>
                <option value="medium">মাঝারি (Medium)</option>
                <option value="high">বেশি গুরুত্ব (High)</option>
                <option value="critical">অত্যন্ত জরুরি (Critical)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location on Leaflet Map */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span>২. ভৌগোলিক অবস্থান ও মানচিত্র নির্বাচন</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                জেলা *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ঢাকা">ঢাকা</option>
                <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                <option value="সিলেট">সিলেট</option>
                <option value="রাজশাহী">রাজশাহী</option>
                <option value="খুলনা">খুলনা</option>
                <option value="বরিশাল">বরিশাল</option>
                <option value="রংপুর">রংপুর</option>
                <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                <option value="গাজীপুর">গাজীপুর</option>
                <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                এলাকা / পাড়ার নাম *
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="যেমন: মিরপুর ১০, উত্তরা ৪ নম্বর সেক্টর, ধানমন্ডি ২৭"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              বিস্তারিত সড়ক ঠিকানা বা ল্যান্ডমার্ক
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="যেমন: আনন্দ সিনেমা হল সংলগ্ন ফুটওভার ব্রিজ, কাজী নজরুল ইসলাম এভিনিউ"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Interactive Leaflet Picker Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                ম্যাপে ক্লিক করে সঠিক অবস্থান সেট করুন:
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>

            <LeafletMap
              mode="picker"
              height="320px"
              initialCoords={coords}
              onLocationPicked={(c) => setCoords(c)}
            />
          </div>
        </div>

        {/* Section 3: Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span>৩. সমস্যার আলোকচিত্র (ছবি)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Upload Input */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs text-slate-700 font-semibold mb-1">
                ছবি নির্বাচন করুন বা টেনে এনে ছাড়ুন
              </div>
              <div className="text-[10px] text-slate-400 mb-3">PNG, JPG, WEBP (সর্বোচ্চ ১০MB)</div>
              <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-block">
                <span>ফাইল ব্রাউজ করুন</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Preview & Sample Selectors */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">বর্তমান ছবি:</span>
              <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={images[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 self-center">টেস্ট ফটো:</span>
                {samplePhotos.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImages([sp.url])}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            * রিপোর্টটি জমা দেওয়ার সাথে সাথে এআই দ্বারা মূল্যায়িত হবে।
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>প্রসেসিং ও এআই অ্যানালাইসিস...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>সমস্যা জমা দিন</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
