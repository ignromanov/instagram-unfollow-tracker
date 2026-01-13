import { render } from '@testing-library/react';
import { forwardRef } from 'react';
import { Separator } from '@/components/ui/separator';

// Mock Radix UI Separator with proper decorative behavior
vi.mock('@radix-ui/react-separator', () => ({
  Root: forwardRef(({ decorative = true, ...props }: any, ref: any) => {
    // Mimic Radix behavior: decorative=true -> role="none", decorative=false -> role="separator"
    const role = decorative ? 'none' : 'separator';
    return <div ref={ref} data-testid="separator" role={role} {...props} />;
  }),
}));

describe('Separator Component', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<Separator />);

      const separator = getByTestId('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('orientation', 'horizontal');
      expect(separator).toHaveAttribute('role', 'none'); // decorative=true -> role="none"
    });

    it('should render with horizontal orientation classes', () => {
      const { getByTestId } = render(<Separator orientation="horizontal" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border', 'h-[1px]', 'w-full');
    });

    it('should render with vertical orientation classes', () => {
      const { getByTestId } = render(<Separator orientation="vertical" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border', 'h-full', 'w-[1px]');
    });

    it('should render with decorative true', () => {
      const { getByTestId } = render(<Separator decorative={true} />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'none'); // decorative=true -> role="none"
    });

    it('should render with decorative false', () => {
      const { getByTestId } = render(<Separator decorative={false} />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator'); // decorative=false -> role="separator"
    });

    it('should apply custom className', () => {
      const { getByTestId } = render(<Separator className="custom-separator" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveClass('custom-separator');
    });

    it('should merge custom className with default classes', () => {
      const { getByTestId } = render(
        <Separator className="my-4 custom-class" orientation="horizontal" />
      );

      const separator = getByTestId('separator');
      expect(separator).toHaveClass(
        'shrink-0',
        'bg-border',
        'h-[1px]',
        'w-full',
        'my-4',
        'custom-class'
      );
    });
  });

  describe('orientation', () => {
    it('should handle horizontal orientation by default', () => {
      const { getByTestId } = render(<Separator />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should handle explicit horizontal orientation', () => {
      const { getByTestId } = render(<Separator orientation="horizontal" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should handle vertical orientation', () => {
      const { getByTestId } = render(<Separator orientation="vertical" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('orientation', 'vertical');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });
  });

  describe('additional props', () => {
    it('should pass through additional props', () => {
      const { getByTestId } = render(<Separator data-custom="test" id="my-separator" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('data-custom', 'test');
      expect(separator).toHaveAttribute('id', 'my-separator');
    });

    it('should handle ref forwarding', () => {
      const ref = { current: null };
      render(<Separator ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('should handle all props combination', () => {
      const { getByTestId } = render(
        <Separator
          orientation="vertical"
          decorative={false}
          className="custom"
          data-testid="custom-separator"
          aria-label="Divider"
        />
      );

      const separator = getByTestId('custom-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('orientation', 'vertical');
      expect(separator).toHaveAttribute('role', 'separator'); // decorative=false -> role="separator"
      expect(separator).toHaveAttribute('aria-label', 'Divider');
      expect(separator).toHaveClass('custom');
    });
  });

  describe('accessibility', () => {
    it('should be decorative by default for a11y', () => {
      const { getByTestId } = render(<Separator />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'none'); // decorative=true -> role="none" (hidden from a11y tree)
    });

    it('should support non-decorative mode with aria-label', () => {
      const { getByTestId } = render(<Separator decorative={false} aria-label="Section divider" />);

      const separator = getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator'); // decorative=false -> role="separator" (visible to a11y)
      expect(separator).toHaveAttribute('aria-label', 'Section divider');
    });
  });
});
