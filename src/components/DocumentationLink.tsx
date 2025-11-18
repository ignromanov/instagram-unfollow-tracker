import { BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentationLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 transition-all duration-200 hover:scale-105"
      asChild
    >
      <a
        href="/docs/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open documentation in new tab"
      >
        <BookOpen className="h-4 w-4" />
        Docs
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
}
