-- Create profiles table with comprehensive user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  date_of_birth DATE NOT NULL,
  
  -- Profile Details
  profile_created_for TEXT NOT NULL CHECK (profile_created_for IN ('myself', 'my_son', 'my_daughter', 'my_brother', 'my_sister', 'my_friend', 'my_relative')),
  religion TEXT,
  community TEXT,
  living_in TEXT,
  
  -- Physical Attributes
  height TEXT,
  weight TEXT,
  body_type TEXT,
  complexion TEXT,
  
  -- Professional Information
  education TEXT,
  profession TEXT,
  company TEXT,
  annual_income TEXT,
  
  -- Family Information
  father_name TEXT,
  mother_name TEXT,
  siblings TEXT,
  family_type TEXT,
  family_status TEXT,
  
  -- Lifestyle
  diet TEXT,
  smoking TEXT,
  drinking TEXT,
  hobbies TEXT[],
  
  -- About
  about_me TEXT,
  partner_expectations TEXT,
  
  -- Profile Media
  profile_photo TEXT,
  photo_gallery TEXT[],
  
  -- Social Media
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  
  -- Profile Status
  profile_completion INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  membership_plan TEXT DEFAULT 'free' CHECK (membership_plan IN ('free', 'premium', 'vip')),
  
  -- Engagement Metrics
  profile_views INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  interests_received INTEGER DEFAULT 0,
  clicks_received INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_living_in ON profiles(living_in);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
