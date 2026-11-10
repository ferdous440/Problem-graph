import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { ProblemReport, Category, UserProfile, AuditLog, UserNotification } from './store.js';

dotenv.config();

export function normalizeSupabaseUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.includes('.')) {
      url = `https://${url}.supabase.co`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
}

export function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function ensureValidUUID(id?: string): string {
  if (id && isValidUUID(id)) {
    return id;
  }
  return crypto.randomUUID();
}

const rawSupabaseUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Supabase initialization error:', err);
    supabase = null;
  }
}

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url?: string;
  messageBn: string;
  details?: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const rawUrl = process.env.SUPABASE_URL?.trim() || '';
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!rawUrl || !key) {
    return {
      isConfigured: false,
      isConnected: false,
      messageBn: 'Supabase ক্রেডেনশিয়ালস সেট করা হয়নি। অ্যাপ্লিকেশনটি বর্তমানে লোকাল স্টোরে সচল রয়েছে।',
      details: 'Missing SUPABASE_URL or API keys.'
    };
  }

  try {
    const client = supabase || createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from('categories').select('count', { count: 'exact', head: true });

    const maskedUrl = url.replace(/(https?:\/\/)(.{4})(.*)(\.supabase\.co.*)/, '$1$2***$4');

    if (error) {
      if (error.code === '42P01') {
        return {
          isConfigured: true,
          isConnected: true,
          url: maskedUrl,
          messageBn: 'Supabase কানেক্ট হয়েছে, কিন্তু টেবিল তৈরি করা হয়নি (supabase_schema.sql রান করুন)।',
          details: error.message
        };
      }
      return {
        isConfigured: true,
        isConnected: false,
        url: maskedUrl,
        messageBn: `Supabase কানেক্টে সমস্যা: ${error.message}`,
        details: error.message
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      url: maskedUrl,
      messageBn: 'Supabase PostgreSQL ডেটাবেজ সফলভাবে সংযুক্ত ও সম্পূর্ণ সক্রিয় রয়েছে!',
      details: 'Connection verified successfully.'
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      url: url.substring(0, 15) + '...',
      messageBn: `সংযোগ পরীক্ষা ব্যর্থ: ${err.message}`,
      details: err.message
    };
  }
}

// -------------------------------------------------------------
// Bidirectional Data Synchronization Service
// -------------------------------------------------------------
export const supabaseService = {
  getClient(): SupabaseClient | null {
    return supabase;
  },

  async seedAndSyncInitialData(
    seedCategories: Category[],
    seedProfiles: UserProfile[],
    seedReports: ProblemReport[]
  ): Promise<{
    categories?: Category[];
    profiles?: UserProfile[];
    reports?: ProblemReport[];
  }> {
    if (!supabase) return {};

    try {
      // 1. Sync Categories
      const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
      let finalCategories: Category[] | undefined = undefined;

      if (!catErr) {
        if (!dbCategories || dbCategories.length === 0) {
          console.log('Seeding initial categories into Supabase...');
          const insertPayload = seedCategories.map(c => ({
            id: c.id,
            slug: c.slug,
            name_bn: c.name_bn,
            name_en: c.name_en,
            icon: c.icon,
            color: c.color,
            description_bn: c.description_bn,
            subcategories: c.subcategories || [],
            is_active: c.is_active ?? true
          }));
          await supabase.from('categories').insert(insertPayload);
          finalCategories = seedCategories;
        } else {
          finalCategories = dbCategories as Category[];
        }
      }

      // 2. Sync Profiles (User Accounts)
      const { data: dbProfiles, error: profErr } = await supabase.from('profiles').select('*');
      let finalProfiles: UserProfile[] | undefined = undefined;

      if (!profErr) {
        if (!dbProfiles || dbProfiles.length === 0) {
          console.log('Seeding initial user profiles into Supabase...');
          const insertPayload = seedProfiles.map(p => ({
            id: ensureValidUUID(p.id),
            email: p.email.toLowerCase().trim(),
            full_name: p.full_name,
            phone: p.phone || null,
            role: p.role,
            division: p.division || 'ঢাকা',
            district: p.district || 'ঢাকা',
            area: p.area || 'মিরপুর',
            address: p.address || null,
            nid: p.nid || null,
            avatar_url: p.avatar_url || null,
            is_verified: p.is_verified ?? true,
            created_at: p.created_at || new Date().toISOString()
          }));
          await supabase.from('profiles').insert(insertPayload);
          finalProfiles = seedProfiles;
        } else {
          finalProfiles = dbProfiles.map((p: any) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            phone: p.phone || '',
            role: p.role || 'user',
            division: p.division || 'ঢাকা',
            district: p.district || 'ঢাকা',
            area: p.area || '',
            address: p.address || '',
            nid: p.nid || '',
            avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            is_verified: p.is_verified ?? true,
            created_at: p.created_at || new Date().toISOString()
          }));
        }
      }

      // 3. Sync Problem Reports
      const { data: dbReports, error: repErr } = await supabase.from('problem_reports').select('*');
      let finalReports: ProblemReport[] | undefined = undefined;

      if (!repErr) {
        if (!dbReports || dbReports.length === 0) {
          console.log('Seeding initial reports into Supabase...');
          const insertPayload = seedReports.map(r => ({
            id: r.id,
            tracking_code: r.tracking_code,
            user_id: r.user_id,
            user_name: r.user_name,
            user_phone: r.user_phone || null,
            category_id: r.category_id,
            category: r.category,
            subcategory: r.subcategory || null,
            title: r.title,
            description: r.description,
            severity: r.severity,
            status: r.status,
            district: r.district,
            area: r.area,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
            reported_at: r.reported_at,
            resolved_at: r.resolved_at || null,
            upvotes_count: r.upvotes_count || 0,
            comments_count: r.comments_count || 0,
            views_count: r.views_count || 0,
            is_public: r.is_public ?? true,
            images: r.images || [],
            resolution_notes: r.resolution_notes || null,
            resolution_evidence_url: r.resolution_evidence_url || null,
            ai_analysis: r.ai_analysis || {},
            supported_by: r.supported_by || []
          }));
          await supabase.from('problem_reports').insert(insertPayload);
          finalReports = seedReports;
        } else {
          // Fetch comments & status history from Supabase for all reports
          const { data: dbComments } = await supabase.from('comments').select('*');
          const { data: dbHistory } = await supabase.from('status_history').select('*');

          finalReports = dbReports.map((r: any) => {
            const reportComments = (dbComments || [])
              .filter((c: any) => c.problem_id === r.id)
              .map((c: any) => ({
                id: c.id,
                user_id: c.user_id,
                user_name: c.user_name,
                comment_text: c.comment_text,
                created_at: c.created_at
              }));

            const reportHistory = (dbHistory || [])
              .filter((h: any) => h.problem_id === r.id)
              .map((h: any) => ({
                old_status: h.old_status,
                new_status: h.new_status,
                changed_by_name: h.changed_by_name,
                reason: h.reason || '',
                created_at: h.created_at
              }));

            return {
              ...r,
              comments: reportComments,
              status_history: reportHistory
            } as ProblemReport;
          });
        }
      }

      return {
        categories: finalCategories,
        profiles: finalProfiles,
        reports: finalReports
      };
    } catch (e) {
      console.error('Supabase initial seed/sync error:', e);
      return {};
    }
  },

  // User Profile Operations
  async insertProfile(profile: UserProfile): Promise<boolean> {
    if (!supabase) return false;
    try {
      const uuid = ensureValidUUID(profile.id);
      const payload = {
        id: uuid,
        email: profile.email.toLowerCase().trim(),
        full_name: profile.full_name.trim(),
        phone: profile.phone?.trim() || null,
        role: profile.role || 'user',
        division: profile.division || 'ঢাকা',
        district: profile.district || 'ঢাকা',
        area: profile.area || '',
        address: profile.address || null,
        nid: profile.nid || null,
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        is_verified: profile.is_verified ?? true,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('profiles').insert([payload]).select();
      if (error) {
        console.error('Failed to insert user profile in Supabase:', error.message, error.details);
        return false;
      }
      console.log('✅ User profile successfully saved in Supabase:', data);
      return true;
    } catch (err: any) {
      console.error('Supabase insertProfile exception:', err.message || err);
      return false;
    }
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: any = { ...updates, updated_at: new Date().toISOString() };
      delete payload.password; // Do not send password if column is not in profiles table
      delete payload.id;

      const { error } = await supabase.from('profiles').update(payload).eq('id', id);
      if (error) {
        console.error('Failed to update profile in Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateProfile exception:', err);
      return false;
    }
  },

  async getProfileByEmailOrPhone(identifier: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const clean = identifier.trim().toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.${clean},phone.eq.${clean}`)
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      const p = data[0];
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        phone: p.phone || '',
        role: p.role || 'user',
        division: p.division || 'ঢাকা',
        district: p.district || 'ঢাকা',
        area: p.area || '',
        address: p.address || '',
        nid: p.nid || '',
        avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        is_verified: p.is_verified ?? true,
        created_at: p.created_at || new Date().toISOString()
      };
    } catch {
      return null;
    }
  },

  // Problem Report Operations
  async insertReport(report: ProblemReport): Promise<boolean> {
    if (!supabase) return false;
    try {
      let currentTrackingCode = report.tracking_code;
      let attempts = 0;
      let inserted = false;

      while (!inserted && attempts < 5) {
        const { error } = await supabase.from('problem_reports').insert([{
          id: report.id,
          tracking_code: currentTrackingCode,
          user_id: report.user_id,
          user_name: report.user_name,
          user_phone: report.user_phone || null,
          category_id: report.category_id,
          category: report.category,
          subcategory: report.subcategory || null,
          title: report.title,
          description: report.description,
          severity: report.severity,
          status: report.status,
          district: report.district,
          area: report.area,
          address: report.address,
          latitude: report.latitude,
          longitude: report.longitude,
          reported_at: report.reported_at,
          upvotes_count: report.upvotes_count || 0,
          comments_count: report.comments_count || 0,
          views_count: report.views_count || 0,
          is_public: report.is_public ?? true,
          images: report.images || [],
          ai_analysis: report.ai_analysis || {},
          supported_by: report.supported_by || []
        }]);

        if (error) {
          // If duplicate tracking code error (PostgreSQL unique violation 23505)
          const isUniqueViolation = error.code === '23505' || 
            error.message.includes('unique constraint') ||
            error.message.includes('tracking_code');

          if (isUniqueViolation) {
            attempts++;
            const nowYear = new Date().getFullYear();
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            currentTrackingCode = `PG-${nowYear}-${randSuffix}`;
            report.tracking_code = currentTrackingCode;
            console.warn(`Unique tracking code conflict detected. Retrying with new code: ${currentTrackingCode} (Attempt ${attempts})`);
            continue;
          }

          console.error('Failed to insert report in Supabase:', error.message);
          return false;
        }

        inserted = true;
      }

      return inserted;
    } catch (err) {
      console.error('Supabase insertReport exception:', err);
      return false;
    }
  },

  async updateReport(id: string, updates: Partial<ProblemReport>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: any = { ...updates, updated_at: new Date().toISOString() };
      delete payload.comments;
      delete payload.status_history;

      const { error } = await supabase.from('problem_reports').update(payload).eq('id', id);
      if (error) {
        console.error('Failed to update report in Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateReport exception:', err);
      return false;
    }
  },

  async addStatusHistory(problemId: string, item: {
    old_status: string;
    new_status: string;
    changed_by_name: string;
    changed_by_id?: string;
    reason?: string;
  }): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('status_history').insert([{
        problem_id: problemId,
        old_status: item.old_status,
        new_status: item.new_status,
        changed_by_id: item.changed_by_id || 'system',
        changed_by_name: item.changed_by_name,
        reason: item.reason || null
      }]);
      if (error) {
        console.warn('Supabase addStatusHistory warning:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async addComment(problemId: string, comment: {
    user_id: string;
    user_name: string;
    comment_text: string;
  }): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('comments').insert([{
        problem_id: problemId,
        user_id: comment.user_id,
        user_name: comment.user_name,
        comment_text: comment.comment_text
      }]);
      if (error) {
        console.error('Failed to insert comment in Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async insertCategory(cat: Category): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('categories').insert([{
        id: cat.id,
        slug: cat.slug,
        name_bn: cat.name_bn,
        name_en: cat.name_en,
        icon: cat.icon,
        color: cat.color,
        description_bn: cat.description_bn,
        subcategories: cat.subcategories || [],
        is_active: cat.is_active ?? true
      }]);
      if (error) {
        console.error('Failed to insert category in Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async insertAuditLog(log: AuditLog): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('audit_logs').insert([{
        admin_id: log.admin_id,
        admin_name: log.admin_name,
        action_type: log.action_type,
        target_entity: log.target_entity,
        target_id: log.target_id,
        details: log.details || {}
      }]);
      if (error) {
        console.warn('Supabase insertAuditLog warning:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async insertNotification(notif: UserNotification): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('notifications').insert([{
        user_id: notif.user_id,
        problem_id: notif.problem_id || null,
        title_bn: notif.title_bn,
        message_bn: notif.message_bn,
        is_read: notif.is_read ?? false
      }]);
      if (error) {
        console.warn('Supabase insertNotification warning:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // -----------------------------------------------------------
  // Supabase Auth Integration
  // -----------------------------------------------------------
  async createAuthUser(user: { id?: string; email: string; password?: string; full_name?: string; phone?: string }): Promise<boolean> {
    if (!supabase || !user.email || !user.password) return false;
    try {
      const email = user.email.toLowerCase().trim();
      const payload: any = {
        email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name || '',
          phone: user.phone || ''
        }
      };
      if (user.id && isValidUUID(user.id)) {
        payload.id = user.id;
      }
      const { data, error } = await supabase.auth.admin.createUser(payload);
      if (error) {
        if (error.message?.toLowerCase().includes('already') || error.message?.toLowerCase().includes('exists')) {
          try {
            const { data: usersData } = await supabase.auth.admin.listUsers();
            const existing = usersData?.users?.find(u => u.email?.toLowerCase() === email);
            if (existing) {
              await supabase.auth.admin.updateUserById(existing.id, {
                password: user.password,
                user_metadata: { full_name: user.full_name, phone: user.phone }
              });
              return true;
            }
          } catch {}
        }
        console.warn('Supabase auth create user notice:', error.message);
        return false;
      }
      return !!data.user;
    } catch (e: any) {
      console.warn('Supabase auth create user exception:', e.message);
      return false;
    }
  },

  async verifyAuthUser(email: string, password: string): Promise<{ success: boolean; user?: any }> {
    if (!supabase || !email || !password) return { success: false };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });
      if (!error && data?.user) {
        return { success: true, user: data.user };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  },

  async updateAuthUserPassword(userIdOrEmail: string, newPassword: string): Promise<boolean> {
    if (!supabase || !userIdOrEmail || !newPassword) return false;
    try {
      if (isValidUUID(userIdOrEmail)) {
        const { error } = await supabase.auth.admin.updateUserById(userIdOrEmail, { password: newPassword });
        return !error;
      } else {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existing = usersData?.users?.find(u => u.email?.toLowerCase() === userIdOrEmail.toLowerCase().trim());
        if (existing) {
          const { error } = await supabase.auth.admin.updateUserById(existing.id, { password: newPassword });
          return !error;
        }
      }
      return false;
    } catch {
      return false;
    }
  }
};

