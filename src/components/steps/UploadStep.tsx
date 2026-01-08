'use client';

import React, { useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ParseResultDisplay } from '@/components/ParseResultDisplay';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useAppStore } from '@/lib/store';
import { AlertCircle, BookOpen, FileArchive, Info, Upload } from 'lucide-react';

export function UploadStep() {
  const { uploadState, handleZipUpload } = useInstagramData();
  const advanceJourney = useAppStore(s => s.advanceJourney);

  // Auto-advance to results when upload succeeds
  useEffect(() => {
    if (uploadState.status === 'success') {
      advanceJourney('results');
    }
  }, [uploadState.status, advanceJourney]);

  const handleFileSelect = async (file: File) => {
    try {
      await handleZipUpload(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.zip')) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const isLoading = uploadState.status === 'loading';
  const error = uploadState.error;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Introduction */}
      <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Upload Your Instagram Data
        </h3>
        <p className="text-pretty text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Upload the ZIP file you received from Instagram. All processing happens locally in your
          browser — your data never leaves your device.
        </p>
      </div>

      {/* Important notice about JSON format */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">JSON format required</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          When requesting your data from Instagram, make sure to select{' '}
          <strong className="text-foreground">JSON format</strong> (not HTML). The file should be a
          ZIP containing <code className="text-xs bg-muted px-1 rounded">following.json</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">followers_*.json</code> files.
        </AlertDescription>
      </Alert>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="group relative rounded-xl border-2 border-dashed border-border bg-card p-6 sm:p-12 text-center transition-all hover:border-primary hover:bg-accent/50 focus-within:ring-4 focus-within:ring-ring/50 focus-within:border-primary cursor-grab active:cursor-grabbing mx-2 sm:mx-0"
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed opacity-0"
          disabled={isLoading}
          aria-label="Upload Instagram data ZIP file"
        />

        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="rounded-full bg-primary/10 p-5 sm:p-6 transition-transform group-hover:scale-110">
            {isLoading ? (
              <div
                role="status"
                aria-label="Processing your Instagram data"
                className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
              />
            ) : (
              <FileArchive className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="text-balance text-lg sm:text-xl font-semibold text-card-foreground px-2">
              {isLoading ? 'Processing your data...' : 'Drop your Instagram data here'}
            </h4>
            <p className="text-pretty text-xs sm:text-sm text-muted-foreground px-2">
              {isLoading
                ? 'Large files are cached for instant reload'
                : 'or click to browse for your ZIP file'}
            </p>
          </div>

          {!isLoading && (
            <Button size="lg" className="mt-2 sm:mt-4 min-h-[48px] px-6">
              <Upload className="mr-2 h-5 w-5" />
              Select ZIP File
            </Button>
          )}
        </div>
      </div>

      {/* Show detailed parse result with file discovery */}
      <ParseResultDisplay />

      {/* Fallback error display for non-parse errors */}
      {error &&
        !error.includes('format') &&
        !error.includes('export') &&
        !error.includes('ZIP') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
          </Alert>
        )}

      {/* Quick help */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 sm:p-6 mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h5 className="text-sm sm:text-base font-semibold text-card-foreground">Need help?</h5>
          <Button
            variant="outline"
            size="sm"
            onClick={() => advanceJourney('how-to')}
            className="gap-2 shrink-0 bg-transparent w-full sm:w-auto min-h-[40px] text-xs sm:text-sm"
          >
            <BookOpen className="h-4 w-4" />
            <span className="sm:hidden">Guide</span>
            <span className="hidden sm:inline">View detailed guide</span>
          </Button>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Common issue:</strong> Make sure you selected{' '}
            <strong>JSON format</strong> when downloading your data from Instagram.
          </p>
          <p>
            <strong className="text-foreground">File size:</strong> Expect 100KB - 10MB depending on
            your follower count.
          </p>
          <p>
            <strong className="text-foreground">Privacy:</strong> Your data is processed locally and
            never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
