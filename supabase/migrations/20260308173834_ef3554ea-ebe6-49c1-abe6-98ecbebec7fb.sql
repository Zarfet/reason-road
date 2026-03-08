
-- Drop the permissive RLS policy that exposes all shared assessments
DROP POLICY IF EXISTS "Public can view shared assessments" ON public.assessments;

-- Create a SECURITY DEFINER function that enforces exact token matching
CREATE OR REPLACE FUNCTION public.get_shared_assessment(p_token UUID)
RETURNS TABLE (id UUID, responses JSONB, paradigm_results JSONB, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.id, a.responses, a.paradigm_results, a.created_at
  FROM public.assessments a
  WHERE a.share_token = p_token AND a.share_token IS NOT NULL;
$$;
