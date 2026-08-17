export enum MemberPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export const MEMBER_PAYMENT_STATUS_LABELS: Record<MemberPaymentStatus, string> = {
  [MemberPaymentStatus.PENDING]: 'Pendiente',
  [MemberPaymentStatus.PAID]: 'Pagado',
  [MemberPaymentStatus.OVERDUE]: 'Vencido',
  [MemberPaymentStatus.CANCELLED]: 'Anulado',
};
