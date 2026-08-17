export type StudentEnrollmentWizardStep =
  | 'benefits'
  | 'course'
  | 'modality'
  | 'schedule'
  | 'extras'
  | 'summary'
  | 'payment'
  | 'confirmation';

export const STUDENT_ENROLLMENT_WIZARD_STEPS: { id: StudentEnrollmentWizardStep; label: string; order: number }[] = [
  { id: 'benefits', label: 'Beneficios', order: 1 },
  { id: 'course', label: 'Curso', order: 2 },
  { id: 'modality', label: 'Modalidad / Sede', order: 3 },
  { id: 'schedule', label: 'Horario', order: 4 },
  { id: 'extras', label: 'Adicionales', order: 5 },
  { id: 'summary', label: 'Resumen', order: 6 },
  { id: 'payment', label: 'Pago', order: 7 },
  { id: 'confirmation', label: 'Confirmación', order: 8 },
];
