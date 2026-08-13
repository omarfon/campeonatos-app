import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnrollmentPayment, PaymentRequest } from '../models/enrollment.model';
import { MOCK_ENROLLMENT_PAYMENTS } from '../mocks/enrollment.mock';

@Injectable({ providedIn: 'root' })
export class EnrollmentPaymentService {
  private readonly _payments = signal<EnrollmentPayment[]>([...MOCK_ENROLLMENT_PAYMENTS]);

  getByEnrollment(enrollmentId: number): Observable<EnrollmentPayment[]> {
    return of(this._payments().filter(p => p.enrollmentId === enrollmentId)).pipe(delay(150));
  }

  getPending(): Observable<EnrollmentPayment[]> {
    return of(this._payments().filter(p => !p.confirmed)).pipe(delay(150));
  }

  processPayment(enrollmentId: number, request: PaymentRequest): Observable<EnrollmentPayment> {
    const payment: EnrollmentPayment = {
      id: this._payments().length + 1,
      enrollmentId,
      amount: request.amount,
      method: request.method,
      reference: request.reference,
      paidAt: new Date().toISOString(),
      confirmed: true,
    };
    this._payments.update(list => [...list, payment]);
    return of(payment).pipe(delay(600));
  }
}
