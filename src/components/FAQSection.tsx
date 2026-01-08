import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Is it safe to use? Do you need my Instagram password?',
    answer:
      'Absolutely safe! We never ask for your Instagram password or login. This tool works entirely with the official data export from Instagram — a ZIP file you download directly from Meta. Your credentials stay with you.',
  },
  {
    question: 'How do I get my Instagram data?',
    answer:
      'Go to Instagram Settings → Privacy and Security → Download Your Data → Request Download (JSON format). Instagram will email you a link within 24-48 hours. Download the ZIP file and upload it here.',
  },
  {
    question: 'Does it work with the ZIP file from Instagram?',
    answer:
      "Yes! This tool is specifically designed for Instagram's official data export (ZIP file). This is the safest and most privacy-respecting way to analyze your followers — no third-party API access needed.",
  },
  {
    question: 'Can I use it offline?',
    answer:
      'Yes! Once the page loads, everything works offline. Your data is processed entirely in your browser and stored locally. No internet connection required for analysis.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Yes! The app is fully responsive and works great on mobile devices. 81% of our users access it from their phones.',
  },
  {
    question: 'How many followers can it handle?',
    answer:
      "We've tested with over 1,000,000 accounts and it works flawlessly. The app uses advanced compression and filtering techniques to handle massive datasets in milliseconds.",
  },
  {
    question: 'How is this different from paid apps?',
    answer:
      'Unlike paid apps that require your Instagram login (risking your account), charge monthly fees, and store your data on their servers — this tool is 100% free, requires no login, and processes everything locally on your device.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Only on YOUR device. We use IndexedDB (browser storage) to keep your data. Nothing is ever sent to our servers. When you close the browser, you control what happens to your data.',
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema()),
        }}
      />
      <section
        className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
        aria-labelledby="faq-heading"
      >
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about using Instagram Unfollow Tracker
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            aria-label="Frequently asked questions"
          >
            {faqItems.map((item, index) => (
              <AccordionItem key={`faq-${index}`} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
