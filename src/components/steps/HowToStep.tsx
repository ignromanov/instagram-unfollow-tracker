'use client';

import React from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  ExternalLink,
  Image,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type HowToSubStep, useAppStore } from '@/lib/store';
import { navigateToSubStep } from '@/hooks/useJourneyHash';

interface HowToStepItem {
  name: string;
  text: string;
}

const howToSteps: HowToStepItem[] = [
  {
    name: 'Open Instagram Settings',
    text: 'Open the Instagram app on your phone and go to your profile. Tap the menu icon (☰) in the top-right corner, then tap "Settings and privacy".',
  },
  {
    name: 'Navigate to Account Center',
    text: 'Scroll down and tap "Accounts Center" under the Meta section. This is where you manage your data across Meta apps.',
  },
  {
    name: 'Find Download Your Information',
    text: 'In the Accounts Center, tap "Your information and permissions", then tap "Download your information".',
  },
  {
    name: 'Request Instagram Data',
    text: 'Tap "Download or transfer information", select your Instagram account, then choose "Some of your information".',
  },
  {
    name: 'Select Followers and Following',
    text: 'Scroll down to "Connections" section and check only "Followers and following". This keeps the download small and fast.',
  },
  {
    name: 'Choose JSON Format',
    text: 'On the next screen, select "Download to device", then change the format from HTML to JSON. JSON format is required for this tool.',
  },
  {
    name: 'Create and Download File',
    text: 'Tap "Create files" and wait. Instagram will email you when ready (usually within 24-48 hours, sometimes faster).',
  },
  {
    name: 'Download the ZIP File',
    text: 'Check your email for the download link from Instagram. Download the ZIP file to your device.',
  },
  {
    name: 'Upload to This Tool',
    text: 'Come back to this page and drag-and-drop the ZIP file onto the upload area. The tool will process it locally in your browser.',
  },
  {
    name: 'Analyze Your Followers',
    text: 'Once uploaded, you can see who unfollowed you, find non-mutuals, and filter by any badge type. All data stays on your device!',
  },
];

interface StepGroup {
  id: HowToSubStep;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: HowToStepItem[];
  imageAlt: string;
}

const stepGroups: StepGroup[] = [
  {
    id: 'opening-settings',
    title: 'Opening Settings',
    icon: Settings,
    steps: howToSteps.slice(0, 3),
    imageAlt: 'Navigation to Instagram Account Center',
  },
  {
    id: 'selecting-data',
    title: 'Selecting Data',
    icon: Database,
    steps: howToSteps.slice(3, 6),
    imageAlt: 'Selecting followers and following data in JSON format',
  },
  {
    id: 'downloading',
    title: 'Downloading',
    icon: Download,
    steps: howToSteps.slice(6, 8),
    imageAlt: 'Creating and downloading Instagram data export',
  },
  {
    id: 'uploading-analyzing',
    title: 'Uploading & Analyzing',
    icon: Upload,
    steps: howToSteps.slice(8, 10),
    imageAlt: 'Uploading data to Instagram Unfollow Tracker',
  },
];

export function HowToStep() {
  const advanceJourney = useAppStore(s => s.advanceJourney);
  const completedSubSteps = useAppStore(s => s.journey.completedHowToSubSteps);
  const toggleHowToSubStep = useAppStore(s => s.toggleHowToSubStep);

  const handleToggleSubStep = (subStep: HowToSubStep) => {
    toggleHowToSubStep(subStep);
    navigateToSubStep(subStep);
  };

  // Schema.org JSON-LD for HowTo
  React.useEffect(() => {
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Check Who Unfollowed You on Instagram Without Login',
      description:
        'Step-by-step guide to find Instagram unfollowers using your official data export. No login required, 100% private.',
      totalTime: 'PT5M',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
      supply: [
        { '@type': 'HowToSupply', name: 'Instagram account' },
        { '@type': 'HowToSupply', name: 'Email access' },
      ],
      tool: [{ '@type': 'HowToTool', name: 'Instagram Unfollow Tracker (this website)' }],
      step: howToSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    });

    document.head.appendChild(schemaScript);

    return () => {
      document.head.removeChild(schemaScript);
    };
  }, []);

  const completedCount = completedSubSteps.size;
  const totalCount = stepGroups.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          How to Get Your Instagram Data
        </h3>
        <p className="text-pretty text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Follow these simple steps to download your Instagram data and analyze your followers — no
          login required, completely private.
        </p>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto pt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="font-medium">
              <span className="sm:hidden">
                {completedCount}/{totalCount}
              </span>
              <span className="hidden sm:inline">
                {completedCount} of {totalCount} steps completed
              </span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary CTA - Open Instagram Settings */}
      <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 mx-2 sm:mx-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-hidden="true" />
          <h4 className="text-lg sm:text-xl font-semibold text-foreground">Ready to Start?</h4>
        </div>
        <p className="text-pretty text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
          Open Instagram's Account Center to request your data export. This is the official and safe
          method approved by Meta.
        </p>
        <Button
          size="lg"
          asChild
          className="gap-2 w-full sm:w-auto min-h-[48px] text-sm sm:text-base"
        >
          <a href="https://accountscenter.instagram.com" target="_blank" rel="noopener noreferrer">
            <span className="sm:hidden">Open Settings</span>
            <span className="hidden sm:inline">Open Instagram Settings</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Step groups */}
      <div className="space-y-4 sm:space-y-6">
        {stepGroups.map((group, groupIndex) => {
          const IconComponent = group.icon;
          const startIndex = stepGroups
            .slice(0, groupIndex)
            .reduce((sum, g) => sum + g.steps.length, 0);
          const isCompleted = completedSubSteps.has(group.id);

          return (
            <div
              key={group.id}
              id={group.id}
              className={`rounded-lg border bg-card p-4 sm:p-6 space-y-3 sm:space-y-4 mx-2 sm:mx-0 scroll-mt-4 transition-colors ${
                isCompleted ? 'border-green-500/50 bg-green-500/5' : 'border-border'
              }`}
            >
              {/* Group header with checkbox */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <IconComponent
                    className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-primary'}`}
                    aria-hidden="true"
                  />
                  <h4
                    className={`text-base sm:text-lg font-semibold ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}
                  >
                    {group.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSubStep(group.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors cursor-pointer min-h-[40px] text-sm font-medium"
                  aria-label={
                    isCompleted
                      ? `Mark ${group.title} as incomplete`
                      : `Mark ${group.title} as complete`
                  }
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 hidden sm:inline">
                        Done
                      </span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground hidden sm:inline">Mark done</span>
                    </>
                  )}
                </button>
              </div>

              <Separator />

              {/* Steps in this group */}
              <ol className={`space-y-3 sm:space-y-4 ${isCompleted ? 'opacity-60' : ''}`}>
                {group.steps.map((step, stepIndex) => {
                  const globalIndex = startIndex + stepIndex;
                  return (
                    <li key={`step-${globalIndex}`} className="flex gap-3 sm:gap-4">
                      <div
                        className={`flex-shrink-0 flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full text-sm font-medium ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {isCompleted ? '✓' : globalIndex + 1}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h5
                          className={`text-sm sm:text-base font-semibold ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                        >
                          {step.name}
                        </h5>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{step.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Image placeholder */}
              <div
                className={`mt-3 sm:mt-4 rounded-lg border-2 border-dashed bg-muted/30 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-2 ${
                  isCompleted ? 'border-green-500/30' : 'border-border'
                }`}
              >
                <Image
                  className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40"
                  aria-hidden="true"
                />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground/60">
                  Screenshot coming soon
                </p>
                <p className="text-xs text-muted-foreground/40">{group.imageAlt}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time estimate */}
      <div className="text-center pt-3 sm:pt-4 border-t border-border px-4 sm:px-0">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total time: ~5 minutes (plus waiting for Instagram to prepare your data)
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-2 sm:bottom-4 z-10 px-2 sm:px-0">
        <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm sm:text-base font-semibold text-foreground">
                Already have your data?
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Upload it now and analyze your followers
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => advanceJourney('upload')}
              className="gap-2 w-full sm:w-auto flex-shrink-0 min-h-[48px] text-sm sm:text-base"
            >
              <span className="sm:hidden">Upload Now</span>
              <span className="hidden sm:inline">I Have My Data</span>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
