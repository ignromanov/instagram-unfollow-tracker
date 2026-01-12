'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X, ExternalLink, AlertTriangle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { analytics } from '@/lib/analytics';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

interface WizardStep {
  id: number;
  externalLink?: string;
  isWarning?: boolean;
  visual?: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    externalLink:
      'https://accountscenter.instagram.com/info_and_permissions/dyi/?entry_point=app_settings',
    visual: '/wizard/step-1.gif',
  },
  {
    id: 2,
    visual: '/wizard/step-2.gif',
  },
  {
    id: 3,
    visual: '/wizard/step-3.gif',
  },
  {
    id: 4,
    isWarning: true,
    visual: '/wizard/step-4.gif',
  },
  {
    id: 5,
    visual: '/wizard/step-5.gif',
  },
  {
    id: 6,
    isWarning: true,
    visual: '/wizard/step-6.gif',
  },
  {
    id: 7,
    visual: '/wizard/step-7.gif',
  },
  {
    id: 8,
    visual: '/wizard/step-8.gif',
  },
];

interface WizardProps {
  initialStep?: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function Wizard({ initialStep = 1, onComplete, onCancel }: WizardProps) {
  const { t } = useTranslation('wizard');
  const location = useLocation();
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Initialize step from URL path (overrides initialStep prop)
  useEffect(() => {
    const match = location.pathname.match(/\/wizard\/step\/(\d+)/);
    if (match?.[1]) {
      const stepFromPath = parseInt(match[1], 10);
      if (stepFromPath >= 1 && stepFromPath <= WIZARD_STEPS.length) {
        setCurrentStep(stepFromPath);
      }
    }
  }, [location.pathname]);

  // Update URL path when step changes and track analytics
  useEffect(() => {
    const newPath = `${prefix}/wizard/step/${currentStep}`;
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }

    const stepTitle = t(`steps.${currentStep}.title` as any);
    analytics.wizardStepView(currentStep, String(stepTitle));
  }, [currentStep, t, prefix, navigate, location.pathname]);

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

  const handleCalendarReminder = useCallback(() => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      t('calendar.title')
    )}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${
      endDate.toISOString().replace(/[-:]/g, '').split('.')[0]
    }Z&details=${encodeURIComponent(t('calendar.details'))}`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  }, [t]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xs md:text-sm text-zinc-500 uppercase tracking-widest">
            {t('header.stepOf', { current: currentStep, total: WIZARD_STEPS.length })}
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
          <div className="bg-[oklch(0.5_0_0_/_0.05)] overflow-hidden relative">
            <img
              src={step.visual || `https://picsum.photos/seed/${step.id}/800/450`}
              alt={t(`steps.${currentStep}.alt` as any)}
              className="w-full h-auto block"
              loading="lazy"
            />
            {step.isWarning && (
              <div className="absolute top-4 left-4 p-2.5 bg-amber-400 text-black rounded-xl shadow-lg flex items-center gap-2 font-black text-xs animate-bounce">
                <AlertTriangle size={18} />
                {t('format.warning')}
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
              {t(`steps.${currentStep}.title` as any)}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-xl leading-relaxed mb-10 font-medium">
              {t(`steps.${currentStep}.description` as any)}
            </p>

            {/* External Link Button (step 1) */}
            {step.externalLink && (
              <a
                href={step.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleExternalLinkClick}
                className="cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm md:text-base w-full sm:w-auto"
              >
                {t('buttons.openInstagram')} <ExternalLink size={20} />
              </a>
            )}

            {/* Calendar Reminder Button (last step) */}
            {isLastStep && (
              <button
                onClick={handleCalendarReminder}
                className="cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl font-bold transition-all text-sm md:text-base w-full sm:w-auto"
              >
                <Calendar size={20} />
                {t('calendar.addReminder')}
              </button>
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
          <ArrowLeft size={20} /> <span className="hidden sm:inline">{t('buttons.back')}</span>
        </button>
        <button
          onClick={handleNext}
          className="cursor-pointer flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          {isLastStep ? t('buttons.done') : t('buttons.next')} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
