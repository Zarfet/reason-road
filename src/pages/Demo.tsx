import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useAssessment } from '@/context/AssessmentContext';
import { DEMO_SCENARIOS, type DemoScenario } from '@/data/demoScenarios';
import type { AssessmentAnswers } from '@/types/assessment';

const SCENARIO_IMAGES: Record<string, string> = {
  'google-glass':  '/demo/images/01 Google Glass.png',
  'humane-ai-pin': '/demo/images/02 Human AI.png',
  'rabbit-r1':     '/demo/images/03 Rabbit R1.png',
  'fire-phone':    '/demo/images/04 Fire Phone.png',
  'clippy':        '/demo/images/05 Clippy.png',
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
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-mono">
              Demo Mode
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight">
              Five products that failed.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select one to run the assessment that could have flagged the risks before launch.
            </p>
          </motion.div>
        </section>

        {/* Cards grid */}
        <section className="py-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {DEMO_SCENARIOS.map((scenario, i) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={i}
                onClick={() => handleSelectScenario(scenario)}
              />
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
