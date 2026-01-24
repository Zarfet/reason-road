-- ============================================================
-- NEXUS - Profiles Table Migration
-- 
-- Purpose: Store extended user profile information
-- Security: RLS enabled - users can only access their own profile
-- Trigger: Auto-creates profile on user signup
-- ============================================================

-- 1. CREATE PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add documentation
COMMENT ON TABLE public.profiles IS 'Extended user profile information for NEXUS users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id) - same as user UUID';
COMMENT ON COLUMN public.profiles.email IS 'User email for display purposes';
COMMENT ON COLUMN public.profiles.full_name IS 'Optional display name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR PROFILES
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile (for signup flow)
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- This trigger runs when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. UPDATE TRIGGER FOR profiles.updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. CREATE INDEX FOR PERFORMANCE
CREATE INDEX idx_profiles_email ON public.profiles(email);