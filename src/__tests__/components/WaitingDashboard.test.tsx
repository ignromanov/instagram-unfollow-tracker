import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaitingDashboard } from '@/components/WaitingDashboard';

describe('WaitingDashboard', () => {
  const mockOnUploadNow = vi.fn();
  const mockOnSkip = vi.fn();
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByText('Waiting for Instagram...')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByText(/Instagram is preparing your data export/)).toBeInTheDocument();
    });

    it('should render the calendar reminder button', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByText('Add Reminder to Calendar')).toBeInTheDocument();
      expect(screen.getByText('Remind me to check in 2 days')).toBeInTheDocument();
    });

    it('should render the upload now section', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByText('Already have your file?')).toBeInTheDocument();
      expect(screen.getByText(/If you already downloaded the ZIP export/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upload Now/i })).toBeInTheDocument();
    });

    it('should render the pro tip section', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.getByText('Pro Tip: Check your Spam Folder')).toBeInTheDocument();
      expect(screen.getByText(/Instagram emails often end up there/)).toBeInTheDocument();
    });

    it('should not render skip button when onSkip is not provided', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      expect(screen.queryByText('Skip for now')).not.toBeInTheDocument();
    });

    it('should render skip button when onSkip is provided', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} onSkip={mockOnSkip} />);

      expect(screen.getByText('Skip for now')).toBeInTheDocument();
    });
  });

  describe('CTA buttons', () => {
    it('should call onUploadNow when Upload Now button is clicked', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      const uploadButton = screen.getByRole('button', { name: /Upload Now/i });
      fireEvent.click(uploadButton);

      expect(mockOnUploadNow).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when Skip button is clicked', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} onSkip={mockOnSkip} />);

      const skipButton = screen.getByText('Skip for now');
      fireEvent.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should open Google Calendar when reminder button is clicked', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      const reminderButton = screen.getByText('Add Reminder to Calendar');
      fireEvent.click(reminderButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('calendar.google.com'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should include calendar event details in the URL', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      const reminderButton = screen.getByText('Add Reminder to Calendar');
      fireEvent.click(reminderButton);

      const calendarUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calendarUrl).toContain('action=TEMPLATE');
      expect(calendarUrl).toContain(encodeURIComponent('Check Instagram Export Email'));
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Waiting for Instagram...');

      const h3 = screen.getByRole('heading', { level: 3 });
      expect(h3).toHaveTextContent('Already have your file?');
    });

    it('should have clickable buttons', () => {
      render(<WaitingDashboard onUploadNow={mockOnUploadNow} onSkip={mockOnSkip} />);

      const uploadButton = screen.getByRole('button', { name: /Upload Now/i });
      const skipButton = screen.getByRole('button', { name: /Skip for now/i });

      expect(uploadButton).toBeEnabled();
      expect(skipButton).toBeEnabled();
    });
  });
});
