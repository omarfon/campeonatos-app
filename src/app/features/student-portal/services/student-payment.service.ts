import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentPayment } from '../models/student-portal.model';
import { MOCK_PORTAL_PAYMENTS } from '../mocks/student-portal.mock';
import { StudentPaymentStatus } from '../enums/student-payment-status.enum';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentPaymentService {
  private readonly sessionService = inject(StudentSessionService);

  getPendingPayments(): Observable<StudentPayment[]> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_PAYMENTS.filter(p =>
      p.status === StudentPaymentStatus.PENDING || p.status === StudentPaymentStatus.OVERDUE,
    )).pipe(delay(200));
  }

  getPaymentHistory(filters?: { year?: number; status?: StudentPaymentStatus }): Observable<StudentPayment[]> {
    this.sessionService.requireStudentId();
    let list = [...MOCK_PORTAL_PAYMENTS];
    if (filters?.status) list = list.filter(p => p.status === filters.status);
    if (filters?.year) {
      list = list.filter(p => {
        const date = p.paidAt ?? p.dueDate ?? '';
        return date.startsWith(String(filters.year));
      });
    }
    return of(list).pipe(delay(200));
  }

  getPaymentDetail(id: number): Observable<StudentPayment | undefined> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_PAYMENTS.find(p => p.id === id)).pipe(delay(150));
  }

  getAccountSummary(): Observable<{ pendingAmount: number; nextDueDate?: string; statusLabel: string }> {
    this.sessionService.requireStudentId();
    const pending = MOCK_PORTAL_PAYMENTS.filter(p =>
      p.status === StudentPaymentStatus.PENDING || p.status === StudentPaymentStatus.OVERDUE,
    );
    const pendingAmount = pending.reduce((s, p) => s + p.amount, 0);
    return of({
      pendingAmount,
      nextDueDate: pending[0]?.dueDate,
      statusLabel: pendingAmount > 0 ? 'Pendiente' : 'Al día',
    }).pipe(delay(200));
  }

  processVisaPayment(paymentId: number): Observable<{ payment: StudentPayment; receiptNumber: string }> {
    this.sessionService.requireStudentId();
    const payment = MOCK_PORTAL_PAYMENTS.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }
    if (payment.status !== StudentPaymentStatus.PENDING && payment.status !== StudentPaymentStatus.OVERDUE) {
      throw new Error('Pago no pendiente');
    }

    const receiptNumber = `B001-${String(Date.now()).slice(-8)}`;
    const paidAt = new Date().toISOString().split('T')[0];
    payment.status = StudentPaymentStatus.PAID;
    payment.paidAt = paidAt;
    payment.method = 'Visa';
    payment.receiptNumber = receiptNumber;

    return of({ payment: { ...payment }, receiptNumber }).pipe(delay(1200));
  }
}
