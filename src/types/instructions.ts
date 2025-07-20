export interface InstructionStep {
  number: number;
  title: string;
  description: string;
  icon: string;
  details?: string;
}

export interface InstructionNote {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  icon: string;
}

export interface InstructionsData {
  web: InstructionStep[];
  mobile: InstructionStep[];
  notes: InstructionNote[];
}

export type InstructionTab = 'web' | 'mobile' | 'notes';
