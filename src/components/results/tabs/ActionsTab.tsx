/**
 * Actions Tab - Download, share, save, and start new
 */

import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Save, 
  RefreshCw,
  FileText,
  Link2,
  User,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { Button } from '@/components/ui/button';
import { ShareButton } from '../ShareButton';
import { RatingCard } from '../RatingCard';

interface ActionsTabProps {
  onDownloadPDF: () => void;
  onStartOver: () => void;
  savedAssessmentId: string | null;
}

export function ActionsTab({ onDownloadPDF, onStartOver, savedAssessmentId }: ActionsTabProps) {
  return (
    <BentoGrid className="mt-6">
      {/* Download PDF - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Download Report" 
          subtitle="Generate a comprehensive PDF"
          icon={<FileText className="h-5 w-5 text-accent" />}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Get a detailed PDF report with all recommendations, reasoning, and implementation guidance.
          </p>
          <Button 
            onClick={onDownloadPDF}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </motion.div>
      </BentoBox>

      {/* Share Link - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Share Results" 
          subtitle="Generate a public link"
          icon={<Link2 className="h-5 w-5 text-accent" />}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Share your assessment results with team members or stakeholders via a secure link.
          </p>
          {savedAssessmentId ? (
            <ShareButton assessmentId={savedAssessmentId} />
          ) : (
            <Button variant="outline" className="w-full gap-2" disabled>
              <Share2 className="h-4 w-4" />
              Saving assessment...
            </Button>
          )}
        </motion.div>
      </BentoBox>

      {/* Rate This Assessment - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Rate This Assessment" 
          subtitle="Help improve NEXUS"
          icon={<MessageSquare className="h-5 w-5 text-accent" />}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          {savedAssessmentId ? (
            <RatingCard assessmentId={savedAssessmentId} />
          ) : (
            <p className="text-sm text-muted-foreground">Saving assessment...</p>
          )}
        </motion.div>
      </BentoBox>

      {/* Save to Profile - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Saved to Profile" 
          subtitle="Access anytime from your account"
          icon={<User className="h-5 w-5 text-accent" />}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Your assessment has been automatically saved to your profile for future reference.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <Save className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Assessment saved</span>
          </div>
        </motion.div>
      </BentoBox>

      {/* Start New - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="New Assessment" 
          subtitle="Start fresh with a different project"
          icon={<Sparkles className="h-5 w-5 text-accent" />}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Ready to evaluate another project? Start a new assessment with fresh inputs.
          </p>
          <Button 
            onClick={onStartOver}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <RefreshCw className="h-4 w-4" />
            Run Another Assessment
          </Button>
        </motion.div>
      </BentoBox>
    </BentoGrid>
  );
}
