/**
 * Share Button Component
 * 
 * Allows users to generate/copy a public share link for their assessment
 */

import { useState } from 'react';
import { Share2, Link2, Check, Loader2, Link2Off } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  assessmentId: string;
  initialShareToken?: string | null;
}

export function ShareButton({ assessmentId, initialShareToken }: ShareButtonProps) {
  const { toast } = useToast();
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken 
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

  const handleEnableSharing = async () => {
    setLoading(true);
    try {
      const newToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from('assessments')
        .update({ share_token: newToken })
        .eq('id', assessmentId);

      if (error) {
        throw error;
      }

      setShareToken(newToken);
      toast({
        title: 'Sharing enabled',
        description: 'Your assessment can now be shared via link.',
      });
    } catch (err) {
      console.error('Error enabling sharing:', err);
      toast({
        title: 'Error',
        description: 'Could not enable sharing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ share_token: null })
        .eq('id', assessmentId);

      if (error) {
        throw error;
      }

      setShareToken(null);
      toast({
        title: 'Sharing disabled',
        description: 'The share link has been deactivated.',
      });
    } catch (err) {
      console.error('Error disabling sharing:', err);
      toast({
        title: 'Error',
        description: 'Could not disable sharing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Share Assessment</h4>
            <p className="text-xs text-muted-foreground">
              {shareToken 
                ? 'Anyone with this link can view your assessment results.'
                : 'Generate a public link to share your results.'}
            </p>
          </div>

          {shareToken ? (
            <div className="space-y-3">
              {/* Share URL */}
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs bg-muted p-2 rounded truncate font-mono">
                  {shareUrl}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={handleCopyLink}
                  disabled={loading}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Disable sharing */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDisableSharing}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2Off className="h-4 w-4 mr-2" />
                )}
                Disable Sharing
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full gap-2"
              onClick={handleEnableSharing}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Generate Share Link
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
