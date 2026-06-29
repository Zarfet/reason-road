import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useAssessment } from '@/context/AssessmentContext';
import { DEMO_SCENARIOS_FAILED, DEMO_SCENARIOS_SUCCEEDED, DEMO_SCENARIO_ANA, type DemoScenario } from '@/data/demoScenarios';
import type { AssessmentAnswers } from '@/types/assessment';

const SCENARIO_IMAGES: Record<string, string> = {
  'google-glass':      '/demo/images/01 Google Glass.png',
  'humane-ai-pin':     '/demo/images/02 Human AI.png',
  'rabbit-r1':         '/demo/images/03 Rabbit R1.png',
  'fire-phone':        '/demo/images/04 Fire Phone.png',
  'clippy':            '/demo/images/05 Clippy.png',
  'apple-vision-pro':  '/demo/images/06 Apple Vision Pro.png',
  'kindle':            '/demo/images/07 Kindle.png',
  'notion':            '/demo/images/08 Notion.png',
  'iphone-original':   '/demo/images/09 iPhone Original.png',
  'rayban-meta':       '/demo/images/10 Rayban Meta.png',
  'ana-garcia':        '/demo/images/11 Ana Garcia.png',
};

interface ScenarioCardProps {
  scenario: DemoScenario;
  index: number;
  onClick: () => void;
}

function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  return (
    <motion.div
      className="nexus-card cursor-pointer hover:border-foreground/20 transition-colors overflow-hidden p-0"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <img
        src={SCENARIO_IMAGES[scenario.id]}
        alt={scenario.name}
        className="w-full aspect-square object-cover"
      />

      <div className="p-4 space-y-1">
        <p className="font-medium text-foreground text-sm tracking-tight">{scenario.name}</p>
        <p className="text-xs font-mono text-muted-foreground">{scenario.year}</p>
        <p className="text-xs text-muted-foreground">{scenario.outcome}</p>
        <p className="text-xs font-mono text-primary">{scenario.investment}</p>
      </div>
    </motion.div>
  );
}

export default function Demo() {
  const navigate = useNavigate();
  const { resetAssessment, updateAnswer } = useAssessment();

  const handleSelectScenario = (scenario: DemoScenario) => {
    resetAssessment();
    (Object.keys(scenario.answers) as Array<keyof AssessmentAnswers>).forEach((key) => {
      updateAnswer(key, scenario.answers[key] as AssessmentAnswers[typeof key]);
    });
    navigate('/demo/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="nexus-container pb-20">
        {/* Hero */}
        <section className="pt-16 pb-6">
          <motion.div
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-mono">
              Demo Mode
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight">
              See the framework in action.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select any product to run the assessment and explore what the framework would have surfaced before launch.
            </p>
          </motion.div>
        </section>

        {/* Failed section */}
        <section className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-medium text-foreground tracking-tight">Five products that failed.</h2>
            <p className="text-sm text-muted-foreground mt-1">Risks the framework would have flagged before launch.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {DEMO_SCENARIOS_FAILED.map((scenario, i) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={i}
                onClick={() => handleSelectScenario(scenario)}
              />
            ))}
          </motion.div>
        </section>

        {/* Succeeded section */}
        <section className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-medium text-foreground tracking-tight">Five products that succeeded.</h2>
            <p className="text-sm text-muted-foreground mt-1">What the framework looks like when the design decisions are right.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {DEMO_SCENARIOS_SUCCEEDED.map((scenario, i) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={i}
                onClick={() => handleSelectScenario(scenario)}
              />
            ))}
          </motion.div>
        </section>

        {/* Ana's Journey section */}
        <section className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl font-medium text-foreground tracking-tight">Ana's Journey.</h2>
            <p className="text-sm text-muted-foreground mt-1">
              A PM faces a HiPPO pushing AR/VR for a chronic patient app. Run the assessment she would have run.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            <div className="lg:col-start-3">
              <ScenarioCard
                scenario={DEMO_SCENARIO_ANA}
                index={0}
                onClick={() => handleSelectScenario(DEMO_SCENARIO_ANA)}
              />
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
