'use client';

import { Globe, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '@/locales';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { analytics } from '@/lib/analytics';
import { useTranslation } from 'react-i18next';

/**
 * Get current path without language prefix
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
  const { language, setLanguage } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageChange = (lang: SupportedLanguage) => {
    // Update store
    setLanguage(lang);
    analytics.languageChange(lang);

    // Navigate to new language path
    const basePath = getPathWithoutLang(location.pathname);
    const newPath = lang === 'en' ? basePath : `/${lang}${basePath === '/' ? '' : basePath}`;

    navigate(newPath || '/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="cursor-pointer flex items-center gap-1.5 p-2.5 md:px-3 md:py-2 rounded-2xl hover:bg-[oklch(0.5_0_0_/_0.05)] transition-colors text-zinc-500"
          aria-label={t('language.changeLanguage')}
        >
          <Globe size={20} />
          <span className="hidden md:inline text-xs font-bold uppercase">{language}</span>
          <ChevronDown size={14} className="hidden md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {SUPPORTED_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`cursor-pointer ${
              language === lang ? 'bg-primary/10 text-primary font-bold' : ''
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
