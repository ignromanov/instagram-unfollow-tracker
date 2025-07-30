import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@tests/utils/testUtils';
import { FileUpload } from '@/components/FileUpload';

describe('FileUpload Component', () => {
  const mockOnZipUpload = vi.fn();

  const defaultProps = {
    onZipUpload: mockOnZipUpload,
    uploadState: {
      status: 'idle' as const,
      error: null,
      fileName: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area', () => {
    render(<FileUpload {...defaultProps} />);

    expect(screen.getByText('📁 Upload Instagram Data')).toBeInTheDocument();
    expect(screen.getByText('Click to browse or drag & drop your ZIP file')).toBeInTheDocument();
  });

  it('should call onZipUpload when file is selected', () => {
    render(<FileUpload {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(mockOnZipUpload).toHaveBeenCalledWith(file);
  });

  it('should show drag over state when file is dragged over', () => {
    render(<FileUpload {...defaultProps} />);

    const uploadArea = screen.getByText('📁 Upload Instagram Data').closest('div');

    fireEvent.dragOver(uploadArea!);
    expect(screen.getByText('📁 Drop ZIP file here')).toBeInTheDocument();
  });

  it('should handle file drop', () => {
    render(<FileUpload {...defaultProps} />);

    const uploadArea = screen.getByText('📁 Upload Instagram Data').closest('div');
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });

    fireEvent.drop(uploadArea!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnZipUpload).toHaveBeenCalledWith(file);
  });

  it('should handle drag leave', () => {
    render(<FileUpload {...defaultProps} />);

    const uploadArea = screen.getByText('📁 Upload Instagram Data').closest('div');

    // Simulate drag over then drag leave
    fireEvent.dragOver(uploadArea!);
    fireEvent.dragLeave(uploadArea!);

    // Should not crash and should not call onZipUpload
    expect(mockOnZipUpload).not.toHaveBeenCalled();
  });

  it('should handle click to open file dialog', () => {
    render(<FileUpload {...defaultProps} />);

    const clickableArea = screen.getByText('📁 Upload Instagram Data').closest('div');

    // Mock file input click
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => { });

    fireEvent.click(clickableArea!);

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
