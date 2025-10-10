'use client';

import type React from 'react';
import {
  Shield,
  Users,
  TrendingDown,
  Trash2,
  Github,
  UserCheck,
  ShieldCheck,
  FileArchive,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DocumentationLink } from './DocumentationLink';
import { HelpButton } from './HelpButton';
import { Logo } from './Logo';
import { useHeaderData } from '@/hooks/useHeaderData';
import type { StatCardProps } from '@/types/components';

interface HeaderProps {
  onHelpClick: () => void;
}

export function Header({ onHelpClick }: HeaderProps) {
  const {
    hasData,
    shouldShowClearButton,
    fileName,
    fileSize,
    uploadDate,
    uploadStatus,
    stats,
    onClearData,
  } = useHeaderData();
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">
              Instagram Unfollow Tracker
            </h1>
          </div>
          <p className="text-pretty text-muted-foreground">
            Analyze your Instagram connections privately in your browser
          </p>
          {hasData && fileName && fileSize && uploadDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileArchive className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
              <span>•</span>
              <span>{formatFileSize(fileSize)}</span>
              <span>•</span>
              <span>Uploaded {formatRelativeTime(uploadDate)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <HelpButton onClick={onHelpClick} />
          <DocumentationLink />
          {shouldShowClearButton && onClearData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  {uploadStatus === 'loading' ? 'Cancel Upload' : 'Clear Data'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {uploadStatus === 'loading'
                      ? 'Cancel upload and clear data?'
                      : 'Clear all data?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {uploadStatus === 'loading'
                      ? 'This will cancel the current upload and clear any existing data. This action cannot be undone.'
                      : 'This will remove all loaded Instagram data and return you to the file upload screen. This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {uploadStatus === 'loading' ? 'Cancel & Clear' : 'Clear Data'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Badge variant="secondary" className="gap-1.5 justify-center">
          <Shield className="h-3.5 w-3.5" />
          100% Private
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center">
          <Github className="h-3.5 w-3.5" />
          Open Source
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center">
          <UserCheck className="h-3.5 w-3.5" />
          No Login Required
        </Badge>
        <Badge variant="secondary" className="gap-1.5 justify-center">
          <ShieldCheck className="h-3.5 w-3.5" />
          Local Processing
        </Badge>
      </div>

      {hasData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Following" value={stats.following} icon={Users} color="blue" />
          <StatCard label="Followers" value={stats.followers} icon={Users} color="green" />
          <StatCard label="Mutuals" value={stats.mutuals} icon={Users} color="purple" />
          <StatCard
            label="Not Following Back"
            value={stats.notFollowingBack}
            icon={TrendingDown}
            color="red"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-card-foreground">{value.toLocaleString()}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
