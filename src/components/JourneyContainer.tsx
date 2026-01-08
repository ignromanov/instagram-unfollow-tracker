'use client';

import type React from 'react';
import { type JourneyStep, useAppStore } from '@/lib/store';
import { useJourneyHash } from '@/hooks/useJourneyHash';
import { JourneyStepWrapper } from './JourneyStepWrapper';

// Step component imports
import { HeroStep } from './steps/HeroStep';
import { HowToStep } from './steps/HowToStep';
import { UploadStep } from './steps/UploadStep';
import { ResultsStep } from './steps/ResultsStep';

interface StepConfig {
  id: JourneyStep;
  title: string;
  component: React.ComponentType;
  collapsible: boolean;
  visibleWhen: (
    journey: {
      currentStep: JourneyStep;
      completedSteps: Set<JourneyStep>;
      expandedSteps: Set<JourneyStep>;
    },
    hasData: boolean
  ) => boolean;
}

export function JourneyContainer() {
  const { journey, fileMetadata } = useAppStore();
  const hasData = !!fileMetadata && (fileMetadata.accountCount || 0) > 0;

  // Sync URL hash with journey state for deep linking
  useJourneyHash();

  const steps: StepConfig[] = [
    {
      id: 'hero',
      title: 'See Who Unfollowed You',
      component: HeroStep,
      collapsible: false,
      visibleWhen: () => true, // Always visible as header
    },
    {
      id: 'how-to',
      title: 'How to Get Your Instagram Data?',
      component: HowToStep,
      collapsible: true,
      visibleWhen: j => j.currentStep >= 'how-to' || j.completedSteps.has('how-to'),
    },
    {
      id: 'upload',
      title: 'Upload Your Data',
      component: UploadStep,
      collapsible: true,
      visibleWhen: j => j.currentStep >= 'upload' || j.completedSteps.has('upload'),
    },
    {
      id: 'results',
      title: 'Your Followers Analysis',
      component: ResultsStep,
      collapsible: false,
      visibleWhen: () => hasData,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-safe">
      {steps
        .filter(step => step.visibleWhen(journey, hasData))
        .map(step => (
          <JourneyStepWrapper
            key={step.id}
            step={step}
            isActive={journey.currentStep === step.id}
            isCompleted={journey.completedSteps.has(step.id)}
            isExpanded={journey.expandedSteps.has(step.id)}
          />
        ))}
    </div>
  );
}
