import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/Logo';

describe('Logo Component', () => {
  it('should render logo with default props', () => {
    render(<Logo />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'favicon.svg');
    expect(logo).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should render logo with custom size', () => {
    render(<Logo size={60} />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('should render logo with custom className', () => {
    render(<Logo className="custom-class" />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveClass('flex-shrink-0', 'custom-class');
  });

  it('should render logo with both custom size and className', () => {
    render(<Logo size={80} className="test-class" />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveStyle({ width: '80px', height: '80px' });
    expect(logo).toHaveClass('flex-shrink-0', 'test-class');
  });

  it('should handle zero size', () => {
    render(<Logo size={0} />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveStyle({ width: '0px', height: '0px' });
  });

  it('should handle negative size', () => {
    render(<Logo size={-10} />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveStyle({ width: '-10px', height: '-10px' });
  });

  it('should handle empty className', () => {
    render(<Logo className="" />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveClass('flex-shrink-0');
  });

  it('should handle multiple class names', () => {
    render(<Logo className="class1 class2 class3" />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveClass('flex-shrink-0', 'class1', 'class2', 'class3');
  });

  it('should have correct alt text for accessibility', () => {
    render(<Logo />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should be an img element', () => {
    render(<Logo />);

    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('IMG');
  });

  it('should have correct src attribute', () => {
    render(<Logo />);

    const logo = screen.getByAltText('Instagram Unfollow Tracker Logo');
    expect(logo).toHaveAttribute('src', 'favicon.svg');
  });
});
