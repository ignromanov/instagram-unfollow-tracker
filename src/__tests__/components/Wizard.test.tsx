import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wizard } from '@/components/Wizard';
import wizardEN from '@/locales/en/wizard.json';

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

// Mock react-i18next with actual translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      // Handle interpolation for 'header.stepOf'
      if (key === 'header.stepOf' && options) {
        return `Step ${options.current} of ${options.total}`;
      }
      // Navigate nested keys like 'steps.1.title'
      const keys = key.split('.');
      let value: unknown = wizardEN;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return (value as string) || key;
    },
  }),
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

    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
  });

  it('should render step indicator with progress dots', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Step counter text
    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
  });

  it('should render first step title and description', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Title appears twice (heading + button), check heading specifically
    expect(screen.getByRole('heading', { name: wizardEN.steps['1'].title })).toBeInTheDocument();
    // Use partial match for description (contains quotes that may render differently)
    expect(
      screen.getByText(/Click the button below to open Meta Accounts Center/)
    ).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Next Step')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should render external link button on step 1', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const externalLink = screen.getByRole('link', {
      name: new RegExp(wizardEN.buttons.openInstagram),
    });
    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute(
      'href',
      'https://accountscenter.instagram.com/info_and_permissions/dyi/?entry_point=app_settings'
    );
  });

  it('should navigate to next step when Next is clicked', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText(wizardEN.buttons.next));

    expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();
    expect(screen.getByText(wizardEN.steps['2'].title)).toBeInTheDocument();
  });

  it('should navigate to previous step when Back is clicked', () => {
    render(<Wizard initialStep={2} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
  });

  it('should call onCancel when close button is clicked', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Find the close button by its aria-label from translations
    const closeButton = screen.getByRole('button', { name: wizardEN.buttons.close });
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show warning badge on step 4', () => {
    render(<Wizard initialStep={4} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText(wizardEN.format.warning)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: new RegExp('Followers and following') })
    ).toBeInTheDocument();
  });

  it('should call onComplete on last step when Done is clicked', () => {
    render(<Wizard initialStep={9} onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText("Done, let's go!")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Done, let's go!"));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should render step image with alt text', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const image = screen.getByAltText(wizardEN.steps['1'].alt);
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

  it('should render all 9 steps when navigating through', () => {
    render(<Wizard onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    for (let i = 1; i <= 9; i++) {
      if (i > 1) {
        fireEvent.click(screen.getByText(wizardEN.buttons.next));
      }
      expect(screen.getByText(`Step ${i} of 9`)).toBeInTheDocument();
      // Verify a heading exists for each step
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    }
  });
});
