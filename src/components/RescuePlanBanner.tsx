'use client';

import { TrendingDown, Sparkles, MessageSquare, Video, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RescuePlanBannerProps {
  onDismiss?: () => void;
}

export function RescuePlanBanner({ onDismiss }: RescuePlanBannerProps) {
  const { t } = useTranslation('results');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const tools = [
    {
      name: 'Submagic',
      descKey: 'rescue.tools.submagic',
      icon: Video,
      url: 'https://submagic.co/?via=safeunfollow',
      color: 'text-purple-500',
    },
    {
      name: 'Predis.ai',
      descKey: 'rescue.tools.predis',
      icon: Sparkles,
      url: 'https://predis.ai/?ref=safeunfollow',
      color: 'text-blue-500',
    },
    {
      name: 'ManyChat',
      descKey: 'rescue.tools.manychat',
      icon: MessageSquare,
      url: 'https://manychat.com/?ref=safeunfollow',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900 rounded-3xl p-6 md:p-8">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        aria-label={t('rescue.dismiss')}
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-2xl shrink-0">
          <TrendingDown className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-white">
            {t('rescue.title')}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm md:text-base">
            {t('rescue.subtitle')}
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {tools.map(tool => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <tool.icon className={`w-5 h-5 ${tool.color}`} />
              <span className="font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                {tool.name}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(tool.descKey as any)}</p>
          </a>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-400 mt-4 text-center">{t('rescue.disclaimer')}</p>
    </div>
  );
}
