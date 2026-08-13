import { Injectable, inject } from '@angular/core';
import { Observable, map, of, delay } from 'rxjs';
import { Event, BingoSerie, BingoBatch, EventConsumption, EventRegistration } from '../models/event.model';
import { EventService } from './event.service';
import { EventTicketService } from './event-ticket.service';
import { EventRegistrationService } from './event-registration.service';
import { EventConsumptionService } from './event-consumption.service';
import { TicketStatus } from '../enums/ticket-status.enum';

export interface RevenueSourceBreakdown {
  key: string;
  label: string;
  count: number;
  amount: number;
}

export interface EventRevenueStats {
  totalRevenue: number;
  ticketRevenue: number;
  registrationRevenue: number;
  consumptionRevenue: number;
  ticketsTotal: number;
  ticketsPaid: number;
  registrationsTotal: number;
  registrationsPaid: number;
  consumptionsTotal: number;
  consumptionsDelivered: number;
  totalSeries: number;
  totalBatches: number;
  totalCards: number;
  sources: RevenueSourceBreakdown[];
}

export interface EventRevenueListItem {
  event: Event;
  stats: EventRevenueStats;
}

/** @deprecated Use EventRevenueStats */
export type FundraisingStats = EventRevenueStats;
/** @deprecated Use EventRevenueListItem */
export type FundraisingListItem = EventRevenueListItem;

@Injectable({ providedIn: 'root' })
export class EventFundraisingService {
  private readonly eventService = inject(EventService);
  private readonly ticketService = inject(EventTicketService);
  private readonly registrationService = inject(EventRegistrationService);
  private readonly consumptionService = inject(EventConsumptionService);

  getFundraisingEvents(search?: string): Observable<EventRevenueListItem[]> {
    return this.getRevenueEvents(search);
  }

  getRevenueEvents(search?: string): Observable<EventRevenueListItem[]> {
    return this.eventService.getEvents().pipe(
      map(events => {
        let list = [...events];
        if (search?.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter(e =>
            e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
          );
        }
        return list
          .map(event => ({ event, stats: this.buildStats(event) }))
          .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate));
      }),
      delay(80),
    );
  }

  getFundraisingEvent(id: string): Observable<Event | undefined> {
    return this.getRevenueEvent(id);
  }

  getRevenueEvent(id: string): Observable<Event | undefined> {
    return this.eventService.getEvent(id).pipe(delay(50));
  }

  getFundraisingStats(event: Event): EventRevenueStats {
    return this.buildStats(event);
  }

  getRevenueStats(event: Event): EventRevenueStats {
    return this.buildStats(event);
  }

  getSeriesForEvent(event: Event): BingoSerie[] {
    return event.categoryConfig.bingoSeries ?? [];
  }

  getBatchesForEvent(event: Event, serieId?: string): BingoBatch[] {
    const batches = event.categoryConfig.bingoBatches ?? [];
    return serieId ? batches.filter(b => b.serieId === serieId) : batches;
  }

  getConsumptionsForEvent(eventId: string): EventConsumption[] {
    return this.consumptionService.consumptions().filter(c => c.eventId === eventId);
  }

  generateCards(serie: BingoSerie): Observable<{ generated: number }> {
    return of({ generated: serie.cardCount }).pipe(delay(300));
  }

  createBatch(serieId: string, name: string, startNumber: number, endNumber: number, assignedTo: string): Observable<BingoBatch> {
    const batch: BingoBatch = {
      id: crypto.randomUUID(),
      serieId,
      name,
      startNumber,
      endNumber,
      assignedTo,
      status: 'generated',
    };
    return of(batch).pipe(delay(200));
  }

  private buildStats(event: Event): EventRevenueStats {
    const tickets = this.ticketService.tickets().filter(t => t.eventId === event.id);
    const registrations = this.registrationService.registrations().filter(r => r.eventId === event.id);
    const consumptions = this.consumptionService.consumptions().filter(c => c.eventId === event.id);
    const series = event.categoryConfig.bingoSeries ?? [];
    const batches = event.categoryConfig.bingoBatches ?? [];

    const isPaidTicket = (s: TicketStatus) =>
      [TicketStatus.PAID, TicketStatus.DELIVERED, TicketStatus.USED].includes(s);
    const isPaidRegistration = (status: EventRegistration['paymentStatus']) =>
      status === 'paid' || status === 'partial';

    const paidTickets = tickets.filter(t => isPaidTicket(t.status));
    const ticketRevenue = paidTickets.reduce((sum, t) => sum + t.price, 0);

    const paidRegistrations = registrations.filter(r => isPaidRegistration(r.paymentStatus));
    const registrationRevenue = paidRegistrations.reduce((sum, r) => sum + r.rateAmount, 0);

    let consumptionRevenue = 0;
    const consumptionByOption = new Map<string, { label: string; count: number; amount: number }>();

    for (const c of consumptions) {
      const price = this.getOptionPrice(event, c.optionId);
      const lineAmount = price * c.quantity;
      consumptionRevenue += lineAmount;
      const existing = consumptionByOption.get(c.optionId) ?? { label: c.optionName, count: 0, amount: 0 };
      existing.count += c.quantity;
      existing.amount += lineAmount;
      consumptionByOption.set(c.optionId, existing);
    }

    const sources: RevenueSourceBreakdown[] = [];

    if (tickets.length > 0) {
      sources.push({
        key: 'tickets',
        label: 'Entradas / tickets',
        count: paidTickets.length,
        amount: ticketRevenue,
      });
    }

    if (registrations.length > 0) {
      sources.push({
        key: 'registrations',
        label: 'Inscripciones',
        count: paidRegistrations.length,
        amount: registrationRevenue,
      });
    }

    for (const [optionId, data] of consumptionByOption) {
      sources.push({
        key: `consumption-${optionId}`,
        label: data.label,
        count: data.count,
        amount: data.amount,
      });
    }

    this.appendCatalogSources(event, consumptions, sources);

    const totalRevenue = ticketRevenue + registrationRevenue + consumptionRevenue;

    return {
      totalRevenue,
      ticketRevenue,
      registrationRevenue,
      consumptionRevenue,
      ticketsTotal: tickets.length,
      ticketsPaid: paidTickets.length,
      registrationsTotal: registrations.length,
      registrationsPaid: paidRegistrations.length,
      consumptionsTotal: consumptions.reduce((sum, c) => sum + c.quantity, 0),
      consumptionsDelivered: consumptions.filter(c => c.status === 'delivered').reduce((sum, c) => sum + c.quantity, 0),
      totalSeries: series.length,
      totalBatches: batches.length,
      totalCards: series.reduce((sum, s) => sum + s.cardCount, 0),
      sources,
    };
  }

  private appendCatalogSources(
    event: Event,
    consumptions: EventConsumption[],
    sources: RevenueSourceBreakdown[],
  ): void {
    const catalog = event.categoryConfig.offeringCatalog;
    if (!catalog) return;

    for (const group of catalog.groups) {
      if (sources.some(s => s.key === `group-${group.key}`)) continue;

      const groupOptions = catalog.options.filter(o => o.groupId === group.id);
      let count = 0;
      let amount = 0;

      for (const opt of groupOptions) {
        const matched = consumptions.filter(c => c.optionId === opt.id || c.optionId === opt.code);
        count += matched.reduce((sum, c) => sum + c.quantity, 0);
        amount += matched.reduce((sum, c) => sum + opt.price * c.quantity, 0);
      }

      sources.push({
        key: `group-${group.key}`,
        label: group.name,
        count,
        amount,
      });
    }
  }

  private getOptionPrice(event: Event, optionId: string): number {
    const catalog = event.categoryConfig.offeringCatalog;
    const option = catalog?.options.find(o => o.id === optionId || o.code === optionId);
    if (option) return option.price;

    const food = event.categoryConfig.foodOptions?.find(f => f.id === optionId);
    return food?.additionalPrice ?? 0;
  }
}
