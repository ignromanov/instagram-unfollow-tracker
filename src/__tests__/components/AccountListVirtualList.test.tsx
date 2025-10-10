import { render, screen } from '@testing-library/react';
import { AccountList } from '@/components/AccountList';
import type { AccountBadges } from '@/core/types';

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getTotalSize: () => 300,
    getVirtualItems: () => [
      { key: '0', index: 0, start: 0, size: 100 },
      { key: '1', index: 1, start: 100, size: 100 },
      { key: '2', index: 2, start: 200, size: 100 },
    ],
    scrollToIndex: vi.fn(),
  })),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ExternalLink: () => <span data-testid="external-link-icon">→</span>,
}));

// Mock store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(selector => {
    const state = {
      fileMetadata: {
        fileHash: 'test-hash',
        accountCount: 100,
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date(),
      },
    };
    return selector(state);
  }),
}));

// Mock useAccountDataSource
const mockAccounts: AccountBadges[] = [
  { username: 'test_user_0', badges: { following: true } },
  { username: 'test_user_1', badges: { followers: true } },
  { username: 'test_user_2', badges: { mutuals: true } },
];

vi.mock('@/hooks/useAccountDataSource', () => ({
  useAccountDataSource: vi.fn(() => ({
    getAccount: vi.fn((index: number) => mockAccounts[index]),
  })),
}));

describe('AccountList Virtual List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render virtual list with correct structure', () => {
    const accountIndices = [0, 1, 2];
    render(<AccountList accountIndices={accountIndices} hasLoadedData={true} />);

    expect(screen.getByText('Accounts (3)')).toBeInTheDocument();
  });

  it('should render visible accounts', () => {
    const accountIndices = [0, 1, 2];
    render(<AccountList accountIndices={accountIndices} hasLoadedData={true} />);

    expect(screen.getByText('@test_user_0')).toBeInTheDocument();
    expect(screen.getByText('@test_user_1')).toBeInTheDocument();
    expect(screen.getByText('@test_user_2')).toBeInTheDocument();
  });

  it('should handle large datasets efficiently', () => {
    const largeIndices = Array.from({ length: 10000 }, (_, i) => i);
    render(<AccountList accountIndices={largeIndices} hasLoadedData={true} />);

    // Should only render visible items (3 mocked)
    expect(screen.getByText('Accounts (10,000)')).toBeInTheDocument();
    expect(screen.getByText('@test_user_0')).toBeInTheDocument();
  });

  it('should handle empty dataset', () => {
    render(<AccountList accountIndices={[]} hasLoadedData={true} />);

    expect(screen.getByText('No accounts match your filters')).toBeInTheDocument();
  });

  it('should handle single item', () => {
    const singleIndices = [0];
    render(<AccountList accountIndices={singleIndices} hasLoadedData={true} />);

    expect(screen.getByText('Accounts (1)')).toBeInTheDocument();
    expect(screen.getByText('@test_user_0')).toBeInTheDocument();
  });

  it('should not render when data not loaded', () => {
    const { container } = render(<AccountList accountIndices={[0, 1]} hasLoadedData={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should handle external links correctly', () => {
    const accountIndices = [0, 1, 2];
    render(<AccountList accountIndices={accountIndices} hasLoadedData={true} />);

    const externalLinks = screen.getAllByTestId('external-link-icon');
    expect(externalLinks.length).toBeGreaterThan(0);

    const firstLink = externalLinks[0]?.closest('a');
    expect(firstLink).toHaveAttribute('href', 'https://instagram.com/test_user_0');
    expect(firstLink).toHaveAttribute('target', '_blank');
  });

  it('should display badges correctly', () => {
    const accountIndices = [0, 1, 2];
    render(<AccountList accountIndices={accountIndices} hasLoadedData={true} />);

    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Mutuals')).toBeInTheDocument();
  });
});
