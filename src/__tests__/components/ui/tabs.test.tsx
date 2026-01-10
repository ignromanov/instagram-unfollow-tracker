import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('Tabs Components', () => {
  describe('Tabs', () => {
    it('should render tabs with default value', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="tab1" className="custom-tabs-class">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const tabs = screen.getByText('Tab 1').closest('[data-slot="tabs"]');
      expect(tabs).toHaveClass('custom-tabs-class');
      expect(tabs).toHaveClass('flex', 'flex-col', 'gap-2');
    });

    it('should render with data-slot attribute', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const tabs = screen.getByText('Tab').closest('[data-slot="tabs"]');
      expect(tabs).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="test-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('test-tabs')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('should render tabs list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should apply default styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const list = screen.getByText('Tab').closest('[data-slot="tabs-list"]');
      expect(list).toHaveClass('bg-muted', 'text-muted-foreground');
      expect(list).toHaveClass('inline-flex', 'h-9', 'w-fit');
      expect(list).toHaveClass('items-center', 'justify-center');
      expect(list).toHaveClass('rounded-lg', 'p-[3px]');
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list-class">
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const list = screen.getByText('Tab').closest('[data-slot="tabs-list"]');
      expect(list).toHaveClass('custom-list-class');
    });

    it('should have data-slot attribute', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const list = screen.getByText('Tab').closest('[data-slot="tabs-list"]');
      expect(list).toHaveAttribute('data-slot', 'tabs-list');
    });
  });

  describe('TabsTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Click me</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Click me');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'tabs-trigger');
    });

    it('should apply extensive styling classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Tab');
      expect(trigger).toHaveClass(
        'inline-flex',
        'flex-1',
        'items-center',
        'justify-center',
        'gap-1.5'
      );
      expect(trigger).toHaveClass('rounded-md', 'border', 'border-transparent');
      expect(trigger).toHaveClass('px-2', 'py-1', 'text-sm', 'font-medium');
      expect(trigger).toHaveClass('whitespace-nowrap', 'transition-[color,box-shadow]');
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger-class">
              Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Tab');
      expect(trigger).toHaveClass('custom-trigger-class');
    });

    it('should handle active state styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Active Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Active Tab');
      expect(trigger).toHaveClass(
        'data-[state=active]:bg-background',
        'data-[state=active]:shadow-sm'
      );
    });

    it('should handle disabled state', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled>
              Disabled Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Disabled Tab');
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2Trigger = screen.getByText('Tab 2');
      await user.click(tab2Trigger);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle focus and accessibility', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Tab');
      expect(trigger).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
        'focus-visible:outline-ring'
      );
    });
  });

  describe('TabsContent', () => {
    it('should render content for active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">This is tab 1 content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('This is tab 1 content')).toBeInTheDocument();
    });

    it('should apply default styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const content = screen.getByText('Content');
      expect(content).toHaveClass('flex-1', 'outline-none');
      expect(content).toHaveAttribute('data-slot', 'tabs-content');
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content-class">
            Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-content-class');
    });

    it('should render complex content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div>
              <h2>Title</h2>
              <p>Paragraph</p>
            </div>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const content = screen.getByText('Content');
      expect(content).toHaveAttribute('data-slot', 'tabs-content');
    });
  });

  describe('Tabs integration', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // Initially tab1 is active
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // Click tab2
      await user.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      // Click tab3
      await user.click(screen.getByText('Tab 3'));
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('should handle controlled value', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle empty tabs', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList />
        </Tabs>
      );

      const list = container.querySelector('[data-slot="tabs-list"]');
      expect(list).toBeInTheDocument();
      expect(list).toBeEmptyDOMElement();
    });

    it('should pass through aria attributes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Navigation tabs">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const list = screen.getByText('Tab 1').closest('[data-slot="tabs-list"]');
      expect(list).toHaveAttribute('aria-label', 'Navigation tabs');
    });

    it('should handle multiple tabs lists', () => {
      render(
        <div>
          <Tabs defaultValue="a1">
            <TabsList>
              <TabsTrigger value="a1">A1</TabsTrigger>
              <TabsTrigger value="a2">A2</TabsTrigger>
            </TabsList>
            <TabsContent value="a1">Content A1</TabsContent>
            <TabsContent value="a2">Content A2</TabsContent>
          </Tabs>
          <Tabs defaultValue="b1">
            <TabsList>
              <TabsTrigger value="b1">B1</TabsTrigger>
              <TabsTrigger value="b2">B2</TabsTrigger>
            </TabsList>
            <TabsContent value="b1">Content B1</TabsContent>
            <TabsContent value="b2">Content B2</TabsContent>
          </Tabs>
        </div>
      );

      expect(screen.getByText('Content A1')).toBeInTheDocument();
      expect(screen.getByText('Content B1')).toBeInTheDocument();
    });
  });
});
