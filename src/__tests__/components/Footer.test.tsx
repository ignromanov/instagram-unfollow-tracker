import { vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render footer with copyright text', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2025 Instagram Unfollow Tracker. Privacy-focused analytics.')
    ).toBeInTheDocument();
  });

  it('should render GitHub link with correct attributes', () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText('View source code on GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/ignromanov/instagram-unfollow-tracker'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('should render Documentation link with correct attributes', () => {
    render(<Footer />);

    const docsLink = screen.getByLabelText('Read documentation');
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute(
      'href',
      'https://ignromanov.github.io/instagram-unfollow-tracker/docs/'
    );
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('should render MIT License link with correct attributes', () => {
    render(<Footer />);

    const licenseLink = screen.getByLabelText('View MIT license');
    expect(licenseLink).toBeInTheDocument();
    expect(licenseLink).toHaveAttribute(
      'href',
      'https://github.com/ignromanov/instagram-unfollow-tracker/blob/main/LICENSE'
    );
    expect(licenseLink).toHaveAttribute('target', '_blank');
    expect(licenseLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('MIT License')).toBeInTheDocument();
  });

  it('should render all three icons', () => {
    render(<Footer />);

    // Check for Github, BookOpen, and Scale icons (SVG elements)
    const icons = document.querySelectorAll('svg');
    expect(icons).toHaveLength(3);
  });

  it('should have proper footer structure and styling classes', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'z-50',
      'border-t',
      'border-border/50',
      'bg-background/80',
      'backdrop-blur-lg',
      'shadow-lg'
    );
  });

  it('should have responsive layout classes', () => {
    render(<Footer />);

    const container = document.querySelector('.mx-auto.max-w-7xl.px-4.py-4.sm\\:px-6.lg\\:px-8');
    expect(container).toBeInTheDocument();

    const flexContainer = document.querySelector(
      '.flex.flex-col.items-center.justify-between.gap-4.sm\\:flex-row'
    );
    expect(flexContainer).toBeInTheDocument();
  });

  it('should have proper link styling classes', () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText('View source code on GitHub');
    expect(githubLink).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'text-muted-foreground',
      'transition-colors',
      'hover:text-foreground'
    );

    const docsLink = screen.getByLabelText('Read documentation');
    expect(docsLink).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'text-muted-foreground',
      'transition-colors',
      'hover:text-foreground'
    );

    const licenseLink = screen.getByLabelText('View MIT license');
    expect(licenseLink).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'text-muted-foreground',
      'transition-colors',
      'hover:text-foreground'
    );
  });

  it('should have proper icon sizing', () => {
    render(<Footer />);

    const icons = document.querySelectorAll('svg');
    icons.forEach(icon => {
      expect(icon).toHaveClass('h-4', 'w-4');
    });
  });

  it('should hide text labels on small screens', () => {
    render(<Footer />);

    const githubText = screen.getByText('GitHub');
    expect(githubText).toHaveClass('hidden', 'sm:inline');

    const docsText = screen.getByText('Documentation');
    expect(docsText).toHaveClass('hidden', 'sm:inline');

    const licenseText = screen.getByText('MIT License');
    expect(licenseText).toHaveClass('hidden', 'sm:inline');
  });
});
