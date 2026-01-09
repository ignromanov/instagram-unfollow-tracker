'use client';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileWarning,
  Info,
  Loader2,
  Upload,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';

export interface UploadError {
  title: string;
  message: string;
}

export interface UploadZoneProps {
  onUploadStart: (file: File) => void;
  onBack?: () => void;
  onOpenWizard?: () => void;
  isProcessing?: boolean;
  error?: UploadError | string | null;
}

export function UploadZone({
  onUploadStart,
  onBack,
  onOpenWizard,
  isProcessing = false,
  error,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.zip')) {
        onUploadStart(file);
      }
    },
    [onUploadStart]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUploadStart(file);
      }
    },
    [onUploadStart]
  );

  const errorData = typeof error === 'string' ? { title: 'Error', message: error } : error;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-24">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary md:mb-12"
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Main upload area - 3 columns */}
        <div className="space-y-8 lg:col-span-3">
          {/* Title */}
          <div className="text-center md:text-left">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-6xl">
              Upload Your Data
            </h1>
            <p className="text-base font-medium text-zinc-500 md:text-lg">
              Your data remains 100% private. We analyze everything locally in your browser.
            </p>
          </div>

          {/* Drag & drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              group relative flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-4xl border-4 border-dashed p-8 transition-all duration-500
              md:aspect-video
              ${
                isDragOver
                  ? 'scale-[1.02] border-primary bg-primary/10 shadow-2xl'
                  : 'border-border bg-card shadow-sm hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl'
              }
            `}
          >
            <input
              type="file"
              accept=".zip"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isProcessing}
              aria-label="Upload Instagram data ZIP file"
            />

            {isProcessing ? (
              <div className="animate-in fade-in text-center">
                <Loader2
                  className="mx-auto mb-6 h-16 w-16 animate-spin text-primary"
                  aria-hidden="true"
                />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
                  Analyzing locally...
                </h3>
                <p className="font-medium text-zinc-500">
                  Processing large datasets (up to 1M+) can take a moment.
                </p>
              </div>
            ) : (
              <div className="text-center">
                {/* Icon */}
                <div
                  className={`
                    mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-3xl transition-all duration-500
                    md:h-24 md:w-24
                    ${
                      isDragOver
                        ? 'rotate-12 bg-primary text-white'
                        : 'bg-zinc-100 text-zinc-400 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white dark:bg-zinc-800'
                    }
                  `}
                >
                  <Upload size={36} className="md:size-48" aria-hidden="true" />
                </div>

                {/* Upload prompt */}
                <h3 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white md:text-4xl">
                  Drop your Instagram ZIP
                </h3>
                <p className="mx-auto mb-8 max-w-sm text-sm font-medium text-zinc-500 md:text-lg">
                  Or tap to browse your local storage.
                </p>

                {/* JSON Format badge */}
                <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-sm dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertCircle size={14} aria-hidden="true" /> JSON Format Only
                </div>
              </div>
            )}
          </div>

          {/* Error state */}
          {errorData && (
            <div className="animate-in slide-in-from-top-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="mb-2 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <FileWarning size={18} aria-hidden="true" /> {errorData.title}
              </div>
              <p className="text-sm font-medium leading-relaxed">{errorData.message}</p>
              {onOpenWizard && (
                <button
                  onClick={onOpenWizard}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest underline decoration-rose-200"
                >
                  Re-read the guide to fix this
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pre-upload Checklist */}
          <div className="rounded-4xl border border-border bg-card p-8 shadow-sm">
            <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
              <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" /> Pre-upload
              Checklist
            </h4>
            <ul className="space-y-5">
              {[
                'Format: JSON (not HTML)',
                "Includes: 'Followers and following'",
                "Timeframe: 'All Time'",
                'File type: .zip',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Most Common Error */}
          <div className="rounded-4xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
              <Info size={16} className="text-primary" aria-hidden="true" /> Most Common Error
            </h4>
            <p className="text-xs font-medium leading-relaxed text-zinc-500 md:text-sm">
              If your export has 0 followers, you likely exported in <strong>HTML</strong> format or
              didn't select the "Followers and following" information category.
            </p>
            {onOpenWizard && (
              <button
                onClick={onOpenWizard}
                className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Learn how to fix <ArrowLeft className="rotate-180" size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
