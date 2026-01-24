-- Create assessments table for storing wizard responses
CREATE TABLE public.assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB DEFAULT '{}'::jsonb,
    paradigm_results JSONB DEFAULT '{}'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    time_to_complete_seconds INTEGER,
    pdf_downloaded BOOLEAN DEFAULT false,
    agreement_rating INTEGER CHECK (agreement_rating >= 1 AND agreement_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE public.assessments IS 'Stores user assessment responses and paradigm results from the NEXUS wizard';

-- Enable Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create an assessment (allows anonymous usage)
CREATE POLICY "Anyone can create assessments"
ON public.assessments
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own assessments (by user_id)
CREATE POLICY "Users can view own assessments"
ON public.assessments
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own assessments
CREATE POLICY "Users can update own assessments"
ON public.assessments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
ON public.assessments
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user lookups
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);