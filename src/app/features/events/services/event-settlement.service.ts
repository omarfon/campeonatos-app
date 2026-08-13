import { Injectable, inject } from '@angular/core';
import { Observable, map, of, delay } from 'rxjs';
import { EventSettlement, Event } from '../models/event.model';
import { EventService } from './event.service';
import { EventTicketService } from './event-ticket.service';
import { EventFundraisingService } from './event-fundraising.service';
import { EventStatus } from '../enums/event-status.enum';
import { TicketStatus } from '../enums/ticket-status.enum';

export type SettlementFilterStatus = 'all' | 'pending' | 'settled';

export interface SettlementListItem {
  event: Event;
  settlement: EventSettlement;
  canSettle: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventSettlementService {
  private readonly eventService = inject(EventService);
  private readonly ticketService = inject(EventTicketService);
  private readonly revenueService = inject(EventFundraisingService);

  getSettlements(filters?: { search?: string; status?: SettlementFilterStatus }): Observable<SettlementListItem[]> {
    return this.eventService.getEvents().pipe(
      map(events => {
        let list = events.filter(e =>
          [EventStatus.FINISHED, EventStatus.SETTLED].includes(e.status),
        );

        const status = filters?.status ?? 'all';
        if (status === 'pending') list = list.filter(e => e.status === EventStatus.FINISHED);
        if (status === 'settled') list = list.filter(e => e.status === EventStatus.SETTLED);

        if (filters?.search?.trim()) {
          const q = filters.search.trim().toLowerCase();
          list = list.filter(e =>
            e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
          );
        }

        return list
          .map(event => ({
            event,
            settlement: this.buildSettlement(event),
            canSettle: event.status === EventStatus.FINISHED,
          }))
          .sort((a, b) => b.event.startDate.localeCompare(a.event.startDate));
      }),
      delay(80),
    );
  }

  getSettlement(eventId: string): Observable<EventSettlement> {
    const event = this.eventService.getEventSync(eventId);
    return of(this.buildSettlement(event)).pipe(delay(150));
  }

  settleEvent(eventId: string): Observable<void> {
    const event = this.eventService.getEventSync(eventId);
    if (!event || event.status !== EventStatus.FINISHED) {
      return of(undefined).pipe(delay(50));
    }
    this.eventService.updateEvent(eventId, { status: EventStatus.SETTLED }).subscribe();
    return of(undefined).pipe(delay(200));
  }

  private buildSettlement(event: Event | undefined): EventSettlement {
    if (!event) {
      return {
        eventId: '',
        ticketsIssued: 0,
        ticketsPaid: 0,
        ticketsCancelled: 0,
        courtesyTickets: 0,
        ticketRevenue: 0,
        consumptionRevenue: 0,
        otherRevenue: 0,
        totalRevenue: 0,
      };
    }

    const tickets = this.ticketService.tickets().filter(t => t.eventId === event.id);
    const revenue = this.revenueService.getRevenueStats(event);
    const paidStatuses = [TicketStatus.PAID, TicketStatus.DELIVERED, TicketStatus.USED];

    const settlement: EventSettlement = {
      eventId: event.id,
      ticketsIssued: tickets.length,
      ticketsPaid: tickets.filter(t => paidStatuses.includes(t.status)).length,
      ticketsCancelled: tickets.filter(t => t.status === TicketStatus.CANCELLED).length,
      courtesyTickets: tickets.filter(t => t.price === 0).length,
      ticketRevenue: revenue.ticketRevenue,
      consumptionRevenue: revenue.consumptionRevenue,
      otherRevenue: revenue.registrationRevenue,
      totalRevenue: revenue.totalRevenue,
      settledAt: event.status === EventStatus.SETTLED ? event.updatedAt : undefined,
    };

    return settlement;
  }
}
