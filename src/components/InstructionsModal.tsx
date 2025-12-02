'use client';

import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { analytics } from '@/lib/analytics';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileJson,
  Shield,
  Zap,
  Search,
  Filter,
  ExternalLink as ExternalLinkIcon,
  Keyboard,
  Instagram,
  ArrowRight,
} from 'lucide-react';

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructionsModal({ open, onOpenChange }: InstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Help & Guide</DialogTitle>
              <DialogDescription>Everything you need to know to get started</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="download" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">Download Data</TabsTrigger>
            <TabsTrigger value="usage">How to Use</TabsTrigger>
            <TabsTrigger value="tips">Tips & FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-6 mt-6">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    Estimated Time: 5 minutes + 24-48 hours wait
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setting up takes 5 minutes. Instagram needs 24-48 hours to prepare your data.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                >
                  {/* Step Number */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-sm">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-card-foreground leading-tight">
                        {step.title}
                      </h4>
                      {step.badge && (
                        <Badge
                          variant={step.badge === 'Required' ? 'destructive' : 'secondary'}
                          className="shrink-0"
                        >
                          {step.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2"
                        onClick={() => analytics.linkClick('meta_accounts')}
                      >
                        Open Meta Accounts Center
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Once you receive the download link via email, return here and upload the ZIP file to
                analyze your connections instantly.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6 mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={Search}
                title="Search Accounts"
                description="Type any username to instantly find accounts in your followers or following list."
                color="blue"
              />
              <FeatureCard
                icon={Filter}
                title="Smart Filters"
                description="Use badge filters to find mutual followers, people who don't follow back, and more."
                color="purple"
              />
              <FeatureCard
                icon={ExternalLinkIcon}
                title="Open Profiles"
                description="Click the external link icon on any account to open their Instagram profile in a new tab."
                color="green"
              />
              <FeatureCard
                icon={Zap}
                title="Real-time Stats"
                description="See live statistics about your followers, following, and mutual connections."
                color="orange"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Tips for Best Results
              </h3>
              <div className="space-y-3">
                <TipItem tip="Use filters to narrow down results before searching for specific accounts" />
                <TipItem tip="Processing time shown in search bar helps you gauge performance with large datasets" />
                <TipItem tip="The app works completely offline after loading - your data never leaves your device" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4 mt-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">Processing Time</p>
                <p className="text-sm">
                  Instagram typically takes 24-48 hours to prepare your data. You'll receive an
                  email with a download link when ready.
                </p>
              </AlertDescription>
            </Alert>

            <Alert>
              <FileJson className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">Select Only What You Need</p>
                <p className="text-sm">
                  Choose ONLY "Followers and Following" section. Downloading all data takes much
                  longer and isn't necessary.
                </p>
              </AlertDescription>
            </Alert>

            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">Download Link Expires</p>
                <p className="text-sm">
                  The download link expires after a few days. Download your data as soon as you
                  receive the email.
                </p>
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">Your Privacy is Protected</p>
                <p className="text-sm">
                  All processing happens locally in your browser. Your data never leaves your
                  device. We don't store or transmit anything.
                </p>
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">JSON Format Required</p>
                <p className="text-sm">
                  You MUST select JSON format (not HTML) when requesting your data. HTML format is
                  not compatible with this tool.
                </p>
              </AlertDescription>
            </Alert>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <FAQItem
                  question="Is my data safe?"
                  answer="Yes! Everything is processed locally in your browser. Your data never leaves your device."
                />
                <FAQItem
                  question="Why does it take so long?"
                  answer="Instagram needs time to compile your data. This is Instagram's process, not ours. Usually takes 24-48 hours."
                />
                <FAQItem
                  question="Can I use HTML format?"
                  answer="No, you must use JSON format. HTML format is not compatible with this tool."
                />
                <FAQItem
                  question="What if my file won't upload?"
                  answer="Make sure you're uploading the ZIP file directly from Instagram, and that you selected JSON format."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <div className={`inline-flex rounded-lg p-2.5 ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TipItem({ tip }: { tip: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3 shadow-sm">
      <div className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary mt-2" />
      <span className="text-sm text-muted-foreground">{tip}</span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-2 shadow-sm">
      <h4 className="font-semibold text-sm">{question}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}

const steps = [
  {
    title: 'Go to Meta Accounts Center',
    description: 'Visit the Meta Accounts Center where you can manage your Instagram data.',
    link: 'https://accountscenter.instagram.com/',
    badge: undefined,
  },
  {
    title: 'Log in to your account',
    description: 'Sign in with your Instagram credentials to access your account settings.',
    link: undefined,
    badge: undefined,
  },
  {
    title: 'Navigate to "Your information and permissions"',
    description: 'Find this section in the left sidebar of the Accounts Center.',
    link: undefined,
    badge: undefined,
  },
  {
    title: 'Click "Download your information"',
    description: 'This will open the data download request page.',
    link: undefined,
    badge: undefined,
  },
  {
    title: 'Select "Some of your information"',
    description: 'Choose this option to download only specific data instead of everything.',
    link: undefined,
    badge: undefined,
  },
  {
    title: 'Choose ONLY "Followers and Following" section',
    description: 'Uncheck all other options. We only need your followers and following data.',
    link: undefined,
    badge: 'Important',
  },
  {
    title: 'Select "JSON" format',
    description:
      'Make sure to choose JSON format, not HTML. JSON is required for this tool to work.',
    link: undefined,
    badge: 'Required',
  },
  {
    title: 'Set date range to "All time"',
    description: 'This ensures you get your complete follower history.',
    link: undefined,
    badge: undefined,
  },
  {
    title: 'Submit request',
    description:
      "Click submit and wait for Instagram to email you. This usually takes up to 48 hours. You'll receive a download link via email.",
    link: undefined,
    badge: undefined,
  },
] as const;
