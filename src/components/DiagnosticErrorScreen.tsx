'use client';

import type { DiagnosticError, DiagnosticErrorCode, ParseWarning } from '@/core/types';
import { createDiagnosticError, mapWarningToDiagnosticCode } from '@/core/types';
import {
  AlertTriangle,
  ArrowLeft,
  Code2,
  FileArchive,
  FileQuestion,
  FileX2,
  FolderX,
  RefreshCw,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface DiagnosticErrorScreenProps {
  /** Error code for direct error display */
  errorCode?: DiagnosticErrorCode;
  /** Custom error message (overrides default) */
  errorMessage?: string;
  /** Parse warnings from parser (will extract first error) */
  parseWarnings?: ParseWarning[];
  /** Callback when user wants to try again */
  onTryAgain?: () => void;
  /** Callback to open wizard/guide */
  onOpenWizard?: () => void;
  /** Callback to go back */
  onBack?: () => void;
}

/** Get icon component for error type */
function getErrorIcon(icon: DiagnosticError['icon']) {
  const iconProps = { size: 48, strokeWidth: 1.5 };

  switch (icon) {
    case 'html':
      return <Code2 {...iconProps} />;
    case 'zip':
      return <FileArchive {...iconProps} />;
    case 'folder':
      return <FolderX {...iconProps} />;
    case 'file':
      return <FileX2 {...iconProps} />;
    default:
      return <FileQuestion {...iconProps} />;
  }
}

/** Get color scheme for error severity */
function getColorScheme(severity: DiagnosticError['severity']) {
  if (severity === 'warning') {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      icon: 'text-amber-500',
      title: 'text-amber-700 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-300',
    };
  }

  return {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-200 dark:border-rose-900/50',
    icon: 'text-rose-500',
    title: 'text-rose-700 dark:text-rose-400',
    text: 'text-rose-600 dark:text-rose-300',
  };
}

export function DiagnosticErrorScreen({
  errorCode,
  errorMessage,
  parseWarnings,
  onTryAgain,
  onOpenWizard,
  onBack,
}: DiagnosticErrorScreenProps) {
  const { t } = useTranslation('upload');

  // Derive diagnostic error from props
  const diagnosticError = useMemo((): DiagnosticError => {
    // Direct error code takes priority
    if (errorCode) {
      return createDiagnosticError(errorCode, errorMessage);
    }

    // Extract from parse warnings
    if (parseWarnings?.length) {
      const firstError = parseWarnings.find(w => w.severity === 'error');
      if (firstError) {
        const code = mapWarningToDiagnosticCode(firstError.code);
        return createDiagnosticError(code, firstError.message);
      }
    }

    // Fallback to unknown error
    return createDiagnosticError('UNKNOWN', errorMessage);
  }, [errorCode, errorMessage, parseWarnings]);

  const colors = getColorScheme(diagnosticError.severity);
  const Icon = getErrorIcon(diagnosticError.icon);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-8 flex cursor-pointer items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} /> {t('diagnostic.back')}
        </button>
      )}

      {/* Error card */}
      <div
        className={`animate-in slide-in-from-top-4 rounded-4xl border-2 ${colors.border} ${colors.bg} p-8 md:p-12`}
      >
        {/* Icon */}
        <div className={`mb-6 ${colors.icon}`}>{Icon}</div>

        {/* Title */}
        <div className="mb-2 flex items-center gap-3">
          <AlertTriangle size={20} className={colors.icon} aria-hidden="true" />
          <h2 className={`text-sm font-black uppercase tracking-widest ${colors.title}`}>
            {diagnosticError.title}
          </h2>
        </div>

        {/* Message */}
        <p className={`mb-6 text-base font-medium leading-relaxed md:text-lg ${colors.text}`}>
          {diagnosticError.message}
        </p>

        {/* Fix section */}
        <div className="mb-8 rounded-2xl bg-white/60 p-6 dark:bg-black/20">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
            {t('diagnostic.howToFix')}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
            {diagnosticError.fix}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {onTryAgain && (
            <button
              onClick={onTryAgain}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <RefreshCw size={18} />
              {t('diagnostic.tryAgain')}
            </button>
          )}

          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 ${colors.border} px-6 py-3 text-sm font-bold ${colors.title} transition-all hover:bg-white/50 dark:hover:bg-black/20`}
            >
              {t('diagnostic.showMistakes')}
            </button>
          )}
        </div>
      </div>

      {/* Common mistakes hint */}
      <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          {t('diagnostic.commonMistakes')}
        </h4>
        <ul className="space-y-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
            <span>
              <strong>{t('diagnostic.mistakes.html.title')}</strong> —{' '}
              {t('diagnostic.mistakes.html.description')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span>
              <strong>{t('diagnostic.mistakes.missingData.title')}</strong> —{' '}
              {t('diagnostic.mistakes.missingData.description')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>
              <strong>{t('diagnostic.mistakes.wrongFile.title')}</strong> —{' '}
              {t('diagnostic.mistakes.wrongFile.description')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
