/**
 * Bento Grid Layout System
 * 
 * A responsive CSS Grid-based layout for organizing content
 * into modular containers of varying sizes.
 */

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for bento grid items
 * 12 columns on desktop, 6 on tablet, 1 on mobile
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-6 lg:grid-cols-12',
        className
      )}
    >
      {children}
    </div>
  );
}

type BentoSize = 'small' | 'medium' | 'large' | 'wide';

interface BentoBoxProps {
  children: ReactNode;
  size?: BentoSize;
  className?: string;
}

const sizeClasses: Record<BentoSize, string> = {
  small: 'col-span-1 sm:col-span-2 lg:col-span-4',
  medium: 'col-span-1 sm:col-span-3 lg:col-span-6',
  large: 'col-span-1 sm:col-span-6 lg:col-span-8',
  wide: 'col-span-1 sm:col-span-6 lg:col-span-12',
};

/**
 * Individual bento box container
 * Wraps content in a styled card with responsive column spans
 */
export function BentoBox({ children, size = 'medium', className }: BentoBoxProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm',
        'transition-all duration-200',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

/**
 * Standard header for bento boxes
 */
export function BentoHeader({ title, subtitle, icon }: BentoHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      {icon && (
        <div className="shrink-0 h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
