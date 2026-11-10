import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { store, UserProfile } from './server/store.js';
import {
  classifyProblemReport,
  analyzeRouteCorridorAI,
  generateAdminInsightsAI,
  generateSolutionRecommendationAI
} from './server/gemini.js';
import {
  resolveLocation,
  getRoute,
  findReportsInRouteCorridor
} from './server/routing.js';

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

app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'ইমেইল দেওয়া আবশ্যক' });
  }

  let user = store.getProfileByEmail(email);
  if (!user && role) {
    // Demo login switcher
    const users = store.getProfiles();
    user = users.find(u => u.role === role) || users[0];
  }

  if (!user) {
    return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
  }

  // Session token is the user ID
  res.json({
    token: user.id,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, phone, district, area } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'নাম ও ইমেইল আবশ্যক' });
  }

  const existing = store.getProfileByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট তৈরি করা আছে' });
  }

  const newProfile: UserProfile = {
    id: `user-${Date.now()}`,
    email,
    full_name,
    phone: phone || '',
    role: 'user',
    district: district || 'ঢাকা',
    area: area || 'মিরপুর',
    is_verified: true,
    created_at: new Date().toISOString()
  };

  store.createProfile(newProfile);

  res.json({
    token: newProfile.id,
    user: newProfile
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'অপ্রমাণিত সেশন' });
  }
  res.json({ user });
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

app.post('/api/categories', requireAdmin, (req, res) => {
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

  const aiResult = await classifyProblemReport(title, description || '', category, severity);
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
    images
  } = req.body;

  if (!title || !description || !district || !area) {
    return res.status(400).json({ error: 'প্রয়োজনীয় তথ্য অসম্পূর্ণ' });
  }

  // Trigger Gemini AI classification
  const aiClassification = await classifyProblemReport(
    title,
    description,
    category,
    severity
  );

  const newReport = store.createReport(
    {
      title,
      description,
      category_id,
      category,
      subcategory,
      severity,
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

  res.status(201).json({
    report: newReport,
    message: 'সমস্যা সফলভাবে জমা হয়েছে। এআই প্রাথমিক পর্যালোচনা সম্পন্ন করেছে।'
  });
});

// Status change (Admin)
app.patch('/api/problems/:id/status', requireAdmin, (req, res) => {
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

  res.json({
    report: updated,
    message: 'রিপোর্টের অবস্থা সফলভাবে হালনাগাদ করা হয়েছে'
  });
});

// Edit report details (Admin)
app.patch('/api/problems/:id', requireAdmin, (req, res) => {
  const admin = (req as any).user as UserProfile;
  const updated = store.editReport(req.params.id, req.body, admin);
  if (!updated) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }
  res.json({ report: updated });
});

// Add comment
app.post('/api/problems/:id/comment', requireAuth, (req, res) => {
  const user = (req as any).user as UserProfile;
  const { commentText } = req.body;
  if (!commentText || !commentText.trim()) {
    return res.status(400).json({ error: 'মন্তব্যের বিবরণ আবশ্যক' });
  }

  const comment = store.addComment(req.params.id, user, commentText);
  if (!comment) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
  }

  res.json({ comment });
});

// Upvote / Support
app.post('/api/problems/:id/support', requireAuth, (req, res) => {
  const user = (req as any).user as UserProfile;
  const result = store.toggleSupport(req.params.id, user);
  if (!result) {
    return res.status(404).json({ error: 'রিপোর্টটি পাওয়া যায়নি' });
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

app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
  const user = (req as any).user as UserProfile;
  store.markNotificationAsRead(req.params.id, user.id);
  res.json({ success: true });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ProblemGraph (প্রবলেমগ্রাফ) Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
