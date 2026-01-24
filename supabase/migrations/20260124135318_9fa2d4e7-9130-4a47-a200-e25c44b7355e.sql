-- Fix assessments INSERT policy to require authentication
-- This prevents anonymous users from flooding the database with fake assessments

-- Drop the permissive anonymous insert policy
DROP POLICY IF EXISTS "Anyone can create assessments" ON public.assessments;

-- Create new policy requiring authentication
CREATE POLICY "Users can create own assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Make user_id required to prevent orphaned records
ALTER TABLE public.assessments ALTER COLUMN user_id SET NOT NULL;