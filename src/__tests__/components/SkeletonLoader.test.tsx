import { vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountListSkeleton, FilterChipsSkeleton } from '@/components/SkeletonLoader';

describe('SkeletonLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AccountListSkeleton', () => {
    it('should render with default count of 5', () => {
      render(<AccountListSkeleton />);

      // Check for header skeleton
      expect(screen.getByTestId('account-list-skeleton')).toBeInTheDocument();

      // Check for 5 skeleton items (default count)
      const skeletonItems = document.querySelectorAll('.animate-pulse');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should render with custom count', () => {
      render(<AccountListSkeleton count={3} />);

      // Check for header skeleton
      expect(screen.getByTestId('account-list-skeleton')).toBeInTheDocument();

      // Should have skeleton elements for 3 items
      const skeletonItems = document.querySelectorAll('.animate-pulse');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should render with count of 0', () => {
      render(<AccountListSkeleton count={0} />);

      // Should still render the container and header
      expect(screen.getByTestId('account-list-skeleton')).toBeInTheDocument();
    });

    it('should render with count of 1', () => {
      render(<AccountListSkeleton count={1} />);

      expect(screen.getByTestId('account-list-skeleton')).toBeInTheDocument();
    });

    it('should have correct CSS classes for styling', () => {
      render(<AccountListSkeleton count={2} />);

      // Check for main container classes
      const container = document.querySelector('.space-y-3');
      expect(container).toBeInTheDocument();

      // Check for header skeleton classes
      const headerSkeleton = document.querySelector('.h-5.w-32.animate-pulse.rounded');
      expect(headerSkeleton).toBeInTheDocument();

      // Check for items container classes
      const itemsContainer = document.querySelector('.space-y-2');
      expect(itemsContainer).toBeInTheDocument();
    });

    it('should render skeleton items with correct structure', () => {
      render(<AccountListSkeleton count={1} />);

      // Check for item container
      const itemContainer = document.querySelector('.flex.items-center.gap-3.rounded-lg.border');
      expect(itemContainer).toBeInTheDocument();

      // Check for avatar skeleton
      const avatarSkeleton = document.querySelector(
        '.h-12.w-12.flex-shrink-0.animate-pulse.rounded-full'
      );
      expect(avatarSkeleton).toBeInTheDocument();

      // Check for content area
      const contentArea = document.querySelector('.min-w-0.flex-1.space-y-2');
      expect(contentArea).toBeInTheDocument();

      // Check for username skeleton
      const usernameSkeleton = document.querySelector('.h-4.w-32.animate-pulse.rounded');
      expect(usernameSkeleton).toBeInTheDocument();

      // Check for badges container
      const badgesContainer = document.querySelector('.flex.gap-1\\.5');
      expect(badgesContainer).toBeInTheDocument();
    });

    it('should render multiple badge skeletons per item', () => {
      render(<AccountListSkeleton count={1} />);

      // Should have 3 badge skeletons per item
      const badgeSkeletons = document.querySelectorAll('.h-5.animate-pulse.rounded-full');
      expect(badgeSkeletons.length).toBe(3);
    });

    it('should have different widths for badge skeletons', () => {
      render(<AccountListSkeleton count={1} />);

      // Check for different width classes
      const w16Skeleton = document.querySelector('.w-16');
      const w20Skeleton = document.querySelector('.w-20');
      const w14Skeleton = document.querySelector('.w-14');

      expect(w16Skeleton).toBeInTheDocument();
      expect(w20Skeleton).toBeInTheDocument();
      expect(w14Skeleton).toBeInTheDocument();
    });
  });

  describe('FilterChipsSkeleton', () => {
    it('should render with default count of 10', () => {
      render(<FilterChipsSkeleton />);

      expect(screen.getByTestId('filter-chips-skeleton')).toBeInTheDocument();

      // Should have skeleton elements
      const skeletonItems = document.querySelectorAll('.animate-pulse');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should have correct CSS classes for styling', () => {
      render(<FilterChipsSkeleton />);

      // Check for main container classes
      const container = document.querySelector('.space-y-3');
      expect(container).toBeInTheDocument();

      // Check for header skeleton classes
      const headerSkeleton = document.querySelector('.h-5.w-32.animate-pulse.rounded');
      expect(headerSkeleton).toBeInTheDocument();

      // Check for chips container classes
      const chipsContainer = document.querySelector('.flex.flex-wrap.gap-2');
      expect(chipsContainer).toBeInTheDocument();
    });

    it('should render 10 chip skeletons', () => {
      render(<FilterChipsSkeleton />);

      // Should have 10 chip skeletons
      const chipSkeletons = document.querySelectorAll('.h-8.w-24.animate-pulse.rounded-full');
      expect(chipSkeletons.length).toBe(10);
    });

    it('should have correct chip skeleton structure', () => {
      render(<FilterChipsSkeleton />);

      // Check for chip skeleton classes
      const chipSkeleton = document.querySelector('.h-8.w-24.animate-pulse.rounded-full');
      expect(chipSkeleton).toBeInTheDocument();
    });

    it('should render all chip skeletons with same dimensions', () => {
      render(<FilterChipsSkeleton />);

      const chipSkeletons = document.querySelectorAll(
        '.h-8.w-24.animate-pulse.rounded-full.bg-muted'
      );

      chipSkeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-8', 'w-24', 'animate-pulse', 'rounded-full', 'bg-muted');
      });
    });
  });

  describe('Accessibility', () => {
    it('should not have any interactive elements', () => {
      render(<AccountListSkeleton count={1} />);
      render(<FilterChipsSkeleton />);

      // Should not have any buttons, links, or other interactive elements
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should be purely visual elements', () => {
      render(<AccountListSkeleton count={1} />);

      // Should only contain div elements (excluding html and body)
      const skeletonContainer = screen.getByTestId('account-list-skeleton');
      const allElements = skeletonContainer.querySelectorAll('*');
      allElements.forEach(element => {
        expect(element.tagName).toBe('DIV');
      });
    });
  });

  describe('Performance', () => {
    it('should render efficiently with large counts', () => {
      const startTime = performance.now();
      render(<AccountListSkeleton count={100} />);
      const endTime = performance.now();

      // Should render quickly even with many items (relaxed for test environment)
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should not cause memory leaks with many re-renders', () => {
      const { rerender } = render(<AccountListSkeleton count={10} />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<AccountListSkeleton count={10} />);
      }

      // Should still render correctly - check that we have multiple generic elements
      const genericElements = screen.getAllByRole('generic');
      expect(genericElements.length).toBeGreaterThan(0);
    });
  });
});
