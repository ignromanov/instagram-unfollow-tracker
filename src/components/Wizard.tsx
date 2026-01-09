'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, X, ExternalLink, AlertTriangle } from 'lucide-react';

import { analytics } from '@/lib/analytics';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  externalLink?: string;
  isWarning?: boolean;
  visual?: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Open Data Export Page',
    description:
      "Tap the button below to go directly to the platform's data export page. You may need to log in first.",
    externalLink:
      'https://accountscenter.instagram.com/info_and_permissions/dyi/?entry_point=app_settings',
  },
  {
    id: 2,
    title: "Select 'Some of your information'",
    description:
      "Don't download everything — we only need your followers and following data to speed this up.",
    visual: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
  },
  {
    id: 3,
    title: "Check only 'Followers and following'",
    description:
      'Uncheck all other options like messages or media. This makes your file much smaller.',
    visual: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?w=800&q=80',
  },
  {
    id: 4,
    title: '⚠️ Select JSON format',
    description:
      'This is critical: Choose JSON, not HTML. HTML files will not work with our analyzer.',
    isWarning: true,
    visual: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  },
  {
    id: 5,
    title: "Choose 'All time' and tap 'Create files'",
    description:
      'The platform will now start preparing your data. This can take anywhere from 5 minutes to a few hours.',
    visual: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    id: 6,
    title: 'Wait for email notification',
    description:
      "Keep an eye on your inbox (and spam folder!). You'll get an email when your file is ready to download.",
    visual: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80',
  },
  {
    id: 7,
    title: 'Download the ZIP file',
    description:
      "Download the file to your device. Once you have it, you're ready to analyze it here!",
    visual: 'https://images.unsplash.com/photo-1590212151175-e58edd96d85c?w=800&q=80',
  },
  {
    id: 8,
    title: 'Upload & Reveal Results',
    description:
      'Head back here, upload your ZIP file, and instantly see who unfollowed you and more!',
    visual: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?w=800&q=80',
  },
];

interface WizardProps {
  initialStep?: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function Wizard({ initialStep = 1, onComplete, onCancel }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Initialize step from URL hash (overrides initialStep prop)
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/#wizard\/step\/(\d+)/);
    if (match?.[1]) {
      const stepFromHash = parseInt(match[1], 10);
      if (stepFromHash >= 1 && stepFromHash <= WIZARD_STEPS.length) {
        setCurrentStep(stepFromHash);
      }
    }
  }, []);

  // Update hash when step changes and track analytics
  useEffect(() => {
    window.location.hash = `#wizard/step/${currentStep}`;
    const step = WIZARD_STEPS.find(s => s.id === currentStep);
    if (step) {
      analytics.wizardStepView(step.id, step.title);
    }
  }, [currentStep]);

  const step = WIZARD_STEPS.find(s => s.id === currentStep);
  if (!step) {
    return null;
  }

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === WIZARD_STEPS.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      analytics.wizardNextClick(currentStep);
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      onCancel();
    } else {
      analytics.wizardBackClick(currentStep);
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleCancel = () => {
    analytics.wizardCancel();
    onCancel();
  };

  const handleExternalLinkClick = () => {
    analytics.wizardExternalLinkClick(step.id);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xs md:text-sm text-zinc-500 uppercase tracking-widest">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <div className="flex gap-1.5">
            {WIZARD_STEPS.map(s => (
              <div
                key={s.id}
                className={`h-1.5 w-6 md:w-8 rounded-full transition-all duration-300 ${
                  s.id <= currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="cursor-pointer p-2.5 rounded-full hover:bg-[oklch(0.5_0_0_/_0.05)] transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={`max-w-xl w-full rounded-4xl overflow-hidden shadow-2xl border transition-all ${
            step.isWarning
              ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50'
              : 'border-border bg-card'
          }`}
        >
          {/* Image */}
          <div className="aspect-video bg-[oklch(0.5_0_0_/_0.05)] overflow-hidden relative group">
            <img
              src={step.visual || `https://picsum.photos/seed/${step.id}/800/450`}
              alt={`Step ${step.id}: ${step.title}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
            />
            {step.isWarning && (
              <div className="absolute top-4 left-4 p-2.5 bg-amber-400 text-black rounded-xl shadow-lg flex items-center gap-2 font-black text-xs animate-bounce">
                <AlertTriangle size={18} />
                JSON FORMAT ONLY
              </div>
            )}
          </div>

          {/* Step Info */}
          <div className="p-8 md:p-12">
            <h2
              className={`text-2xl md:text-3xl font-display font-bold mb-5 leading-tight ${
                step.isWarning
                  ? 'text-amber-800 dark:text-amber-500'
                  : 'text-zinc-900 dark:text-white'
              }`}
            >
              {step.title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-xl leading-relaxed mb-10 font-medium">
              {step.description}
            </p>

            {/* External Link Button */}
            {step.externalLink && (
              <a
                href={step.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleExternalLinkClick}
                className="cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm md:text-base w-full sm:w-auto"
              >
                Open Instagram <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-6 border-t border-border flex items-center justify-between bg-card shadow-[0_-10px_20px_oklch(0_0_0_/_0.03)]">
        <button
          onClick={handleBack}
          disabled={isFirstStep}
          className={`cursor-pointer flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'hover:bg-[oklch(0.5_0_0_/_0.05)] text-zinc-500'
          }`}
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={handleNext}
          className="cursor-pointer flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          {isLastStep ? "Done, let's go!" : 'Next Step'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
