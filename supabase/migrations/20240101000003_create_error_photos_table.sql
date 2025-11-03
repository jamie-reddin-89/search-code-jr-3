-- Create error_photos table
CREATE TABLE public.error_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  error_code TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_error_photos_system_name ON public.error_photos(system_name);
CREATE INDEX idx_error_photos_error_code ON public.error_photos(error_code);
CREATE INDEX idx_error_photos_user_id ON public.error_photos(user_id);
CREATE INDEX idx_error_photos_system_error ON public.error_photos(system_name, error_code);
CREATE INDEX idx_error_photos_storage_path ON public.error_photos(storage_path);

-- Enable RLS
ALTER TABLE public.error_photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own photos
CREATE POLICY "Users can read their own photos" ON public.error_photos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own photos
CREATE POLICY "Users can insert their own photos" ON public.error_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON public.error_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own photos
CREATE POLICY "Users can update their own photos" ON public.error_photos
  FOR UPDATE USING (auth.uid() = user_id);
