/**
 * FullscreenToggle — Floating button + keyboard shortcut (F) for fullscreen mode
 */

import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/useFullscreen';

export function FullscreenToggle() {
  const { isFullscreen, toggle } = useFullscreen('f');

  // Hide on unsupported browsers
  if (typeof document !== 'undefined' && !document.documentElement.requestFullscreen) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => toggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
            className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-lg border-border bg-background/80 backdrop-blur hover:bg-secondary shadow-sm"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-mono text-xs">
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} · press{' '}
          <kbd className="px-1 py-0.5 rounded border border-border bg-secondary">F</kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
