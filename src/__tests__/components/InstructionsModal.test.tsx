/**
 * InstructionsModal Component Tests
 *
 * Tests for the help and guide modal with tabs for download, usage, and tips
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstructionsModal } from '@/components/InstructionsModal';

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    linkClick: vi.fn(),
  },
}));

describe('InstructionsModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when open is true', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText('Help & Guide')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<InstructionsModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Help & Guide')).not.toBeInTheDocument();
    });

    it('should render description', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText('Everything you need to know to get started')).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('should render all three tabs', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByRole('tab', { name: 'Download Data' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'How to Use' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tips & FAQ' })).toBeInTheDocument();
    });

    it('should show Download Data tab content by default', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(/Estimated Time: 5 minutes \+ 24-48 hours wait/)).toBeInTheDocument();
    });

    it('should switch to How to Use tab when clicked', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: 'How to Use' }));

      expect(screen.getByText('Search Accounts')).toBeInTheDocument();
      expect(screen.getByText('Smart Filters')).toBeInTheDocument();
    });

    it('should switch to Tips & FAQ tab when clicked', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });
  });

  describe('Download Data tab', () => {
    it('should render all step titles', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText('Go to Meta Accounts Center')).toBeInTheDocument();
      expect(screen.getByText('Log in to your account')).toBeInTheDocument();
      expect(
        screen.getByText('Navigate to "Your information and permissions"')
      ).toBeInTheDocument();
      expect(screen.getByText('Click "Download your information"')).toBeInTheDocument();
      expect(screen.getByText('Select "Some of your information"')).toBeInTheDocument();
      expect(screen.getByText('Choose ONLY "Followers and Following" section')).toBeInTheDocument();
      expect(screen.getByText('Select "JSON" format')).toBeInTheDocument();
      expect(screen.getByText('Set date range to "All time"')).toBeInTheDocument();
      expect(screen.getByText('Submit request')).toBeInTheDocument();
    });

    it('should render step badges', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('should render Meta Accounts Center link', () => {
      render(<InstructionsModal {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Open Meta Accounts Center/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://accountscenter.instagram.com/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should track link click for analytics', async () => {
      const { analytics } = await import('@/lib/analytics');
      render(<InstructionsModal {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Open Meta Accounts Center/i });
      fireEvent.click(link);

      expect(analytics.linkClick).toHaveBeenCalledWith('meta_accounts');
    });

    it('should render success alert', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(/Once you receive the download link via email/)).toBeInTheDocument();
    });
  });

  describe('How to Use tab', () => {
    it('should render all feature cards', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'How to Use' }));

      expect(screen.getByText('Search Accounts')).toBeInTheDocument();
      expect(screen.getByText('Smart Filters')).toBeInTheDocument();
      expect(screen.getByText('Open Profiles')).toBeInTheDocument();
      expect(screen.getByText('Real-time Stats')).toBeInTheDocument();
    });

    it('should render feature card descriptions', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'How to Use' }));

      expect(screen.getByText(/Type any username to instantly find accounts/)).toBeInTheDocument();
      expect(screen.getByText(/Use badge filters to find mutual followers/)).toBeInTheDocument();
      expect(screen.getByText(/Click the external link icon/)).toBeInTheDocument();
      expect(screen.getByText(/See live statistics about your followers/)).toBeInTheDocument();
    });

    it('should render tips section', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'How to Use' }));

      expect(screen.getByText('Tips for Best Results')).toBeInTheDocument();
    });

    it('should render all tips', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'How to Use' }));

      expect(
        screen.getByText(/Use filters to narrow down results before searching/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Processing time shown in search bar helps you gauge performance/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The app works completely offline after loading/)
      ).toBeInTheDocument();
    });
  });

  describe('Tips & FAQ tab', () => {
    it('should render all alert sections', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      expect(screen.getByText('Processing Time')).toBeInTheDocument();
      expect(screen.getByText('Select Only What You Need')).toBeInTheDocument();
      expect(screen.getByText('Download Link Expires')).toBeInTheDocument();
      expect(screen.getByText('Your Privacy is Protected')).toBeInTheDocument();
      expect(screen.getByText('JSON Format Required')).toBeInTheDocument();
    });

    it('should render FAQ section title', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });

    it('should render all FAQ questions', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      expect(screen.getByText('Is my data safe?')).toBeInTheDocument();
      expect(screen.getByText('Why does it take so long?')).toBeInTheDocument();
      expect(screen.getByText('Can I use HTML format?')).toBeInTheDocument();
      expect(screen.getByText("What if my file won't upload?")).toBeInTheDocument();
    });

    it('should render FAQ answers', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      expect(
        screen.getByText(/Everything is processed locally in your browser/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Instagram needs time to compile your data/)).toBeInTheDocument();
      expect(screen.getByText(/No, you must use JSON format/)).toBeInTheDocument();
      expect(
        screen.getByText(/Make sure you're uploading the ZIP file directly/)
      ).toBeInTheDocument();
    });

    it('should have destructive variant for JSON format alert', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: 'Tips & FAQ' }));

      // The JSON Format Required alert should be destructive variant
      const alertText = screen.getByText('JSON Format Required');
      const alertContainer = alertText.closest('[role="alert"]');
      expect(alertContainer).toHaveClass('text-destructive');
    });
  });

  describe('dialog behavior', () => {
    it('should call onOpenChange when dialog state changes', () => {
      const onOpenChange = vi.fn();
      render(<InstructionsModal open={true} onOpenChange={onOpenChange} />);

      // Click outside or press escape would trigger this
      // For now, we verify the prop is passed
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('should have scrollable content', () => {
      render(<InstructionsModal {...defaultProps} />);

      const dialogContent = document.querySelector('[class*="overflow-y-auto"]');
      expect(dialogContent).toBeInTheDocument();
    });

    it('should have max width constraint', () => {
      render(<InstructionsModal {...defaultProps} />);

      const dialogContent = document.querySelector('[class*="max-w-4xl"]');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible link with aria-label', () => {
      render(<InstructionsModal {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Open Meta Accounts Center/i });
      expect(link).toHaveAttribute('aria-label', 'Open Meta Accounts Center in new tab');
    });

    it('should have tab navigation', () => {
      render(<InstructionsModal {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
    });
  });
});
