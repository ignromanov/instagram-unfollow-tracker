import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Is this really private?',
    answer:
      "Yes. All processing happens entirely within your web browser. Your data is never uploaded to any server. You can even use this app offline once it's loaded.",
  },
  {
    question: 'Why do I need to download a ZIP file?',
    answer:
      "Platforms restrict apps from seeing certain data through their official API to prevent 'spam'. The only safe, authorized way to get this data without risking your account is through their official 'Download Your Information' tool.",
  },
  {
    question: 'Will my account be safe?',
    answer:
      "Yes. Unlike other apps that ask for your password and 'scrape' data (which violates Terms of Service), this tool uses your official data export. It's 100% safe.",
  },
  {
    question: 'How many accounts can this handle?',
    answer:
      "We've tested this tool with exports containing over 1,000,000 accounts. We use high-performance virtual scrolling and local indexing to keep the experience smooth even for huge datasets.",
  },
  {
    question: 'Is this really free?',
    answer:
      'Yes. This tool is open-source and free to use. There are no subscriptions, paywalls, or hidden limits.',
  },
];

function generateFAQSchema() {
  return {
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
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema()),
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
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl md:rounded-4xl border border-border bg-card overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
