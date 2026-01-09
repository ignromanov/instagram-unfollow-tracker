'use client';

import { useState, useEffect } from 'react';
import { Heart, Shield, EyeOff, Eye } from 'lucide-react';
import { analytics, isTrackingOptedOut, optOutOfTracking, optIntoTracking } from '@/lib/analytics';
import { Logo } from './Logo';

export function Footer() {
  const [isOptedOut, setIsOptedOut] = useState(false);

  useEffect(() => {
    setIsOptedOut(isTrackingOptedOut());
  }, []);

  const handleTrackingToggle = () => {
    if (isOptedOut) {
      optIntoTracking(); // This will reload the page
    } else {
      optOutOfTracking();
      setIsOptedOut(true);
    }
  };

  return (
    <footer className="mt-12 md:mt-20 border-t border-border bg-surface py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <div className="font-bold text-2xl mb-6 flex items-center justify-center md:justify-start gap-4 group">
              <Logo
                size={56}
                className="md:w-16 md:h-16 shadow-2xl group-hover:rotate-12 transition-transform"
              />
              <span className="text-3xl md:text-5xl font-display font-extrabold tracking-tight leading-none">
                SafeUnfollow<span className="text-primary">.app</span>
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-base md:text-lg leading-relaxed font-medium mx-auto md:mx-0">
              The only relationship analyzer that works 100% in your browser. No server, no logs,
              just your data and your device.
            </p>
          </div>

          {/* Links & Support */}
          <div className="flex flex-col items-center md:items-end gap-8">
            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-12 gap-y-6 text-xs md:text-sm font-black uppercase tracking-widest text-zinc-400">
              <a
                href="#privacy"
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
                onClick={() => analytics.linkClick('privacy-policy')}
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
                onClick={() => analytics.linkClick('terms-of-service')}
              >
                Terms of Service
              </a>
              <a
                href="mailto:support@safeunfollow.app"
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
              >
                Contact Support
              </a>
              <button
                onClick={handleTrackingToggle}
                className={`cursor-pointer hover:text-primary transition-colors py-2 px-1 flex items-center gap-1.5 ${
                  isOptedOut ? 'text-emerald-500' : ''
                }`}
                title={isOptedOut ? 'Analytics disabled' : 'Disable anonymous analytics'}
              >
                {isOptedOut ? <Eye size={14} /> : <EyeOff size={14} />}
                {isOptedOut ? 'Tracking Off' : "Don't Track Me"}
              </button>
            </div>

            {/* BuyMeaCoffee Section */}
            <div className="bg-[oklch(0.5_0_0_/_0.03)] p-6 md:p-8 rounded-3xl border border-border flex flex-col items-center gap-5 shadow-sm w-full md:w-auto">
              <p className="text-xs md:text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">
                Keep it free & private
              </p>
              <a
                href="https://www.buymeacoffee.com/ignromanov"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-sm md:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center cursor-pointer"
                onClick={() => analytics.linkClick('buy-me-coffee')}
              >
                <Shield size={22} className="fill-current" />
                <span>Support privacy</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8 text-sm text-zinc-400 font-bold">
          <div className="flex items-center gap-2">
            Made with <Heart size={16} className="text-rose-500 fill-current animate-pulse" /> for
            the Community
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
            <span>© 2026 SafeUnfollow.app</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-primary opacity-90 uppercase tracking-tighter">MIT Licensed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
