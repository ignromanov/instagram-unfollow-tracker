import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import * as analytics from '@/lib/analytics';

// Mock analytics module
vi.mock('@/lib/analytics', () => ({
  analytics: {
    linkClick: vi.fn(),
  },
  isTrackingOptedOut: vi.fn(() => false),
  optOutOfTracking: vi.fn(),
  optIntoTracking: vi.fn(),
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render footer with copyright text', () => {
    render(<Footer />);

    expect(screen.getByText('© 2026 SafeUnfollow.app')).toBeInTheDocument();
  });

  it('should render SafeUnfollow branding', () => {
    render(<Footer />);

    // Use getAllByText since "SafeUnfollow" appears in multiple places
    const safeUnfollowTexts = screen.getAllByText(/SafeUnfollow/);
    expect(safeUnfollowTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('.app')).toBeInTheDocument();
  });

  it('should render Privacy Policy link', () => {
    render(<Footer />);

    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '#privacy');
  });

  it('should render Terms of Service link', () => {
    render(<Footer />);

    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '#terms');
  });

  it('should render Contact Support link', () => {
    render(<Footer />);

    const contactLink = screen.getByText('Contact Support');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', 'mailto:support@safeunfollow.app');
  });

  it('should render tracking toggle button', () => {
    render(<Footer />);

    const trackingButton = screen.getByText("Don't Track Me");
    expect(trackingButton).toBeInTheDocument();
  });

  it('should toggle tracking state when clicked', () => {
    const { rerender } = render(<Footer />);

    const trackingButton = screen.getByText("Don't Track Me");
    fireEvent.click(trackingButton);

    expect(analytics.optOutOfTracking).toHaveBeenCalled();
  });

  it('should show opted-out state', () => {
    vi.mocked(analytics.isTrackingOptedOut).mockReturnValue(true);

    render(<Footer />);

    expect(screen.getByText('Tracking Off')).toBeInTheDocument();
  });

  it('should render MIT License text', () => {
    render(<Footer />);

    expect(screen.getByText('MIT Licensed')).toBeInTheDocument();
  });

  it('should render support privacy button', () => {
    render(<Footer />);

    const supportButton = screen.getByText('Support privacy');
    expect(supportButton).toBeInTheDocument();

    const link = supportButton.closest('a');
    expect(link).toHaveAttribute('href', 'https://www.buymeacoffee.com/ignromanov');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render description text', () => {
    render(<Footer />);

    expect(
      screen.getByText(/The only relationship analyzer that works 100% in your browser/)
    ).toBeInTheDocument();
  });

  it('should render "Made with" text', () => {
    render(<Footer />);

    expect(screen.getByText(/Made with/)).toBeInTheDocument();
    expect(screen.getByText(/for the Community/)).toBeInTheDocument();
  });

  it('should have proper footer structure', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer.tagName).toBe('FOOTER');
  });

  it('should call analytics on Privacy Policy click', () => {
    render(<Footer />);

    const privacyLink = screen.getByText('Privacy Policy');
    fireEvent.click(privacyLink);

    expect(analytics.analytics.linkClick).toHaveBeenCalledWith('privacy-policy');
  });

  it('should call analytics on Terms click', () => {
    render(<Footer />);

    const termsLink = screen.getByText('Terms of Service');
    fireEvent.click(termsLink);

    expect(analytics.analytics.linkClick).toHaveBeenCalledWith('terms-of-service');
  });

  it('should call analytics on support button click', () => {
    render(<Footer />);

    const supportButton = screen.getByText('Support privacy');
    fireEvent.click(supportButton);

    expect(analytics.analytics.linkClick).toHaveBeenCalledWith('buy-me-coffee');
  });

  it('should render Logo component', () => {
    render(<Footer />);

    // Logo should be an SVG with role="img"
    const logo = screen.getByRole('img', { name: 'SafeUnfollow logo' });
    expect(logo).toBeInTheDocument();
  });
});
