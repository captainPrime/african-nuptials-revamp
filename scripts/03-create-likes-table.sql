-- Create table to track likes between users
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(liker_id, liked_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON likes(liked_id);

-- Enable Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view likes they gave or received
CREATE POLICY "Users can view their likes"
  ON likes FOR SELECT
  USING (liker_id = auth.uid() OR liked_id = auth.uid());

-- Policy: Users can insert their own likes
CREATE POLICY "Users can insert their own likes"
  ON likes FOR INSERT
  WITH CHECK (liker_id = auth.uid());

-- Policy: Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (liker_id = auth.uid());
