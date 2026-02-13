
-- ================================================
-- USER RATING SYSTEM
-- For thesis validation and quality improvement
-- ================================================

CREATE TABLE public.assessment_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Rating (1-5 stars)
  rating INTEGER NOT NULL,
  
  -- Feedback text (optional)
  feedback_text TEXT,
  
  -- Specific feedback categories (optional)
  accuracy_rating INTEGER,
  usefulness_rating INTEGER,
  clarity_rating INTEGER,
  
  -- Would recommend? (NPS-style)
  would_recommend BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(assessment_id)
);

-- Validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_rating_values()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  IF NEW.accuracy_rating IS NOT NULL AND (NEW.accuracy_rating < 1 OR NEW.accuracy_rating > 5) THEN
    RAISE EXCEPTION 'accuracy_rating must be between 1 and 5';
  END IF;
  IF NEW.usefulness_rating IS NOT NULL AND (NEW.usefulness_rating < 1 OR NEW.usefulness_rating > 5) THEN
    RAISE EXCEPTION 'usefulness_rating must be between 1 and 5';
  END IF;
  IF NEW.clarity_rating IS NOT NULL AND (NEW.clarity_rating < 1 OR NEW.clarity_rating > 5) THEN
    RAISE EXCEPTION 'clarity_rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_rating_before_insert
BEFORE INSERT OR UPDATE ON public.assessment_ratings
FOR EACH ROW EXECUTE FUNCTION public.validate_rating_values();

-- Indexes
CREATE INDEX idx_assessment_ratings_assessment ON public.assessment_ratings(assessment_id);
CREATE INDEX idx_assessment_ratings_rating ON public.assessment_ratings(rating);

-- RLS
ALTER TABLE public.assessment_ratings ENABLE ROW LEVEL SECURITY;

-- Users can rate their own assessments
CREATE POLICY "Users can rate own assessments"
ON public.assessment_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() IN (SELECT user_id FROM public.assessments WHERE id = assessment_id)
);

-- Users can view their own ratings
CREATE POLICY "Users can view own ratings"
ON public.assessment_ratings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
ON public.assessment_ratings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
