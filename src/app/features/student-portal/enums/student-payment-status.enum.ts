export enum StudentPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export const STUDENT_PAYMENT_STATUS_LABELS: Record<StudentPaymentStatus, string> = {
  [StudentPaymentStatus.PENDING]: 'Pendiente',
  [StudentPaymentStatus.PAID]: 'Pagado',
  [StudentPaymentStatus.OVERDUE]: 'Vencido',
  [StudentPaymentStatus.CANCELLED]: 'Anulado',
};
