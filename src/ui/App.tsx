import { AccountListSection } from '@/components/AccountListSection';
import { FAQSection } from '@/components/FAQSection';
import { FileUploadSection } from '@/components/FileUploadSection';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HowToSection } from '@/components/HowToSection';
import { InstructionsModal } from '@/components/InstructionsModal';
import { useHydration } from '@/hooks/useHydration';
import { analytics } from '@/lib/analytics';
import { useAppStore } from '@/lib/store';
import { Analytics } from '@vercel/analytics/react';
import React, { useState } from 'react';

export const App: React.FC = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const hasHydrated = useHydration();
  const fileMetadata = useAppStore(s => s.fileMetadata);
  const hasLoadedData = !!fileMetadata && (fileMetadata.accountCount || 0) > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header>
            <Header
              onHelpClick={() => {
                analytics.helpOpen('header');
                setIsInstructionsOpen(true);
              }}
            />
          </header>

          <main>
            {!hasHydrated ? (
              <section aria-label="Loading application">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              </section>
            ) : !hasLoadedData ? (
              <section aria-label="Upload Instagram data">
                <FileUploadSection
                  onHelpClick={() => {
                    analytics.helpOpen('upload_section');
                    setIsInstructionsOpen(true);
                  }}
                />
              </section>
            ) : (
              <section aria-label="Account list and filters">
                <AccountListSection />
              </section>
            )}
          </main>
        </div>
      </div>

      <HowToSection />
      <FAQSection />
      <Footer />
      <InstructionsModal open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen} />
      <Analytics />
    </div>
  );
};
