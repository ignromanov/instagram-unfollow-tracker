import { DiagnosticErrorScreen } from '@/components/DiagnosticErrorScreen';
import type { DiagnosticErrorCode, ParseWarning } from '@/core/types';
import { fireEvent, render, screen } from '@tests/utils/testUtils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DiagnosticErrorScreen', () => {
  const mockOnTryAgain = vi.fn();
  const mockOnOpenWizard = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering with different error codes', () => {
    it('should render NOT_ZIP error', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      expect(screen.getByText('Not a ZIP File')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Please upload the ZIP archive from Instagram, not a folder or other file type.'
        )
      ).toBeInTheDocument();
    });

    it('should render HTML_FORMAT error', () => {
      render(<DiagnosticErrorScreen errorCode="HTML_FORMAT" />);

      expect(screen.getByText('Wrong Format: HTML')).toBeInTheDocument();
      expect(
        screen.getByText(
          'You downloaded your data in HTML format, but this tool requires JSON format to work.'
        )
      ).toBeInTheDocument();
    });

    it('should render NOT_INSTAGRAM_EXPORT error', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_INSTAGRAM_EXPORT" />);

      expect(screen.getByText('Not an Instagram Export')).toBeInTheDocument();
      expect(
        screen.getByText("This ZIP file doesn't appear to be an Instagram data export.")
      ).toBeInTheDocument();
    });

    it('should render INCOMPLETE_EXPORT error', () => {
      render(<DiagnosticErrorScreen errorCode="INCOMPLETE_EXPORT" />);

      expect(screen.getByText('Incomplete Export')).toBeInTheDocument();
      expect(
        screen.getByText('The export is missing the "Followers and following" data.')
      ).toBeInTheDocument();
    });

    it('should render NO_DATA_FILES error', () => {
      render(<DiagnosticErrorScreen errorCode="NO_DATA_FILES" />);

      expect(screen.getByText('No Follower Data Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Could not find following.json or followers files in the expected location.'
        )
      ).toBeInTheDocument();
    });

    it('should render MISSING_FOLLOWING error', () => {
      render(<DiagnosticErrorScreen errorCode="MISSING_FOLLOWING" />);

      expect(screen.getByText('Missing Following Data')).toBeInTheDocument();
      expect(
        screen.getByText('following.json not found — cannot detect who you follow.')
      ).toBeInTheDocument();
    });

    it('should render MISSING_FOLLOWERS error', () => {
      render(<DiagnosticErrorScreen errorCode="MISSING_FOLLOWERS" />);

      expect(screen.getByText('Missing Followers Data')).toBeInTheDocument();
      expect(
        screen.getByText('followers_*.json files not found — cannot detect who follows you.')
      ).toBeInTheDocument();
    });

    it('should render UNKNOWN error', () => {
      render(<DiagnosticErrorScreen errorCode="UNKNOWN" />);

      expect(screen.getByText('Upload Error')).toBeInTheDocument();
      expect(
        screen.getByText('An unexpected error occurred while processing your file.')
      ).toBeInTheDocument();
    });

    it('should render UNKNOWN error with custom message', () => {
      render(<DiagnosticErrorScreen errorCode="UNKNOWN" errorMessage="Custom error message" />);

      expect(screen.getByText('Upload Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('error title and description', () => {
    it('should display error title in heading', () => {
      render(<DiagnosticErrorScreen errorCode="HTML_FORMAT" />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Wrong Format: HTML');
    });

    it('should display "How to fix this" section', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      // diagnostic.howToFix translation
      expect(screen.getByText('How to fix this')).toBeInTheDocument();
      // Fix instructions for NOT_ZIP
      expect(
        screen.getByText(/Look for a file ending in .zip in your Downloads folder/)
      ).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('should render "Try Again" button when onTryAgain is provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" onTryAgain={mockOnTryAgain} />);

      // diagnostic.tryAgain translation
      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toBeInTheDocument();

      fireEvent.click(tryAgainButton);
      expect(mockOnTryAgain).toHaveBeenCalledTimes(1);
    });

    it('should not render "Try Again" button when onTryAgain is not provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should render "Show Where I Went Wrong" button when onOpenWizard is provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" onOpenWizard={mockOnOpenWizard} />);

      // diagnostic.showMistakes translation
      const showMistakesButton = screen.getByText('Show Where I Went Wrong');
      expect(showMistakesButton).toBeInTheDocument();

      fireEvent.click(showMistakesButton);
      expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
    });

    it('should not render wizard button when onOpenWizard is not provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      expect(screen.queryByText('Show Where I Went Wrong')).not.toBeInTheDocument();
    });

    it('should render back button when onBack is provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" onBack={mockOnBack} />);

      // diagnostic.back translation
      const backButton = screen.getByText('Back');
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should not render back button when onBack is not provided', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('common mistakes section', () => {
    it('should display common mistakes hint section', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      // diagnostic.commonMistakes translation
      expect(screen.getByText('Common Mistakes')).toBeInTheDocument();

      // diagnostic.mistakes.html.title translation
      expect(screen.getByText('HTML instead of JSON')).toBeInTheDocument();

      // diagnostic.mistakes.missingData.title translation
      expect(screen.getByText('Missing data category')).toBeInTheDocument();

      // diagnostic.mistakes.wrongFile.title translation
      expect(screen.getByText('Wrong file')).toBeInTheDocument();
    });

    it('should display mistake descriptions', () => {
      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" />);

      // Descriptions are rendered inside spans with titles, so use regex to match partial text
      // diagnostic.mistakes.html.description translation
      expect(
        screen.getByText(/Make sure to select "JSON" format when requesting your data/)
      ).toBeInTheDocument();

      // diagnostic.mistakes.missingData.description translation
      expect(
        screen.getByText(/You need to select "Followers and following" in the data types/)
      ).toBeInTheDocument();

      // diagnostic.mistakes.wrongFile.description translation
      expect(
        screen.getByText(/Upload the .zip file, not a folder or extracted files/)
      ).toBeInTheDocument();
    });
  });

  describe('parseWarnings integration', () => {
    it('should extract error from parseWarnings', () => {
      const parseWarnings: ParseWarning[] = [
        {
          code: 'HTML_FORMAT',
          message: 'Export is in HTML format',
          severity: 'error',
        },
      ];

      render(<DiagnosticErrorScreen parseWarnings={parseWarnings} />);

      expect(screen.getByText('Wrong Format: HTML')).toBeInTheDocument();
      expect(screen.getByText('Export is in HTML format')).toBeInTheDocument();
    });

    it('should prioritize errorCode over parseWarnings', () => {
      const parseWarnings: ParseWarning[] = [
        {
          code: 'HTML_FORMAT',
          message: 'Export is in HTML format',
          severity: 'error',
        },
      ];

      render(<DiagnosticErrorScreen errorCode="NOT_ZIP" parseWarnings={parseWarnings} />);

      expect(screen.getByText('Not a ZIP File')).toBeInTheDocument();
      expect(screen.queryByText('Wrong Format: HTML')).not.toBeInTheDocument();
    });

    it('should fallback to UNKNOWN when no error in parseWarnings', () => {
      const parseWarnings: ParseWarning[] = [
        {
          code: 'SOME_WARNING',
          message: 'Just a warning',
          severity: 'warning',
        },
      ];

      render(<DiagnosticErrorScreen parseWarnings={parseWarnings} />);

      expect(screen.getByText('Upload Error')).toBeInTheDocument();
    });

    it('should fallback to UNKNOWN when no props provided', () => {
      render(<DiagnosticErrorScreen />);

      expect(screen.getByText('Upload Error')).toBeInTheDocument();
    });
  });

  describe('all error codes render without crashing', () => {
    const errorCodes: DiagnosticErrorCode[] = [
      'NOT_ZIP',
      'HTML_FORMAT',
      'NOT_INSTAGRAM_EXPORT',
      'INCOMPLETE_EXPORT',
      'NO_DATA_FILES',
      'MISSING_FOLLOWING',
      'MISSING_FOLLOWERS',
      'UNKNOWN',
    ];

    it.each(errorCodes)('should render %s error without crashing', errorCode => {
      const { container } = render(
        <DiagnosticErrorScreen
          errorCode={errorCode}
          onTryAgain={mockOnTryAgain}
          onOpenWizard={mockOnOpenWizard}
          onBack={mockOnBack}
        />
      );

      expect(container).toBeInTheDocument();
      // Should have error card with proper structure
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText('How to fix this')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
