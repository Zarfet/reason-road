-- Add share_token column to assessments table
-- When set, the assessment can be viewed publicly via this token
ALTER TABLE public.assessments 
ADD COLUMN share_token uuid DEFAULT NULL;

-- Create index for faster lookups by share_token
CREATE INDEX idx_assessments_share_token ON public.assessments(share_token) 
WHERE share_token IS NOT NULL;

-- Allow public read access when share_token is provided and matches
CREATE POLICY "Public can view shared assessments"
ON public.assessments
FOR SELECT
TO anon
USING (share_token IS NOT NULL);