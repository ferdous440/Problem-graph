-- ============================================================================
-- ProblemGraph (প্রবলেমগ্রাফ) PostgreSQL Database Schema
-- Compatible with Supabase PostgreSQL and PostGIS extensions
-- ============================================================================

-- Enable UUID and PostGIS extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "postgis";
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Profiles (ইউজার প্রোফাইল)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    district VARCHAR(100) DEFAULT 'ঢাকা',
    area VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories (সমস্যার ক্যাটাগরি)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    icon VARCHAR(100),
    color VARCHAR(50) DEFAULT '#0284c7',
    description_bn TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Problem Reports (সমস্যা রিপোর্ট)
CREATE TABLE IF NOT EXISTS problem_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(100),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(30) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'in_progress', 'resolved', 'rejected')),
    
    district VARCHAR(100) NOT NULL,
    area VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    upvotes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    
    resolution_notes TEXT,
    resolution_evidence_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Problem Images (সমস্যার ছবি)
CREATE TABLE IF NOT EXISTS problem_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Problem Comments (মন্তব্য)
CREATE TABLE IF NOT EXISTS problem_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Problem Supports / Upvotes (সমর্থন)
CREATE TABLE IF NOT EXISTS problem_supports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(problem_id, user_id)
);

-- 7. Problem Follows (অনুসরণ)
CREATE TABLE IF NOT EXISTS problem_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(problem_id, user_id)
);

-- 8. Problem Verifications (অ্যাডমিন যাচাইকরণ)
CREATE TABLE IF NOT EXISTS problem_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Problem Status History (অবস্থা পরিবর্তনের ইতিহাস)
CREATE TABLE IF NOT EXISTS problem_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Problem Embeddings (ভেক্টর এম্বেডিং)
CREATE TABLE IF NOT EXISTS problem_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID UNIQUE REFERENCES problem_reports(id) ON DELETE CASCADE,
    embedding_text TEXT,
    keywords TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Problem Clusters (সমস্যার ক্লাস্টার)
CREATE TABLE IF NOT EXISTS problem_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION DEFAULT 500,
    report_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Analysis (এআই মূল্যায়ন ও শ্রেণিবিভাগ)
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    suggested_category VARCHAR(150),
    suggested_severity VARCHAR(50),
    urgency_score DOUBLE PRECISION,
    summary_bn TEXT,
    key_entities JSONB,
    potential_hazards JSONB,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI Recommendations (এআই সমাধান সুপারিশ)
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES problem_clusters(id) ON DELETE SET NULL,
    root_cause_bn TEXT,
    impact_assessment_bn TEXT,
    recommended_solution_bn TEXT,
    priority VARCHAR(50),
    target_authority_bn TEXT,
    admin_review_status VARCHAR(50) DEFAULT 'pending_review' CHECK (admin_review_status IN ('pending_review', 'approved', 'modified', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. User Notifications (ব্যবহারকারী নোটিফিকেশন)
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problem_reports(id) ON DELETE CASCADE,
    title_bn VARCHAR(255) NOT NULL,
    message_bn TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Admin Audit Logs (অ্যাডমিন অডিট লগ)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. System Settings (সিস্টেম কনফিগারেশন)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public profile info; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Problem Reports: Anyone can view public reports; authenticated users can insert
CREATE POLICY "Public reports are viewable by everyone" ON problem_reports
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can submit reports" ON problem_reports
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own pending reports" ON problem_reports
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin Audit Logs: Only admins can view
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );
