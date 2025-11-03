-- Create error_notes table
CREATE TABLE public.error_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  error_code TEXT NOT NULL,
  note TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_error_notes_system_name ON public.error_notes(system_name);
CREATE INDEX idx_error_notes_error_code ON public.error_notes(error_code);
CREATE INDEX idx_error_notes_user_id ON public.error_notes(user_id);
CREATE INDEX idx_error_notes_system_error ON public.error_notes(system_name, error_code);

-- Enable RLS
ALTER TABLE public.error_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own notes
CREATE POLICY "Users can read their own notes" ON public.error_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own notes
CREATE POLICY "Users can insert their own notes" ON public.error_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own notes" ON public.error_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own notes
CREATE POLICY "Users can update their own notes" ON public.error_notes
  FOR UPDATE USING (auth.uid() = user_id);
