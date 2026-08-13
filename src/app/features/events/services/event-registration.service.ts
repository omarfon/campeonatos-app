import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { ParticipantType } from '../enums/participant-type.enum';
import { EventRegistration, EventConsumptionSelection } from '../models/event.model';
import { MOCK_REGISTRATIONS } from '../mocks/events.mock';
import { EventService } from './event.service';

export type RegistrationPaymentFilter = EventRegistration['paymentStatus'] | 'all';

export interface RegistrationFilters {
  eventId?: string;
  status?: RegistrationStatus;
  participantType?: ParticipantType;
  paymentStatus?: RegistrationPaymentFilter;
  search?: string;
}

export interface CreateRegistrationDto {
  eventId: string;
  personId: string;
  personName: string;
  documentNumber: string;
  participantType: EventRegistration['participantType'];
  rateName: string;
  rateAmount: number;
  consumptions?: EventConsumptionSelection[];
}

@Injectable({ providedIn: 'root' })
export class EventRegistrationService {
  private readonly _registrations = signal<EventRegistration[]>([...MOCK_REGISTRATIONS]);
  readonly registrations = this._registrations.asReadonly();

  constructor(private readonly eventService: EventService) {}

  getRegistrations(filters?: RegistrationFilters): Observable<EventRegistration[]> {
    let result = [...this._registrations()];
    if (filters?.eventId) result = result.filter(r => r.eventId === filters.eventId);
    if (filters?.status) result = result.filter(r => r.status === filters.status);
    if (filters?.participantType) result = result.filter(r => r.participantType === filters.participantType);
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      result = result.filter(r => r.paymentStatus === filters.paymentStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r =>
        r.personName.toLowerCase().includes(q) ||
        r.documentNumber.includes(q) ||
        r.eventName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
      );
    }
    return of(result).pipe(delay(100));
  }

  countRegistrations(filters?: RegistrationFilters): Observable<number> {
    return new Observable(observer => {
      this.getRegistrations(filters).subscribe(list => {
        observer.next(list.length);
        observer.complete();
      });
    });
  }

  getByEvent(eventId: string): Observable<EventRegistration[]> {
    return this.getRegistrations({ eventId });
  }

  createRegistration(dto: CreateRegistrationDto): Observable<EventRegistration> {
    if (!this.eventService.canRegister(dto.eventId)) {
      return throwError(() => new Error('No se puede inscribir: evento no disponible o sin cupos'));
    }

    const event = this.eventService.getEventSync(dto.eventId);
    const reg: EventRegistration = {
      id: crypto.randomUUID(),
      code: `INS-${String(this._registrations().length + 1).padStart(5, '0')}`,
      eventId: dto.eventId,
      eventName: event?.name ?? '',
      personId: dto.personId,
      personName: dto.personName,
      documentNumber: dto.documentNumber,
      participantType: dto.participantType,
      rateName: dto.rateName,
      rateAmount: dto.rateAmount,
      currency: 'PEN',
      registrationDate: new Date().toISOString().slice(0, 10),
      paymentStatus: dto.rateAmount === 0 ? 'exempt' : 'pending',
      status: RegistrationStatus.PENDING,
      consumptions: dto.consumptions,
    };

    this._registrations.update(list => [...list, reg]);
    return of(reg).pipe(delay(200));
  }

  confirmRegistration(id: string): Observable<void> {
    this._registrations.update(list =>
      list.map(r => r.id === id ? { ...r, status: RegistrationStatus.CONFIRMED, paymentStatus: 'paid' as const } : r)
    );
    return of(undefined).pipe(delay(100));
  }

  cancelRegistration(id: string): Observable<void> {
    this._registrations.update(list =>
      list.map(r => r.id === id ? { ...r, status: RegistrationStatus.CANCELLED } : r)
    );
    return of(undefined).pipe(delay(100));
  }
}
