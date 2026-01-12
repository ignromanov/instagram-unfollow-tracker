'use client';

import { useState, useEffect } from 'react';
import { Heart, Shield, EyeOff, Eye, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analytics, isTrackingOptedOut, optOutOfTracking, optIntoTracking } from '@/lib/analytics';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useTranslation('common');
  const prefix = useLanguagePrefix();
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
    <footer className="mt-12 md:mt-20 border-t border-border bg-surface py-10 md:py-14">
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
              {t('footer.description')}
            </p>
          </div>

          {/* Links & Support */}
          <div className="flex flex-col items-center md:items-end gap-8">
            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-12 gap-y-6 text-xs md:text-sm font-black uppercase tracking-widest text-zinc-400">
              <a
                href={`${prefix}/privacy`}
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
                onClick={() => analytics.linkClick('privacy-policy')}
              >
                {t('footer.privacyPolicy')}
              </a>
              <a
                href={`${prefix}/terms`}
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
                onClick={() => analytics.linkClick('terms-of-service')}
              >
                {t('footer.termsOfService')}
              </a>
              <a
                href="mailto:hello@safeunfollow.app"
                className="hover:text-primary transition-colors py-2 px-1 cursor-pointer"
              >
                {t('footer.contact')}
              </a>
              <button
                onClick={handleTrackingToggle}
                className={`cursor-pointer hover:text-primary transition-colors py-2 px-1 flex items-center gap-1.5 ${
                  isOptedOut ? 'text-emerald-500' : ''
                }`}
                title={isOptedOut ? t('footer.trackingDisabled') : t('footer.trackingEnabled')}
              >
                {isOptedOut ? <Eye size={14} /> : <EyeOff size={14} />}
                {isOptedOut ? t('footer.trackingOff') : t('footer.dontTrackMe')}
              </button>
              <a
                href="https://github.com/ignromanov/instagram-unfollow-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors py-2 px-1 flex items-center gap-1.5 cursor-pointer"
                onClick={() => analytics.linkClick('github')}
              >
                <Github size={14} />
                {t('footer.viewSource')}
              </a>
            </div>

            {/* BuyMeaCoffee Section */}
            <div className="bg-[oklch(0.5_0_0_/_0.03)] p-6 md:p-8 rounded-3xl border border-border flex flex-col items-center gap-5 shadow-sm w-full md:w-auto">
              <p className="text-xs md:text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">
                {t('footer.keepItFree')}
              </p>
              <a
                href="https://www.buymeacoffee.com/ignromanov"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-sm md:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center cursor-pointer"
                onClick={() => analytics.linkClick('buy-me-coffee')}
              >
                <Shield size={22} className="fill-current" />
                <span>{t('footer.supportPrivacy')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-sm text-zinc-400 font-bold">
          <div className="flex items-center gap-2">
            {t('footer.madeWithLove')}{' '}
            <Heart size={16} className="text-rose-500 fill-current animate-pulse" />{' '}
            {t('footer.forTheCommunity')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
            <span>{t('footer.copyright')}</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-primary opacity-90 uppercase tracking-tighter">
              {t('footer.license')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
