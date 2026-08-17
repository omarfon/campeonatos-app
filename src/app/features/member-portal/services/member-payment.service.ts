import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import {
  MemberPayment,
  MemberReceipt,
  MemberAccountStatement,
} from '../models/member-portal.model';
import { MOCK_MEMBER_PAYMENTS, buildMemberReceipts } from '../mocks/member-payments.mock';
import { MemberPaymentStatus } from '../enums/member-payment-status.enum';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberPaymentService {
  private readonly sessionService = inject(MemberSessionService);
  private receiptCounter = buildMemberReceipts().length + 1;

  getPendingPayments(participantPersonId?: number | 'all'): Observable<MemberPayment[]> {
    this.sessionService.requireMemberId();
    let list = MOCK_MEMBER_PAYMENTS.filter(p =>
      p.status === MemberPaymentStatus.PENDING || p.status === MemberPaymentStatus.OVERDUE,
    );
    if (participantPersonId != null && participantPersonId !== 'all') {
      list = list.filter(p => p.participantPersonId === participantPersonId);
    }
    return of(list).pipe(delay(250));
  }

  getPaymentHistory(filters?: {
    year?: number;
    status?: MemberPaymentStatus;
    participantPersonId?: number | 'all';
  }): Observable<MemberPayment[]> {
    this.sessionService.requireMemberId();
    let list = MOCK_MEMBER_PAYMENTS.filter(p => p.status === MemberPaymentStatus.PAID);
    if (filters?.status) list = MOCK_MEMBER_PAYMENTS.filter(p => p.status === filters.status);
    if (filters?.participantPersonId != null && filters.participantPersonId !== 'all') {
      list = list.filter(p => p.participantPersonId === filters.participantPersonId);
    }
    if (filters?.year) {
      list = list.filter(p => {
        const date = p.paidAt ?? p.dueDate ?? '';
        return date.startsWith(String(filters.year));
      });
    }
    return of(list).pipe(delay(250));
  }

  getPaymentDetail(id: number): Observable<MemberPayment | undefined> {
    this.sessionService.requireMemberId();
    return of(MOCK_MEMBER_PAYMENTS.find(p => p.id === id)).pipe(delay(150));
  }

  getAccountStatement(): Observable<MemberAccountStatement> {
    this.sessionService.requireMemberId();
    const pending = MOCK_MEMBER_PAYMENTS.filter(p =>
      p.status === MemberPaymentStatus.PENDING || p.status === MemberPaymentStatus.OVERDUE,
    );
    const totalPending = pending.reduce((s, p) => s + p.amount, 0);
    const lineMap = new Map<number, { name: string; amount: number; count: number }>();

    for (const p of pending) {
      const existing = lineMap.get(p.participantPersonId);
      if (existing) {
        existing.amount += p.amount;
        existing.count += 1;
      } else {
        lineMap.set(p.participantPersonId, {
          name: p.participantName,
          amount: p.amount,
          count: 1,
        });
      }
    }

    const paid = MOCK_MEMBER_PAYMENTS
      .filter(p => p.status === MemberPaymentStatus.PAID && p.paidAt)
      .sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''));

    const dueDates = pending.map(p => p.dueDate).filter(Boolean).sort();

    return of({
      totalPending,
      isUpToDate: totalPending === 0,
      lastPaymentDate: paid[0]?.paidAt,
      nextDueDate: dueDates[0],
      lines: [...lineMap.entries()].map(([personId, data]) => ({
        participantPersonId: personId,
        participantName: data.name,
        pendingAmount: data.amount,
        debtCount: data.count,
      })),
    }).pipe(delay(200));
  }

  getAccountSummary(): Observable<{ pendingAmount: number; nextDueDate?: string; statusLabel: string }> {
    return this.getAccountStatement().pipe(
      map(stmt => ({
        pendingAmount: stmt.totalPending,
        nextDueDate: stmt.nextDueDate,
        statusLabel: stmt.isUpToDate ? 'Al día' : 'Pendiente',
      })),
    );
  }

  getReceipts(): Observable<MemberReceipt[]> {
    this.sessionService.requireMemberId();
    return of(buildMemberReceipts()).pipe(delay(200));
  }

  getReceipt(id: string): Observable<MemberReceipt | undefined> {
    this.sessionService.requireMemberId();
    return of(buildMemberReceipts().find(r => r.id === id)).pipe(delay(150));
  }

  processVisaPayment(paymentId: number): Observable<{ payment: MemberPayment; receiptNumber: string }> {
    return this.processPayments([paymentId]).pipe(
      map(result => ({
        payment: result.payments[0],
        receiptNumber: result.receiptNumber,
      })),
    );
  }

  processPayments(paymentIds: number[]): Observable<{ payments: MemberPayment[]; receiptNumber: string }> {
    this.sessionService.requireMemberId();
    if (paymentIds.length === 0) {
      return throwError(() => new Error('Selecciona al menos un pago.'));
    }

    const payments: MemberPayment[] = [];
    const receiptNumber = `B001-${String(this.receiptCounter++).padStart(6, '0')}`;
    const paidAt = new Date().toISOString().split('T')[0];

    for (const id of paymentIds) {
      const payment = MOCK_MEMBER_PAYMENTS.find(p => p.id === id);
      if (!payment) {
        return throwError(() => new Error('Uno de los pagos no fue encontrado.'));
      }
      if (payment.status !== MemberPaymentStatus.PENDING && payment.status !== MemberPaymentStatus.OVERDUE) {
        return throwError(() => new Error(`El pago ${payment.code} no está pendiente.`));
      }

      payment.status = MemberPaymentStatus.PAID;
      payment.paidAt = paidAt;
      payment.method = 'Visa';
      payment.receiptNumber = receiptNumber;
      payment.receiptId = `rec-${payment.id}`;
      payments.push({ ...payment });
    }

    return of({ payments, receiptNumber }).pipe(delay(1200));
  }
}
