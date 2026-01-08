import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { JourneyContainer } from '@/components/JourneyContainer';
import { InstructionsModal } from '@/components/InstructionsModal';
import { useHydration } from '@/hooks/useHydration';
import { Analytics } from '@vercel/analytics/react';
import React, { useState } from 'react';

export const App: React.FC = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const hasHydrated = useHydration();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <main id="main-content">
            {!hasHydrated ? (
              <section aria-label="Loading application">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              </section>
            ) : (
              <JourneyContainer />
            )}
          </main>
        </div>
      </div>

      <FAQSection />
      <Footer />
      <InstructionsModal open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen} />
      <Analytics />
    </div>
  );
};
