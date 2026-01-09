'use client';

import { Moon, Sun, ShieldCheck, Trash2, LayoutDashboard, Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { analytics } from '@/lib/analytics';
import { AppState } from '@/core/types';
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

interface HeaderV2Props {
  hasData?: boolean;
  onViewResults?: () => void;
  onClear?: () => void;
  onUpload?: () => void;
  onLogoClick?: () => void;
  activeScreen?: AppState;
}

export function HeaderV2({
  hasData = false,
  onViewResults,
  onClear,
  onUpload,
  onLogoClick,
  activeScreen = AppState.HERO,
}: HeaderV2Props) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleThemeToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    analytics.themeToggle(newTheme);
  };

  const handleClear = () => {
    analytics.clearData();
    onClear?.();
  };

  return (
    <header className="sticky top-0 z-[80] w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onLogoClick?.()}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-xl md:text-2xl tracking-tight hidden sm:block">
            SafeUnfollow<span className="text-primary">.app</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {hasData ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onViewResults}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeScreen === AppState.RESULTS
                    ? 'bg-primary text-white shadow-md'
                    : 'text-zinc-500 hover:bg-[oklch(0.5_0_0_/_0.05)]'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Results</span>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title="Delete Data"
                  >
                    <Trash2 size={18} />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
                      <Trash2 size={28} className="text-rose-500" />
                    </div>
                    <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all loaded Instagram data and return you to the home screen.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-rose-500 text-white hover:bg-rose-600"
                    >
                      Clear Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <button
              onClick={onUpload}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeScreen === AppState.UPLOAD
                  ? 'bg-primary text-white shadow-md'
                  : 'text-zinc-500 hover:bg-[oklch(0.5_0_0_/_0.05)]'
              }`}
            >
              <Upload size={18} />
              <span className="hidden md:inline">Upload File</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-[1px] h-6 md:h-8 bg-border" />

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="cursor-pointer p-2 md:p-2.5 rounded-2xl hover:bg-[oklch(0.5_0_0_/_0.05)] transition-colors text-zinc-500"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
