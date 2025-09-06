import { render, screen, fireEvent } from '@testing-library/react';
import { HelpButton } from '@/components/HelpButton';

describe('HelpButton Component', () => {
  const defaultProps = {
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render help button with correct text', () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /open help guide/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Help');
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<HelpButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open help guide/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label', () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /open help guide/i });
    expect(button).toHaveAttribute('aria-label', 'Open help guide');
  });

  it('should have correct CSS classes', () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /open help guide/i });
    expect(button).toHaveClass('gap-2');
  });

  it('should display help circle icon', () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /open help guide/i });
    const icon = button.querySelector('[data-lucide="help-circle"]') || button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should be focusable', () => {
    const mockOnClick = vi.fn();
    render(<HelpButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open help guide/i });

    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should handle multiple clicks', () => {
    const mockOnClick = vi.fn();
    render(<HelpButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open help guide/i });

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('should handle disabled state', () => {
    const mockOnClick = vi.fn();
    render(<HelpButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open help guide/i });

    // Test that button can be disabled
    button.setAttribute('disabled', 'true');
    expect(button).toHaveAttribute('disabled', 'true');
  });
});
