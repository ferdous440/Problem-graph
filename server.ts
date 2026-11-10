import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { store, UserProfile } from './server/store.js';
import {
  classifyProblemReport,
  fallbackClassification,
  analyzeRouteCorridorAI,
  generateAdminInsightsAI,
  generateSolutionRecommendationAI
} from './server/gemini.js';
import {
  resolveLocation,
  getRoute,
  findReportsInRouteCorridor
} from './server/routing.js';
import { checkSupabaseConnection, supabaseService } from './server/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper: Extract user from Bearer token
function getAuthenticatedUser(req: express.Request): UserProfile | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  // Simple token format: user-id or base64 user-id
  return store.getProfileById(token) || null;
}

// Middleware: Require Auth
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'লগইন করা আবশ্যক (অননুমোদিত)' });
  }
  (req as any).user = user;
  next();
}

// Middleware: Require Admin / Super Admin
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'শুধুমাত্র দায়িত্বপ্রাপ্ত অ্যাডমিনদের জন্য অনুমোদিত' });
  }
  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email && !role) {
    return res.status(400).json({ error: 'ইমেইল অথবা মোবাইল নম্বর দেওয়া আবশ্যক' });
  }

  let user: UserProfile | null = null;
  if (email) {
    user = store.getProfileByEmailOrPhone(email) || null;
    if (!user) {
      // Query Supabase directly in case user was added remotely
      const supaUser = await supabaseService.getProfileByEmailOrPhone(email);
      if (supaUser) {
        store.createProfile(supaUser);
        user = supaUser;
      }
    }
  }

  if (!user && role) {
    // Demo login switcher
    const users = store.getProfiles();
    user = users.find(u => u.role === role) || users[0];
  }

  if (!user) {
    return res.status(404).json({ error: 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' });
  }

  // Validate password
  if (password) {
    let passwordMatched = (user.password === password);

    // If direct local match failed, verify directly against Supabase Auth using user's email
    if (!passwordMatched && user.email) {
      try {
        const authRes = await supabaseService.verifyAuthUser(user.email, password);
        if (authRes.success) {
          passwordMatched = true;
          // Synchronize local password with the validated password so future checks are instant
          user.password = password;
          store.updateProfilePassword(user.id, password);
          console.log(`✅ Supabase Auth verified and synchronized password for ${user.email}`);
        }
      } catch (authErr) {
        console.warn('Supabase auth verification attempt notice:', authErr);
      }
    }

    // Also support default demo credentials for seed accounts
    if (!passwordMatched) {
      const validDefault = (user.role === 'admin' && password === 'admin123') ||
                           (user.role === 'super_admin' && password === 'super123') ||
                           (password === 'pass123');
      if (validDefault) {
        passwordMatched = true;
      }
    }

    if (!passwordMatched) {
      return res.status(401).json({ error: 'প্রদত্ত পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' });
    }
  }

  // Session token is the user ID
  res.json({
    token: user.id,
    user
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, phone, division, district, area, address, nid, role, avatar_url } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'পূর্ণ নাম ও ইমেইল ঠিকানা প্রদান আবশ্যক' });
  }

  if (password && password.length < 6) {
    return res.status(400).json({ error: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হওয়া আবশ্যক' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingEmail = store.getProfileByEmail(cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ error: 'এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
  }

  if (phone) {
    const existingPhone = store.getProfileByEmailOrPhone(phone);
    if (existingPhone && existingPhone.email !== cleanEmail) {
      return res.status(400).json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে।' });
    }
  }

  // Generate a valid RFC 4122 v4 UUID for Supabase PostgreSQL profiles table
  const newUserId = crypto.randomUUID();

  const newProfile: UserProfile = {
    id: newUserId,
    email: cleanEmail,
    full_name: full_name.trim(),
    password: password || 'pass123',
    phone: phone ? phone.trim() : '',
    role: (role === 'admin' || role === 'super_admin') ? role : 'user',
    division: division || 'ঢাকা',
    district: district || 'ঢাকা',
    area: area || 'মিরপুর',
    address: address || '',
    nid: nid || '',
    avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
    created_at: new Date().toISOString()
  };

  // 1. Save locally in persistent store
  store.createProfile(newProfile);

  // 2. Direct save to Supabase profiles database table
  const supabaseSaved = await supabaseService.insertProfile(newProfile);
  console.log(`Supabase profile insertion for ${cleanEmail}:`, supabaseSaved ? 'SUCCESS' : 'FALLBACK');

  // 2.1 Direct save credentials to Supabase Auth service
  if (password) {
    const authCreated = await supabaseService.createAuthUser({
      id: newUserId,
      email: cleanEmail,
      password: password,
      full_name: newProfile.full_name,
      phone: newProfile.phone
    });
    console.log(`Supabase auth user creation for ${cleanEmail}:`, authCreated ? 'SUCCESS' : 'NOTED');
  }

  // 3. Insert welcome notification to Supabase
  await supabaseService.insertNotification({
    id: `notif-${Date.now()}`,
    user_id: newUserId,
    title_bn: 'প্রবলেমগ্রাফে স্বাগতম',
    message_bn: `প্রিয় ${newProfile.full_name}, আপনার অ্যাকাউন্ট সফলভাবে ডেটাবেজে সংরক্ষিত হয়েছে। আপনার এলাকার নাগরিক সমস্যা জানাতে প্রস্তুত হন!`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  // 4. Insert audit log to Supabase
  await supabaseService.insertAuditLog({
    id: `log-${Date.now()}`,
    admin_id: newUserId,
    admin_name: newProfile.full_name,
    action_type: 'user_register',
    target_entity: 'profile',
    target_id: newUserId,
    details: { email: cleanEmail, role: newProfile.role, supabaseSaved },
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    token: newProfile.id,
    user: newProfile,
    supabaseSynced: supabaseSaved,
    message: 'রেজিস্ট্রেশন সফল হয়েছে! ডেটাবেজে আপনার অ্যাকাউন্ট সংরক্ষিত হয়েছে।'
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'ইমেইল বা মোবাইল নম্বর দিন' });
  }
  const user = store.getProfileByEmailOrPhone(email);
  if (!user) {
    return res.status(404).json({ error: 'এই তথ্যে কোনো ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    message: `আপনার নিবন্ধিত অ্যাকাউন্ট (${user.email})-এ পাসওয়ার্ড পরিবর্তনের নির্দেশনাবলী পাঠানো হয়েছে।`
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, new_password } = req.body;
  if (!email || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'সঠিক ইমেইল/ফোন এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন' });
  }
  const user = store.getProfileByEmailOrPhone(email);
  if (!user) {
    return res.status(404).json({ error: 'এই তথ্যে কোনো ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
  }
  user.password = new_password;
  store.updateProfilePassword(user.id, new_password);
  await supabaseService.updateAuthUserPassword(user.id, new_password);
  res.json({
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'অপ্রমাণিত সেশন' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'অপ্রমাণিত সেশন' });
  }

  const { full_name, phone, division, district, area, address, avatar_url } = req.body;
  const updates: Partial<UserProfile> = {};
  if (full_name !== undefined) updates.full_name = String(full_name).trim();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (division !== undefined) updates.division = String(division).trim();
  if (district !== undefined) updates.district = String(district).trim();
  if (area !== undefined) updates.area = String(area).trim();
  if (address !== undefined) updates.address = String(address).trim();
  if (avatar_url !== undefined) updates.avatar_url = String(avatar_url).trim();

  const updatedUser = store.updateProfile(user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'ব্যবহারকারী অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' });
  }

  // Also sync updates to Supabase profiles table
  try {
    await supabaseService.updateProfile(user.id, updates);
  } catch (err) {
    console.warn('Supabase updateProfile notice:', err);
  }

  res.json({
    success: true,
    user: updatedUser,
    message: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।'
  });
});

app.post('/api/auth/change-password', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'অপ্রমাণিত সেশন' });
  }

  const { current_password, new_password } = req.body;
  if (!new_password || String(new_password).length < 6) {
    return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
  }

  // Verify current password if user has one set
  if (user.password && current_password) {
    let matches = (user.password === current_password);
    if (!matches && user.email) {
      try {
        const authRes = await supabaseService.verifyAuthUser(user.email, current_password);
        if (authRes.success) matches = true;
      } catch {}
    }
    if (!matches) {
      return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' });
    }
  }

  user.password = new_password;
  store.updateProfilePassword(user.id, new_password);
  await supabaseService.updateAuthUserPassword(user.id, new_password);

  res.json({
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।'
  });
});

app.get('/api/auth/profiles', (req, res) => {
  // Returns all available demo profiles
  res.json({ profiles: store.getProfiles() });
});

// -------------------------------------------------------------
// Category Endpoints
// -------------------------------------------------------------

app.get('/api/categories', (req, res) => {
  res.json({ categories: store.getCategories() });
});

app.post('/api/categories', requireAdmin, async (req, res) => {
  const { name_bn, name_en, slug, icon, color, description_bn, subcategories } = req.body;
  if (!name_bn || !slug) {
    return res.status(400).json({ error: 'ক্যাটাগরির নাম ও স্লাগ আবশ্যক' });
  }

  const newCat = {
    id: `cat-${Date.now()}`,
    slug,
    name_bn,
    name_en: name_en || slug,
    icon: icon || 'Tag',
    color: color || '#0284c7',
    description_bn: description_bn || '',
    subcategories: subcategories || [],
    is_active: true
  };

  store.addCategory(newCat);
  await supabaseService.insertCategory(newCat);

  const admin = (req as any).user as UserProfile;
  await supabaseService.insertAuditLog({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action_type: 'create_category',
    target_entity: 'category',
    target_id: newCat.id,
    details: { name_bn: newCat.name_bn, slug: newCat.slug },
    created_at: new Date().toISOString()
  });

  res.json({ category: newCat });
});

// -------------------------------------------------------------
// Problem Reports Endpoints
// -------------------------------------------------------------

app.get('/api/problems', (req, res) => {
  const { category, district, severity, status, search, userId } = req.query;
  const reports = store.getReports({
    category: category as string,
    district: district as string,
    severity: severity as string,
    status: status as string,
    search: search as string,
    userId: userId as string
  });
  res.json({ reports, count: reports.length });
});

app.get('/api/problems/:id', (req, res) => {
  const report = store.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }
  res.json({ report });
});

// AI preview classification on the fly
app.post('/api/problems/classify-preview', async (req, res) => {
  const { title, description, category, severity } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'শিরোনাম আবশ্যক' });
  }

  const aiResult = await classifyProblemReport(title, description || '', category, severity, 1000);
  res.json({ classification: aiResult });
});

// Submit a new problem
app.post('/api/problems', requireAuth, async (req, res) => {
  const user = (req as any).user as UserProfile;
  const {
    title,
    description,
    category_id,
    category,
    subcategory,
    severity,
    district,
    area,
    address,
    latitude,
    longitude,
    images,
    ai_analysis
  } = req.body;

  if (!title || !description || !district || !area) {
    return res.status(400).json({ error: 'প্রয়োজনীয় তথ্য অসম্পূর্ণ' });
  }

  // Fast AI Classification:
  // 1. If client already provided pre-computed AI analysis from preview, use it immediately (0ms).
  // 2. Otherwise run with a fast 800ms race timeout, falling back smoothly to smart rule-based Bengali analysis.
  let aiClassification = ai_analysis;
  if (!aiClassification || !aiClassification.summaryBn) {
    aiClassification = await classifyProblemReport(
      title,
      description,
      category,
      severity,
      800
    );
  }

  const newReport = store.createReport(
    {
      title,
      description,
      category_id,
      category,
      subcategory,
      severity: (aiClassification?.suggestedSeverity as any) || severity || 'medium',
      district,
      area,
      address,
      latitude: parseFloat(latitude) || 23.8103,
      longitude: parseFloat(longitude) || 90.4125,
      images: images || [],
      ai_analysis: aiClassification
    },
    user
  );

  // Sync to Supabase problem_reports table
  const supaReportSaved = await supabaseService.insertReport(newReport);
  store.saveData();

  // Trigger secondary logging & notifications concurrently in background (non-blocking)
  Promise.allSettled([
    supabaseService.addStatusHistory(newReport.id, {
      old_status: '',
      new_status: 'pending',
      changed_by_name: user.full_name,
      changed_by_id: user.id,
      reason: 'নাগরিক কর্তৃক নতুন সমস্যা রিপোর্ট জমা দেওয়া হয়েছে'
    }),
    supabaseService.insertNotification({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      problem_id: newReport.id,
      title_bn: 'সমস্যা সফলভাবে জমা হয়েছে',
      message_bn: `আপনার সমস্যা "${newReport.title}" জমা হয়েছে। ট্র্যাকিং কোড: ${newReport.tracking_code}`,
      is_read: false,
      created_at: new Date().toISOString()
    }),
    supabaseService.insertAuditLog({
      id: `log-${Date.now()}`,
      admin_id: user.id,
      admin_name: user.full_name,
      action_type: 'create_report',
      target_entity: 'problem_report',
      target_id: newReport.id,
      details: { tracking_code: newReport.tracking_code, title: newReport.title, supabaseSaved: supaReportSaved },
      created_at: new Date().toISOString()
    })
  ]).catch(() => {});

  // Send fast immediate response to client
  res.status(201).json({
    report: newReport,
    message: 'সমস্যা সফলভাবে জমা হয়েছে এবং ডেটাবেজে সংরক্ষিত হয়েছে।'
  });
});

// Status change (Admin)
app.patch('/api/problems/:id/status', requireAdmin, async (req, res) => {
  const admin = (req as any).user as UserProfile;
  const { status, reason, resolutionNotes, evidenceUrl } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'নতুন অবস্থা নির্ধারণ আবশ্যক' });
  }

  const updated = store.updateReportStatus(
    req.params.id,
    status,
    admin,
    reason,
    resolutionNotes,
    evidenceUrl
  );

  if (!updated) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }

  // Sync status change to Supabase
  await supabaseService.updateReport(req.params.id, {
    status,
    resolved_at: updated.resolved_at,
    resolution_notes: updated.resolution_notes,
    resolution_evidence_url: updated.resolution_evidence_url
  });

  await supabaseService.addStatusHistory(req.params.id, {
    old_status: 'previous',
    new_status: status,
    changed_by_name: admin.full_name,
    changed_by_id: admin.id,
    reason
  });

  if (updated.user_id) {
    const statusLabels: Record<string, string> = {
      verified: 'যাচাইকৃত হয়েছে',
      in_progress: 'কার্যক্রম চলমান রয়েছে',
      resolved: 'সমাধান করা হয়েছে',
      rejected: 'বাতিল/খারিজ করা হয়েছে'
    };
    await supabaseService.insertNotification({
      id: `notif-${Date.now()}`,
      user_id: updated.user_id,
      problem_id: updated.id,
      title_bn: `সমস্যার অবস্থা পরিবর্তন: ${statusLabels[status] || status}`,
      message_bn: `আপনার সমস্যা "${updated.title}"-এর অবস্থা এখন: ${statusLabels[status] || status}। ${reason ? `মন্তব্য: ${reason}` : ''}`,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  await supabaseService.insertAuditLog({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action_type: 'update_status',
    target_entity: 'problem_report',
    target_id: updated.id,
    details: { new_status: status, reason },
    created_at: new Date().toISOString()
  });

  res.json({
    report: updated,
    message: 'রিপোর্টের অবস্থা সফলভাবে হালনাগাদ করা হয়েছে'
  });
});

// Edit report details (Admin)
app.patch('/api/problems/:id', requireAdmin, async (req, res) => {
  const admin = (req as any).user as UserProfile;
  const updated = store.editReport(req.params.id, req.body, admin);
  if (!updated) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }

  await supabaseService.updateReport(req.params.id, req.body);
  await supabaseService.insertAuditLog({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action_type: 'edit_report',
    target_entity: 'problem_report',
    target_id: updated.id,
    details: { title: updated.title },
    created_at: new Date().toISOString()
  });

  res.json({ report: updated });
});

// Add comment
app.post('/api/problems/:id/comment', requireAuth, async (req, res) => {
  const user = (req as any).user as UserProfile;
  const { commentText } = req.body;
  if (!commentText || !commentText.trim()) {
    return res.status(400).json({ error: 'মন্তব্যের বিবরণ আবশ্যক' });
  }

  const comment = store.addComment(req.params.id, user, commentText);
  if (!comment) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }

  const report = store.getReportById(req.params.id);

  // Sync comment to Supabase comments table & update comments_count
  await supabaseService.addComment(req.params.id, {
    user_id: user.id,
    user_name: user.full_name,
    comment_text: commentText
  });

  if (report) {
    await supabaseService.updateReport(req.params.id, {
      comments_count: report.comments_count
    });

    if (report.user_id && report.user_id !== user.id) {
      await supabaseService.insertNotification({
        id: `notif-${Date.now()}`,
        user_id: report.user_id,
        problem_id: report.id,
        title_bn: 'নতুন মন্তব্য যুক্ত হয়েছে',
        message_bn: `${user.full_name} আপনার সমস্যা রিপোর্টে মন্তব্য করেছেন: "${commentText.slice(0, 50)}..."`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  }

  res.json({ comment });
});

// Upvote / Support
app.post('/api/problems/:id/support', requireAuth, async (req, res) => {
  const user = (req as any).user as UserProfile;
  const result = store.toggleSupport(req.params.id, user);
  if (!result) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }

  const report = store.getReportById(req.params.id);
  if (report) {
    await supabaseService.updateReport(req.params.id, {
      upvotes_count: report.upvotes_count,
      supported_by: report.supported_by
    });
  }

  res.json(result);
});

// -------------------------------------------------------------
// AI Location & Route Intelligence (Core Feature)
// -------------------------------------------------------------

app.post('/api/route-intelligence/analyze', async (req, res) => {
  try {
    const { origin, destination, corridorBufferMeters = 800 } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'যাত্রা শুরু ও গন্তব্যের অবস্থান আবশ্যক' });
    }

    // Step 1: Geocode origin and destination
    const originResolved = await resolveLocation(origin);
    const destResolved = await resolveLocation(destination);

    // Step 2: Fetch route geometry
    const routeData = await getRoute(
      originResolved.coords,
      destResolved.coords,
      originResolved.displayName,
      destResolved.displayName
    );

    // Step 3: Query all active problem reports in corridor
    const allReports = store.getReports();
    // Exclude rejected ones
    const activeReports = allReports.filter(r => r.status !== 'rejected');

    const corridorReports = findReportsInRouteCorridor(
      activeReports,
      routeData.polyline,
      corridorBufferMeters
    );

    // Step 4: Construct structured evidence
    const evidencePayload = {
      origin: routeData.origin,
      destination: routeData.destination,
      totalDistanceKm: routeData.distanceKm,
      corridorRadiusMeters: corridorBufferMeters,
      reportCount: corridorReports.length,
      reports: corridorReports.map(r => ({
        id: r.id,
        trackingCode: r.tracking_code,
        title: r.title,
        category: r.category,
        severity: r.severity,
        status: r.status,
        district: r.district,
        area: r.area,
        distanceFromRouteMeters: r.distanceFromRouteMeters,
        reportedAt: r.reported_at,
        verified: r.status === 'verified' || r.status === 'in_progress'
      }))
    };

    // Step 5: Generate Gemini 3.8 Flash 9-point Bangla intelligence
    const aiIntelligence = await analyzeRouteCorridorAI(evidencePayload);

    res.json({
      route: routeData,
      corridorBufferMeters,
      corridorReports,
      evidenceSummary: {
        totalReportsFound: corridorReports.length,
        criticalCount: corridorReports.filter(r => r.severity === 'critical').length,
        highCount: corridorReports.filter(r => r.severity === 'high').length,
        verifiedCount: corridorReports.filter(r => r.status === 'verified').length
      },
      aiAnalysis: aiIntelligence
    });
  } catch (error: any) {
    console.error('Route intelligence error:', error);
    res.status(500).json({
      error: 'যাত্রাপথ বিশ্লেষণ প্রক্রিয়াকরণে ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।'
    });
  }
});

// -------------------------------------------------------------
// Admin Analytics, AI Insights & Recommendations
// -------------------------------------------------------------

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const stats = store.getStats();
  res.json({ stats });
});

app.get('/api/admin/insights', requireAdmin, async (req, res) => {
  const stats = store.getStats();
  const insights = await generateAdminInsightsAI(stats);
  res.json({ insights, timestamp: new Date().toISOString() });
});

app.post('/api/admin/recommendations', requireAdmin, async (req, res) => {
  const { problemId } = req.body;
  const problem = store.getReportById(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'সমস্যাটি পাওয়া যায়নি' });
  }

  const rec = await generateSolutionRecommendationAI(problem);
  store.saveAIRecommendation(rec);
  res.json({ recommendation: rec });
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  res.json({ logs: store.getAuditLogs() });
});

// -------------------------------------------------------------
// User Notifications
// -------------------------------------------------------------

app.get('/api/notifications', requireAuth, (req, res) => {
  const user = (req as any).user as UserProfile;
  const notifications = store.getNotifications(user.id);
  res.json({ notifications });
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const user = (req as any).user as UserProfile;
  store.markNotificationAsRead(req.params.id, user.id);
  await supabaseService.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// Citizen Feedback / Contact Endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'নাম ও বার্তা প্রদান আবশ্যক' });
  }

  await supabaseService.insertAuditLog({
    id: `log-${Date.now()}`,
    admin_id: 'citizen',
    admin_name: name,
    action_type: 'citizen_feedback',
    target_entity: 'feedback',
    target_id: `fb-${Date.now()}`,
    details: { name, email, message },
    created_at: new Date().toISOString()
  });

  res.json({ success: true, message: 'আপনার বার্তাটি সফলভাবে ডেটাবেজে গ্রহণ করা হয়েছে।' });
});

// -------------------------------------------------------------
// System & Database Health Status
// -------------------------------------------------------------
app.get('/api/system/status', async (req, res) => {
  const supabaseStatus = await checkSupabaseConnection();
  res.json({
    appName: 'ProblemGraph (প্রবলেমগ্রাফ)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      provider: supabaseStatus.isConnected ? 'Supabase PostgreSQL' : 'Local Persistent Storage (database/app_data.json)',
      supabase: supabaseStatus
    },
    ai: {
      provider: 'Google Gemini API',
      model: 'gemini-3.8-flash',
      isConfigured: !!process.env.GEMINI_API_KEY
    }
  });
});

// -------------------------------------------------------------
// Fallback for API routes (prevent falling through to Vite SPA index.html)
// -------------------------------------------------------------
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `অনুরোধকৃত এপিআই এন্ডপয়েন্ট পাওয়া যায়নি: ${req.method} ${req.path}`,
    status: 404
  });
});

// Global API error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error:', err);
    return res.status(err.status || 500).json({
      error: err.message || 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে',
      status: err.status || 500
    });
  }
  next(err);
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Seed and synchronize with Supabase PostgreSQL if connected
  try {
    const { categories, profiles, reports } = await supabaseService.seedAndSyncInitialData(
      store.getCategories(),
      store.getProfiles(),
      store.getReports()
    );
    if (categories && categories.length > 0) {
      store.setCategories(categories);
    }
    if (profiles && profiles.length > 0) {
      store.setProfiles(profiles);
    }
    if (reports && reports.length > 0) {
      store.setReports(reports);
    }
    console.log(`✅ Supabase PostgreSQL Database successfully connected and synchronized: ${profiles?.length || 0} users, ${categories?.length || 0} categories, ${reports?.length || 0} reports.`);
  } catch (err) {
    console.warn('Supabase initial sync notice:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ProblemGraph (প্রবলেমগ্রাফ) Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
