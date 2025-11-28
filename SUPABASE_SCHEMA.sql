-- ============================================
-- KUCCPS Course Checker - Complete Database Schema
-- ============================================
-- Database: Supabase (PostgreSQL)
-- Version: 1.0
-- Last Updated: December 2024
-- ============================================

-- ============================================
-- CHATBOT TABLES
-- ============================================

-- Chatbot Settings Table
-- Stores global chatbot configuration
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  welcome_message TEXT DEFAULT 'Hello! How can I help you with your course selection today?',
  response_tone VARCHAR(50) DEFAULT 'friendly',
  model VARCHAR(100) DEFAULT 'openai/gpt-3.5-turbo',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 150,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT temperature_range CHECK (temperature >= 0 AND temperature <= 2),
  CONSTRAINT max_tokens_positive CHECK (max_tokens > 0)
);

-- Chatbot API Key Table
-- Stores OpenRouter API credentials
CREATE TABLE IF NOT EXISTS chatbot_api_key (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL,
  provider VARCHAR(50) DEFAULT 'openrouter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT api_key_not_empty CHECK (LENGTH(api_key) > 0)
);

-- Chatbot Contexts Table
-- Stores training data files for chatbot
CREATE TABLE IF NOT EXISTS chatbot_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT file_name_not_empty CHECK (LENGTH(file_name) > 0),
  CONSTRAINT content_not_empty CHECK (LENGTH(content) > 0)
);

-- Chatbot History Table
-- Stores all chatbot conversations
CREATE TABLE IF NOT EXISTS chatbot_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  result_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT prompt_not_empty CHECK (LENGTH(prompt) > 0),
  CONSTRAINT response_not_empty CHECK (LENGTH(response) > 0)
);

-- Create indexes for chatbot tables
CREATE INDEX idx_chatbot_history_session ON chatbot_history(session_id);
CREATE INDEX idx_chatbot_history_timestamp ON chatbot_history(timestamp DESC);
CREATE INDEX idx_chatbot_contexts_active ON chatbot_contexts(is_active) WHERE is_active = true;

-- ============================================
-- COURSE TABLES (-- GUESS --)
-- These tables are inferred and need verification
-- ============================================

-- Degree Programmes Table
-- Stores all university degree programs
CREATE TABLE IF NOT EXISTS degree_programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  cluster_subjects TEXT[] NOT NULL,
  minimum_points DECIMAL(5,2) NOT NULL,
  maximum_points DECIMAL(5,2),
  category VARCHAR(50) DEFAULT 'University',
  duration_years INTEGER,
  entry_requirements TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT points_positive CHECK (minimum_points >= 0),
  CONSTRAINT max_greater_than_min CHECK (maximum_points IS NULL OR maximum_points >= minimum_points),
  CONSTRAINT duration_positive CHECK (duration_years IS NULL OR duration_years > 0)
);

-- Diploma Programmes Table
-- Stores all diploma programs
CREATE TABLE IF NOT EXISTS diploma_programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  cluster_subjects TEXT[] NOT NULL,
  minimum_mean_grade VARCHAR(3) NOT NULL,
  minimum_points DECIMAL(5,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'TVET',
  duration_years INTEGER,
  entry_requirements TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT points_positive CHECK (minimum_points >= 0),
  CONSTRAINT duration_positive CHECK (duration_years IS NULL OR duration_years > 0)
);

-- Certificate Programmes Table
-- Stores all certificate programs
CREATE TABLE IF NOT EXISTS certificate_programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  minimum_mean_grade VARCHAR(3) NOT NULL,
  minimum_points DECIMAL(5,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'TVET',
  duration_months INTEGER,
  entry_requirements TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT points_positive CHECK (minimum_points >= 0),
  CONSTRAINT duration_positive CHECK (duration_months IS NULL OR duration_months > 0)
);

-- KMTC Programmes Table
-- Stores Kenya Medical Training College programs
CREATE TABLE IF NOT EXISTS kmtc_programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  campus TEXT NOT NULL,
  cluster_subjects TEXT[] NOT NULL,
  minimum_mean_grade VARCHAR(3) NOT NULL,
  minimum_cluster_points DECIMAL(5,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'KMTC',
  duration_years INTEGER,
  entry_requirements TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT points_positive CHECK (minimum_cluster_points >= 0),
  CONSTRAINT duration_positive CHECK (duration_years IS NULL OR duration_years > 0)
);

-- Artisan Programmes Table
-- Stores artisan/vocational programs
CREATE TABLE IF NOT EXISTS artisan_programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  minimum_mean_grade VARCHAR(3) NOT NULL,
  category VARCHAR(50) DEFAULT 'Artisan',
  duration_months INTEGER,
  entry_requirements TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT duration_positive CHECK (duration_months IS NULL OR duration_months > 0)
);

-- Create indexes for course tables
CREATE INDEX idx_degree_institution ON degree_programmes(institution);
CREATE INDEX idx_degree_points ON degree_programmes(minimum_points);
CREATE INDEX idx_degree_active ON degree_programmes(is_active) WHERE is_active = true;

CREATE INDEX idx_diploma_institution ON diploma_programmes(institution);
CREATE INDEX idx_diploma_mean_grade ON diploma_programmes(minimum_mean_grade);
CREATE INDEX idx_diploma_active ON diploma_programmes(is_active) WHERE is_active = true;

CREATE INDEX idx_certificate_institution ON certificate_programmes(institution);
CREATE INDEX idx_certificate_active ON certificate_programmes(is_active) WHERE is_active = true;

CREATE INDEX idx_kmtc_campus ON kmtc_programmes(campus);
CREATE INDEX idx_kmtc_active ON kmtc_programmes(is_active) WHERE is_active = true;

CREATE INDEX idx_artisan_institution ON artisan_programmes(institution);
CREATE INDEX idx_artisan_active ON artisan_programmes(is_active) WHERE is_active = true;

-- ============================================
-- NEWS TABLES (-- RECOMMENDED --)
-- Currently using localStorage, recommended to add
-- ============================================

-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category VARCHAR(50) NOT NULL,
  author VARCHAR(255) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT category_valid CHECK (category IN ('Education', 'Technology', 'Business', 'Lifestyle'))
);

-- News Likes Table
CREATE TABLE IF NOT EXISTS news_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug VARCHAR(255) NOT NULL,
  user_identifier VARCHAR(255) NOT NULL, -- IP or session ID
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(article_slug, user_identifier)
);

-- News Comments Table
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  comment_text TEXT NOT NULL,
  user_identifier VARCHAR(255) NOT NULL, -- IP or session ID
  commented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  
  CONSTRAINT comment_not_empty CHECK (LENGTH(comment_text) > 0)
);

-- Create indexes for news tables
CREATE INDEX idx_news_slug ON news_articles(slug);
CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_published ON news_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_news_likes_article ON news_likes(article_slug);
CREATE INDEX idx_news_comments_article ON news_comments(article_slug);
CREATE INDEX idx_news_comments_time ON news_comments(commented_at DESC);

-- ============================================
-- ADMIN TABLES (-- RECOMMENDED --)
-- For admin user management and roles
-- ============================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id),
  CONSTRAINT role_valid CHECK (role IN ('admin', 'super_admin', 'moderator'))
);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_time ON admin_activity_log(created_at DESC);

-- ============================================
-- PAYMENT TABLES (-- RECOMMENDED --)
-- For tracking payment transactions
-- ============================================

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'mpesa',
  result_id VARCHAR(255), -- Link to course check session
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT status_valid CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_phone ON payments(phone_number);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for chatbot contexts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chatbot-contexts', 'chatbot-contexts', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_api_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE degree_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diploma_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kmtc_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Chatbot tables - Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users" ON chatbot_settings 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON chatbot_api_key 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON chatbot_contexts 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON chatbot_history 
  FOR ALL TO authenticated USING (true);

-- Course tables - Public read, admin write
CREATE POLICY "Public can view active courses" ON degree_programmes 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON degree_programmes 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Public can view active courses" ON diploma_programmes 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON diploma_programmes 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Public can view active courses" ON certificate_programmes 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON certificate_programmes 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Public can view active courses" ON kmtc_programmes 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON kmtc_programmes 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Public can view active courses" ON artisan_programmes 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON artisan_programmes 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- News tables - Public read, admin write
CREATE POLICY "Public can view published articles" ON news_articles 
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage articles" ON news_articles 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Anyone can like articles" ON news_likes 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view likes" ON news_likes 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can comment" ON news_comments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view approved comments" ON news_comments 
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage comments" ON news_comments 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admin tables - Admins only
CREATE POLICY "Admins can view admin users" ON admin_users 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users" ON admin_users 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
        AND admin_users.role = 'super_admin' 
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can view activity log" ON admin_activity_log 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Payment tables - Admins can view, system can insert
CREATE POLICY "Admins can view payments" ON payments 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Service role can manage payments" ON payments 
  FOR ALL TO service_role USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_chatbot_settings_updated_at
    BEFORE UPDATE ON chatbot_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_api_key_updated_at
    BEFORE UPDATE ON chatbot_api_key
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_degree_programmes_updated_at
    BEFORE UPDATE ON degree_programmes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diploma_programmes_updated_at
    BEFORE UPDATE ON diploma_programmes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_programmes_updated_at
    BEFORE UPDATE ON certificate_programmes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kmtc_programmes_updated_at
    BEFORE UPDATE ON kmtc_programmes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artisan_programmes_updated_at
    BEFORE UPDATE ON artisan_programmes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default chatbot settings
INSERT INTO chatbot_settings (enabled, welcome_message, response_tone, model, temperature, max_tokens)
VALUES (true, 'Hello! How can I help you with your course selection today?', 'friendly', 'openai/gpt-3.5-turbo', 0.7, 150)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- ============================================
-- END OF SCHEMA
-- ============================================
