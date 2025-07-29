import type { 
  InstructionStep, 
  InstructionNote, 
  InstructionsData, 
  InstructionTab 
} from '@/types/instructions';

describe('Instructions Types', () => {
  describe('InstructionStep', () => {
    it('should have correct structure', () => {
      const step: InstructionStep = {
        number: 1,
        title: 'Test Step',
        description: 'Test description',
        icon: '1',
        details: 'Test details'
      };

      expect(step.number).toBe(1);
      expect(step.title).toBe('Test Step');
      expect(step.description).toBe('Test description');
      expect(step.icon).toBe('1');
      expect(step.details).toBe('Test details');
    });

    it('should work without optional details', () => {
      const step: InstructionStep = {
        number: 1,
        title: 'Test Step',
        description: 'Test description',
        icon: '1'
      };

      expect(step.details).toBeUndefined();
    });
  });

  describe('InstructionNote', () => {
    it('should have correct structure', () => {
      const note: InstructionNote = {
        title: 'Test Note',
        content: 'Test content',
        type: 'info',
        icon: 'ℹ️'
      };

      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('Test content');
      expect(note.type).toBe('info');
      expect(note.icon).toBe('ℹ️');
    });

    it('should support all note types', () => {
      const infoNote: InstructionNote = {
        title: 'Info',
        content: 'Info content',
        type: 'info',
        icon: 'ℹ️'
      };

      const warningNote: InstructionNote = {
        title: 'Warning',
        content: 'Warning content',
        type: 'warning',
        icon: '⚠️'
      };

      const successNote: InstructionNote = {
        title: 'Success',
        content: 'Success content',
        type: 'success',
        icon: '✅'
      };

      expect(infoNote.type).toBe('info');
      expect(warningNote.type).toBe('warning');
      expect(successNote.type).toBe('success');
    });
  });

  describe('InstructionsData', () => {
    it('should have correct structure', () => {
      const data: InstructionsData = {
        web: [
          {
            number: 1,
            title: 'Web Step',
            description: 'Web description',
            icon: '1'
          }
        ],
        mobile: [
          {
            number: 1,
            title: 'Mobile Step',
            description: 'Mobile description',
            icon: '1'
          }
        ],
        notes: [
          {
            title: 'Test Note',
            content: 'Test content',
            type: 'info',
            icon: 'ℹ️'
          }
        ]
      };

      expect(data.web).toHaveLength(1);
      expect(data.mobile).toHaveLength(1);
      expect(data.notes).toHaveLength(1);
      expect(data.web[0]?.title).toBe('Web Step');
      expect(data.mobile[0]?.title).toBe('Mobile Step');
      expect(data.notes[0]?.title).toBe('Test Note');
    });
  });

  describe('InstructionTab', () => {
    it('should support all tab types', () => {
      const webTab: InstructionTab = 'web';
      const mobileTab: InstructionTab = 'mobile';
      const notesTab: InstructionTab = 'notes';

      expect(webTab).toBe('web');
      expect(mobileTab).toBe('mobile');
      expect(notesTab).toBe('notes');
    });
  });
});
