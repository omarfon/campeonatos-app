import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EventPayment } from '../models/event.model';
import { MOCK_PAYMENTS } from '../mocks/events.mock';
import { EventRegistrationService } from './event-registration.service';
import { EventTicketService } from './event-ticket.service';

export interface ProcessPaymentDto {
  registrationId: string;
  eventId: string;
  amount: number;
  method: EventPayment['method'];
  ticketData: Parameters<EventTicketService['generateTicket']>[2];
}

@Injectable({ providedIn: 'root' })
export class EventPaymentService {
  private payments = [...MOCK_PAYMENTS];

  constructor(
    private readonly registrationService: EventRegistrationService,
    private readonly ticketService: EventTicketService
  ) {}

  getPayments(eventId?: string): Observable<EventPayment[]> {
    const result = eventId ? this.payments.filter(p => p.eventId === eventId) : this.payments;
    return of(result).pipe(delay(100));
  }

  processPayment(dto: ProcessPaymentDto): Observable<{ payment: EventPayment; ticketId: string }> {
    const payment: EventPayment = {
      id: crypto.randomUUID(),
      registrationId: dto.registrationId,
      eventId: dto.eventId,
      amount: dto.amount,
      currency: 'PEN',
      method: dto.method,
      status: 'completed',
      paidAt: new Date().toISOString(),
      receiptNumber: `REC-${String(this.payments.length + 1).padStart(6, '0')}`,
    };
    this.payments.push(payment);

    return new Observable(observer => {
      this.registrationService.confirmRegistration(dto.registrationId).subscribe(() => {
        this.ticketService.generateTicket(dto.registrationId, dto.eventId, dto.ticketData).subscribe(ticket => {
          observer.next({ payment, ticketId: ticket.id });
          observer.complete();
        });
      });
    });
  }
}
