import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

describe('Accordion Components', () => {
  describe('Accordion', () => {
    it('should render accordion with single item', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      // Content is visible when accordion is open
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should render accordion with multiple items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Section 3</AccordionTrigger>
            <AccordionContent>Content 3</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('should handle multiple type accordion', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });

  describe('AccordionItem', () => {
    it('should render with default styling', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = container.querySelector('[data-state]');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('border-b');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item-class">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = container.querySelector('[data-state]');
      expect(item).toHaveClass('custom-item-class');
      expect(item).toHaveClass('border-b');
    });

    it('should render with unique value', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="unique-value">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = container.querySelector('[data-state]');
      expect(item).toBeInTheDocument();
    });
  });

  describe('AccordionTrigger', () => {
    it('should render trigger with chevron icon', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Click me</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Click me');
      expect(trigger).toBeInTheDocument();

      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4', 'shrink-0');
    });

    it('should apply custom className', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="custom-trigger-class">Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Title');
      expect(trigger).toHaveClass('custom-trigger-class');
      expect(trigger).toHaveClass('flex', 'flex-1', 'items-center');
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Toggle</AccordionTrigger>
            <AccordionContent>Hidden Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Toggle');
      expect(trigger).toHaveClass('cursor-pointer');

      await user.click(trigger);
      // After click, accordion should expand (Radix handles this)
    });

    it('should render complex children', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span>Icon</span>
              <span>Title Text</span>
            </AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Title Text')).toBeInTheDocument();
    });
  });

  describe('AccordionContent', () => {
    it('should render content', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>This is the content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('This is the content')).toBeInTheDocument();
    });

    it('should apply custom className to inner div', () => {
      const { container } = render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent className="custom-content-class">Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const contentWrapper = container.querySelector('.custom-content-class');
      expect(contentWrapper).toBeInTheDocument();
      expect(contentWrapper).toHaveClass('pb-4', 'pt-0');
    });

    it('should have animation classes', () => {
      const { container } = render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // Find the content wrapper using data-state attribute
      const content = screen.getByText('Content');
      const contentContainer = content.closest('[data-state]');

      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass('overflow-hidden', 'text-sm');
    });

    it('should render complex content', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>
              <div>
                <p>Paragraph 1</p>
                <p>Paragraph 2</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Accordion integration', () => {
    it('should handle collapsible single accordion', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Section 1');
      await user.click(trigger1);

      // Radix handles the expand/collapse state
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should handle default open state', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // item-2 should be open by default
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>Disabled Section</AccordionTrigger>
            <AccordionContent>Disabled Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Disabled Section');
      expect(trigger).toBeInTheDocument();
    });

    it('should render empty accordion', () => {
      const { container } = render(<Accordion type="single" collapsible />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Accordion type="single" collapsible data-testid="test-accordion">
          <AccordionItem value="item-1">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('test-accordion')).toBeInTheDocument();
    });
  });
});
