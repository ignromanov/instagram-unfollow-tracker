import { HeaderV2 } from '@/components/HeaderV2';
import { AppState } from '@/core/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    themeToggle: vi.fn(),
    clearData: vi.fn(),
  },
}));

// Mock LanguageSwitcher component
vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

describe('HeaderV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<HeaderV2 />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should render logo with ShieldCheck icon', () => {
    render(<HeaderV2 />);

    // Logo text should be visible
    expect(screen.getByText('SafeUnfollow')).toBeInTheDocument();
    expect(screen.getByText('.app')).toBeInTheDocument();
  });

  it('should render logo as clickable button', () => {
    render(<HeaderV2 />);

    const logoButton = screen.getByRole('button', { name: /SafeUnfollow/i });
    expect(logoButton).toBeInTheDocument();
    expect(logoButton).toHaveAttribute('tabIndex', '0');
  });

  it('should call onLogoClick when logo is clicked', () => {
    const onLogoClick = vi.fn();
    render(<HeaderV2 onLogoClick={onLogoClick} />);

    const logoContainer = screen.getByText('SafeUnfollow').closest('[role="button"]');
    fireEvent.click(logoContainer!);

    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });

  it('should call onLogoClick when Enter key is pressed on logo', () => {
    const onLogoClick = vi.fn();
    render(<HeaderV2 onLogoClick={onLogoClick} />);

    const logoContainer = screen.getByText('SafeUnfollow').closest('[role="button"]');
    fireEvent.keyDown(logoContainer!, { key: 'Enter' });

    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });

  it('should render theme toggle button', () => {
    render(<HeaderV2 />);

    const themeButton = screen.getByTitle('Dark Mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('should render language switcher', () => {
    render(<HeaderV2 />);

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  describe('when hasData is false', () => {
    it('should render upload button', () => {
      render(<HeaderV2 hasData={false} />);
      expect(screen.getByText('Upload My File')).toBeInTheDocument();
    });

    it('should call onUpload when upload button is clicked', () => {
      const onUpload = vi.fn();
      render(<HeaderV2 hasData={false} onUpload={onUpload} />);

      const uploadButton = screen.getByText('Upload My File').closest('button');
      fireEvent.click(uploadButton!);

      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    it('should highlight upload button when activeScreen is UPLOAD', () => {
      render(<HeaderV2 hasData={false} activeScreen={AppState.UPLOAD} />);

      const uploadButton = screen.getByText('Upload My File').closest('button');
      expect(uploadButton).toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('when hasData is true', () => {
    it('should render view results button', () => {
      render(<HeaderV2 hasData={true} />);

      expect(screen.getByText('View Analysis Results')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(<HeaderV2 hasData={true} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onViewResults when view results button is clicked', () => {
      const onViewResults = vi.fn();
      render(<HeaderV2 hasData={true} onViewResults={onViewResults} />);

      const viewResultsButton = screen.getByText('View Analysis Results').closest('button');
      fireEvent.click(viewResultsButton!);

      expect(onViewResults).toHaveBeenCalledTimes(1);
    });

    it('should highlight view results button when activeScreen is RESULTS', () => {
      render(<HeaderV2 hasData={true} activeScreen={AppState.RESULTS} />);

      const viewResultsButton = screen.getByText('View Analysis Results').closest('button');
      expect(viewResultsButton).toHaveClass('bg-primary', 'text-white');
    });

    it('should open delete confirmation dialog when delete button is clicked', () => {
      render(<HeaderV2 hasData={true} />);

      const deleteButton = screen.getByText('Delete').closest('button');
      fireEvent.click(deleteButton!);

      // Dialog should appear with title
      expect(screen.getByText('Clear all data?')).toBeInTheDocument();
      expect(screen.getByText(/This will remove all loaded Instagram data/)).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons in delete dialog', () => {
      render(<HeaderV2 hasData={true} />);

      const deleteButton = screen.getByText('Delete').closest('button');
      fireEvent.click(deleteButton!);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Clear Data')).toBeInTheDocument();
    });
  });

  it('should have sticky positioning', () => {
    render(<HeaderV2 />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('should have proper z-index for overlay behavior', () => {
    render(<HeaderV2 />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('z-[80]');
  });
});
