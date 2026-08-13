export enum TicketStatus {
  RESERVED = 'RESERVED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  USED = 'USED',
  CANCELLED = 'CANCELLED',
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.RESERVED]: 'Reservada',
  [TicketStatus.PENDING_PAYMENT]: 'Pendiente de pago',
  [TicketStatus.PAID]: 'Pagada',
  [TicketStatus.DELIVERED]: 'Entregada',
  [TicketStatus.USED]: 'Usada',
  [TicketStatus.CANCELLED]: 'Anulada',
};
