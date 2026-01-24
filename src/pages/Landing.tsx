/**
 * NEXUS - Landing Page
 * 
 * Purpose: Home page introducing the NEXUS assessment tool
 * 
 * Features:
 * - Hero section with value proposition
 * - Feature cards highlighting key benefits
 * - Step-by-step process overview
 * - Auth-aware CTA button
 * 
 * SEO:
 * - H1 contains main keyword
 * - Semantic HTML structure
 * - Descriptive content
 * 
 * Auth Integration:
 * - Checks if user is logged in
 * - CTA changes based on auth state:
 *   - Logged in: "Continue to Assessment" → /assessment
 *   - Not logged in: "Start Assessment" → /auth
 * 
 * Dependencies: framer-motion, react-router-dom, useAuth hook
 */

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Target, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

/**
 * Landing page component
 * Main entry point for the NEXUS application
 */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  /**
   * Handle CTA button click
   * Navigates to assessment (auth handled by ProtectedRoute)
   */
  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar with auth state */}
      <Navbar />

      {/* Hero Section */}
      <main className="nexus-container pb-20">
        <section className="py-16 md:py-24">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nexus-emerald-light text-foreground text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-accent" />
              Evidence-based interface selection
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Stop Losing{' '}
              <span className="text-gradient-emerald">$1.7B</span>
              {' '}on Wrong Interface Choices
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Evidence-based paradigm selection in 5 minutes. Get a multi-modal recommendation backed by 47+ research papers.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="gap-2 px-8 py-6 text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
                onClick={handleStartAssessment}
                disabled={loading}
              >
                {loading ? 'Loading...' : user ? 'Continue to Assessment' : 'Start Assessment'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="sr-only">Key Features</h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, staggerChildren: 0.1 }}
          >
            <FeatureCard 
              icon={<Target className="h-6 w-6" />}
              title="Values-First Approach"
              description="Start with what matters most: User Control, Efficiency, Accessibility, Sustainability, or Joy."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="DIKW Framework"
              description="9 context questions across Data, Information, Knowledge, and Wisdom layers."
            />
            <FeatureCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="Multi-Modal Output"
              description="Get percentage-based recommendations for Traditional, Voice, AI, Spatial, and Invisible interfaces."
            />
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <motion.div 
            className="text-center space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-3xl font-semibold text-foreground">How it works</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard number={1} title="Define Values" description="Rank your 5 core design values" />
              <StepCard number={2} title="Answer Questions" description="9 context questions about your project" />
              <StepCard number={3} title="Get Results" description="Multi-modal paradigm recommendation" />
              <StepCard number={4} title="Explore Research" description="Academic papers supporting your choice" />
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="nexus-container py-8">
          <p className="text-sm text-muted-foreground text-center">
            Built for designers making evidence-based interface decisions
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Feature card component for highlighting key benefits
 * 
 * @param icon - Lucide icon component
 * @param title - Feature title
 * @param description - Feature description
 */
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <motion.div 
      className="nexus-card space-y-4"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

/**
 * Step card component for the process overview
 * 
 * @param number - Step number (1-4)
 * @param title - Step title
 * @param description - Step description
 */
function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
        {number}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
