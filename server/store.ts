import fs from 'fs';
import path from 'path';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  district: string;
  area: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  icon: string;
  color: string;
  description_bn: string;
  subcategories: string[];
  is_active: boolean;
}

export interface ProblemReport {
  id: string;
  tracking_code: string;
  user_id: string;
  user_name: string;
  user_phone?: string;
  category_id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected';
  district: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  resolved_at?: string;
  upvotes_count: number;
  comments_count: number;
  views_count: number;
  is_public: boolean;
  images: string[];
  resolution_notes?: string;
  resolution_evidence_url?: string;
  ai_analysis?: {
    suggestedCategory?: string;
    suggestedSeverity?: string;
    summaryBn?: string;
    keywords?: string[];
    urgencyScore?: number;
    potentialHazards?: string[];
  };
  supported_by?: string[]; // user IDs
  comments?: Array<{
    id: string;
    user_id: string;
    user_name: string;
    comment_text: string;
    created_at: string;
  }>;
  status_history?: Array<{
    old_status: string;
    new_status: string;
    changed_by_name: string;
    reason?: string;
    created_at: string;
  }>;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  problem_id: string;
  title_bn: string;
  message_bn: string;
  is_read: boolean;
  created_at: string;
}

const DATA_FILE = path.resolve(process.cwd(), 'database', 'app_data.json');

// Initial seed categories
const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'road-damage',
    name_bn: 'রাস্তার ক্ষতি',
    name_en: 'Road Damage',
    icon: 'Hammer',
    color: '#f97316',
    description_bn: 'রাস্তার খানাখন্দ, পিচ ঢালাই ভেঙে যাওয়া ও কার্পেটিং নষ্ট',
    subcategories: ['বড় গর্ত/খানাখন্দ', 'ম্যানহোল ভেঙে যাওয়া', 'ফুটপাত ভাঙা', 'ডিভাইডার ক্ষতি'],
    is_active: true
  },
  {
    id: 'cat-2',
    slug: 'traffic-jam',
    name_bn: 'যানজট',
    name_en: 'Traffic Jam',
    icon: 'Car',
    color: '#ef4444',
    description_bn: 'স্থবির ট্রাফিক, সিগন্যাল বিকল এবং অবৈধ পার্কিং সংক্রান্ত জ্যাম',
    subcategories: ['সিগন্যাল অকার্যকর', 'অবৈধ বাস স্ট্যান্ড', 'দীর্ঘস্থায়ী ট্রাফিক জ্যাম', 'অবৈধ পার্কিং'],
    is_active: true
  },
  {
    id: 'cat-3',
    slug: 'waterlogging',
    name_bn: 'জলাবদ্ধতা',
    name_en: 'Waterlogging',
    icon: 'CloudRain',
    color: '#0284c7',
    description_bn: 'বৃষ্টির পর রাস্তায় দীর্ঘস্থায়ী পানি জমে থাকা ও চলাচলে স্থবিরতা',
    subcategories: ['রাস্তায় কোমর সমান পানি', 'ফুটপাত নিমজ্জিত', 'আবাসিক এলাকায় পানি প্রবেশ'],
    is_active: true
  },
  {
    id: 'cat-4',
    slug: 'waste-management',
    name_bn: 'বর্জ্য ব্যবস্থাপনা',
    name_en: 'Waste Management',
    icon: 'Trash2',
    color: '#84cc16',
    description_bn: 'খোলা রাস্তায় ময়লার স্তূপ, ডাস্টবিন উপচে পড়া ও তীব্র দুর্গন্ধ',
    subcategories: ['খোলা রাস্তায় আবর্জনা', 'ডাস্টবিন অপসারিত নয়', 'মেডিকেল বর্জ্য'],
    is_active: true
  },
  {
    id: 'cat-5',
    slug: 'drainage',
    name_bn: 'ড্রেনেজ সমস্যা',
    name_en: 'Drainage Issue',
    icon: 'Waves',
    color: '#6366f1',
    description_bn: 'ড্রেন উপচে পড়া, ঢাকনাহীন খোলা ড্রেন ও পলিথিন জমে ব্লক',
    subcategories: ['খোলা ম্যানহোল/ড্রেন', 'ড্রেন উপচে রাস্তায় ময়লা পানি', 'ড্রেন সংস্কার বন্ধ'],
    is_active: true
  },
  {
    id: 'cat-6',
    slug: 'water-supply',
    name_bn: 'পানি সমস্যা',
    name_en: 'Water Supply Issue',
    icon: 'Droplet',
    color: '#06b6d4',
    description_bn: 'ওয়াসার পাইপলাইন ফেটে যাওয়া, পানির তীব্র সংকট বা ময়লা পানি সরবরাহ',
    subcategories: ['পাইপ ফেটে পানি অপচয়', 'পানির অভাব', 'দূষিত দুর্গন্ধযুক্ত পানি'],
    is_active: true
  },
  {
    id: 'cat-7',
    slug: 'electricity',
    name_bn: 'বিদ্যুৎ সমস্যা',
    name_en: 'Electricity Issue',
    icon: 'Zap',
    color: '#eab308',
    description_bn: 'বিপজ্জনক খোলা তার, ট্রান্সফরমার বিস্ফোরণ ও ঘনঘন লোডশেডিং',
    subcategories: ['ঝুলন্ত বিপজ্জনক তার', 'ট্রান্সফরমার বিকল', 'অকার্যকর স্ট্রিট লাইট'],
    is_active: true
  },
  {
    id: 'cat-8',
    slug: 'gas-supply',
    name_bn: 'গ্যাস সমস্যা',
    name_en: 'Gas Supply Issue',
    icon: 'Flame',
    color: '#a855f7',
    description_bn: 'গ্যাসের পাইপলাইন লিকেজ ও রান্নার গ্যাসের তীব্র সংকট',
    subcategories: ['পাইপলাইন লিকেজ', 'নিম্নচাপ', 'সম্পূর্ণ গ্যাস সংযোগ বিচ্ছিন্ন'],
    is_active: true
  },
  {
    id: 'cat-9',
    slug: 'construction',
    name_bn: 'নির্মাণকাজ',
    name_en: 'Construction Obstacle',
    icon: 'HardHat',
    color: '#f59e0b',
    description_bn: 'রাস্তায় ফেলে রাখা নির্মাণ সামগ্রী ও অনির্দিষ্টকালের খোঁড়াখুঁড়ি',
    subcategories: ['রাস্তায় রড-সিমেন্ট-বালু', 'অনিরাপদ খোঁড়াখুঁড়ি', 'ব্যারিকেডবিহীন গর্ত'],
    is_active: true
  },
  {
    id: 'cat-10',
    slug: 'public-transport',
    name_bn: 'গণপরিবহন সমস্যা',
    name_en: 'Public Transport Issue',
    icon: 'Bus',
    color: '#3b82f6',
    description_bn: 'অতিরিক্ত ভাড়া আদায়, ফিটনেসবিহীন বাস ও যাত্রী হয়রানি',
    subcategories: ['অতিরিক্ত ভাড়া', 'ফিটনেসবিহীন গাড়ি', 'যাত্রী তোলার প্রতিযোগিতা'],
    is_active: true
  },
  {
    id: 'cat-11',
    slug: 'pollution',
    name_bn: 'পরিবেশ দূষণ',
    name_en: 'Environmental Pollution',
    icon: 'Wind',
    color: '#10b981',
    description_bn: 'ধোঁয়াশা, তীব্র শব্দদূষণ ও অবৈধ ইটভাটা',
    subcategories: ['কালো ধোঁয়া', 'অননুমোদিত হর্ন/শব্দদূষণ', 'রাসায়নিক বর্জ্য নিক্ষেপ'],
    is_active: true
  },
  {
    id: 'cat-12',
    slug: 'security',
    name_bn: 'নিরাপত্তা সংক্রান্ত সমস্যা',
    name_en: 'Security Issue',
    icon: 'ShieldAlert',
    color: '#ec4899',
    description_bn: 'ছিনতাইপ্রবণ অন্ধকার এলাকা, বখাটেদের উপদ্রব ও ক্লোজ সার্কিট ক্যামেরার অভাব',
    subcategories: ['অন্ধকার অনিরাপদ গলি', 'ছিনতাইপ্রবণ এলাকা', 'মাদকের আড্ডা'],
    is_active: true
  },
  {
    id: 'cat-13',
    slug: 'others',
    name_bn: 'অন্যান্য',
    name_en: 'Others',
    icon: 'AlertCircle',
    color: '#64748b',
    description_bn: 'অন্যান্য জরুরি জনদুর্ভোগ বা নাগরিক অসঙ্গতি',
    subcategories: ['গাছ ভেঙে পড়া', 'ঘূর্ণায়মান সাইনবোর্ড ঝুঁকি'],
    is_active: true
  }
];

// Initial seed profiles
const SEED_PROFILES: UserProfile[] = [
  {
    id: 'user-superadmin',
    email: 'superadmin@problemgraph.bd',
    full_name: 'কাজী শাহরিয়ার রহমান (সুপার অ্যাডমিন)',
    phone: '01711000001',
    role: 'super_admin',
    district: 'ঢাকা',
    area: 'উত্তরা',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-admin',
    email: 'admin@problemgraph.bd',
    full_name: 'প্রকৌশলী রফিকুল ইসলাম (ডিএনসিসি)',
    phone: '01811000002',
    role: 'admin',
    district: 'ঢাকা',
    area: 'মিরপুর',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
    created_at: '2025-01-05T00:00:00Z'
  },
  {
    id: 'user-general',
    email: 'user@problemgraph.bd',
    full_name: 'তানভীর আহমেদ',
    phone: '01911000003',
    role: 'user',
    district: 'ঢাকা',
    area: 'ধানমন্ডি',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
    created_at: '2025-01-10T00:00:00Z'
  }
];

// Initial seed problem reports in Dhaka and Chittagong with real GPS coords
const SEED_REPORTS: ProblemReport[] = [
  {
    id: 'prob-1',
    tracking_code: 'PG-2025-0101',
    user_id: 'user-general',
    user_name: 'তানভীর আহমেদ',
    user_phone: '01911000003',
    category_id: 'cat-1',
    category: 'রাস্তার ক্ষতি',
    subcategory: 'বড় গর্ত/খানাখন্দ',
    title: 'মিরপুর ১০ গোলচত্বরে গভীর গর্ত ও পিচ উঠে গিয়ে যান চলাচলে মারাত্মক বিঘ্ন',
    description: 'মিরপুর ১০ মেট্রো স্টেশনের ৩ নম্বর পিলারের নিচে মূল সড়কে বেশ কয়েকটি বিশাল গর্ত তৈরি হয়েছে। রিকশা ও মোটরসাইকেল উল্টে নিয়মিত দুর্ঘটনা ঘটছে। বৃষ্টি হলে পানি জমে গর্ত দেখা যায় না। জরুরি মেরামতের অনুরোধ।',
    severity: 'critical',
    status: 'verified',
    district: 'ঢাকা',
    area: 'মিরপুর ১০',
    address: 'মিরপুর ১০ নম্বর গোলচত্বর, মেট্রো পিলার নম্বর ৩ এর সংলগ্ন মূল সড়ক, ঢাকা-১২১৬',
    latitude: 23.8071,
    longitude: 90.3685,
    reported_at: '2025-02-10T09:30:00Z',
    upvotes_count: 42,
    comments_count: 5,
    views_count: 280,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general', 'user-admin'],
    comments: [
      {
        id: 'c-1',
        user_id: 'user-admin',
        user_name: 'প্রকৌশলী রফিকুল ইসলাম (ডিএনসিসি)',
        comment_text: 'রিপোর্টটি প্রকৌশল টিম পরিদর্শন করেছে। চলতি সপ্তাহের মধ্যে প্যাচওয়ার্ক মেরামতের শিডিউল দেওয়া হয়েছে।',
        created_at: '2025-02-10T14:15:00Z'
      }
    ],
    status_history: [
      {
        old_status: 'pending',
        new_status: 'verified',
        changed_by_name: 'প্রকৌশলী রফিকুল ইসলাম (ডিএনসিসি)',
        reason: 'মাঠপর্যায়ের ফটোগ্রাফ ও অবস্থান পর্যবেক্ষণ করে সত্যতা নিশ্চিত করা হয়েছে।',
        created_at: '2025-02-10T11:00:00Z'
      }
    ],
    ai_analysis: {
      suggestedCategory: 'রাস্তার ক্ষতি',
      suggestedSeverity: 'critical',
      summaryBn: 'মিরপুর ১০ মেট্রোরেল স্টেশনের নিকটস্থ প্রধান সড়কে তীব্র খানাখন্দ। সড়ক দুর্ঘটনার আশঙ্কায় জরুরি ব্যবস্থা প্রয়োজন।',
      keywords: ['মিরপুর ১০', 'মেট্রোরেল', 'সড়ক দুর্ঘটনা', 'খানাখন্দ'],
      urgencyScore: 9.2,
      potentialHazards: ['মোটরসাইকেল উল্টে যাওয়া', 'যানবাহন বিকল', 'তীব্র যানজট']
    }
  },
  {
    id: 'prob-2',
    tracking_code: 'PG-2025-0102',
    user_id: 'user-general',
    user_name: 'ফারহানা ইয়াসমিন',
    category_id: 'cat-2',
    category: 'যানজট',
    subcategory: 'অবৈধ বাস স্ট্যান্ড',
    title: 'ফার্মগেট আনন্দ সিনেমা হলের মোড়ে অবৈধ বাস থামিয়ে রাখার কারণে তীব্র জ্যাম',
    description: 'ফার্মগেট থেকে শাহবাগগামী লেনে ৩টি লেনের মধ্যে ২টি লেন দখল করে সারাদিন লোকাল বাস দাঁড়িয়ে থাকে। ট্রাফিক পুলিশের নিয়মিত নজরদারি না থাকায় সকাল ও বিকেলে অসহনীয় জ্যাম সৃষ্টি হচ্ছে।',
    severity: 'high',
    status: 'in_progress',
    district: 'ঢাকা',
    area: 'ফার্মগেট',
    address: 'আনন্দ সিনেমা হল সংলগ্ন ফুটওভার ব্রিজ, কাজী নজরুল ইসলাম এভিনিউ, ফার্মগেট, ঢাকা',
    latitude: 23.7570,
    longitude: 90.3905,
    reported_at: '2025-02-11T08:15:00Z',
    upvotes_count: 36,
    comments_count: 3,
    views_count: 215,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general'],
    comments: [
      {
        id: 'c-2',
        user_id: 'user-superadmin',
        user_name: 'কাজী শাহরিয়ার রহমান (সুপার অ্যাডমিন)',
        comment_text: 'ডিএমপি ট্রাফিক তেজগাঁও বিভাগকে বিষয়টি জরুরি ব্যবস্থা গ্রহণের জন্য অফিসিয়ালি অবহিত করা হয়েছে।',
        created_at: '2025-02-11T12:00:00Z'
      }
    ],
    ai_analysis: {
      suggestedCategory: 'যানজট',
      suggestedSeverity: 'high',
      summaryBn: 'ফার্মগেটে অবৈধ বাস পার্কিংয়ের ফলে কাজী নজরুল ইসলাম এভিনিউতে তীব্র ট্রাফিক স্থবিরতা।',
      keywords: ['ফার্মগেট', 'বাস পার্কিং', 'কাজী নজরুল ইসলাম এভিনিউ', 'যানজট'],
      urgencyScore: 8.0,
      potentialHazards: ['অফিসযাত্রীদের বিলম্ব', 'জরুরি অ্যাম্বুলেন্স আটকে থাকা']
    }
  },
  {
    id: 'prob-3',
    tracking_code: 'PG-2025-0103',
    user_id: 'user-general',
    user_name: 'আসিফ ইকবাল',
    category_id: 'cat-3',
    category: 'জলাবদ্ধতা',
    subcategory: 'রাস্তায় কোমর সমান পানি',
    title: 'ধানমন্ডি ২৭ নম্বর রাপা প্লাজার সামনে ড্রেন উপচে দীর্ঘস্থায়ী জলাবদ্ধতা',
    description: 'হালকা বৃষ্টিতেই ধানমন্ডি ২৭ প্রধান সড়ক ও মিরপুর রোডের সংযোগস্থলে পানি জমে যায়। ড্রেনের মুখে পলিথিন ও বর্জ্য আটকে থাকায় ঘণ্টার পর ঘণ্টা পানি নামতে পারে না। ছোট গাড়ি ও রিকশা বিকল হয়ে পড়ে।',
    severity: 'high',
    status: 'verified',
    district: 'ঢাকা',
    area: 'ধানমন্ডি ২৭',
    address: 'রাপা প্লাজার সম্মুখস্থ মিরপুর রোড ক্রসিং, ধানমন্ডি ২৭, ঢাকা-১২০৯',
    latitude: 23.7538,
    longitude: 90.3768,
    reported_at: '2025-02-09T16:20:00Z',
    upvotes_count: 51,
    comments_count: 8,
    views_count: 340,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general', 'user-admin'],
    ai_analysis: {
      suggestedCategory: 'জলাবদ্ধতা',
      suggestedSeverity: 'high',
      summaryBn: 'ধানমন্ডি ২৭ নম্বর রাপা প্লাজা সংলগ্ন ড্রেনেজ ব্লকের কারণে জলাবদ্ধতা। ড্রেন পরিষ্কার ও পলি অপসারণ জরুরি।',
      keywords: ['ধানমন্ডি ২৭', 'রাপা প্লাজা', 'জলাবদ্ধতা', 'ড্রেনেজ ব্লক'],
      urgencyScore: 8.4,
      potentialHazards: ['যানবাহন ইঞ্জিন বিকল', 'পথচারী ড্রেনে পড়ে যাওয়ার ঝুঁকি']
    }
  },
  {
    id: 'prob-4',
    tracking_code: 'PG-2025-0104',
    user_id: 'user-general',
    user_name: 'সাঈদ হাসান',
    category_id: 'cat-5',
    category: 'ড্রেনেজ সমস্যা',
    subcategory: 'খোলা ম্যানহোল/ড্রেন',
    title: 'মহাখালী কাঁচাবাজারের পাশে ঢাকনাহীন বিপজ্জনক খোলা ম্যানহোল',
    description: 'মহাখালী কাঁচাবাজারের উত্তর গলিতে মূল সড়কের ওপর একটি বড় ম্যানহোলের ঢাকনা গত ২০ দিন ধরে ভাঙা। পথচারীরা একটি গাছের ডাল গুঁজে রেখেছে। রাতের বেলায় যে কোনো সময় মারাত্মক প্রাণঘাতী দুর্ঘটনা ঘটতে পারে।',
    severity: 'critical',
    status: 'verified',
    district: 'ঢাকা',
    area: 'মহাখালী',
    address: 'মহাখালী কাঁচাবাজারের উত্তর পাশ, আমতলী মোড় হতে কাঁচাবাজার লিংক রোড, ঢাকা',
    latitude: 23.7776,
    longitude: 90.4054,
    reported_at: '2025-02-12T07:45:00Z',
    upvotes_count: 73,
    comments_count: 12,
    views_count: 490,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general', 'user-admin', 'user-superadmin'],
    ai_analysis: {
      suggestedCategory: 'ড্রেনেজ সমস্যা',
      suggestedSeverity: 'critical',
      summaryBn: 'মহাখালী জনবহুল কাঁচাবাজারে খোলা গভীর ম্যানহোল। মানুষের জীবননাশের ঝুঁকি রয়েছে। অবিলম্বে কংক্রিট স্ল্যাব স্থাপন করা হোক।',
      keywords: ['মহাখালী', 'খোলা ম্যানহোল', 'কাঁচাবাজার', 'প্রাণঘাতী ঝুঁকি'],
      urgencyScore: 9.8,
      potentialHazards: ['পথচারী ও শিশু পড়ে যাওয়া', 'মৃত্যু ঝুঁকি']
    }
  },
  {
    id: 'prob-5',
    tracking_code: 'PG-2025-0105',
    user_id: 'user-general',
    user_name: 'মাহমুদুল হক',
    category_id: 'cat-4',
    category: 'বর্জ্য ব্যবস্থাপনা',
    subcategory: 'খোলা রাস্তায় আবর্জনা',
    title: 'উত্তরা ৪ নম্বর সেক্টর কল্যাণ সমিতির সামনে খোলা রাস্তায় আবর্জনার ভাগাড়',
    description: 'সেক্টর ৪ এর পার্ক ও মসজিদ সংলগ্ন রাস্তায় প্রতিদিন আশপাশের রেস্তোরাঁ ও ভবনের বর্জ্য ফেলা হচ্ছে। সিটি কর্পোরেশনের গাড়ি নিয়মিত না আসায় কুকুর-বিড়াল তা ছড়িয়ে দিচ্ছে এবং প্রচণ্ড দুর্গন্ধে হাঁটাচলা অসম্ভব হয়ে পড়েছে।',
    severity: 'medium',
    status: 'resolved',
    district: 'ঢাকা',
    area: 'উত্তরা',
    address: 'রোড নম্বর ৭, সেক্টর ৪, উত্তরা মডেল টাউন, ঢাকা-১২৩০',
    latitude: 23.8680,
    longitude: 90.3950,
    reported_at: '2025-02-05T10:00:00Z',
    resolved_at: '2025-02-08T15:30:00Z',
    resolution_notes: 'ডিএনসিসি বর্জ্য ব্যবস্থাপনা দল সম্পূর্ণ স্থান পরিষ্কার করেছে এবং একটি ক্লোজড ডাস্টবিন বসিয়েছে।',
    resolution_evidence_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    upvotes_count: 29,
    comments_count: 4,
    views_count: 190,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general']
  },
  {
    id: 'prob-6',
    tracking_code: 'PG-2025-0106',
    user_id: 'user-general',
    user_name: 'মুনজেরিন ইসলাম',
    category_id: 'cat-9',
    category: 'নির্মাণকাজ',
    subcategory: 'রাস্তায় রড-সিমেন্ট-বালু',
    title: 'বনানী ১১ নম্বর ব্রিজের সংযোগস্থলে রাস্তা দখল করে নির্মাণ সামগ্রী ফেলে রাখা',
    description: 'একটি বহুতল বাণিজ্যিক ভবনের নির্মাণ কাজের জন্য প্রধান রাস্তার অর্ধেক জায়গা জুড়ে পাথর, বালু ও মিক্সার মেশিন রাখা হয়েছে। ফলে গাড়ি এক লেনে চলতে গিয়ে চরম জ্যাম হচ্ছে এবং ধুলোবালিতে পথচারীরা অসুস্থ হচ্ছে।',
    severity: 'medium',
    status: 'pending',
    district: 'ঢাকা',
    area: 'বনানী',
    address: 'রোড নম্বর ১১, ব্লক এফ, বনানী, ঢাকা-১২১৩',
    latitude: 23.7937,
    longitude: 90.4066,
    reported_at: '2025-02-12T11:00:00Z',
    upvotes_count: 19,
    comments_count: 1,
    views_count: 140,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: []
  },
  {
    id: 'prob-7',
    tracking_code: 'PG-2025-0107',
    user_id: 'user-general',
    user_name: 'কবির হোসেন',
    category_id: 'cat-1',
    category: 'রাস্তার ক্ষতি',
    subcategory: 'বড় গর্ত/খানাখন্দ',
    title: 'চট্টগ্রাম আগ্রাবাদ এক্সেস রোডে বিশাল খানাখন্দ ও কার্পেটিং ধসে পড়া',
    description: 'চট্টগ্রাম আগ্রাবাদ এক্সেস রোডে ভারী কনটেইনার লরি চলাচলের কারণে সড়কটির মাঝখানে পিচ দেবে গিয়ে বড় ধরনের গর্তের সৃষ্টি হয়েছে। রাতে বা বৃষ্টির সময় ছোট গাড়ি চাকা আটকে বিকল হচ্ছে।',
    severity: 'high',
    status: 'verified',
    district: 'চট্টগ্রাম',
    area: 'আগ্রাবাদ',
    address: 'আগ্রাবাদ এক্সেস রোড, বেপজা সংলগ্ন এলাকা, ডবলমুরিং, চট্টগ্রাম',
    latitude: 22.3259,
    longitude: 91.8124,
    reported_at: '2025-02-08T14:00:00Z',
    upvotes_count: 48,
    comments_count: 6,
    views_count: 310,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general', 'user-admin']
  },
  {
    id: 'prob-8',
    tracking_code: 'PG-2025-0108',
    user_id: 'user-general',
    user_name: 'সোহেল রানা',
    category_id: 'cat-7',
    category: 'বিদ্যুৎ সমস্যা',
    subcategory: 'ঝুলন্ত বিপজ্জনক তার',
    title: 'পুরান ঢাকা চকবাজার মোড়ে ঝুলন্ত ঝুঁকিপূর্ণ বিদ্যুতের তারের জটলা',
    description: 'চকবাজার মোড়ে মাথার মাত্র ৬ ফুট উপরে বিদ্যুতের তার ও ইন্টারনেট ক্যাবলের ভয়াবহ জট। সামান্য বাতাসেই স্পার্ক হচ্ছে এবং আগুন ধরে যাওয়ার আশঙ্কা রয়েছে।',
    severity: 'critical',
    status: 'in_progress',
    district: 'ঢাকা',
    area: 'চকবাজার',
    address: 'চকবাজার শাহী মসজিদ মোড়, চকবাজার, লালবাগ, পুরান ঢাকা',
    latitude: 23.7155,
    longitude: 90.3955,
    reported_at: '2025-02-11T13:40:00Z',
    upvotes_count: 62,
    comments_count: 7,
    views_count: 375,
    is_public: true,
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80'
    ],
    supported_by: ['user-general', 'user-superadmin']
  }
];

class MemoryStore {
  private categories: Category[] = [];
  private profiles: UserProfile[] = [];
  private reports: ProblemReport[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: UserNotification[] = [];
  private aiRecommendations: any[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.categories = data.categories || SEED_CATEGORIES;
        this.profiles = data.profiles || SEED_PROFILES;
        this.reports = data.reports || SEED_REPORTS;
        this.auditLogs = data.auditLogs || [];
        this.notifications = data.notifications || [];
        this.aiRecommendations = data.aiRecommendations || [];
        return;
      }
    } catch (e) {
      console.warn('Error reading data file, initializing defaults:', e);
    }

    this.categories = [...SEED_CATEGORIES];
    this.profiles = [...SEED_PROFILES];
    this.reports = [...SEED_REPORTS];
    this.auditLogs = [
      {
        id: 'log-1',
        admin_id: 'user-admin',
        admin_name: 'প্রকৌশলী রফিকুল ইসলাম (ডিএনসিসি)',
        action_type: 'VERIFY_REPORT',
        target_entity: 'problem_reports',
        target_id: 'prob-1',
        details: { status: 'verified', tracking_code: 'PG-2025-0101' },
        created_at: '2025-02-10T11:00:00Z'
      }
    ];
    this.notifications = [
      {
        id: 'notif-1',
        user_id: 'user-general',
        problem_id: 'prob-1',
        title_bn: 'রিপোর্ট যাচাই সম্পন্ন হয়েছে',
        message_bn: 'আপনার রিপোর্ট "মিরপুর ১০ গোলচত্বরে গভীর গর্ত" দায়িত্বপ্রাপ্ত অ্যাডমিন কর্তৃক যাচাই করা হয়েছে।',
        is_read: false,
        created_at: '2025-02-10T11:05:00Z'
      }
    ];
    this.saveData();
  }

  private saveData() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
          {
            categories: this.categories,
            profiles: this.profiles,
            reports: this.reports,
            auditLogs: this.auditLogs,
            notifications: this.notifications,
            aiRecommendations: this.aiRecommendations
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (e) {
      console.error('Failed to write app data file:', e);
    }
  }

  // --- Profile methods ---
  getProfiles() {
    return this.profiles;
  }

  getProfileById(id: string) {
    return this.profiles.find(p => p.id === id);
  }

  getProfileByEmail(email: string) {
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  createProfile(profile: UserProfile) {
    this.profiles.push(profile);
    this.saveData();
    return profile;
  }

  updateProfile(id: string, updates: Partial<UserProfile>) {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...updates };
      this.saveData();
      return this.profiles[idx];
    }
    return null;
  }

  // --- Category methods ---
  getCategories() {
    return this.categories;
  }

  addCategory(category: Category) {
    this.categories.push(category);
    this.saveData();
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.categories[idx] = { ...this.categories[idx], ...updates };
      this.saveData();
      return this.categories[idx];
    }
    return null;
  }

  // --- Problem Reports ---
  getReports(filters?: {
    category?: string;
    district?: string;
    severity?: string;
    status?: string;
    search?: string;
    userId?: string;
  }) {
    let result = [...this.reports];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        result = result.filter(r => r.category === filters.category || r.category_id === filters.category);
      }
      if (filters.district && filters.district !== 'all') {
        result = result.filter(r => r.district.includes(filters.district!));
      }
      if (filters.severity && filters.severity !== 'all') {
        result = result.filter(r => r.severity === filters.severity);
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters.userId) {
        result = result.filter(r => r.user_id === filters.userId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          r =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.area.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q) ||
            r.tracking_code.toLowerCase().includes(q)
        );
      }
    }

    return result.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  }

  getReportById(id: string) {
    const rep = this.reports.find(r => r.id === id || r.tracking_code === id);
    if (rep) {
      rep.views_count = (rep.views_count || 0) + 1;
      this.saveData();
    }
    return rep;
  }

  createReport(data: Partial<ProblemReport>, user: UserProfile): ProblemReport {
    const nowYear = new Date().getFullYear();
    const count = this.reports.length + 101;
    const trackingCode = `PG-${nowYear}-${String(count).padStart(4, '0')}`;

    const newReport: ProblemReport = {
      id: `prob-${Date.now()}`,
      tracking_code: trackingCode,
      user_id: user.id,
      user_name: user.full_name,
      user_phone: user.phone,
      category_id: data.category_id || 'cat-1',
      category: data.category || 'রাস্তার ক্ষতি',
      subcategory: data.subcategory,
      title: data.title || 'নাগরিক সমস্যা',
      description: data.description || '',
      severity: data.severity || 'medium',
      status: 'pending',
      district: data.district || 'ঢাকা',
      area: data.area || 'মিরপুর',
      address: data.address || '',
      latitude: data.latitude || 23.8103,
      longitude: data.longitude || 90.4125,
      reported_at: new Date().toISOString(),
      upvotes_count: 1,
      comments_count: 0,
      views_count: 1,
      is_public: true,
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      ],
      supported_by: [user.id],
      comments: [],
      status_history: [
        {
          old_status: '',
          new_status: 'pending',
          changed_by_name: user.full_name,
          reason: 'নাগরিক কর্তৃক নতুন সমস্যা জমা দেওয়া হয়েছে',
          created_at: new Date().toISOString()
        }
      ],
      ai_analysis: data.ai_analysis
    };

    this.reports.unshift(newReport);

    // Create user notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      problem_id: newReport.id,
      title_bn: 'সমস্যা সফলভাবে জমা হয়েছে',
      message_bn: `আপনার সমস্যা "${newReport.title}" জমা হয়েছে। ট্র্যাকিং কোড: ${trackingCode}`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.saveData();
    return newReport;
  }

  updateReportStatus(
    id: string,
    newStatus: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected',
    admin: UserProfile,
    reason?: string,
    resolutionNotes?: string,
    evidenceUrl?: string
  ) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return null;

    const oldStatus = report.status;
    report.status = newStatus;
    if (newStatus === 'resolved') {
      report.resolved_at = new Date().toISOString();
      if (resolutionNotes) report.resolution_notes = resolutionNotes;
      if (evidenceUrl) report.resolution_evidence_url = evidenceUrl;
    }

    if (!report.status_history) report.status_history = [];
    report.status_history.push({
      old_status: oldStatus,
      new_status: newStatus,
      changed_by_name: admin.full_name,
      reason: reason || `অবস্থা পরিবর্তন: ${oldStatus} -> ${newStatus}`,
      created_at: new Date().toISOString()
    });

    // Notify original submitter
    const statusLabels: Record<string, string> = {
      verified: 'যাচাইকৃত হয়েছে',
      in_progress: 'কার্যক্রম চলমান রয়েছে',
      resolved: 'সমাধান করা হয়েছে',
      rejected: 'বাতিল/খারিজ করা হয়েছে'
    };

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: report.user_id,
      problem_id: report.id,
      title_bn: `রিপোর্টের অবস্থা: ${statusLabels[newStatus] || newStatus}`,
      message_bn: `আপনার রিপোর্ট "${report.title}" এর অবস্থা পরিবর্তন করে '${statusLabels[newStatus] || newStatus}' করা হয়েছে। মন্তব্য: ${reason || 'কোনো মন্তব্য নেই'}`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    // Add Audit Log
    this.addAuditLog({
      id: `log-${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.full_name,
      action_type: 'UPDATE_REPORT_STATUS',
      target_entity: 'problem_reports',
      target_id: report.id,
      details: {
        tracking_code: report.tracking_code,
        old_status: oldStatus,
        new_status: newStatus,
        reason
      },
      created_at: new Date().toISOString()
    });

    this.saveData();
    return report;
  }

  editReport(id: string, updates: Partial<ProblemReport>, admin: UserProfile) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return null;

    Object.assign(report, updates);

    this.addAuditLog({
      id: `log-${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.full_name,
      action_type: 'EDIT_REPORT_DETAILS',
      target_entity: 'problem_reports',
      target_id: report.id,
      details: updates,
      created_at: new Date().toISOString()
    });

    this.saveData();
    return report;
  }

  addComment(problemId: string, user: UserProfile, commentText: string) {
    const report = this.reports.find(r => r.id === problemId);
    if (!report) return null;

    if (!report.comments) report.comments = [];
    const comment = {
      id: `comment-${Date.now()}`,
      user_id: user.id,
      user_name: user.full_name,
      comment_text: commentText,
      created_at: new Date().toISOString()
    };
    report.comments.push(comment);
    report.comments_count = report.comments.length;

    this.saveData();
    return comment;
  }

  toggleSupport(problemId: string, user: UserProfile) {
    const report = this.reports.find(r => r.id === problemId);
    if (!report) return null;

    if (!report.supported_by) report.supported_by = [];
    const idx = report.supported_by.indexOf(user.id);
    let supported = false;

    if (idx === -1) {
      report.supported_by.push(user.id);
      supported = true;
    } else {
      report.supported_by.splice(idx, 1);
      supported = false;
    }

    report.upvotes_count = report.supported_by.length;
    this.saveData();
    return { supported, upvotesCount: report.upvotes_count };
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return this.auditLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addAuditLog(log: AuditLog) {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    this.saveData();
  }

  // --- Notifications ---
  getNotifications(userId: string) {
    return this.notifications.filter(n => n.user_id === userId);
  }

  markNotificationAsRead(notifId: string, userId: string) {
    const notif = this.notifications.find(n => n.id === notifId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.saveData();
    }
  }

  // --- AI Recommendations ---
  saveAIRecommendation(rec: any) {
    this.aiRecommendations.unshift({
      id: `rec-${Date.now()}`,
      ...rec,
      created_at: new Date().toISOString()
    });
    this.saveData();
    return this.aiRecommendations[0];
  }

  getAIRecommendations() {
    return this.aiRecommendations;
  }

  // --- Stats and Aggregates ---
  getStats() {
    const total = this.reports.length;
    const pending = this.reports.filter(r => r.status === 'pending').length;
    const verified = this.reports.filter(r => r.status === 'verified').length;
    const inProgress = this.reports.filter(r => r.status === 'in_progress').length;
    const resolved = this.reports.filter(r => r.status === 'resolved').length;
    const rejected = this.reports.filter(r => r.status === 'rejected').length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const r of this.reports) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }

    // District breakdown
    const districtCounts: Record<string, number> = {};
    for (const r of this.reports) {
      districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
    }

    // Area breakdown (Top problem areas)
    const areaCounts: Record<string, number> = {};
    for (const r of this.reports) {
      const key = `${r.area} (${r.district})`;
      areaCounts[key] = (areaCounts[key] || 0) + 1;
    }

    // Severity breakdown
    const severityCounts = {
      critical: this.reports.filter(r => r.severity === 'critical').length,
      high: this.reports.filter(r => r.severity === 'high').length,
      medium: this.reports.filter(r => r.severity === 'medium').length,
      low: this.reports.filter(r => r.severity === 'low').length,
    };

    return {
      total,
      pending,
      verified,
      inProgress,
      resolved,
      rejected,
      categoryCounts,
      districtCounts,
      areaCounts,
      severityCounts
    };
  }
}

export const store = new MemoryStore();
