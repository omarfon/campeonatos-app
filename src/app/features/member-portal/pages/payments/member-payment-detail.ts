import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberPaymentService } from '../../services/member-payment.service';
import { MemberPayment } from '../../models/member-portal.model';
import {
  MemberPaymentStatus,
  MEMBER_PAYMENT_STATUS_LABELS,
} from '../../enums/member-payment-status.enum';
import { MEMBER_PAYMENT_TYPE_LABELS } from '../../enums/member-payment-type.enum';
import { MemberVisaCheckoutModalComponent } from '../../components/member-visa-checkout-modal/member-visa-checkout-modal';
import { MemberPaymentReceiptModalComponent } from '../../components/member-payment-receipt-modal/member-payment-receipt-modal';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberVisaCheckoutModalComponent, MemberPaymentReceiptModalComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500">
        <a [routerLink]="paymentsRoute" class="hover:text-brand">Estado de cuenta y pagos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Detalle</span>
      </nav>

      @if (loading()) {
        <div class="mp-card p-8 animate-pulse">
          <div class="h-6 bg-slate-200 rounded w-48"></div>
        </div>
      } @else if (payment(); as p) {
        <div class="space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>
              <h1 class="text-2xl font-extrabold text-slate-900 mt-1">{{ p.concept }}</h1>
              <p class="text-sm text-brand font-semibold mt-1">{{ p.participantName }}</p>
              @if (p.activityName) {
                <p class="text-sm text-slate-600 mt-1">{{ p.activityName }} · {{ p.period }}</p>
              }
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" [class]="statusClass(p.status)">
              {{ statusLabel(p.status) }}
            </span>
          </div>

          <div class="mp-card p-5 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-slate-600">Monto</span>
              <span class="text-2xl font-extrabold text-slate-900">S/ {{ p.amount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Tipo</span>
              <span class="font-semibold text-slate-900">{{ typeLabel(p.type) }}</span>
            </div>
            @if (p.dueDate) {
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Vencimiento</span>
                <span class="font-semibold text-slate-900">{{ formatDate(p.dueDate) }}</span>
              </div>
            }
            @if (p.paidAt) {
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Fecha de pago</span>
                <span class="font-semibold text-slate-900">{{ formatDate(p.paidAt) }}</span>
              </div>
            }
            @if (p.method) {
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Método</span>
                <span class="font-semibold text-slate-900">{{ p.method }}</span>
              </div>
            }
            @if (p.receiptNumber) {
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Comprobante</span>
                <span class="font-mono font-semibold text-slate-900">{{ p.receiptNumber }}</span>
              </div>
            }
          </div>

          <div class="flex flex-wrap gap-2">
            @if (p.status === statusPending || p.status === statusOverdue) {
              <button type="button" class="btn-primary" (click)="openCheckout()">Pagar ahora</button>
            }
            @if (p.status === statusPaid) {
              <button type="button" class="btn-secondary" (click)="openReceipt()">Ver comprobante</button>
            }
            <a [routerLink]="paymentsRoute" class="btn-secondary">Volver a pagos</a>
          </div>
        </div>
      } @else {
        <div class="mp-card p-10 text-center space-y-4">
          <p class="text-slate-600">No encontramos este pago.</p>
          <a [routerLink]="paymentsRoute" class="btn-primary inline-block">Volver a pagos</a>
        </div>
      }

      <app-member-visa-checkout-modal
        [open]="checkoutOpen()"
        [payments]="checkoutPayments()"
        (close)="closeCheckout()"
        (paid)="reload()" />

      <app-member-payment-receipt-modal
        [open]="receiptOpen()"
        [payment]="payment()"
        (close)="receiptOpen.set(false)" />
    </div>
  `,
})
export class MemberPaymentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(MemberPaymentService);

  protected readonly loading = signal(true);
  protected readonly payment = signal<MemberPayment | null>(null);
  protected readonly checkoutOpen = signal(false);
  protected readonly checkoutPayments = signal<MemberPayment[]>([]);
  protected readonly receiptOpen = signal(false);

  protected readonly paymentsRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`;
  protected readonly statusPending = MemberPaymentStatus.PENDING;
  protected readonly statusOverdue = MemberPaymentStatus.OVERDUE;
  protected readonly statusPaid = MemberPaymentStatus.PAID;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.paymentService.getPaymentDetail(id).subscribe({
      next: p => { this.payment.set(p ?? null); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected openCheckout(): void {
    const p = this.payment();
    if (p) {
      this.checkoutPayments.set([p]);
      this.checkoutOpen.set(true);
    }
  }

  protected closeCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutPayments.set([]);
  }

  protected openReceipt(): void {
    this.receiptOpen.set(true);
  }

  protected reload(): void {
    const id = this.payment()?.id;
    if (id == null) return;
    this.paymentService.getPaymentDetail(id).subscribe(p => this.payment.set(p ?? null));
    this.closeCheckout();
  }

  protected statusLabel(status: MemberPaymentStatus): string {
    return MEMBER_PAYMENT_STATUS_LABELS[status];
  }

  protected typeLabel(type: MemberPayment['type']): string {
    return MEMBER_PAYMENT_TYPE_LABELS[type];
  }

  protected statusClass(status: MemberPaymentStatus): string {
    switch (status) {
      case MemberPaymentStatus.PAID: return 'bg-emerald-100 text-emerald-800';
      case MemberPaymentStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case MemberPaymentStatus.OVERDUE: return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
