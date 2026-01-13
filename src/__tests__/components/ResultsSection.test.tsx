/**
 * ResultsSection Component Tests
 *
 * Tests for the results section that displays stat cards and layout
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsSection } from '@/components/ResultsSection';
import resultsEN from '@/locales/en/results.json';

// react-i18next is already mocked globally in vitest.setup.ts

describe('ResultsSection', () => {
  const defaultProps = {
    totalCount: 1000,
    filteredCount: 500,
    stats: {
      following: 800,
      followers: 600,
      mutuals: 400,
      notFollowingBack: 200,
    },
    children: <div data-testid="child-content">Filter chips here</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<ResultsSection {...defaultProps} />);
      expect(screen.getByText(resultsEN.stats.following)).toBeInTheDocument();
    });

    it('should render all four stat cards', () => {
      render(<ResultsSection {...defaultProps} />);

      expect(screen.getByText(resultsEN.stats.following)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.stats.followers)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.mutuals)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.stats.notFollowing)).toBeInTheDocument();
    });

    it('should render children in sidebar', () => {
      render(<ResultsSection {...defaultProps} />);

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Filter chips here')).toBeInTheDocument();
    });

    it('should display showing count text', () => {
      render(<ResultsSection {...defaultProps} />);

      expect(screen.getByText(/Showing 500 of 1,?000/)).toBeInTheDocument();
    });
  });

  describe('stat card values', () => {
    it('should display following count', () => {
      render(<ResultsSection {...defaultProps} />);
      expect(screen.getByText('800')).toBeInTheDocument();
    });

    it('should display followers count', () => {
      render(<ResultsSection {...defaultProps} />);
      expect(screen.getByText('600')).toBeInTheDocument();
    });

    it('should display mutuals count', () => {
      render(<ResultsSection {...defaultProps} />);
      expect(screen.getByText('400')).toBeInTheDocument();
    });

    it('should display not following back count', () => {
      render(<ResultsSection {...defaultProps} />);
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should format large numbers with locale separators', () => {
      const propsWithLargeNumbers = {
        ...defaultProps,
        totalCount: 1000000,
        filteredCount: 500000,
        stats: {
          following: 1234567,
          followers: 987654,
          mutuals: 456789,
          notFollowingBack: 123456,
        },
      };

      render(<ResultsSection {...propsWithLargeNumbers} />);

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
      expect(screen.getByText('987,654')).toBeInTheDocument();
      expect(screen.getByText('456,789')).toBeInTheDocument();
      expect(screen.getByText('123,456')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const propsWithZeros = {
        ...defaultProps,
        totalCount: 0,
        filteredCount: 0,
        stats: {
          following: 0,
          followers: 0,
          mutuals: 0,
          notFollowingBack: 0,
        },
      };

      render(<ResultsSection {...propsWithZeros} />);

      // All zero values should be displayed (at least 4 stat cards)
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('layout structure', () => {
    it('should have grid layout for stat cards', () => {
      const { container } = render(<ResultsSection {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-2', 'lg:grid-cols-4');
    });

    it('should have sidebar for children', () => {
      const { container } = render(<ResultsSection {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass('md:w-72');
    });

    it('should have main content area', () => {
      const { container } = render(<ResultsSection {...defaultProps} />);

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-grow');
    });
  });

  describe('responsive design', () => {
    it('should have responsive padding', () => {
      const { container } = render(<ResultsSection {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('px-4', 'py-8', 'md:py-12');
    });

    it('should have responsive gap in stat cards grid', () => {
      const { container } = render(<ResultsSection {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'md:gap-8');
    });
  });

  describe('with different children', () => {
    it('should render complex children', () => {
      const complexChildren = (
        <div>
          <button data-testid="filter-btn">Filter</button>
          <input data-testid="search-input" placeholder="Search" />
        </div>
      );

      render(<ResultsSection {...defaultProps}>{complexChildren}</ResultsSection>);

      expect(screen.getByTestId('filter-btn')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render null children without error', () => {
      render(<ResultsSection {...defaultProps}>{null}</ResultsSection>);

      expect(screen.getByText(resultsEN.stats.following)).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ResultsSection {...defaultProps}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ResultsSection>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });
});
