'use client';

import type React from 'react';
import { Shield, Github, UserCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAppStore } from '@/lib/store';

export function HeroStep() {
  const advanceJourney = useAppStore(s => s.advanceJourney);

  return (
    <div className="text-center space-y-6 sm:space-y-8 py-4 sm:py-8">
      {/* Logo and main heading */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-center">
          <Logo size={64} className="text-primary sm:w-20 sm:h-20" />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground px-2">
            See Who Unfollowed You
            <br className="sm:hidden" /> — No Login Required
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-muted-foreground sm:text-base px-2">
            <span>No Login Needed</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Free Forever</span>
            <span className="text-muted-foreground/50">•</span>
            <Badge
              variant="secondary"
              className="gap-1 px-2.5 py-1 text-xs font-medium min-h-[28px]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              1M+ Accounts Tested
            </Badge>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center px-2">
        <Badge variant="secondary" className="gap-1.5 justify-center py-2 min-h-[44px] text-sm">
          <Shield className="h-4 w-4" aria-hidden="true" />
          100% Private
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center py-2 min-h-[44px] text-sm">
          <Github className="h-4 w-4" aria-hidden="true" />
          Open Source
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center py-2 min-h-[44px] text-sm">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          No Login Required
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center py-2 min-h-[44px] text-sm">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Local Processing
        </Badge>
      </div>

      {/* Call to action */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
        <Button
          size="lg"
          onClick={() => advanceJourney('how-to')}
          className="text-sm sm:text-base px-6 sm:px-8 py-3 min-h-[48px] w-full sm:w-auto"
        >
          <span className="sm:hidden">Get Started — How to Get Data?</span>
          <span className="hidden sm:inline">Get Started — How to Get My Data?</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => advanceJourney('upload')}
          className="text-sm sm:text-base px-6 sm:px-8 py-3 min-h-[48px] w-full sm:w-auto"
        >
          <span className="sm:hidden">I Have My Data</span>
          <span className="hidden sm:inline">I Already Have My Data</span>
        </Button>
      </div>

      {/* Value proposition */}
      <div className="max-w-2xl mx-auto text-muted-foreground px-4 sm:px-6">
        <p className="text-pretty text-base sm:text-lg leading-relaxed">
          The only Instagram unfollow tracker that works 100% locally in your browser. No servers,
          no login, no risk to your account. Just upload your official Instagram data export and see
          who unfollowed you instantly.
        </p>
      </div>
    </div>
  );
}
