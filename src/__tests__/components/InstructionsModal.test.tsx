import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { InstructionsModal } from '@/components/InstructionsModal';
import { INSTRUCTIONS_DATA } from '@/data/instructionsData';

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('InstructionsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render modal when opened', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('📥 How to Download Your Instagram Data')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    renderWithMantine(
      <InstructionsModal opened={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('📥 How to Download Your Instagram Data')).not.toBeInTheDocument();
  });

  it('should render all tabs', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Step-by-Step Guide')).toBeInTheDocument();
    expect(screen.getByText('Important Notes')).toBeInTheDocument();
  });

  it('should show web instructions by default', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    expect(screen.getByText(/Go to Meta Accounts Center/)).toBeInTheDocument();
    expect(screen.getByText('Log in to your account')).toBeInTheDocument();
    expect(screen.getByText('Navigate to Your Information')).toBeInTheDocument();
  });

  it('should switch to notes tab when clicked', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByText('Important Notes'));

    expect(screen.getByText('Processing Time')).toBeInTheDocument();
    expect(screen.getByText('Required Data Only')).toBeInTheDocument();
    expect(screen.getByText('Download Promptly')).toBeInTheDocument();
  });


  it('should render all web steps with correct icons', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    const expectedSteps = INSTRUCTIONS_DATA.web;

    expectedSteps.forEach(step => {
      // Use regex to handle text that might be split by links
      const titleElements = screen.getAllByText(new RegExp(step.title));
      expect(titleElements.length).toBeGreaterThan(0);
      // Check that the step number appears in the stepper (use getAllByText to handle multiple matches)
      const stepNumbers = screen.getAllByText(step.number.toString());
      expect(stepNumbers.length).toBeGreaterThan(0);
    });
  });


  it('should render all important notes', () => {
    renderWithMantine(
      <InstructionsModal opened={true} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByText('Important Notes'));

    const expectedNotes = [
      'Processing Time',
      'Required Data Only',
      'Download Promptly',
      'Keep Data Secure'
    ];

    expectedNotes.forEach(note => {
      expect(screen.getByText(note)).toBeInTheDocument();
    });
  });

});
