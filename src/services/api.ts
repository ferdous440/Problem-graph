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

export const api = {
  // Auth
  async login(email: string, role?: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'লগইন ব্যর্থ হয়েছে');
    }
    return res.json();
  },

  async register(data: { full_name: string; email: string; phone?: string; district?: string; area?: string }): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('সেশন মেয়াদোত্তীর্ণ');
    return res.json();
  },

  async getDemoProfiles(): Promise<{ profiles: UserProfile[] }> {
    const res = await fetch(`${API_BASE}/auth/profiles`);
    return res.json();
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async addCategory(data: any): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
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

    const res = await fetch(`${API_BASE}/problems?${params.toString()}`);
    return res.json();
  },

  async getProblemById(id: string): Promise<{ report: ProblemReport }> {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    if (!res.ok) throw new Error('রিপোর্ট পাওয়া যায়নি');
    return res.json();
  },

  async submitProblem(data: any): Promise<{ report: ProblemReport; message: string }> {
    const res = await fetch(`${API_BASE}/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'সমস্যা জমা দিতে ত্রুটি হয়েছে');
    }
    return res.json();
  },

  async classifyPreview(title: string, description: string, category?: string, severity?: string) {
    const res = await fetch(`${API_BASE}/problems/classify-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, severity }),
    });
    return res.json();
  },

  async updateProblemStatus(
    id: string,
    status: string,
    reason?: string,
    resolutionNotes?: string,
    evidenceUrl?: string
  ): Promise<{ report: ProblemReport; message: string }> {
    const res = await fetch(`${API_BASE}/problems/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, reason, resolutionNotes, evidenceUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'অবস্থা হালনাগাদে ত্রুটি');
    }
    return res.json();
  },

  async editProblem(id: string, updates: Partial<ProblemReport>): Promise<{ report: ProblemReport }> {
    const res = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async addComment(problemId: string, commentText: string) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ commentText }),
    });
    return res.json();
  },

  async toggleSupport(problemId: string) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return res.json();
  },

  // Route Intelligence
  async analyzeRoute(origin: string, destination: string, corridorBufferMeters: number = 800): Promise<RouteAnalysisData> {
    const res = await fetch(`${API_BASE}/route-intelligence/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, corridorBufferMeters }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'যাত্রাপথ বিশ্লেষণ প্রক্রিয়াকরণ ব্যর্থ হয়েছে');
    }
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('পরিসংখ্যান লোড করতে ব্যর্থ');
    return res.json();
  },

  async getAdminInsights(): Promise<{ insights: AdminInsights; timestamp: string }> {
    const res = await fetch(`${API_BASE}/admin/insights`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getAdminRecommendation(problemId: string) {
    const res = await fetch(`${API_BASE}/admin/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problemId }),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: UserNotification[] }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return res.json();
  }
};
