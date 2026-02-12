/**
 * Supporting Research & Case Studies Section
 * 
 * Bottom bento grid showing research stats and real-world examples
 */

import { BookOpen, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getTotalCitationCount } from '@/lib/citations';

export function SupportingResearchSection() {
  const citationCount = getTotalCitationCount();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Supporting Research */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Supporting Research</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          All arguments above are backed by academic research and industry studies. Citations are provided inline for verification.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-accent" />
            <span className="font-medium">{citationCount} research sources referenced</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span>All sources peer-reviewed or industry-standard</span>
          </div>
        </div>
      </Card>
      
      {/* Case Studies */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Example Case Studies</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Real-world examples of successful and failed interface paradigm implementations.
        </p>
        
        <div className="space-y-3">
          <div className="p-3 rounded-md bg-accent/5 border border-accent/15">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-sm font-medium">Spotify (Traditional Screen)</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              Visual browsing + algorithmic discovery = 80% user retention
            </p>
          </div>
          
          <div className="p-3 rounded-md bg-accent/5 border border-accent/15">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-sm font-medium">Nest (Invisible Automation)</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              Learning thermostat saves 10-12% energy without user intervention
            </p>
          </div>
          
          <div className="p-3 rounded-md bg-destructive/5 border border-destructive/15">
            <div className="flex items-center gap-1.5 mb-1">
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-sm font-medium">Google Glass (Spatial AR)</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              Privacy concerns + social stigma led to consumer discontinuation
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
