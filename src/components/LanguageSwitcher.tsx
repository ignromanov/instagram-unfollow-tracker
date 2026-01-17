'use client';

import { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '@/locales';
import { detectLanguageFromPathname } from '@/config/languages';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { analytics } from '@/lib/analytics';
import { useTranslation } from 'react-i18next';

/**
 * Get current path without currentLanguage prefix
 */
function getPathWithoutLang(pathname: string): string {
  const langPrefixes = SUPPORTED_LANGUAGES.filter(l => l !== 'en').map(l => `/${l}`);

  for (const prefix of langPrefixes) {
    if (pathname === prefix) {
      return '/';
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length);
    }
  }

  return pathname;
}

export function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const { setLanguage } = useAppStore();
  const location = useLocation();

  // Prevent hydration mismatch - Radix generates different IDs on server vs client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Get currentLanguage from URL synchronously (source of truth)
  const currentLanguage = detectLanguageFromPathname(location.pathname);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    analytics.languageChange(lang);

    // Update store BEFORE redirect - this persists the preference to localStorage
    // so that future visits to currentLanguage-less paths will redirect correctly
    setLanguage(lang);

    // Full page reload to get correct SSG HTML for new currentLanguage
    const basePath = getPathWithoutLang(location.pathname);
    const newPath = lang === 'en' ? basePath : `/${lang}${basePath === '/' ? '' : basePath}`;

    window.location.href = newPath || '/';
  };

  // Static placeholder during SSG - matches structure but no Radix (avoids ID mismatch)
  if (!mounted) {
    return (
      <button
        className="cursor-pointer flex items-center gap-1.5 p-2.5 md:px-3 md:py-2 rounded-2xl hover:bg-[oklch(0.5_0_0_/_0.05)] transition-colors text-zinc-500"
        aria-label={t('language.changeLanguage')}
      >
        <Globe size={20} />
        <span className="hidden md:inline text-xs font-bold uppercase">{currentLanguage}</span>
        <ChevronDown size={14} className="hidden md:block" />
      </button>
    );
  }

  // Full Radix dropdown after mount
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="cursor-pointer flex items-center gap-1.5 p-2.5 md:px-3 md:py-2 rounded-2xl hover:bg-[oklch(0.5_0_0_/_0.05)] transition-colors text-zinc-500"
          aria-label={t('language.changeLanguage')}
        >
          <Globe size={20} />
          <span className="hidden md:inline text-xs font-bold uppercase">{currentLanguage}</span>
          <ChevronDown size={14} className="hidden md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {SUPPORTED_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`cursor-pointer ${
              currentLanguage === lang ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
          >
            <span className="uppercase text-xs font-bold w-6">{lang}</span>
            <span className="ml-2">{LANGUAGE_NAMES[lang]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
