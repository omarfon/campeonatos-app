import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, map, throwError } from 'rxjs';
import { EventStatus } from '../enums/event-status.enum';
import {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventFilters,
  EventDashboardStats,
  EventValidationResult,
  ValidationItem,
  getAvailableCapacity,
} from '../models/event.model';
import { MOCK_EVENTS, MOCK_EVENT_TYPES } from '../mocks/events.mock';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly _events = signal<Event[]>([...MOCK_EVENTS]);
  readonly events = this._events.asReadonly();

  readonly eventTypes = MOCK_EVENT_TYPES;

  readonly dashboardStats = computed((): EventDashboardStats => {
    const events = this._events();
    const now = new Date();
    return {
      activeEvents: events.filter(e =>
        [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN, EventStatus.IN_PROGRESS].includes(e.status)
      ).length,
      upcomingEvents: events.filter(e => new Date(e.startDate) > now && e.status !== EventStatus.CANCELLED).length,
      registrationOpenEvents: events.filter(e => e.status === EventStatus.REGISTRATION_OPEN).length,
      finishedEvents: events.filter(e => [EventStatus.FINISHED, EventStatus.SETTLED].includes(e.status)).length,
      ticketsSold: events.reduce((sum, e) => sum + e.capacity.confirmedCapacity, 0),
      registrationsCount: events.reduce((sum, e) => sum + e.capacity.confirmedCapacity, 0),
      capacityUsed: events.reduce((sum, e) => sum + e.capacity.confirmedCapacity, 0),
      totalRevenue: events.reduce((sum, e) => sum + e.capacity.confirmedCapacity * (e.rates[0]?.price ?? 0), 0),
    };
  });

  getEvents(filters?: EventFilters): Observable<Event[]> {
    let result = [...this._events()];
    if (filters) {
      if (filters.name) {
        const q = filters.name.toLowerCase();
        result = result.filter(e => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
      }
      if (filters.typeId) result = result.filter(e => e.typeId === filters.typeId);
      if (filters.category) result = result.filter(e => e.category === filters.category);
      if (filters.status) result = result.filter(e => e.status === filters.status);
      if (filters.dateFrom) result = result.filter(e => e.startDate >= filters.dateFrom!);
      if (filters.dateTo) result = result.filter(e => e.startDate <= filters.dateTo!);
      if (filters.businessUnitId) result = result.filter(e => e.businessUnitId === filters.businessUnitId);
    }
    return of(result).pipe(delay(100));
  }

  getEvent(id: string): Observable<Event | undefined> {
    return of(this._events().find(e => e.id === id)).pipe(delay(50));
  }

  getEventSync(id: string): Event | undefined {
    return this._events().find(e => e.id === id);
  }

  createEvent(dto: CreateEventDto): Observable<Event> {
    const event: Event = {
      ...dto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._events.update(list => [...list, event]);
    return of(event).pipe(delay(200));
  }

  updateEvent(id: string, dto: UpdateEventDto): Observable<Event> {
    const existing = this._events().find(e => e.id === id);
    if (!existing) return throwError(() => new Error('Evento no encontrado'));
    const updated: Event = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this._events.update(list => list.map(e => (e.id === id ? updated : e)));
    return of(updated).pipe(delay(200));
  }

  publishEvent(id: string): Observable<void> {
    const validation = this.validateEventForPublicationSync(id);
    if (!validation.valid) {
      return throwError(() => new Error(validation.errors.map(e => e.message).join('. ')));
    }
    this._events.update(list =>
      list.map(e => (e.id === id ? { ...e, status: EventStatus.PUBLISHED, updatedAt: new Date().toISOString() } : e))
    );
    return of(undefined).pipe(delay(200));
  }

  duplicateEvent(id: string): Observable<Event> {
    const source = this._events().find(e => e.id === id);
    if (!source) return throwError(() => new Error('Evento no encontrado'));
    const copy: Event = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
      code: `${source.code}-COPY`,
      name: `${source.name} (copia)`,
      status: EventStatus.DRAFT,
      capacity: { ...source.capacity, confirmedCapacity: 0, reservedCapacity: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._events.update(list => [...list, copy]);
    return of(copy).pipe(delay(200));
  }

  cancelEvent(id: string): Observable<void> {
    this._events.update(list =>
      list.map(e => (e.id === id ? { ...e, status: EventStatus.CANCELLED, updatedAt: new Date().toISOString() } : e))
    );
    return of(undefined).pipe(delay(200));
  }

  finishEvent(id: string): Observable<void> {
    this._events.update(list =>
      list.map(e => (e.id === id ? { ...e, status: EventStatus.FINISHED, updatedAt: new Date().toISOString() } : e))
    );
    return of(undefined).pipe(delay(200));
  }

  validateEventForPublication(eventId: string): Observable<EventValidationResult> {
    return of(this.validateEventForPublicationSync(eventId)).pipe(delay(100));
  }

  validateEventForPublicationSync(eventId: string): EventValidationResult {
    const event = this._events().find(e => e.id === eventId);
    if (!event) return { valid: false, errors: [{ field: 'event', message: 'Evento no encontrado', severity: 'error' }], warnings: [] };

    const errors: ValidationItem[] = [];
    const warnings: ValidationItem[] = [];

    if (!event.name) errors.push({ field: 'name', message: 'Nombre del evento requerido', severity: 'error' });
    if (!event.startDate || !event.endDate) errors.push({ field: 'dates', message: 'Fechas del evento requeridas', severity: 'error' });
    if (event.startDate > event.endDate) errors.push({ field: 'dates', message: 'Fecha final debe ser >= fecha inicial', severity: 'error' });
    if (!event.environments.length) errors.push({ field: 'environments', message: 'Debe asignar al menos un ambiente', severity: 'error' });
    if (event.capacity.totalCapacity <= 0) errors.push({ field: 'capacity', message: 'Aforo total debe ser mayor a 0', severity: 'error' });
    if (!event.isFree && !event.rates.length) errors.push({ field: 'rates', message: 'Debe configurar al menos una tarifa', severity: 'error' });
    if (!event.imageUrl) warnings.push({ field: 'imageUrl', message: 'No se configuró imagen del evento', severity: 'warning' });

    return { valid: errors.length === 0, errors, warnings };
  }

  hasAvailableCapacity(eventId: string): boolean {
    const event = this._events().find(e => e.id === eventId);
    if (!event) return false;
    return getAvailableCapacity(event.capacity) > 0;
  }

  canRegister(eventId: string): boolean {
    const event = this._events().find(e => e.id === eventId);
    if (!event) return false;
    if ([EventStatus.FINISHED, EventStatus.SETTLED, EventStatus.CANCELLED].includes(event.status)) return false;
    if (![EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN].includes(event.status)) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (today < event.registrationStartDate || today > event.registrationEndDate) return false;
    return getAvailableCapacity(event.capacity) > 0;
  }

  getUpcomingEvents(limit = 5): Observable<Event[]> {
    const now = new Date().toISOString().slice(0, 10);
    return of(
      this._events()
        .filter(e => e.startDate >= now && e.status !== EventStatus.CANCELLED)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, limit)
    ).pipe(delay(50));
  }
}
