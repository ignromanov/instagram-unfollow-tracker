import { ChevronRight, Play } from 'lucide-react';

interface HowToStep {
  id: number;
  title: string;
  description: string;
  isWarning?: boolean;
  visual?: string;
}

const WIZARD_STEPS: HowToStep[] = [
  {
    id: 1,
    title: 'Open Data Export Page',
    description:
      "Tap the button below to go directly to the platform's data export page. You may need to log in first.",
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
    title: 'Select JSON format',
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

function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Check Who Unfollowed You on Instagram Without Login',
    description:
      'Step-by-step guide to find Instagram unfollowers using your official data export. No login required, 100% private.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Instagram account',
      },
      {
        '@type': 'HowToSupply',
        name: 'Email access',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Instagram Unfollow Tracker (this website)',
      },
    ],
    step: WIZARD_STEPS.map(step => ({
      '@type': 'HowToStep',
      position: step.id,
      name: step.title,
      text: step.description,
      image: step.visual,
    })),
  };
}

interface HowToSectionProps {
  onStart?: (step?: number) => void;
}

export function HowToSection({ onStart }: HowToSectionProps) {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHowToSchema()),
        }}
      />
      <section id="how-it-works" className="py-24 md:py-40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-6xl font-display font-extrabold mb-8 text-center tracking-tight leading-[1.1]">
            How to Check Your <span className="text-gradient">Instagram Unfollowers</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-20 md:mb-32 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
            Follow these 8 simple steps to securely analyze your account without sharing your
            password.
          </p>

          <ol className="space-y-16 md:space-y-24 relative before:absolute before:left-6 md:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {WIZARD_STEPS.map((step, idx) => (
              <li
                key={step.id}
                className="relative pl-16 md:pl-24 group cursor-pointer"
                onClick={() => handleStepClick(idx)}
              >
                <div className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-card border-2 border-primary flex items-center justify-center font-black text-lg md:text-2xl text-primary z-10 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  {step.id}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-display font-bold flex items-center flex-wrap gap-3 text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                    {step.title}
                    {step.isWarning && (
                      <span className="text-[10px] bg-amber-400 text-black px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                        Important
                      </span>
                    )}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium text-base md:text-lg">
                    {step.description}
                  </p>
                  {step.visual && (
                    <div className="rounded-3xl md:rounded-4xl overflow-hidden border border-border shadow-md max-w-xl mt-6 group-hover:border-primary/30 transition-all">
                      <img
                        src={step.visual}
                        alt={step.title}
                        className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Open step in guide <ChevronRight size={14} />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-24 md:mt-40 p-10 md:p-16 rounded-4xl bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-primary/30">
            <div className="text-center md:text-left space-y-4">
              <h4 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">
                Ready to start?
              </h4>
              <p className="opacity-90 font-bold text-base md:text-xl leading-relaxed">
                Analyze your data export privately in seconds.
              </p>
            </div>
            <button
              onClick={handleStartClick}
              className="cursor-pointer w-full md:w-auto px-10 py-5 bg-white text-primary font-black rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg shadow-xl"
            >
              Open Analysis Guide <Play size={22} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
