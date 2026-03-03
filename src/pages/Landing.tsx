/**
 * NEXUS - Landing Page — Tech-Minimalist / Vercel aesthetic
 * Updated: force rebuild
 */

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Target, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="nexus-container pb-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-mono"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Evidence-based interface selection
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Choose the Right Interface Type{' '}
              <span className="font-mono font-bold">with Confidence</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Research-backed interface recommendations for designers. Compare traditional screens, voice, AI, spatial computing, and ambient interfaces based on your project needs.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="gap-2 px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-nexus-glow"
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
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, staggerChildren: 0.1 }}
          >
            <FeatureCard 
              icon={<Target className="h-5 w-5" />}
              title="Values-First Approach"
              description="Start with what matters most: User Control, Efficiency, Accessibility, Sustainability, or Joy."
            />
            <FeatureCard 
              icon={<Shield className="h-5 w-5" />}
              title="DIKW Framework"
              description="9 context questions across Data, Information, Knowledge, and Wisdom layers."
            />
            <FeatureCard 
              icon={<Sparkles className="h-5 w-5" />}
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
            <h2 className="text-3xl font-medium text-foreground tracking-tight">How it works</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard number={1} title="Define Values" description="Rank your 5 core design values" />
              <StepCard number={2} title="Answer Questions" description="9 context questions about your project" />
              <StepCard number={3} title="Get Results" description="Interface recommendation with confidence scores" />
              <StepCard number={4} title="Explore Research" description="Academic papers supporting your choice" />
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="nexus-container py-8">
          <p className="text-sm text-muted-foreground text-center font-mono">
            Built for designers making evidence-based interface decisions
          </p>
        </div>
      </footer>
    </div>
  );
}

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
      className="nexus-card space-y-4 hover:border-foreground/20 transition-colors"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-foreground tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}

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
      <div className="mx-auto h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-sm">
        {number}
      </div>
      <h3 className="font-medium text-foreground tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}