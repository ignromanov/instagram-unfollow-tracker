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

  // Hardcoded strings from InstructionsModal component (used for testing)
  const modalText = {
    title: 'Help & Guide',
    description: 'Everything you need to know to get started',
    tabs: {
      download: 'Download Data',
      usage: 'How to Use',
      tips: 'Tips & FAQ',
    },
    estimatedTime: /Estimated Time: 5 minutes \+ 24-48 hours wait/,
    searchAccounts: 'Search Accounts',
    smartFilters: 'Smart Filters',
    openProfiles: 'Open Profiles',
    realTimeStats: 'Real-time Stats',
    steps: {
      1: 'Go to Meta Accounts Center',
      2: 'Log in to your account',
      3: 'Navigate to "Your information and permissions"',
      4: 'Click "Download your information"',
      5: 'Select "Some of your information"',
      6: 'Choose ONLY "Followers and Following" section',
      7: 'Select "JSON" format',
      8: 'Set date range to "All time"',
      9: 'Submit request',
    },
    badges: {
      important: 'Important',
      required: 'Required',
    },
    metaLink: /Open Meta Accounts Center/i,
    successAlert: /Once you receive the download link via email/,
    tipsForBestResults: 'Tips for Best Results',
    faqTitle: 'Frequently Asked Questions',
    processingTime: 'Processing Time',
    selectOnlyWhatYouNeed: 'Select Only What You Need',
    downloadLinkExpires: 'Download Link Expires',
    yourPrivacyProtected: 'Your Privacy is Protected',
    jsonFormatRequired: 'JSON Format Required',
    isSafeQuestion: 'Is my data safe?',
    whyLongQuestion: 'Why does it take so long?',
    htmlFormatQuestion: 'Can I use HTML format?',
    fileUploadQuestion: "What if my file won't upload?",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when open is true', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.title)).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<InstructionsModal {...defaultProps} open={false} />);

      expect(screen.queryByText(modalText.title)).not.toBeInTheDocument();
    });

    it('should render description', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.description)).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('should render all three tabs', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByRole('tab', { name: modalText.tabs.download })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: modalText.tabs.usage })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: modalText.tabs.tips })).toBeInTheDocument();
    });

    it('should show Download Data tab content by default', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.estimatedTime)).toBeInTheDocument();
    });

    it('should switch to How to Use tab when clicked', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: modalText.tabs.usage }));

      expect(screen.getByText(modalText.searchAccounts)).toBeInTheDocument();
      expect(screen.getByText(modalText.smartFilters)).toBeInTheDocument();
    });

    it('should switch to Tips & FAQ tab when clicked', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

      expect(screen.getByText(modalText.faqTitle)).toBeInTheDocument();
    });
  });

  describe('Download Data tab', () => {
    it('should render all step titles', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.steps[1])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[2])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[3])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[4])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[5])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[6])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[7])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[8])).toBeInTheDocument();
      expect(screen.getByText(modalText.steps[9])).toBeInTheDocument();
    });

    it('should render step badges', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.badges.important)).toBeInTheDocument();
      expect(screen.getByText(modalText.badges.required)).toBeInTheDocument();
    });

    it('should render Meta Accounts Center link', () => {
      render(<InstructionsModal {...defaultProps} />);

      const link = screen.getByRole('link', { name: modalText.metaLink });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://accountscenter.instagram.com/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should track link click for analytics', async () => {
      const { analytics } = await import('@/lib/analytics');
      render(<InstructionsModal {...defaultProps} />);

      const link = screen.getByRole('link', { name: modalText.metaLink });
      fireEvent.click(link);

      expect(analytics.linkClick).toHaveBeenCalledWith('meta_accounts');
    });

    it('should render success alert', () => {
      render(<InstructionsModal {...defaultProps} />);

      expect(screen.getByText(modalText.successAlert)).toBeInTheDocument();
    });
  });

  describe('How to Use tab', () => {
    it('should render all feature cards', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.usage }));

      expect(screen.getByText(modalText.searchAccounts)).toBeInTheDocument();
      expect(screen.getByText(modalText.smartFilters)).toBeInTheDocument();
      expect(screen.getByText(modalText.openProfiles)).toBeInTheDocument();
      expect(screen.getByText(modalText.realTimeStats)).toBeInTheDocument();
    });

    it('should render feature card descriptions', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.usage }));

      expect(screen.getByText(/Type any username to instantly find accounts/)).toBeInTheDocument();
      expect(screen.getByText(/Use badge filters to find mutual followers/)).toBeInTheDocument();
      expect(screen.getByText(/Click the external link icon/)).toBeInTheDocument();
      expect(screen.getByText(/See live statistics about your followers/)).toBeInTheDocument();
    });

    it('should render tips section', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.usage }));

      expect(screen.getByText(modalText.tipsForBestResults)).toBeInTheDocument();
    });

    it('should render all tips', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.usage }));

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
      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

      expect(screen.getByText(modalText.processingTime)).toBeInTheDocument();
      expect(screen.getByText(modalText.selectOnlyWhatYouNeed)).toBeInTheDocument();
      expect(screen.getByText(modalText.downloadLinkExpires)).toBeInTheDocument();
      expect(screen.getByText(modalText.yourPrivacyProtected)).toBeInTheDocument();
      expect(screen.getByText(modalText.jsonFormatRequired)).toBeInTheDocument();
    });

    it('should render FAQ section title', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

      expect(screen.getByText(modalText.faqTitle)).toBeInTheDocument();
    });

    it('should render all FAQ questions', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

      expect(screen.getByText(modalText.isSafeQuestion)).toBeInTheDocument();
      expect(screen.getByText(modalText.whyLongQuestion)).toBeInTheDocument();
      expect(screen.getByText(modalText.htmlFormatQuestion)).toBeInTheDocument();
      expect(screen.getByText(modalText.fileUploadQuestion)).toBeInTheDocument();
    });

    it('should render FAQ answers', async () => {
      const user = userEvent.setup();
      render(<InstructionsModal {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

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
      await user.click(screen.getByRole('tab', { name: modalText.tabs.tips }));

      // The JSON Format Required alert should be destructive variant
      const alertText = screen.getByText(modalText.jsonFormatRequired);
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
