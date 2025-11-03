-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  specs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'pdf')) DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  path TEXT,
  meta JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_analytics table
CREATE TABLE IF NOT EXISTS app_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id TEXT,
  event_type TEXT NOT NULL,
  path TEXT,
  meta JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_logs table
CREATE TABLE IF NOT EXISTS app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT CHECK (level IN ('info', 'warn', 'error')) DEFAULT 'info',
  message TEXT NOT NULL,
  stack_trace JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_user_id ON app_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON app_logs(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Allow public read access to device management tables
CREATE POLICY "Allow public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read models" ON models FOR SELECT USING (true);
CREATE POLICY "Allow public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Allow public read urls" ON urls FOR SELECT USING (true);

-- Allow admin write access (via role check)
CREATE POLICY "Allow admin write brands" ON brands FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update brands" ON brands FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete brands" ON brands FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Allow admin write models" ON models FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update models" ON models FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete models" ON models FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Allow admin write categories" ON categories FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update categories" ON categories FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete categories" ON categories FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Allow admin write tags" ON tags FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update tags" ON tags FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete tags" ON tags FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Allow admin write media" ON media FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update media" ON media FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete media" ON media FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Allow admin write urls" ON urls FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin update urls" ON urls FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Allow admin delete urls" ON urls FOR DELETE USING (auth.jwt() ->> 'role' = 'authenticated');
