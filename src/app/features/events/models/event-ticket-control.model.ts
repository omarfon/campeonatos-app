/** Asignación de rango de numeración a un grupo interno del club */
export interface EventTicketGroupAssignment {
  id: string;
  eventId: string;
  poolId: string;
  poolLabel: string;
  groupName: string;
  responsibleName: string;
  contactPhone?: string;
  startNumber: number;
  endNumber: number;
  /** Calculado: endNumber - startNumber + 1 */
  ticketCount: number;
  paidCount: number;
  attendedCount: number;
  notes?: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface EventTicketPoolSummary {
  poolId: string;
  poolLabel: string;
  prefix: string;
  quantityToGenerate: number;
  generatedCount: number;
  assignedCount: number;
  paidCount: number;
  attendedCount: number;
}

export interface AssignTicketGroupDto {
  eventId: string;
  poolId: string;
  groupName: string;
  responsibleName: string;
  contactPhone?: string;
  startNumber: number;
  endNumber: number;
  notes?: string;
}

export function ticketCountInRange(start: number, end: number): number {
  return Math.max(0, end - start + 1);
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}
