import { Github, BookOpen, Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-lg shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Instagram Unfollow Tracker. Privacy-focused analytics.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/ignromanov/instagram-unfollow-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="View source code on GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <a
              href="/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Read documentation"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Documentation</span>
            </a>

            <a
              href="https://github.com/ignromanov/instagram-unfollow-tracker/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="View MIT license"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">MIT License</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
