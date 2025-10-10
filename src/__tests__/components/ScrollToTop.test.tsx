import { render, screen, fireEvent } from '@tests/utils/testUtils';
import { ScrollToTop } from '@/components/ScrollToTop';

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  it('should not render when scroll position is at top', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });

    render(<ScrollToTop />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render when scroll position is below threshold', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });

    const { rerender } = render(<ScrollToTop />);

    // Trigger scroll event to update visibility
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Scroll to top');
  });

  it('should scroll to top when clicked', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });

    const { rerender } = render(<ScrollToTop />);

    // Trigger scroll event to update visibility
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should show/hide based on scroll position changes', () => {
    const { rerender } = render(<ScrollToTop />);

    // Initially at top - should not show
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Simulate scroll down
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });

    // Trigger scroll event
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    // Should now show
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Simulate scroll back to top
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });

    // Trigger scroll event
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    // Should hide again
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });

    const { rerender } = render(<ScrollToTop />);

    // Trigger scroll event to update visibility
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('fixed', 'bottom-24', 'right-6', 'z-50');
  });

  it('should render chevron up icon', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });

    const { rerender } = render(<ScrollToTop />);

    // Trigger scroll event to update visibility
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);

    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle multiple scroll events correctly', () => {
    const { rerender } = render(<ScrollToTop />);

    // Scroll down (below 400px threshold)
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Scroll down more
    Object.defineProperty(window, 'scrollY', {
      value: 600,
      writable: true,
    });
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Scroll back up but still above threshold
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Scroll to top (below 400px threshold)
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
    fireEvent.scroll(window);
    rerender(<ScrollToTop />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
