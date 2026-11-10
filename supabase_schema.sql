-- ==============================================================
-- ProblemGraph (প্রবলেমগ্রাফ) Supabase Database Schema
-- Run this script in your Supabase Project -> SQL Editor
-- ==============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    division TEXT,
    district TEXT,
    area TEXT,
    address TEXT,
    nid TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_bn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description_bn TEXT,
    subcategories TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Problem Reports Table
CREATE TABLE IF NOT EXISTS public.problem_reports (
    id TEXT PRIMARY KEY DEFAULT ('PG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(uuid_generate_v4()::text, 1, 6)),
    tracking_code TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    category_id TEXT REFERENCES public.categories(id),
    category TEXT NOT NULL,
    subcategory TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'in_progress', 'resolved', 'rejected')),
    district TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    upvotes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    images TEXT[] DEFAULT '{}',
    resolution_notes TEXT,
    resolution_evidence_url TEXT,
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    supported_by TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id TEXT NOT NULL REFERENCES public.problem_reports(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Status History Table
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id TEXT NOT NULL REFERENCES public.problem_reports(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by_id TEXT NOT NULL,
    changed_by_name TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    problem_id TEXT,
    title_bn TEXT NOT NULL,
    message_bn TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.problem_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.problem_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_district ON public.problem_reports(district);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.problem_reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.problem_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_problem ON public.comments(problem_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for problem reports
CREATE POLICY "Public reports viewable by everyone" 
ON public.problem_reports FOR SELECT USING (is_public = true);

-- Users can insert their own reports
CREATE POLICY "Authenticated users can submit reports" 
ON public.problem_reports FOR INSERT WITH CHECK (true);
