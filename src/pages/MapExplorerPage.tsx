import React, { useState, useEffect } from 'react';
import { ProblemReport, Category } from '../types';
import { api } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { ProblemDetailModal } from '../components/ProblemDetailModal';
import {
  Compass,
  Filter,
  Search,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  List,
  Map as MapIcon,
  X
} from 'lucide-react';

export const MapExplorerPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [probRes, catRes] = await Promise.all([
          api.getProblems(),
          api.getCategories()
        ]);
        setProblems(probRes.reports);
        setCategories(catRes.categories);
      } catch (e) {
        console.error('Error loading explorer data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyFilter = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProblems({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined
      });
      setProblems(res.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    api.getProblems().then(res => setProblems(res.reports));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-teal-600" />
              <span>পাবলিক সমস্যা এক্সপ্লোরার ম্যাপ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              বাংলাদেশব্যাপী নাগরিক সমস্যাসমূহের রিয়েল-টাইম অবস্থান ও বিস্তারিত প্রতিবেদন
            </p>
          </div>

          {/* Mobile View Toggle */}
          <div className="flex sm:hidden items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setMobileViewMode('map')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${mobileViewMode === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >
              ম্যাপ ভিউ
            </button>
            <button
              onClick={() => setMobileViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${mobileViewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >
              তালিকা ভিউ
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              placeholder="এলাকা, সড়ক বা বিষয় খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">সব ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name_bn}>{c.name_bn}</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">সব জেলা</option>
              <option value="ঢাকা">ঢাকা</option>
              <option value="চট্টগ্রাম">চট্টগ্রাম</option>
              <option value="সিলেট">সিলেট</option>
              <option value="রাজশাহী">রাজশাহী</option>
              <option value="খুলনা">খুলনা</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">সব গুরুত্ব</option>
              <option value="critical">অত্যন্ত জরুরি</option>
              <option value="high">বেশি গুরুত্ব</option>
              <option value="medium">মাঝারি</option>
              <option value="low">কম গুরুত্ব</option>
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilter}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors"
            >
              ফিল্টার
            </button>
            <button
              onClick={clearFilters}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="ফিল্টার মুছুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Map + Side List View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Container */}
        <div className={`lg:col-span-8 ${mobileViewMode === 'list' ? 'hidden sm:block' : 'block'}`}>
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-2 text-xs text-slate-500">
              <span>প্রদর্শিত হচ্ছে {problems.length} টি সমস্যা</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> জরুরি</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> রাস্তা/যানজট</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> পানি/ড্রেন</span>
              </div>
            </div>
            
            <LeafletMap
              mode="explorer"
              height="580px"
              problems={problems}
              selectedProblem={selectedProblem}
              onSelectProblem={(p) => setSelectedProblem(p)}
            />
          </div>
        </div>

        {/* Side Problem Cards List */}
        <div className={`lg:col-span-4 space-y-3 ${mobileViewMode === 'map' ? 'hidden sm:block' : 'block'}`}>
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900">
              সমস্যার তালিকা ({problems.length})
            </h3>
            <span className="text-xs text-slate-400">ক্লিক করে ম্যাপে দেখুন</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {problems.length > 0 ? (
              problems.map((p) => {
                const isSelected = selectedProblem?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProblem(p)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-400 shadow-md ring-1 ring-teal-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <SeverityBadge severity={p.severity} size="sm" />
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                      {p.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.area}, {p.district}
                      </span>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                কোনো সমস্যা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় খুঁজুন।
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onProblemUpdated={(updated) => {
            setProblems(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProblem(updated);
          }}
        />
      )}

    </div>
  );
};
