import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wizard } from '@/components/Wizard';

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockPathname = '/wizard';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

// Mock useLanguagePrefix
vi.mock('@/hooks/useLanguagePrefix', () => ({
  useLanguagePrefix: () => '',
}));

// Mock analytics module
vi.mock('@/lib/analytics', () => ({
  analytics: {
    wizardStepView: vi.fn(),
    wizardNextClick: vi.fn(),
    wizardBackClick: vi.fn(),
    wizardCancel: vi.fn(),
    wizardExternalLinkClick: vi.fn(),
  },
}));

describe('Wizard', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/wizard';
  });

  it('should render without crashing', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('should render step indicator with progress dots', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Step counter text
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('should render first step title and description', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Open Data Export Page')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tap the button below to go directly to the platform's data export page. You may need to log in first."
      )
    ).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Next Step')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should render external link button on step 1', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const externalLink = screen.getByText('Open Instagram');
    expect(externalLink).toBeInTheDocument();
    expect(externalLink.closest('a')).toHaveAttribute(
      'href',
      'https://accountscenter.instagram.com/info_and_permissions/dyi/?entry_point=app_settings'
    );
  });

  it('should navigate to next step when Next is clicked', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Next Step'));

    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
    expect(screen.getByText("Select 'Some of your information'")).toBeInTheDocument();
  });

  it('should navigate to previous step when Back is clicked', () => {
    render(<Wizard initialStep={2} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('should call onCancel when close button is clicked', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Find the close button (X icon button in header)
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show warning badge on step 4', () => {
    render(<Wizard initialStep={4} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('JSON FORMAT ONLY')).toBeInTheDocument();
    expect(screen.getByText('Select JSON format', { exact: false })).toBeInTheDocument();
  });

  it('should call onComplete on last step when Done is clicked', () => {
    render(<Wizard initialStep={8} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText("Done, let's go!")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Done, let's go!"));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should render step image with alt text', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const image = screen.getByAltText('Step 1: Open Data Export Page');
    expect(image).toBeInTheDocument();
  });

  it('should update URL path when step changes', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Initial navigation to step 1
    expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/1', { replace: true });

    mockNavigate.mockClear();
    fireEvent.click(screen.getByText('Next Step'));

    // Navigation to step 2
    expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/2', { replace: true });
  });

  it('should render all 8 steps when navigating through', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const stepTitles = [
      'Open Data Export Page',
      "Select 'Some of your information'",
      "Check only 'Followers and following'",
      'Select JSON format',
      "Choose 'All time' and tap 'Create files'",
      'Wait for email notification',
      'Download the ZIP file',
      'Upload & Reveal Results',
    ];

    stepTitles.forEach((title, index) => {
      if (index > 0) {
        fireEvent.click(screen.getByText('Next Step'));
      }
      expect(screen.getByText(`Step ${index + 1} of 8`)).toBeInTheDocument();
      expect(screen.getByText(title, { exact: false })).toBeInTheDocument();
    });
  });
});
