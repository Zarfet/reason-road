import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded-xl border transition-all duration-200',
        'hover:border-foreground/40',
        selected 
          ? 'border-primary bg-card shadow-nexus-glow' 
          : 'border-border bg-card hover:bg-secondary/50'
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected 
            ? 'border-primary bg-primary' 
            : 'border-muted-foreground/30'
        )}>
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        
        <div className="space-y-1">
          <p className="font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}