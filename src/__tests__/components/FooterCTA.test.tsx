import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterCTA } from '@/components/FooterCTA';

describe('FooterCTA Component', () => {
  const defaultProps = {
    onStart: vi.fn(),
    onSample: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should render CTA title', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByText('Ready to start?')).toBeInTheDocument();
    });

    it('should render CTA subtitle', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(
        screen.getByText('Scan and process your Instagram data export privately in seconds.')
      ).toBeInTheDocument();
    });

    it('should render tagline', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByText('100% Free • No Login • Privacy First')).toBeInTheDocument();
    });

    it('should render Logo component', () => {
      render(<FooterCTA {...defaultProps} />);

      // Logo renders as an img element
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('CTA buttons', () => {
    it('should render Get Started button', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('should render Try Sample button', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Try Sample/i })).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onStart when Get Started button is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Get Started/i }));

      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    });

    it('should call onSample when Try Sample button is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Try Sample/i }));

      expect(defaultProps.onSample).toHaveBeenCalledTimes(1);
    });

    it('should not call onSample when Get Started is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Get Started/i }));

      expect(defaultProps.onSample).not.toHaveBeenCalled();
    });

    it('should not call onStart when Try Sample is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Try Sample/i }));

      expect(defaultProps.onStart).not.toHaveBeenCalled();
    });
  });
});
