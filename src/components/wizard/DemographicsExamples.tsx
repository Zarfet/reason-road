import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const examples = [
  {
    category: "Healthcare",
    text: "Nurses and doctors, 28-55 years old, moderate tech literacy, comfortable with tablets and smartphones"
  },
  {
    category: "Enterprise",
    text: "Sales professionals, 30-50, mixed tech literacy (beginner to intermediate), primarily use laptops"
  },
  {
    category: "Consumer",
    text: "Gen Z users (18-25), tech-savvy early adopters, smartphone-first, comfortable with AR filters"
  },
  {
    category: "Accessibility",
    text: "Elderly retirement community residents (70+), low tech experience, motor impairments common"
  }
];

export function DemographicsExamples() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="examples" className="border-none">
        <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
          Show example demographics descriptions
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            {examples.map((example, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-md">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  {example.category}
                </p>
                <p className="text-sm">
                  "{example.text}"
                </p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
