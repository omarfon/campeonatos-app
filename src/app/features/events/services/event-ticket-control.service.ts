import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { TicketStatus } from '../enums/ticket-status.enum';
import { Event, EventTicket } from '../models/event.model';
import { EventTicketPool } from '../models/event-offering.model';
import {
  AssignTicketGroupDto,
  EventTicketGroupAssignment,
  EventTicketPoolSummary,
  rangesOverlap,
  ticketCountInRange,
} from '../models/event-ticket-control.model';
import { EventService } from './event.service';
import { EventTicketService } from './event-ticket.service';

@Injectable({ providedIn: 'root' })
export class EventTicketControlService {
  private readonly eventService = inject(EventService);
  private readonly ticketService = inject(EventTicketService);

  private readonly _assignments = signal<EventTicketGroupAssignment[]>([]);
  readonly assignments = this._assignments.asReadonly();

  constructor() {
    this.seedMockAssignments();
  }

  getPoolSummaries(eventId: string): Observable<EventTicketPoolSummary[]> {
    const event = this.eventService.getEventSync(eventId);
    if (!event?.categoryConfig.ticketGeneration?.pools) return of([]).pipe(delay(50));

    const pools = event.categoryConfig.ticketGeneration.pools.filter(p => p.enabled);
    const tickets = this.ticketService.tickets().filter(t => t.eventId === eventId);
    const assignments = this._assignments().filter(a => a.eventId === eventId);

    return of(pools.map(pool => {
      const poolTickets = tickets.filter(t => t.poolId === pool.id);
      return {
        poolId: pool.id,
        poolLabel: pool.label,
        prefix: pool.prefix,
        quantityToGenerate: pool.quantityToGenerate,
        generatedCount: poolTickets.length,
        assignedCount: poolTickets.filter(t => t.groupAssignmentId).length,
        paidCount: poolTickets.filter(t => t.paymentStatus === 'paid').length,
        attendedCount: poolTickets.filter(t => t.attended).length,
      };
    })).pipe(delay(80));
  }

  getAssignments(eventId: string, poolId?: string): Observable<EventTicketGroupAssignment[]> {
    let list = this._assignments().filter(a => a.eventId === eventId);
    if (poolId) list = list.filter(a => a.poolId === poolId);
    return of([...list]).pipe(delay(50));
  }

  getTicketsForEvent(eventId: string, filters?: { poolId?: string; groupId?: string; search?: string }): Observable<EventTicket[]> {
    let list = this.ticketService.tickets().filter(t => t.eventId === eventId);
    if (filters?.poolId) list = list.filter(t => t.poolId === filters.poolId);
    if (filters?.groupId) list = list.filter(t => t.groupAssignmentId === filters.groupId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t =>
        t.code.toLowerCase().includes(q) ||
        String(t.sequenceNumber ?? '').includes(q) ||
        (t.groupName ?? '').toLowerCase().includes(q) ||
        t.participantName.toLowerCase().includes(q),
      );
    }
    return of(list.sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0))).pipe(delay(50));
  }

  generateTicketsFromPools(eventId: string): Observable<{ generated: number }> {
    const event = this.eventService.getEventSync(eventId);
    if (!event) return throwError(() => new Error('Evento no encontrado'));

    const pools = event.categoryConfig.ticketGeneration?.pools.filter(p => p.enabled) ?? [];
    if (!pools.length) return throwError(() => new Error('No hay pools de tickets configurados'));

    let generated = 0;
    const existing = this.ticketService.tickets().filter(t => t.eventId === eventId && t.poolId);

    for (const pool of pools) {
      const poolExisting = existing.filter(t => t.poolId === pool.id);
      const startNum = poolExisting.length + 1;
      const toCreate = pool.quantityToGenerate - poolExisting.length;

      for (let i = 0; i < toCreate; i++) {
        const seq = startNum + i;
        this.createPoolTicket(event, pool, seq);
        generated++;
      }
    }

    return of({ generated }).pipe(delay(300));
  }

  assignToGroup(dto: AssignTicketGroupDto): Observable<EventTicketGroupAssignment> {
    const event = this.eventService.getEventSync(dto.eventId);
    if (!event) return throwError(() => new Error('Evento no encontrado'));

    const pool = event.categoryConfig.ticketGeneration?.pools.find(p => p.id === dto.poolId);
    if (!pool) return throwError(() => new Error('Pool de tickets no encontrado'));

    if (dto.startNumber < 1 || dto.endNumber > pool.quantityToGenerate || dto.startNumber > dto.endNumber) {
      return throwError(() => new Error(`Numeración inválida. Rango permitido: 1–${pool.quantityToGenerate}`));
    }

    const eventAssignments = this._assignments().filter(a => a.eventId === dto.eventId && a.poolId === dto.poolId && a.status === 'active');
    for (const a of eventAssignments) {
      if (rangesOverlap(a.startNumber, a.endNumber, dto.startNumber, dto.endNumber)) {
        return throwError(() => new Error(`El rango se solapa con «${a.groupName}» (${a.startNumber}–${a.endNumber})`));
      }
    }

    const tickets = this.ticketService.tickets().filter(
      t => t.eventId === dto.eventId && t.poolId === dto.poolId,
    );
    const inRange = tickets.filter(t => {
      const n = t.sequenceNumber ?? 0;
      return n >= dto.startNumber && n <= dto.endNumber;
    });

    if (inRange.length < ticketCountInRange(dto.startNumber, dto.endNumber)) {
      return throwError(() => new Error('Genere los tickets del evento antes de asignar este rango'));
    }

    const assignment: EventTicketGroupAssignment = {
      id: crypto.randomUUID(),
      eventId: dto.eventId,
      poolId: dto.poolId,
      poolLabel: pool.label,
      groupName: dto.groupName,
      responsibleName: dto.responsibleName,
      contactPhone: dto.contactPhone,
      startNumber: dto.startNumber,
      endNumber: dto.endNumber,
      ticketCount: ticketCountInRange(dto.startNumber, dto.endNumber),
      paidCount: inRange.filter(t => t.paymentStatus === 'paid').length,
      attendedCount: inRange.filter(t => t.attended).length,
      notes: dto.notes,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this._assignments.update(list => [...list, assignment]);
    this.updateTicketsGroup(dto.eventId, dto.poolId, assignment.id, dto.groupName, dto.startNumber, dto.endNumber);

    return of(assignment).pipe(delay(200));
  }

  markGroupPayment(eventId: string, groupId: string, paid: boolean): Observable<void> {
    const assignment = this._assignments().find(a => a.id === groupId);
    if (!assignment) return throwError(() => new Error('Grupo no encontrado'));

    this.ticketService.updateTicketsInRange(
      eventId, assignment.poolId, assignment.startNumber, assignment.endNumber,
      { paymentStatus: paid ? 'paid' : 'pending', status: paid ? TicketStatus.PAID : TicketStatus.PENDING_PAYMENT },
    );
    this.refreshAssignmentCounts(groupId);
    return of(undefined).pipe(delay(100));
  }

  markGroupAttendance(eventId: string, groupId: string, attended: boolean): Observable<void> {
    const assignment = this._assignments().find(a => a.id === groupId);
    if (!assignment) return throwError(() => new Error('Grupo no encontrado'));

    this.ticketService.updateTicketsInRange(
      eventId, assignment.poolId, assignment.startNumber, assignment.endNumber,
      {
        attended,
        attendedAt: attended ? new Date().toISOString() : undefined,
        status: attended ? TicketStatus.USED : TicketStatus.PAID,
      },
    );
    this.refreshAssignmentCounts(groupId);
    return of(undefined).pipe(delay(100));
  }

  markTicketPayment(ticketId: string, paid: boolean): Observable<void> {
    this.ticketService.patchTicket(ticketId, {
      paymentStatus: paid ? 'paid' : 'pending',
      status: paid ? TicketStatus.PAID : TicketStatus.PENDING_PAYMENT,
    });
    const ticket = this.ticketService.tickets().find(t => t.id === ticketId);
    if (ticket?.groupAssignmentId) this.refreshAssignmentCounts(ticket.groupAssignmentId);
    return of(undefined).pipe(delay(80));
  }

  markTicketAttendance(ticketId: string, attended: boolean): Observable<void> {
    this.ticketService.patchTicket(ticketId, {
      attended,
      attendedAt: attended ? new Date().toISOString() : undefined,
      status: attended ? TicketStatus.USED : TicketStatus.PAID,
    });
    const ticket = this.ticketService.tickets().find(t => t.id === ticketId);
    if (ticket?.groupAssignmentId) this.refreshAssignmentCounts(ticket.groupAssignmentId);
    return of(undefined).pipe(delay(80));
  }

  private createPoolTicket(event: Event, pool: EventTicketPool, sequenceNumber: number): void {
    const code = `${pool.prefix}-${String(sequenceNumber).padStart(4, '0')}`;
    const price = event.rates[0]?.price ?? 0;
    this.ticketService.addTicket({
      id: crypto.randomUUID(),
      code,
      eventId: event.id,
      eventName: event.name,
      participantId: '',
      participantName: '—',
      documentNumber: '',
      buyerId: '',
      buyerName: '—',
      eventDate: event.startDate,
      eventTime: event.startTime,
      environmentName: event.environments[0]?.environmentName ?? '',
      ticketType: pool.label,
      price,
      currency: 'PEN',
      status: TicketStatus.PENDING_PAYMENT,
      registrationId: '',
      qrData: `EVT:${event.id}:POOL:${pool.id}:SEQ:${sequenceNumber}`,
      poolId: pool.id,
      poolLabel: pool.label,
      sequenceNumber,
      paymentStatus: 'pending',
      attended: false,
    });
  }

  private updateTicketsGroup(
    eventId: string, poolId: string, groupId: string, groupName: string,
    start: number, end: number,
  ): void {
    this.ticketService.updateTicketsInRange(eventId, poolId, start, end, {
      groupAssignmentId: groupId,
      groupName,
    });
    this.refreshAssignmentCounts(groupId);
  }

  private refreshAssignmentCounts(groupId: string): void {
    const assignment = this._assignments().find(a => a.id === groupId);
    if (!assignment) return;
    const tickets = this.ticketService.tickets().filter(
      t => t.groupAssignmentId === groupId,
    );
    this._assignments.update(list => list.map(a => a.id === groupId ? {
      ...a,
      paidCount: tickets.filter(t => t.paymentStatus === 'paid').length,
      attendedCount: tickets.filter(t => t.attended).length,
    } : a));
  }

  private seedMockAssignments(): void {
    const bingo = this.eventService.getEventSync('evt-4');
    const trip = this.eventService.getEventSync('evt-6');
    const bingoPool = bingo?.categoryConfig.ticketGeneration?.pools[0];
    const tripPool = trip?.categoryConfig.ticketGeneration?.pools[0];

    if (bingoPool && bingo) {
      this.ensurePoolTickets(bingo, bingoPool, 500);
    }
    if (tripPool && trip) {
      this.ensurePoolTickets(trip, tripPool, 55);
    }

    const assignments: EventTicketGroupAssignment[] = [];
    if (bingoPool) {
      assignments.push(
        {
          id: 'tga-1', eventId: 'evt-4', poolId: bingoPool.id, poolLabel: bingoPool.label,
          groupName: 'Equipo Los Delfines', responsibleName: 'María González', contactPhone: '999111222',
          startNumber: 1, endNumber: 50, ticketCount: 50, paidCount: 42, attendedCount: 38,
          status: 'active', createdAt: '2026-11-05T10:00:00Z',
        },
        {
          id: 'tga-2', eventId: 'evt-4', poolId: bingoPool.id, poolLabel: bingoPool.label,
          groupName: 'Equipo Halcones', responsibleName: 'Carlos Rodríguez',
          startNumber: 51, endNumber: 120, ticketCount: 70, paidCount: 65, attendedCount: 60,
          status: 'active', createdAt: '2026-11-06T11:00:00Z',
        },
      );
      this.applyGroupToTickets('evt-4', bingoPool.id, 'tga-1', 'Equipo Los Delfines', 1, 50);
      this.applyGroupToTickets('evt-4', bingoPool.id, 'tga-2', 'Equipo Halcones', 51, 120);
    }
    if (tripPool) {
      assignments.push({
        id: 'tga-3', eventId: 'evt-6', poolId: tripPool.id, poolLabel: tripPool.label,
        groupName: 'Grupo Familias Norte', responsibleName: 'Ana Torres',
        startNumber: 1, endNumber: 30, ticketCount: 30, paidCount: 30, attendedCount: 28,
        status: 'active', createdAt: '2026-09-10T09:00:00Z',
      });
      this.applyGroupToTickets('evt-6', tripPool.id, 'tga-3', 'Grupo Familias Norte', 1, 30);
    }
    if (assignments.length) this._assignments.set(assignments);
  }

  private ensurePoolTickets(event: Event, pool: EventTicketPool, count: number): void {
    const existing = this.ticketService.tickets().filter(t => t.eventId === event.id && t.poolId === pool.id);
    for (let seq = existing.length + 1; seq <= count; seq++) {
      this.createPoolTicket(event, pool, seq);
    }
    // Marcar pagos/asistencia mock en rangos asignados
    this.ticketService.updateTicketsInRange(event.id, pool.id, 1, 50, {
      paymentStatus: 'paid', status: TicketStatus.PAID,
    });
    this.ticketService.updateTicketsInRange(event.id, pool.id, 1, 38, {
      attended: true, attendedAt: '2026-12-10T16:00:00Z', status: TicketStatus.USED,
    });
    if (event.id === 'evt-4') {
      this.ticketService.updateTicketsInRange(event.id, pool.id, 51, 120, {
        paymentStatus: 'paid', status: TicketStatus.PAID,
      });
      this.ticketService.updateTicketsInRange(event.id, pool.id, 51, 110, {
        attended: true, attendedAt: '2026-12-10T17:00:00Z', status: TicketStatus.USED,
      });
    }
    if (event.id === 'evt-6') {
      this.ticketService.updateTicketsInRange(event.id, pool.id, 1, 30, {
        paymentStatus: 'paid', status: TicketStatus.PAID,
      });
      this.ticketService.updateTicketsInRange(event.id, pool.id, 1, 28, {
        attended: true, attendedAt: '2026-10-18T08:00:00Z', status: TicketStatus.USED,
      });
    }
  }

  private applyGroupToTickets(
    eventId: string, poolId: string, groupId: string, groupName: string, start: number, end: number,
  ): void {
    this.ticketService.updateTicketsInRange(eventId, poolId, start, end, {
      groupAssignmentId: groupId,
      groupName,
    });
  }
}
