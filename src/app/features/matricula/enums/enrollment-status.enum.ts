export enum EnrollmentStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.DRAFT]: 'Borrador',
  [EnrollmentStatus.VALIDATING]: 'Validando',
  [EnrollmentStatus.PENDING_PAYMENT]: 'Pendiente de pago',
  [EnrollmentStatus.CONFIRMED]: 'Confirmada',
  [EnrollmentStatus.CANCELLED]: 'Cancelada',
};
