export enum StudentNotificationType {
  ACADEMIC = 'ACADEMIC',
  ENROLLMENT = 'ENROLLMENT',
  PAYMENT = 'PAYMENT',
  SCHEDULE = 'SCHEDULE',
  GENERAL = 'GENERAL',
}

export const STUDENT_NOTIFICATION_TYPE_LABELS: Record<StudentNotificationType, string> = {
  [StudentNotificationType.ACADEMIC]: 'Académico',
  [StudentNotificationType.ENROLLMENT]: 'Matrícula',
  [StudentNotificationType.PAYMENT]: 'Pago',
  [StudentNotificationType.SCHEDULE]: 'Horario',
  [StudentNotificationType.GENERAL]: 'General',
};
