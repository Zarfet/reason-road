-- Add DELETE policy for profiles table to allow users to delete their own profile
-- Required for GDPR compliance - users must be able to delete their personal data

CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);