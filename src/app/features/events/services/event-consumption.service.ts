import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Event, EventConsumption } from '../models/event.model';
import { MOCK_CONSUMPTIONS } from '../mocks/events.mock';

export interface ConsumptionOptionTotal {
  optionId: string;
  optionName: string;
  quantity: number;
  delivered: number;
  pending: number;
  unitPrice: number;
  totalAmount: number;
  deliveredAmount: number;
}

export interface ConsumptionSummary {
  totalItems: number;
  delivered: number;
  pending: number;
  participants: number;
  totalRevenue: number;
  deliveredRevenue: number;
  byOption: ConsumptionOptionTotal[];
}

@Injectable({ providedIn: 'root' })
export class EventConsumptionService {
  private readonly _consumptions = signal<EventConsumption[]>([...MOCK_CONSUMPTIONS]);
  readonly consumptions = this._consumptions.asReadonly();

  getConsumptions(filters?: { eventId?: string; search?: string; optionId?: string }): Observable<EventConsumption[]> {
    let result = [...this._consumptions()];
    if (filters?.eventId) result = result.filter(c => c.eventId === filters.eventId);
    if (filters?.optionId) result = result.filter(c => c.optionId === filters.optionId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        c.participantName.toLowerCase().includes(q) ||
        c.ticketCode.toLowerCase().includes(q) ||
        c.optionName.toLowerCase().includes(q) ||
        c.eventName.toLowerCase().includes(q),
      );
    }
    return of(result).pipe(delay(100));
  }

  getEventIdsWithConsumptions(): string[] {
    return [...new Set(this._consumptions().map(c => c.eventId))];
  }

  buildSummary(list: EventConsumption[], events: Event[]): ConsumptionSummary {
    const eventMap = new Map(events.map(e => [e.id, e]));
    const byOption = new Map<string, ConsumptionOptionTotal>();
    const participants = new Set<string>();
    let delivered = 0;
    let pending = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    let deliveredRevenue = 0;

    for (const c of list) {
      const event = eventMap.get(c.eventId);
      const unitPrice = this.getOptionPrice(event, c.optionId, c.optionName);
      participants.add(c.participantId);
      totalItems += c.quantity;
      const lineTotal = unitPrice * c.quantity;
      totalRevenue += lineTotal;

      if (c.status === 'delivered') {
        delivered += c.quantity;
        deliveredRevenue += lineTotal;
      } else {
        pending += c.quantity;
      }

      const row = byOption.get(c.optionId) ?? {
        optionId: c.optionId,
        optionName: c.optionName,
        quantity: 0,
        delivered: 0,
        pending: 0,
        unitPrice,
        totalAmount: 0,
        deliveredAmount: 0,
      };
      row.quantity += c.quantity;
      row.totalAmount += lineTotal;
      if (c.status === 'delivered') {
        row.delivered += c.quantity;
        row.deliveredAmount += lineTotal;
      } else {
        row.pending += c.quantity;
      }
      byOption.set(c.optionId, row);
    }

    return {
      totalItems,
      delivered,
      pending,
      participants: participants.size,
      totalRevenue,
      deliveredRevenue,
      byOption: [...byOption.values()].sort((a, b) => a.optionName.localeCompare(b.optionName)),
    };
  }

  getOptionPrice(event: Event | undefined, optionId: string, optionName?: string): number {
    if (!event) return 0;

    const catalog = event.categoryConfig.offeringCatalog;
    const option = catalog?.options.find(o =>
      o.id === optionId || o.code === optionId ||
      (optionName && o.name.toLowerCase() === optionName.toLowerCase()),
    );
    if (option) return option.price;

    const food = event.categoryConfig.foodOptions?.find(f =>
      f.id === optionId || f.name.toLowerCase() === (optionName ?? '').toLowerCase(),
    );
    return food?.additionalPrice ?? 0;
  }

  markDelivered(id: string): Observable<void> {
    this._consumptions.update(list =>
      list.map(c => c.id === id ? { ...c, status: 'delivered' as const } : c),
    );
    return of(undefined).pipe(delay(100));
  }
}
