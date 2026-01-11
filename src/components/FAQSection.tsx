import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface FAQItem {
  key: string;
  question: string;
  answer: string;
}

const FAQ_KEYS = ['privacy', 'zipFile', 'accountSafety', 'scale', 'free'] as const;

export function FAQSection() {
  const { t } = useTranslation('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Build FAQ items from translations
  const faqItems: FAQItem[] = FAQ_KEYS.map(key => ({
    key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  // Generate Schema.org FAQ structured data (safe: uses our own translation strings)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <section
        id="faq"
        className="py-24 md:py-40 border-t border-border"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto px-4">
          <h2
            id="faq-heading"
            className="text-3xl md:text-5xl font-display font-extrabold mb-12 md:mb-24 text-center tracking-tight leading-[1.15] px-4"
          >
            {t('title')}
          </h2>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl md:rounded-4xl border border-border bg-card overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => {
                    const isOpening = openIndex !== index;
                    if (isOpening) {
                      analytics.faqExpand(index, item.question);
                    }
                    setOpenIndex(openIndex === index ? null : index);
                  }}
                  className="cursor-pointer w-full px-6 py-6 md:px-10 md:py-10 flex items-center justify-between text-left hover:bg-[oklch(0.5_0_0_/_0.02)] transition-colors group"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-bold text-lg md:text-2xl pr-8 group-hover:text-primary transition-colors leading-tight">
                    {item.question}
                  </span>
                  <div
                    className={`shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                      openIndex === index
                        ? 'bg-primary text-white'
                        : 'bg-[oklch(0.5_0_0_/_0.05)] text-zinc-400'
                    }`}
                  >
                    {openIndex === index ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    openIndex === index ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 md:px-10 pb-8 md:pb-12 text-zinc-600 dark:text-zinc-400 leading-[1.625] font-medium text-base md:text-xl">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
