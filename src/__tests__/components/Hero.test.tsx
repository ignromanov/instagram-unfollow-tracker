import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from '@/components/Hero';

describe('Hero Component', () => {
  const defaultProps = {
    onStartGuide: vi.fn(),
    onLoadSample: vi.fn(),
    onUploadDirect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render main headline with translated text', () => {
      render(<Hero {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Check');
      expect(heading).toHaveTextContent('Unfollowers');
      expect(heading).toHaveTextContent('Without Logging In.');
    });

    it('should render subheadline', () => {
      render(<Hero {...defaultProps} />);

      expect(
        screen.getByText(/The only free online tool that analyzes your Instagram ZIP file locally/)
      ).toBeInTheDocument();
    });

    it('should render version badge', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(/V1.1 Optimized for 1,000,000\+ Accounts/)).toBeInTheDocument();
    });
  });

  describe('CTA buttons', () => {
    it('should render primary CTA button when no data', () => {
      render(<Hero {...defaultProps} hasData={false} />);

      expect(screen.getByRole('button', { name: /Check Unfollowers Free/i })).toBeInTheDocument();
    });

    it('should render "View Results" button when hasData is true', () => {
      render(<Hero {...defaultProps} hasData={true} onContinue={vi.fn()} />);

      expect(screen.getByRole('button', { name: /View Analysis Results/i })).toBeInTheDocument();
    });

    it('should render sample data button', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Try with Sample/i })).toBeInTheDocument();
    });

    it('should render "I already have my ZIP file" link when no data', () => {
      render(<Hero {...defaultProps} hasData={false} />);

      expect(
        screen.getByRole('button', { name: /I already have my ZIP file/i })
      ).toBeInTheDocument();
    });

    it('should not render "I already have my ZIP file" link when hasData is true', () => {
      render(<Hero {...defaultProps} hasData={true} />);

      expect(
        screen.queryByRole('button', { name: /I already have my ZIP file/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('trust badges', () => {
    it('should render trust badges', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(/Completely Free • Forever/)).toBeInTheDocument();
      expect(screen.getByText(/No Password • No Account Risk/)).toBeInTheDocument();
      expect(screen.getByText(/100% Private • Local Analysis/)).toBeInTheDocument();
    });
  });

  describe('feature cards', () => {
    it('should render all four feature cards', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText('100% Local')).toBeInTheDocument();
      expect(screen.getByText('No Login')).toBeInTheDocument();
      expect(screen.getByText('High Scale')).toBeInTheDocument();
      expect(screen.getByText('Open Source')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText('No data ever leaves your device')).toBeInTheDocument();
      expect(screen.getByText('No risk of account bans or hacking')).toBeInTheDocument();
      expect(screen.getByText('Handles 1M+ accounts at light speed')).toBeInTheDocument();
      expect(screen.getByText('Audit our code, we value your trust')).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onStartGuide when primary CTA is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Check Unfollowers Free/i }));

      expect(defaultProps.onStartGuide).toHaveBeenCalledTimes(1);
    });

    it('should call onLoadSample when sample button is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Try with Sample/i }));

      expect(defaultProps.onLoadSample).toHaveBeenCalledTimes(1);
    });

    it('should call onUploadDirect when "I already have my ZIP file" is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /I already have my ZIP file/i }));

      expect(defaultProps.onUploadDirect).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when "View Results" is clicked', async () => {
      const user = userEvent.setup();
      const onContinue = vi.fn();
      render(<Hero {...defaultProps} hasData={true} onContinue={onContinue} />);

      await user.click(screen.getByRole('button', { name: /View Analysis Results/i }));

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });
});
