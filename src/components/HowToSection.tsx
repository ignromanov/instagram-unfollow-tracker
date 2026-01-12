import { useTranslation, Trans } from 'react-i18next';
import { ChevronRight, Play } from 'lucide-react';

interface HowToStep {
  id: number;
  title: string;
  description: string;
  isWarning?: boolean;
  visual?: string;
}

// Step metadata (visuals and warnings are not translated)
const STEP_META: Array<{ isWarning?: boolean; visual?: string }> = [
  { visual: '/wizard/step-1.gif' },
  { visual: '/wizard/step-2.gif' },
  { visual: '/wizard/step-3.gif' },
  { isWarning: true, visual: '/wizard/step-4.gif' },
  { visual: '/wizard/step-5.gif' },
  { isWarning: true, visual: '/wizard/step-6.gif' },
  { visual: '/wizard/step-7.gif' },
  { visual: '/wizard/step-8.gif' },
];

interface HowToSectionProps {
  onStart?: (step?: number) => void;
}

export function HowToSection({ onStart }: HowToSectionProps) {
  const { t } = useTranslation('howto');

  // Build steps from translations (using 'as any' for dynamic keys)
  const steps: HowToStep[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: t(`steps.${i + 1}.title` as any),
    description: t(`steps.${i + 1}.description` as any),
    ...STEP_META[i],
  }));

  // Generate Schema.org HowTo structured data (safe: uses our own translation strings)
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('schema.name'),
    description: t('schema.description'),
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      { '@type': 'HowToSupply', name: t('schema.supplies.account') },
      { '@type': 'HowToSupply', name: t('schema.supplies.email') },
    ],
    tool: [{ '@type': 'HowToTool', name: t('schema.tool') }],
    step: steps.map(step => ({
      '@type': 'HowToStep',
      position: step.id,
      name: step.title,
      text: step.description,
      image: step.visual,
    })),
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStart) {
      onStart(stepIndex);
    } else {
      // Fallback to hash navigation if no callback provided
      window.location.hash = `wizard/step/${stepIndex + 1}`;
    }
  };

  const handleStartClick = () => {
    if (onStart) {
      onStart(0);
    } else {
      window.location.hash = 'wizard/step/1';
    }
  };

  return (
    <>
      {/* Schema.org HowTo structured data - safe: uses our own translation strings */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <section id="how-it-works" className="py-24 md:py-40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-6xl font-display font-extrabold mb-8 text-center tracking-tight leading-[1.1]">
            <Trans
              i18nKey="title"
              ns="howto"
              components={{ gradient: <span className="text-gradient" /> }}
            >
              How to Check Your <span className="text-gradient">Instagram Unfollowers</span>
            </Trans>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-20 md:mb-32 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
            {t('subtitle')}
          </p>

          <ol className="space-y-16 md:space-y-24 relative before:absolute before:left-6 md:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {steps.map((step, idx) => (
              <li
                key={step.id}
                role="button"
                tabIndex={0}
                aria-label={t('openStepAria', { step: step.id, title: step.title })}
                className="relative pl-16 md:pl-24 group cursor-pointer"
                onClick={() => handleStepClick(idx)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStepClick(idx);
                  }
                }}
              >
                <div className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-card border-2 border-primary flex items-center justify-center font-black text-lg md:text-2xl text-primary z-10 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  {step.id}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-display font-bold flex items-center flex-wrap gap-3 text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                    {step.title}
                    {step.isWarning && (
                      <span className="text-xs bg-amber-400 text-black px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                        {t('important')}
                      </span>
                    )}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium text-base md:text-lg">
                    {step.description}
                  </p>
                  {step.visual && (
                    <div className="rounded-3xl md:rounded-4xl overflow-hidden border border-border shadow-md max-w-xl mt-6 group-hover:border-primary/30 transition-all aspect-[4/3]">
                      <img
                        src={step.visual}
                        alt={step.title}
                        width={800}
                        height={600}
                        className="w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('openStep')} <ChevronRight size={14} />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-24 md:mt-40 p-10 md:p-16 rounded-4xl bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-primary/30">
            <div className="text-center md:text-left space-y-4">
              <h4 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">
                {t('cta.title')}
              </h4>
              <p className="opacity-90 font-bold text-base md:text-xl leading-relaxed">
                {t('cta.subtitle')}
              </p>
            </div>
            <button
              onClick={handleStartClick}
              className="cursor-pointer w-full md:w-auto px-10 py-5 bg-white text-primary font-black rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg shadow-xl"
            >
              {t('cta.button')} <Play size={22} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
