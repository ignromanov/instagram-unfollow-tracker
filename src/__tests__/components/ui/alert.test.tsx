import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render alert with default variant', () => {
      render(<Alert>Default Alert</Alert>);

      const alert = screen.getByText('Default Alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-slot', 'alert');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert.tagName).toBe('DIV');
    });

    it('should render alert with default variant classes', () => {
      render(<Alert>Default Alert</Alert>);

      const alert = screen.getByText('Default Alert');
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-3',
        'text-sm',
        'grid',
        'has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]',
        'grid-cols-[0_1fr]',
        'has-[>svg]:gap-x-3',
        'gap-y-0.5',
        'items-start',
        '[&>svg]:size-4',
        '[&>svg]:translate-y-0.5',
        '[&>svg]:text-current',
        'bg-card',
        'text-card-foreground'
      );
    });

    it('should render alert with destructive variant', () => {
      render(<Alert variant="destructive">Destructive Alert</Alert>);

      const alert = screen.getByText('Destructive Alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass(
        'text-destructive',
        'bg-card',
        '[&>svg]:text-current',
        '*:data-[slot=alert-description]:text-destructive/90'
      );
    });

    it('should apply custom className', () => {
      render(<Alert className="custom-class">Custom Alert</Alert>);

      const alert = screen.getByText('Custom Alert');
      expect(alert).toHaveClass('custom-class');
    });

    it('should pass through additional props', () => {
      render(
        <Alert data-testid="test-alert" id="alert-1">
          Test Alert
        </Alert>
      );

      const alert = screen.getByTestId('test-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('id', 'alert-1');
    });

    it('should handle empty content', () => {
      const { container } = render(<Alert></Alert>);

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toBeEmptyDOMElement();
    });

    it('should handle complex content', () => {
      const { container } = render(
        <Alert>
          <span>Icon</span>
          <span>Text</span>
        </Alert>
      );

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('IconText');
    });
  });

  describe('AlertTitle', () => {
    it('should render alert title', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );

      const title = screen.getByText('Alert Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'alert-title');
      expect(title.tagName).toBe('DIV');
    });

    it('should render alert title with correct classes', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );

      const title = screen.getByText('Alert Title');
      expect(title).toHaveClass(
        'col-start-2',
        'line-clamp-1',
        'min-h-4',
        'font-medium',
        'tracking-tight'
      );
    });

    it('should apply custom className to title', () => {
      render(
        <Alert>
          <AlertTitle className="custom-title">Alert Title</AlertTitle>
        </Alert>
      );

      const title = screen.getByText('Alert Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should pass through additional props to title', () => {
      render(
        <Alert>
          <AlertTitle data-testid="test-title" id="title-1">
            Alert Title
          </AlertTitle>
        </Alert>
      );

      const title = screen.getByTestId('test-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'title-1');
    });
  });

  describe('AlertDescription', () => {
    it('should render alert description', () => {
      render(
        <Alert>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
      );

      const description = screen.getByText('Alert Description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'alert-description');
      expect(description.tagName).toBe('DIV');
    });

    it('should render alert description with correct classes', () => {
      render(
        <Alert>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
      );

      const description = screen.getByText('Alert Description');
      expect(description).toHaveClass(
        'text-muted-foreground',
        'col-start-2',
        'grid',
        'justify-items-start',
        'gap-1',
        'text-sm',
        '[&_p]:leading-relaxed'
      );
    });

    it('should apply custom className to description', () => {
      render(
        <Alert>
          <AlertDescription className="custom-description">Alert Description</AlertDescription>
        </Alert>
      );

      const description = screen.getByText('Alert Description');
      expect(description).toHaveClass('custom-description');
    });

    it('should pass through additional props to description', () => {
      render(
        <Alert>
          <AlertDescription data-testid="test-description" id="desc-1">
            Alert Description
          </AlertDescription>
        </Alert>
      );

      const description = screen.getByTestId('test-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('id', 'desc-1');
    });
  });

  describe('Integration', () => {
    it('should render complete alert structure', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your changes have been saved successfully.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your changes have been saved successfully.')).toBeInTheDocument();

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should render destructive alert with title and description', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>
      );

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toHaveClass('text-destructive', 'bg-card');

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    it('should handle multiple alerts', () => {
      render(
        <div>
          <Alert>
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>This is an info alert.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>This is an error alert.</AlertDescription>
          </Alert>
        </div>
      );

      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('This is an info alert.')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('This is an error alert.')).toBeInTheDocument();
    });

    it('should handle alert with only title', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title Only</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should handle alert with only description', () => {
      const { container } = render(
        <Alert>
          <AlertDescription>Description Only</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Description Only')).toBeInTheDocument();

      const alert = container.querySelector('[data-slot="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });
});
