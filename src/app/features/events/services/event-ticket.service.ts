import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { TicketStatus } from '../enums/ticket-status.enum';
import { EventTicket } from '../models/event.model';
import { MOCK_TICKETS } from '../mocks/events.mock';
import { EventAuditService } from './event-audit.service';

export interface EventTicketSummary {
  total: number;
  placed: number;
  paid: number;
  pendingPayment: number;
  reserved: number;
  delivered: number;
  used: number;
  cancelled: number;
  collectedRevenue: number;
  pendingRevenue: number;
  targetToGenerate: number;
}

@Injectable({ providedIn: 'root' })
export class EventTicketService {
  private readonly _tickets = signal<EventTicket[]>([...MOCK_TICKETS]);
  readonly tickets = this._tickets.asReadonly();

  constructor(private readonly auditService: EventAuditService) {}

  getTickets(filters?: { eventId?: string; status?: TicketStatus; search?: string }): Observable<EventTicket[]> {
    let result = [...this._tickets()];
    if (filters?.eventId) result = result.filter(t => t.eventId === filters.eventId);
    if (filters?.status) result = result.filter(t => t.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.code.toLowerCase().includes(q) ||
        t.participantName.toLowerCase().includes(q) ||
        t.documentNumber.includes(q)
      );
    }
    return of(result).pipe(delay(100));
  }

  getTicketSummary(eventId: string, targetToGenerate = 0): Observable<EventTicketSummary> {
    const tickets = this._tickets().filter(t => t.eventId === eventId);
    const paid = tickets.filter(t => t.status === TicketStatus.PAID);
    const pendingPayment = tickets.filter(t => t.status === TicketStatus.PENDING_PAYMENT);
    const reserved = tickets.filter(t => t.status === TicketStatus.RESERVED);
    const delivered = tickets.filter(t => t.status === TicketStatus.DELIVERED);
    const used = tickets.filter(t => t.status === TicketStatus.USED);
    const cancelled = tickets.filter(t => t.status === TicketStatus.CANCELLED);
    const placed = tickets.filter(t => t.status !== TicketStatus.CANCELLED);

    const isCollected = (s: TicketStatus) =>
      [TicketStatus.PAID, TicketStatus.DELIVERED, TicketStatus.USED].includes(s);

    return of({
      total: tickets.length,
      placed: placed.length,
      paid: paid.length,
      pendingPayment: pendingPayment.length,
      reserved: reserved.length,
      delivered: delivered.length,
      used: used.length,
      cancelled: cancelled.length,
      collectedRevenue: tickets.filter(t => isCollected(t.status)).reduce((sum, t) => sum + t.price, 0),
      pendingRevenue: pendingPayment.reduce((sum, t) => sum + t.price, 0),
      targetToGenerate,
    }).pipe(delay(50));
  }

  getTicket(id: string): Observable<EventTicket | undefined> {
    return of(this._tickets().find(t => t.id === id)).pipe(delay(50));
  }

  getTicketByCode(code: string): Observable<EventTicket | undefined> {
    const q = code.toLowerCase();
    return of(this._tickets().find(t =>
      t.code.toLowerCase() === q ||
      String(t.sequenceNumber) === code.trim(),
    )).pipe(delay(50));
  }

  addTicket(ticket: EventTicket): void {
    this._tickets.update(list => [...list, ticket]);
  }

  patchTicket(id: string, patch: Partial<EventTicket>): void {
    this._tickets.update(list => list.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  updateTicketsInRange(
    eventId: string,
    poolId: string,
    start: number,
    end: number,
    patch: Partial<EventTicket>,
  ): void {
    this._tickets.update(list => list.map(t => {
      if (t.eventId !== eventId || t.poolId !== poolId) return t;
      const n = t.sequenceNumber ?? 0;
      if (n < start || n > end) return t;
      return { ...t, ...patch };
    }));
  }

  generateTicket(registrationId: string, eventId: string, data: Partial<EventTicket>): Observable<EventTicket> {
    const ticket: EventTicket = {
      id: crypto.randomUUID(),
      code: `EVT-TKT-${String(this._tickets().length + 1).padStart(5, '0')}`,
      eventId,
      eventName: data.eventName ?? '',
      participantId: data.participantId ?? '',
      participantName: data.participantName ?? '',
      documentNumber: data.documentNumber ?? '',
      buyerId: data.buyerId ?? data.participantId ?? '',
      buyerName: data.buyerName ?? data.participantName ?? '',
      eventDate: data.eventDate ?? '',
      eventTime: data.eventTime ?? '',
      environmentName: data.environmentName ?? '',
      ticketType: data.ticketType ?? 'General',
      price: data.price ?? 0,
      currency: 'PEN',
      status: TicketStatus.PAID,
      registrationId,
      qrData: `EVT:${eventId}:REG:${registrationId}`,
    };
    this._tickets.update(list => [...list, ticket]);
    return of(ticket).pipe(delay(200));
  }

  cancelTicket(id: string, reason: string, userId: string, userName: string): Observable<void> {
    const ticket = this._tickets().find(t => t.id === id);
    if (!ticket) return throwError(() => new Error('Entrada no encontrada'));
    if (ticket.status === TicketStatus.USED) {
      return throwError(() => new Error('No se puede anular una entrada ya utilizada'));
    }

    this._tickets.update(list =>
      list.map(t => t.id === id ? { ...t, status: TicketStatus.CANCELLED } : t)
    );

    this.auditService.addAudit({
      eventId: ticket.eventId,
      action: 'ticket_cancelled',
      description: `Entrada ${ticket.code} anulada. Motivo: ${reason}`,
      userId,
      userName,
    });

    return of(undefined).pipe(delay(200));
  }

  markDelivered(id: string): Observable<void> {
    this._tickets.update(list =>
      list.map(t => t.id === id ? { ...t, status: TicketStatus.DELIVERED } : t)
    );
    return of(undefined).pipe(delay(100));
  }

  markUsed(id: string): Observable<void> {
    const ticket = this._tickets().find(t => t.id === id);
    if (!ticket) return throwError(() => new Error('Entrada no encontrada'));
    if (ticket.status === TicketStatus.CANCELLED) {
      return throwError(() => new Error('Entrada anulada no puede registrarse como utilizada'));
    }
    if (ticket.status === TicketStatus.USED) {
      return throwError(() => new Error('Entrada ya utilizada'));
    }

    this._tickets.update(list =>
      list.map(t => t.id === id ? { ...t, status: TicketStatus.USED } : t)
    );
    return of(undefined).pipe(delay(100));
  }
}
