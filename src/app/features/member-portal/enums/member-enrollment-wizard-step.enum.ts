export type MemberEnrollmentWizardStep =
  | 'participant'
  | 'benefits'
  | 'schedule'
  | 'summary'
  | 'payment'
  | 'confirmation';

export interface MemberEnrollmentWizardStepDef {
  id: MemberEnrollmentWizardStep;
  label: string;
  order: number;
}

export const MEMBER_ENROLLMENT_WIZARD_STEPS: MemberEnrollmentWizardStepDef[] = [
  { id: 'participant', label: 'Participante', order: 1 },
  { id: 'benefits', label: 'Beneficio', order: 2 },
  { id: 'schedule', label: 'Horario', order: 3 },
  { id: 'summary', label: 'Resumen', order: 4 },
  { id: 'payment', label: 'Pago', order: 5 },
  { id: 'confirmation', label: 'Confirmación', order: 6 },
];
