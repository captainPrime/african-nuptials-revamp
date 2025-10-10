-- Create table to track profile views over time
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profile_id, viewer_id, DATE(viewed_at))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

-- Enable Row Level Security
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile views
CREATE POLICY "Users can view their own profile views"
  ON profile_views FOR SELECT
  USING (profile_id = auth.uid());

-- Policy: Anyone can insert profile views
CREATE POLICY "Anyone can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);
