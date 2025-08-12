import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DocumentationLink } from '@/components/DocumentationLink';

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true
});

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('DocumentationLink', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('should render with default props', () => {
    renderWithMantine(<DocumentationLink />);

    expect(screen.getByText('📚 Docs')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    renderWithMantine(<DocumentationLink size="sm" />);

    expect(screen.getByText('📚 Documentation')).toBeInTheDocument();
  });

  it('should render with custom variant', () => {
    renderWithMantine(<DocumentationLink variant="filled" />);

    const button = screen.getByText('📚 Docs');
    expect(button).toBeInTheDocument();
  });

  it('should render with custom color', () => {
    renderWithMantine(<DocumentationLink color="green" />);

    const button = screen.getByText('📚 Docs');
    expect(button).toBeInTheDocument();
  });

  it('should open documentation in new tab when clicked', () => {
    renderWithMantine(<DocumentationLink />);

    const button = screen.getByText('📚 Docs');
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://ignromanov.github.io/instagram-unfollow-tracker/docs/',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should have correct title attribute', () => {
    renderWithMantine(<DocumentationLink />);

    const button = screen.getByTitle('Open documentation in new tab');
    expect(button).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    renderWithMantine(<DocumentationLink />);

    const button = screen.getByLabelText('Open documentation in new tab');
    expect(button).toBeInTheDocument();
  });

  it('should render with xs size and show "Docs" text', () => {
    renderWithMantine(<DocumentationLink size="xs" />);

    expect(screen.getByText('📚 Docs')).toBeInTheDocument();
  });

  it('should render with larger size and show "Documentation" text', () => {
    renderWithMantine(<DocumentationLink size="md" />);

    expect(screen.getByText('📚 Documentation')).toBeInTheDocument();
  });

  it('should have correct component type (button)', () => {
    renderWithMantine(<DocumentationLink />);

    const button = screen.getByText('📚 Docs');
    expect(button.tagName).toBe('SPAN'); // Mantine Button with component="a" renders as span
  });

  it('should handle multiple clicks correctly', () => {
    renderWithMantine(<DocumentationLink />);

    const button = screen.getByText('📚 Docs');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledTimes(3);
  });
});
