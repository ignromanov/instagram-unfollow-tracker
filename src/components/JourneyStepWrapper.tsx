'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { type JourneyStep, useAppStore } from '@/lib/store';

interface StepConfig {
  id: JourneyStep;
  title: string;
  component: React.ComponentType;
  collapsible: boolean;
  visibleWhen: (journey: any, hasData: boolean) => boolean;
}

interface JourneyStepWrapperProps {
  step: StepConfig;
  isActive: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
}

export function JourneyStepWrapper({
  step,
  isActive,
  isCompleted,
  isExpanded,
}: JourneyStepWrapperProps) {
  const toggleStepExpansion = useAppStore(s => s.toggleStepExpansion);

  // Non-collapsible steps are always rendered directly
  if (!step.collapsible) {
    return (
      <section
        id={step.id}
        className={cn(
          'rounded-lg border transition-all scroll-mt-4 mx-0 sm:mx-0',
          isActive && 'border-primary shadow-lg bg-primary/5',
          !isActive && 'border-border'
        )}
        aria-labelledby={`step-${step.id}-title`}
      >
        <div className="p-4 sm:p-6">
          <step.component />
        </div>
      </section>
    );
  }

  // Collapsible steps with accordion behavior
  return (
    <section
      id={step.id}
      className={cn(
        'rounded-lg border transition-all scroll-mt-4 mx-0 sm:mx-0',
        isActive && 'border-primary shadow-lg',
        isCompleted && !isActive && 'border-muted-foreground/30',
        !isActive && !isCompleted && 'border-border'
      )}
      aria-labelledby={`step-${step.id}-title`}
    >
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? step.id : undefined}
        onValueChange={value => {
          // Toggle expansion when accordion value changes
          if (value === step.id && !isExpanded) {
            toggleStepExpansion(step.id);
          } else if (value === '' && isExpanded) {
            toggleStepExpansion(step.id);
          }
        }}
      >
        <AccordionItem value={step.id} className="border-none">
          <AccordionTrigger
            id={`step-${step.id}-title`}
            className={cn(
              'px-4 sm:px-6 py-4 sm:py-4 text-base sm:text-lg md:text-xl font-semibold hover:no-underline min-h-[56px]',
              isCompleted && 'text-muted-foreground',
              isActive && 'text-primary'
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3 text-left">
              {isCompleted && (
                <CheckCircle2
                  className="h-5 w-5 sm:h-5 sm:w-5 text-green-500 flex-shrink-0"
                  aria-label="Step completed"
                />
              )}
              <span className="flex-1">{step.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-0 sm:px-6 pb-4 sm:pb-6">
              <step.component />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
