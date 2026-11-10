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
  supported_by?: string[];
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
  ai_analysis?: {
    suggestedCategory?: string;
    suggestedSeverity?: string;
    summaryBn?: string;
    keywords?: string[];
    urgencyScore?: number;
    potentialHazards?: string[];
  };
  distanceFromRouteMeters?: number;
}

export interface RouteAnalysisData {
  route: {
    origin: string;
    destination: string;
    originCoords: { lat: number; lng: number };
    destinationCoords: { lat: number; lng: number };
    distanceKm: number;
    durationMinutes: number;
    polyline: Array<{ lat: number; lng: number }>;
    summary: string;
  };
  corridorBufferMeters: number;
  corridorReports: ProblemReport[];
  evidenceSummary: {
    totalReportsFound: number;
    criticalCount: number;
    highCount: number;
    verifiedCount: number;
  };
  aiAnalysis: {
    routeSummary: string;
    vulnerableAreas: string[];
    trafficIssues: string;
    roadDamageIssues: string;
    waterloggingIssues: string;
    constructionIssues: string;
    criticalIssues: string;
    latestReportDates: string;
    travelerAdvisories: string[];
    dataCoverageNote: string;
  };
}

export interface AdminStats {
  total: number;
  pending: number;
  verified: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  categoryCounts: Record<string, number>;
  districtCounts: Record<string, number>;
  areaCounts: Record<string, number>;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AdminInsights {
  executiveSummary: string;
  topProblemAreas: string;
  dominantCategories: string;
  surgingTrends: string;
  longPendingIssues: string;
  priorityActionItems: string[];
  strategicRecommendations: string[];
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
