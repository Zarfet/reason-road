/**
 * User Rating Component
 * 
 * Collects feedback on recommendation quality for thesis validation
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RatingCardProps {
  assessmentId: string;
}

export function RatingCard({ assessmentId }: RatingCardProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  // Check for existing rating
  useEffect(() => {
    async function checkExisting() {
      const { data } = await supabase
        .from('assessment_ratings')
        .select('rating')
        .eq('assessment_id', assessmentId)
        .maybeSingle();
      
      if (data) {
        setExistingRating(data.rating);
        setSubmitted(true);
      }
    }
    checkExisting();
  }, [assessmentId]);

  async function handleSubmit() {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('assessment_ratings')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          rating,
          feedback_text: feedbackText.trim() || null,
        });

      if (error) throw error;

      setSubmitted(true);
      setExistingRating(rating);
      toast({
        title: 'Thank you!',
        description: 'Your feedback helps improve NEXUS.',
      });
    } catch (error) {
      console.error('Rating submission failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Check className="h-5 w-5 text-accent" />
        </div>
        <p className="text-sm font-medium text-foreground">Thank you for your feedback!</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= (existingRating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        How helpful was this assessment?
      </p>

      {/* Star Rating */}
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Not helpful</span>
        <span>Very helpful</span>
      </div>

      {/* Optional Feedback */}
      <div>
        <Textarea
          placeholder="Any additional feedback? (optional)"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={2}
          maxLength={500}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {feedbackText.length}/500
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full"
        variant="outline"
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </div>
  );
}
