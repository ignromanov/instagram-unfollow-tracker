import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DataDownloadInstructions } from '@/components/DataDownloadInstructions';

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('DataDownloadInstructions', () => {
  it('should render button variant by default', () => {
    renderWithMantine(<DataDownloadInstructions />);

    expect(screen.getByText('❓ How to get data?')).toBeInTheDocument();
  });

  it('should render button with custom size', () => {
    renderWithMantine(<DataDownloadInstructions size="lg" />);

    const button = screen.getByText('❓ How to get data?');
    expect(button).toBeInTheDocument();
  });

  it('should render alert variant when specified', () => {
    renderWithMantine(
      <DataDownloadInstructions variant="alert" showInEmptyState />
    );

    expect(screen.getByText('To analyze your Instagram connections, you need to download your data from Instagram first.')).toBeInTheDocument();
    expect(screen.getByText('📖 View Step-by-Step Guide')).toBeInTheDocument();
  });

  it('should open modal when button is clicked', async () => {
    renderWithMantine(<DataDownloadInstructions />);

    fireEvent.click(screen.getByText('❓ How to get data?'));

    // Wait for modal to appear
    await screen.findByText('📥 How to Download Your Instagram Data');
    expect(screen.getByText('📥 How to Download Your Instagram Data')).toBeInTheDocument();
  });

  it('should open modal when alert button is clicked', async () => {
    renderWithMantine(
      <DataDownloadInstructions variant="alert" showInEmptyState />
    );

    fireEvent.click(screen.getByText('📖 View Step-by-Step Guide'));

    // Wait for modal to appear
    await screen.findByText('📥 How to Download Your Instagram Data');
    expect(screen.getByText('📥 How to Download Your Instagram Data')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    renderWithMantine(<DataDownloadInstructions />);

    // Open modal
    fireEvent.click(screen.getByText('❓ How to get data?'));
    await screen.findByText('📥 How to Download Your Instagram Data');
    expect(screen.getByText('📥 How to Download Your Instagram Data')).toBeInTheDocument();

    // Close modal by clicking close button
    const closeButton = document.querySelector('.mantine-Modal-close');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText('📥 How to Download Your Instagram Data')).not.toBeInTheDocument();
    });
  });

  it('should have correct title attribute for button', () => {
    renderWithMantine(<DataDownloadInstructions />);

    const button = screen.getByTitle('How to download Instagram data');
    expect(button).toBeInTheDocument();
  });

  it('should render alert with correct content for empty state', () => {
    renderWithMantine(
      <DataDownloadInstructions variant="alert" showInEmptyState />
    );

    expect(screen.getByText('To analyze your Instagram connections, you need to download your data from Instagram first.')).toBeInTheDocument();
  });

  it('should not render alert when showInEmptyState is false', () => {
    renderWithMantine(
      <DataDownloadInstructions variant="alert" showInEmptyState={false} />
    );

    expect(screen.queryByText(/Need help getting your Instagram data/)).not.toBeInTheDocument();
  });
});
