import { useState } from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { QuestionLayout } from './QuestionLayout';
import { OptionCard } from './OptionCard';
import { ValuesRanking } from './ValuesRanking';
import { DemographicsExamples } from './DemographicsExamples';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { validateDemographics } from '@/types/assessment';
import type { 
  TaskComplexity, 
  Frequency, 
  Predictability, 
  ContextOfUse, 
  InformationType,
  ExplorationMode,
  ErrorConsequence,
  ControlPreference,
  GeographicDeployment 
} from '@/types/assessment';

// Step 0: Project Context
export function StepContext() {
  const { answers, updateAnswer } = useAssessment();
  const [demographicsError, setDemographicsError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleDemographicsChange = (value: string) => {
    updateAnswer('userDemographics', value);
    // Only validate if already touched
    if (touched) {
      setDemographicsError(validateDemographics(value));
    }
  };

  const handleDemographicsBlur = () => {
    setTouched(true);
    setDemographicsError(validateDemographics(answers.userDemographics));
  };

  return (
    <QuestionLayout 
      question="Tell us about your project"
      hint="Demographics are critical for accurate interface recommendations."
    >
      <div className="space-y-6">
        {/* Project Name - Optional */}
        <div className="space-y-2">
          <Label htmlFor="projectName">Project name (optional)</Label>
          <Input
            id="projectName"
            placeholder="e.g., HealthTrack Mobile App"
            value={answers.projectName || ''}
            onChange={(e) => updateAnswer('projectName', e.target.value)}
          />
        </div>
        
        {/* User Demographics - MANDATORY */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="demographics" className="text-base">
              Primary User Demographics
              <span className="text-destructive ml-1">*</span>
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold mb-2">Why is this critical?</p>
                  <ul className="text-sm space-y-1">
                    <li>• VR has 78% rejection in elderly users</li>
                    <li>• Invisible interfaces confuse non-technical users</li>
                    <li>• Voice is essential for visually impaired</li>
                    <li>• Age affects technology adoption rates</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Describe age range, tech literacy, profession, or accessibility needs
          </p>
          
          <Textarea
            id="demographics"
            placeholder="e.g., Healthcare workers, 30-50 years old, moderate tech literacy, comfortable with tablets but not VR"
            value={answers.userDemographics || ''}
            onChange={(e) => handleDemographicsChange(e.target.value)}
            onBlur={handleDemographicsBlur}
            rows={4}
            className={demographicsError && touched ? 'border-destructive' : ''}
          />
          
          {/* Validation Error */}
          {demographicsError && touched && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {demographicsError}
            </p>
          )}
          
          {/* Examples Accordion */}
          <DemographicsExamples />
        </div>
      </div>
    </QuestionLayout>
  );
}

// Step 1: Values Ranking
export function StepValues() {
  const { answers, updateAnswer } = useAssessment();

  return (
    <QuestionLayout 
      question="Rank these 5 design values from most (1) to least (5) important"
      hint="These values filter all recommendations. If 'User Control' is #1, invisible automation becomes inappropriate. Drag to reorder."
    >
      <ValuesRanking 
        values={answers.valuesRanking} 
        onChange={(values) => updateAnswer('valuesRanking', values)} 
      />
    </QuestionLayout>
  );
}

// Step 2: Task Complexity
export function StepComplexity() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: TaskComplexity; label: string; description: string }[] = [
    { value: 'Simple', label: 'Simple', description: 'Single action, e.g., turn on light' },
    { value: 'Medium', label: 'Medium', description: 'Multiple steps, e.g., book reservation' },
    { value: 'Complex', label: 'Complex', description: 'Creativity/judgment, e.g., video editing' },
  ];

  return (
    <QuestionLayout 
      question="How would you describe the main task?"
      hint="Simple tasks favor invisible/voice. Complex needs screens or AI assistance."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.taskComplexity === option.value}
            onClick={() => updateAnswer('taskComplexity', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 3: Frequency
export function StepFrequency() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: Frequency; label: string; description: string }[] = [
    { value: 'Multiple times daily', label: 'Multiple times daily', description: 'Routine, habitual usage' },
    { value: 'Several times per week', label: 'Several times per week', description: 'Regular but not constant' },
    { value: 'Occasionally', label: 'Occasionally', description: 'Monthly or less frequent' },
    { value: 'Rarely', label: 'Rarely', description: 'Once or infrequent usage' },
  ];

  return (
    <QuestionLayout 
      question="How often will users perform this task?"
      hint="High frequency benefits from automation. Infrequent needs visible interfaces—users forget automation."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.frequency === option.value}
            onClick={() => updateAnswer('frequency', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 4: Predictability
export function StepPredictability() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: Predictability; label: string; description: string }[] = [
    { value: 'Always identical', label: 'Always identical', description: 'Same steps every time' },
    { value: 'Varies within known patterns', label: 'Varies within known patterns', description: 'Some variation but structured' },
    { value: 'Always different', label: 'Always different', description: 'Requires adaptation each time' },
  ];

  return (
    <QuestionLayout 
      question="Does the task vary or is it always the same?"
      hint="Predictable enables automation. Unpredictable requires human judgment."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.predictability === option.value}
            onClick={() => updateAnswer('predictability', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 5: Context of Use
export function StepContextOfUse() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: ContextOfUse; label: string; description: string }[] = [
    { value: 'Desktop', label: 'Desktop', description: 'Dedicated time and focus' },
    { value: 'Mobile', label: 'Mobile', description: 'On-the-go, multitasking' },
    { value: 'Hands occupied', label: 'Hands occupied', description: 'Driving, cooking, exercising' },
    { value: 'Social situations', label: 'Social situations', description: 'With other people present' },
  ];

  return (
    <QuestionLayout 
      question="Where/when will this be used primarily?"
      hint="Desktop enables complex screens. Mobile needs simplified. Hands-free requires voice. Social: AR problematic."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.contextOfUse === option.value}
            onClick={() => updateAnswer('contextOfUse', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 6: Information Type
export function StepInformationType() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: InformationType; label: string; description: string }[] = [
    { value: 'Structured data', label: 'Structured data', description: 'Forms, databases, spreadsheets' },
    { value: 'Unstructured text', label: 'Unstructured text', description: 'Documents, notes, research' },
    { value: 'Visual content', label: 'Visual content', description: 'Images, videos, graphics' },
    { value: 'Spatial/3D', label: 'Spatial/3D', description: 'Architecture, molecular models' },
  ];

  return (
    <QuestionLayout 
      question="What type of information are you handling?"
      hint="Structured → screens. Unstructured → AI excels. Visual → screens. Spatial → AR/VR."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.informationType === option.value}
            onClick={() => updateAnswer('informationType', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 7: Exploration Mode
export function StepExploration() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: ExplorationMode; label: string; description: string }[] = [
    { value: 'Explore options', label: 'Explore options before deciding', description: 'Discovery-focused' },
    { value: 'Know exactly', label: 'Know exactly what they want', description: 'Execution-focused' },
    { value: 'Mix of both', label: 'Mix of both', description: 'Iterative refinement' },
  ];

  return (
    <QuestionLayout 
      question="Will users primarily..."
      hint="Exploration requires visible choices. Execution enables automation."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.explorationMode === option.value}
            onClick={() => updateAnswer('explorationMode', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 8: Error Consequences
export function StepErrors() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: ErrorConsequence; label: string; description: string }[] = [
    { value: 'Trivial', label: 'Trivial', description: 'E.g., wrong song plays' },
    { value: 'Annoying but recoverable', label: 'Annoying but recoverable', description: 'Email to wrong person' },
    { value: 'Serious', label: 'Serious', description: 'Financial error, safety hazard' },
  ];

  return (
    <QuestionLayout 
      question="What happens if something goes wrong?"
      hint="Trivial allows automation. Recoverable needs confirmation. Serious requires explicit control."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.errorConsequence === option.value}
            onClick={() => updateAnswer('errorConsequence', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}

// Step 9: Control Preference
export function StepControl() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: ControlPreference; label: string; description: string }[] = [
    { value: 'Automatic', label: 'Want automatic', description: 'Trust system judgment' },
    { value: 'Supervised', label: 'Want to supervise', description: 'Guided automation' },
    { value: 'Full control', label: 'Need full control', description: 'Manual control of every step' },
  ];

  // Check for contradiction
  const hasContradiction = 
    answers.valuesRanking.slice(0, 2).includes('User Control') && 
    answers.controlPreference === 'Automatic';

  return (
    <QuestionLayout 
      question="How much control do users need?"
      hint="Must align with VALUES ranking."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.controlPreference === option.value}
            onClick={() => updateAnswer('controlPreference', option.value)}
          />
        ))}
      </div>
      
      {hasContradiction && (
        <div className="mt-4 p-4 rounded-lg bg-warning-muted border border-warning-border">
          <p className="text-sm text-warning-muted-foreground font-medium">
            ⚠️ Contradiction detected: You prioritized Control but prefer automation. Reconsider?
          </p>
        </div>
      )}
    </QuestionLayout>
  );
}

// Step 10: Geographic Deployment
export function StepGeography() {
  const { answers, updateAnswer } = useAssessment();

  const options: { value: GeographicDeployment; label: string; description: string }[] = [
    { value: 'Primarily Europe', label: 'Primarily Europe', description: 'GDPR, AI Act compliance' },
    { value: 'Primarily US', label: 'Primarily US', description: 'CCPA in California' },
    { value: 'Global', label: 'Global', description: 'Strictest regulations apply' },
    { value: 'Internal tool', label: 'Internal tool', description: 'Less external scrutiny' },
  ];

  return (
    <QuestionLayout 
      question="Where will this product be used?"
      hint="Regulations affect interface viability. Invisible interfaces need data collection. European AI Act conflicts with 'invisible' philosophy."
    >
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={answers.geography === option.value}
            onClick={() => updateAnswer('geography', option.value)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}
