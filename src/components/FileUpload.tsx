'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { FileUploadProps } from '@/types/components';
import { AlertCircle, BookOpen, FileArchive, Upload } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';

export function FileUpload({ onFileSelect, isLoading, error, onHelpClick }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.zip')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="mt-12 space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="group relative rounded-xl border-2 border-dashed border-border bg-card p-12 text-center transition-all hover:border-primary hover:bg-accent/50"
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-6 transition-transform group-hover:scale-110">
            {isLoading ? (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            ) : (
              <FileArchive className="h-12 w-12 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-card-foreground">
              {isLoading ? 'Processing your data...' : 'Drop your Instagram data here'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Large files are cached for instant reload'
                : 'or click to browse for your ZIP file'}
            </p>
          </div>

          {!isLoading && (
            <Button size="lg" className="mt-4">
              <Upload className="mr-2 h-5 w-5" />
              Select ZIP File
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-muted/50 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h4 className="font-semibold text-card-foreground">How to get your Instagram data:</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={onHelpClick}
            className="gap-2 shrink-0 bg-transparent"
          >
            <BookOpen className="h-4 w-4" />
            View detailed guide
          </Button>
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>Go to Meta Accounts Center and request your data</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Select only "Followers and Following" in JSON format</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>Wait for Instagram to email you the download link (up to 48 hours)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span>Upload the ZIP file here - all processing happens locally in your browser</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
