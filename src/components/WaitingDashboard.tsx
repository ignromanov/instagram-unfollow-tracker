'use client';

import { useCallback } from 'react';
import { Clock, Calendar, ArrowRight, FileUp } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from './ui/button';

interface WaitingDashboardProps {
  onUploadNow: () => void;
  onSkip?: () => void;
}

export function WaitingDashboard({ onUploadNow, onSkip }: WaitingDashboardProps) {
  const { t } = useTranslation('upload');

  const handleCalendarReminder = useCallback(() => {
    // Create calendar event data
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 48);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      t('waiting.calendarTitle')
    )}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${
      endDate.toISOString().replace(/[-:]/g, '').split('.')[0]
    }Z&details=${encodeURIComponent(t('waiting.calendarDetails'))}`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  }, [t]);

  return (
    <div className="max-w-2xl mx-auto text-center py-12 px-4">
      {/* Pulsing clock icon */}
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
        <Clock size={48} />
      </div>

      {/* Title and description */}
      <h1 className="text-4xl font-bold mb-4">{t('waiting.title')}</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        {t('waiting.description')}
      </p>

      {/* Reminder buttons - horizontal layout */}
      <div className="grid gap-4 mb-10">
        <button
          onClick={handleCalendarReminder}
          className="cursor-pointer w-full flex items-center gap-4 p-6 h-auto rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-card transition-all text-left group"
        >
          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Calendar size={24} />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-lg text-foreground">{t('waiting.addReminder')}</div>
            <div className="text-sm text-muted-foreground">{t('waiting.reminderHint')}</div>
          </div>
          <ArrowRight className="text-muted-foreground" size={20} />
        </button>
      </div>

      {/* Upload now CTA - centered flex-col with circular icon */}
      <div className="p-8 rounded-3xl bg-primary/5 border-2 border-primary/20 mb-12 shadow-inner">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
            <FileUp size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{t('waiting.haveFile')}</h3>
            <p className="text-muted-foreground mb-4">{t('waiting.haveFileHint')}</p>
            <Button onClick={onUploadNow} size="lg" className="group">
              {t('waiting.uploadNow')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pro tip with emoji */}
      <div className="flex items-start gap-4 p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 text-left shadow-sm">
        <div className="text-2xl mt-0.5">💡</div>
        <div>
          <div className="font-bold text-yellow-700 dark:text-yellow-500 text-lg mb-1">
            {t('waiting.proTip')}
          </div>
          <p className="text-yellow-600/90 dark:text-yellow-600/80">
            <Trans i18nKey="waiting.proTipHint" ns="upload">
              Instagram emails often end up there. Look for emails from <b>Meta</b> or{' '}
              <b>Instagram</b>. The download link expires in 4 days.
            </Trans>
          </p>
        </div>
      </div>

      {/* Optional skip button */}
      {onSkip && (
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            {t('waiting.skip')}
          </Button>
        </div>
      )}
    </div>
  );
}
