import {
  ProblemReport,
  Category,
  UserProfile,
  RouteAnalysisData,
  AdminStats,
  AdminInsights,
  AuditLog,
  UserNotification
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('problemgraph_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetchJson<T>(
  url: string,
  init?: RequestInit,
  defaultErrorMsg = 'অনুরোধটি সম্পন্ন করা সম্ভব হয়নি'
): Promise<T> {
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || defaultErrorMsg);
    }
    throw new Error(`${defaultErrorMsg} (সার্ভার কোড: ${res.status})`);
  }

  if (!isJson) {
    throw new Error('সার্ভার থেকে অপ্রত্যাশিত ফরম্যাটে ডেটা এসেছে');
  }

  return res.json();
}

export const api = {
  // Auth
  async login(
    credentials: { email: string; password?: string; role?: string } | string,
    legacyRole?: string
  ): Promise<{ token: string; user: UserProfile }> {
    const payload = typeof credentials === 'string'
      ? { email: credentials, role: legacyRole }
      : credentials;

    return safeFetchJson<{ token: string; user: UserProfile }>(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      'লগইন ব্যর্থ হয়েছে'
    );
  },

  async register(data: {
    full_name: string;
    email: string;
    password?: string;
    phone?: string;
    division?: string;
    district?: string;
    area?: string;
    address?: string;
    nid?: string;
    role?: string;
    avatar_url?: string;
  }): Promise<{ token: string; user: UserProfile; message?: string }> {
    return safeFetchJson<{ token: string; user: UserProfile; message?: string }>(
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'রেজিস্ট্রেশন ব্যর্থ হয়েছে'
    );
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `${API_BASE}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
      'পাসওয়ার্ড রিসেট অনুরোধ ব্যর্থ হয়েছে'
    );
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return safeFetchJson<{ user: UserProfile }>(
      `${API_BASE}/auth/me`,
      {
        headers: getAuthHeader(),
      },
      'সেশন মেয়াদোত্তীর্ণ'
    );
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile; message?: string }> {
    return safeFetchJson<{ success: boolean; user: UserProfile; message?: string }>(
      `${API_BASE}/auth/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(updates),
      },
      'প্রোফাইল আপডেট ব্যর্থ হয়েছে'
    );
  },

  async changePassword(current_password?: string, new_password?: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `${API_BASE}/auth/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ current_password, new_password }),
      },
      'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে'
    );
  },

  async getDemoProfiles(): Promise<{ profiles: UserProfile[] }> {
    return safeFetchJson<{ profiles: UserProfile[] }>(
      `${API_BASE}/auth/profiles`,
      undefined,
      'প্রোফাইল তালিকা লোড করতে ব্যর্থ'
    );
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return safeFetchJson<{ categories: Category[] }>(
      `${API_BASE}/categories`,
      undefined,
      'ক্যাটাগরি লোড করতে ব্যর্থ'
    );
  },

  async addCategory(data: any): Promise<{ category: Category }> {
    return safeFetchJson<{ category: Category }>(
      `${API_BASE}/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      },
      'ক্যাটাগরি যুক্ত করতে ব্যর্থ'
    );
  },

  // Problem Reports
  async getProblems(filters?: {
    category?: string;
    district?: string;
    severity?: string;
    status?: string;
    search?: string;
    userId?: string;
  }): Promise<{ reports: ProblemReport[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.district) params.append('district', filters.district);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.userId) params.append('userId', filters.userId);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return safeFetchJson<{ reports: ProblemReport[]; count: number }>(
      `${API_BASE}/problems${queryStr}`,
      undefined,
      'সমস্যার তালিকা লোড করতে ব্যর্থ'
    );
  },

  async getProblemById(id: string): Promise<{ report: ProblemReport }> {
    return safeFetchJson<{ report: ProblemReport }>(
      `${API_BASE}/problems/${id}`,
      undefined,
      'রিপোর্টটি পাওয়া যায়নি'
    );
  },

  async submitProblem(data: any): Promise<{ report: ProblemReport; message: string }> {
    return safeFetchJson<{ report: ProblemReport; message: string }>(
      `${API_BASE}/problems`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      },
      'সমস্যা জমা দিতে ত্রুটি হয়েছে'
    );
  },

  async classifyPreview(title: string, description: string, category?: string, severity?: string) {
    return safeFetchJson<any>(
      `${API_BASE}/problems/classify-preview`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, severity }),
      },
      'এআই বিশ্লেষণ প্রিভিউ ব্যর্থ'
    );
  },

  async updateProblemStatus(
    id: string,
    status: string,
    reason?: string,
    resolutionNotes?: string,
    evidenceUrl?: string
  ): Promise<{ report: ProblemReport; message: string }> {
    return safeFetchJson<{ report: ProblemReport; message: string }>(
      `${API_BASE}/problems/${id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, reason, resolutionNotes, evidenceUrl }),
      },
      'অবস্থা হালনাগাদে ত্রুটি'
    );
  },

  async editProblem(id: string, updates: Partial<ProblemReport>): Promise<{ report: ProblemReport }> {
    return safeFetchJson<{ report: ProblemReport }>(
      `${API_BASE}/problems/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates),
      },
      'রিপোর্ট সম্পাদনা করতে ব্যর্থ'
    );
  },

  async addComment(problemId: string, commentText: string) {
    return safeFetchJson<any>(
      `${API_BASE}/problems/${problemId}/comment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ commentText }),
      },
      'মন্তব্য যুক্ত করতে ত্রুটি'
    );
  },

  async toggleSupport(problemId: string) {
    return safeFetchJson<any>(
      `${API_BASE}/problems/${problemId}/support`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      },
      'সমর্থন আপডেট করতে ব্যর্থ'
    );
  },

  // Route Intelligence
  async analyzeRoute(
    origin: string,
    destination: string,
    corridorBufferMeters: number = 800
  ): Promise<RouteAnalysisData> {
    return safeFetchJson<RouteAnalysisData>(
      `${API_BASE}/route-intelligence/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, corridorBufferMeters }),
      },
      'যাত্রাপথ বিশ্লেষণ প্রক্রিয়াকরণ ব্যর্থ হয়েছে'
    );
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return safeFetchJson<{ stats: AdminStats }>(
      `${API_BASE}/admin/stats`,
      {
        headers: getAuthHeader(),
      },
      'প্রশাসনিক পরিসংখ্যান লোড করতে ব্যর্থ'
    );
  },

  async getAdminInsights(): Promise<{ insights: AdminInsights; timestamp: string }> {
    return safeFetchJson<{ insights: AdminInsights; timestamp: string }>(
      `${API_BASE}/admin/insights`,
      {
        headers: getAuthHeader(),
      },
      'এআই অন্তর্দৃষ্টি তৈরি করতে ব্যর্থ'
    );
  },

  async getAdminRecommendation(problemId: string) {
    return safeFetchJson<any>(
      `${API_BASE}/admin/recommendations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ problemId }),
      },
      'সমাধান সুপারিশ তৈরি করতে ব্যর্থ'
    );
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return safeFetchJson<{ logs: AuditLog[] }>(
      `${API_BASE}/admin/audit-logs`,
      {
        headers: getAuthHeader(),
      },
      'অডিট লগ লোড করতে ব্যর্থ'
    );
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: UserNotification[] }> {
    return safeFetchJson<{ notifications: UserNotification[] }>(
      `${API_BASE}/notifications`,
      {
        headers: getAuthHeader(),
      },
      'নোটিফিকেশন লোড করতে ব্যর্থ'
    );
  },

  async markNotificationRead(id: string) {
    return safeFetchJson<any>(
      `${API_BASE}/notifications/${id}/read`,
      {
        method: 'PATCH',
        headers: getAuthHeader(),
      },
      'নোটিফিকেশন পড়া হিসেবে চিহ্নিত করতে ব্যর্থ'
    );
  },

  // System & Database Health
  async getSystemStatus(): Promise<{
    appName: string;
    version: string;
    timestamp: string;
    database: {
      provider: string;
      supabase: {
        isConfigured: boolean;
        isConnected: boolean;
        url?: string;
        messageBn: string;
        details?: string;
      };
    };
    ai: {
      provider: string;
      model: string;
      isConfigured: boolean;
    };
  }> {
    return safeFetchJson<any>(
      `${API_BASE}/system/status`,
      undefined,
      'সিস্টেম স্ট্যাটাস লোড করতে ব্যর্থ'
    );
  }
};
