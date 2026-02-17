/**
 * User Rating Component
 * Collects multi-dimensional feedback for thesis validation.
 * Fields: overall rating, accuracy, clarity, usefulness, would_recommend, feedback_text
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RatingCardProps {
  assessmentId: string;
}

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                s <= (hover || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function RatingCard({ assessmentId }: RatingCardProps) {
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [accuracyRating, setAccuracy] = useState(0);
  const [clarityRating, setClarity] = useState(0);
  const [usefulnessRating, setUsefulness] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

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
          accuracy_rating: accuracyRating || null,
          clarity_rating: clarityRating || null,
          usefulness_rating: usefulnessRating || null,
          would_recommend: wouldRecommend,
          feedback_text: feedbackText.trim() || null,
        });

      if (error) throw error;
      setSubmitted(true);
      setExistingRating(rating);
      toast({ title: 'Thank you!', description: 'Your feedback helps improve NEXUS.' });
    } catch (error) {
      console.error('Rating submission failed:', error);
      toast({ title: 'Error', description: 'Failed to submit rating. Please try again.', variant: 'destructive' });
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
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                s <= (existingRating || rating)
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
      <p className="text-sm text-muted-foreground">How helpful was this assessment?</p>

      {/* Overall star rating */}
      <div className="space-y-1">
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  s <= rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Not helpful</span>
          <span>Very helpful</span>
        </div>
      </div>

      {/* Sub-ratings — only show after overall rating selected */}
      {rating > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground">Optional: rate specific aspects</p>
          <StarRow label="Accuracy" value={accuracyRating} onChange={setAccuracy} />
          <StarRow label="Clarity" value={clarityRating} onChange={setClarity} />
          <StarRow label="Usefulness" value={usefulnessRating} onChange={setUsefulness} />
        </div>
      )}

      {/* Would recommend */}
      {rating > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Would you recommend NEXUS?</p>
          <div className="flex gap-2">
            <Button
              variant={wouldRecommend === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRecommend(wouldRecommend === true ? null : true)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> Yes
            </Button>
            <Button
              variant={wouldRecommend === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRecommend(wouldRecommend === false ? null : false)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" /> No
            </Button>
          </div>
        </div>
      )}

      {/* Free text */}
      {rating > 0 && (
        <div>
          <Textarea
            placeholder="Any additional feedback? (optional)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={2}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{feedbackText.length}/500</p>
        </div>
      )}

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
