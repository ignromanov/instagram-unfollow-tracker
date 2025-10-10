import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    resultCount: 100,
    totalCount: 500,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<SearchBar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search accounts...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should display search icon', () => {
    render(<SearchBar {...defaultProps} />);

    const searchIcon =
      document.querySelector('[data-lucide="search"]') || document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should display result count correctly', () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.getByText('Showing 100 of 500 accounts')).toBeInTheDocument();
  });

  it('should format large numbers with commas', () => {
    render(<SearchBar {...defaultProps} resultCount={1234} totalCount={5678} />);

    expect(screen.getByText('Showing 1,234 of 5,678 accounts')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    const mockOnChange = vi.fn();
    render(<SearchBar {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should display clear button when value is not empty', () => {
    render(<SearchBar {...defaultProps} value="test" />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not display clear button when value is empty', () => {
    render(<SearchBar {...defaultProps} value="" />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should clear input when clear button is clicked', () => {
    const mockOnChange = vi.fn();
    render(<SearchBar {...defaultProps} value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should display X icon in clear button', () => {
    render(<SearchBar {...defaultProps} value="test" />);

    const clearButton = screen.getByRole('button');
    const xIcon =
      clearButton.querySelector('[data-lucide="x"]') || clearButton.querySelector('svg');
    expect(xIcon).toBeInTheDocument();
  });

  it('should handle zero result count', () => {
    render(<SearchBar {...defaultProps} resultCount={0} totalCount={100} />);

    expect(screen.getByText('Showing 0 of 100 accounts')).toBeInTheDocument();
  });

  it('should handle zero total count', () => {
    render(<SearchBar {...defaultProps} resultCount={0} totalCount={0} />);

    expect(screen.getByText('Showing 0 of 0 accounts')).toBeInTheDocument();
  });

  it('should have correct input attributes', () => {
    render(<SearchBar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search accounts...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveClass('pl-10', 'pr-10', 'text-base');
  });

  it('should have correct clear button attributes', () => {
    render(<SearchBar {...defaultProps} value="test" />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toHaveClass(
      'absolute',
      'right-1',
      'top-1/2',
      'h-7',
      'w-7',
      '-translate-y-1/2',
      'p-0'
    );
  });

  it('should handle very large numbers', () => {
    render(<SearchBar {...defaultProps} resultCount={1234567} totalCount={9876543} />);

    expect(screen.getByText('Showing 1,234,567 of 9,876,543 accounts')).toBeInTheDocument();
  });

  it('should maintain focus after clearing input', () => {
    const mockOnChange = vi.fn();
    render(<SearchBar {...defaultProps} value="test" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search accounts...');
    const clearButton = screen.getByRole('button');

    // Focus input first
    input.focus();
    expect(input).toHaveFocus();

    // Click clear button
    fireEvent.click(clearButton);

    // Input should still be focused
    expect(input).toHaveFocus();
  });
});
