import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/Logo';

describe('Logo Component', () => {
  it('should render logo with default props', () => {
    render(<Logo />);

    const logo = screen.getByRole('img', { name: 'SafeUnfollow logo' });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('width', '40');
    expect(logo).toHaveAttribute('height', '40');
  });

  it('should render logo with custom size', () => {
    render(<Logo size={60} />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('width', '60');
    expect(logo).toHaveAttribute('height', '60');
  });

  it('should render logo with custom className', () => {
    render(<Logo className="custom-class" />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('flex-shrink-0', 'custom-class');
  });

  it('should render logo with both custom size and className', () => {
    render(<Logo size={80} className="test-class" />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('width', '80');
    expect(logo).toHaveAttribute('height', '80');
    expect(logo).toHaveClass('flex-shrink-0', 'test-class');
  });

  it('should handle zero size', () => {
    render(<Logo size={0} />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('width', '0');
    expect(logo).toHaveAttribute('height', '0');
  });

  it('should handle negative size', () => {
    render(<Logo size={-10} />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('width', '-10');
    expect(logo).toHaveAttribute('height', '-10');
  });

  it('should handle empty className', () => {
    render(<Logo className="" />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('flex-shrink-0');
  });

  it('should handle multiple class names', () => {
    render(<Logo className="class1 class2 class3" />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('flex-shrink-0', 'class1', 'class2', 'class3');
  });

  it('should have correct aria-label for accessibility', () => {
    render(<Logo />);

    const logo = screen.getByRole('img', { name: 'SafeUnfollow logo' });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('aria-label', 'SafeUnfollow logo');
  });

  it('should be an svg element', () => {
    render(<Logo />);

    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('svg');
  });

  it('should have correct viewBox attribute', () => {
    render(<Logo />);

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('viewBox', '0 0 512 512');
  });
});
