CREATE POLICY "Admins can delete assessments"
ON public.assessments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));