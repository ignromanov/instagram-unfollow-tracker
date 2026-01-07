import { CheckCircle2 } from 'lucide-react';

interface HowToStep {
  name: string;
  text: string;
}

const howToSteps: HowToStep[] = [
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
    step: howToSteps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function HowToSection() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHowToSchema()),
        }}
      />
      <section className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How to Check Who Unfollowed You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to download your Instagram data and analyze your followers —
              no login required, completely private.
            </p>
          </div>

          <ol className="relative border-l border-muted-foreground/20 ml-4 space-y-6">
            {howToSteps.map((step, index) => (
              <li key={`step-${index}`} className="ml-6">
                <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium ring-4 ring-background">
                  {index + 1}
                </span>
                <div className="pt-1">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    {step.name}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Total time: ~5 minutes (plus waiting for Instagram to prepare your data)
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
