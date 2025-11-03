-- Create app_logs table for application error tracking and debugging
CREATE TABLE public.app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('Critical', 'Urgent', 'Shutdown', 'Error', 'Warning', 'Info', 'Debug')),
  message TEXT NOT NULL,
  stack_trace JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_app_logs_level ON public.app_logs(level);
CREATE INDEX idx_app_logs_timestamp ON public.app_logs(timestamp);
CREATE INDEX idx_app_logs_user_id ON public.app_logs(user_id);
CREATE INDEX idx_app_logs_page_path ON public.app_logs(page_path);
CREATE INDEX idx_app_logs_level_timestamp ON public.app_logs(level, timestamp DESC);

-- Enable RLS
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
CREATE POLICY "Admins can read all logs" ON public.app_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow authenticated users to read their own logs
CREATE POLICY "Users can read their own logs" ON public.app_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Allow app to insert logs (authenticated users)
CREATE POLICY "Authenticated users can insert logs" ON public.app_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
