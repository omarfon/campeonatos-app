import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';

import { StudentPaymentService } from '../../services/student-payment.service';

import { StudentPayment } from '../../models/student-portal.model';

import {

  StudentPaymentStatus,

  STUDENT_PAYMENT_STATUS_LABELS,

} from '../../enums/student-payment-status.enum';

import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';
import { StudentVisaCheckoutModalComponent } from '../../components/visa-checkout-modal/student-visa-checkout-modal';
import { StudentPaymentReceiptModalComponent } from '../../components/payment-receipt-modal/student-payment-receipt-modal';



type PaymentTab = 'pending' | 'paid';



@Component({

  selector: 'app-student-payments',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, StudentEmptyStateComponent, StudentVisaCheckoutModalComponent, StudentPaymentReceiptModalComponent],

  template: `

    <div class="space-y-6">

      <div>

        <h1 class="sp-page-title">Pagos</h1>

        <p class="text-sm text-slate-500 mt-1">Consulta tus pagos pendientes e historial.</p>

      </div>



      @if (accountSummary(); as acc) {

        <div class="sp-card p-5 flex flex-wrap items-center justify-between gap-4">

          <div>

            <p class="text-xs font-semibold uppercase text-slate-500">Estado de cuenta</p>

            <p class="text-2xl font-extrabold mt-1"

              [class]="acc.pendingAmount > 0 ? 'text-amber-700' : 'text-green-700'">

              {{ acc.statusLabel }}

            </p>

            @if (acc.pendingAmount > 0) {

              <p class="text-sm text-slate-600 mt-1">Pendiente: S/ {{ acc.pendingAmount.toFixed(2) }}</p>

              @if (acc.nextDueDate) {

                <p class="text-xs text-slate-500 mt-0.5">Próximo vencimiento: {{ acc.nextDueDate }}</p>

              }

            }

          </div>

        </div>

      }



      <div class="flex gap-2" role="tablist" aria-label="Filtrar pagos">

        <button type="button" role="tab" [attr.aria-selected]="tab() === 'pending'"

          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"

          [class]="tab() === 'pending' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"

          (click)="setTab('pending')">

          Pendientes

        </button>

        <button type="button" role="tab" [attr.aria-selected]="tab() === 'paid'"

          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"

          [class]="tab() === 'paid' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"

          (click)="setTab('paid')">

          Pagados

        </button>

      </div>



      @if (loading()) {

        <div class="space-y-3 animate-pulse">

          @for (i of [1, 2]; track i) {

            <div class="h-20 bg-slate-200 rounded-2xl"></div>

          }

        </div>

      } @else if (payments().length === 0) {

        <app-student-empty-state

          [title]="tab() === 'pending' ? 'Sin pagos pendientes' : 'Sin pagos registrados'"

          [description]="tab() === 'pending'

            ? '¡Estás al día! No tienes pagos pendientes.'

            : 'Aún no hay pagos en tu historial.'"

          icon="💳"

        />

      } @else {

        <div class="space-y-3">
          @for (p of payments(); track p.id) {
            <div class="sp-card p-5 flex flex-wrap items-end justify-between gap-4">
              <a [routerLink]="['/portal-alumno/pagos', p.id]"
                class="flex-1 min-w-0 block sp-card-hover -m-1 p-1 rounded-xl">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>
                    <h2 class="font-bold text-slate-900 mt-0.5">{{ p.concept }}</h2>
                    @if (p.courseName) {
                      <p class="text-sm text-slate-600 mt-1">{{ p.courseName }} · {{ p.period }}</p>
                    }
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    [class]="statusClass(p.status)">
                    {{ statusLabel(p.status) }}
                  </span>
                </div>
                <p class="text-lg font-extrabold text-slate-900 mt-3">S/ {{ p.amount.toFixed(2) }}</p>
                @if (p.dueDate && tab() === 'pending') {
                  <p class="text-xs text-amber-700 mt-1">Vence: {{ p.dueDate }}</p>
                }
                @if (p.paidAt && tab() === 'paid') {
                  <p class="text-xs text-slate-500 mt-1">Pagado: {{ p.paidAt }}</p>
                }
              </a>
              @if (tab() === 'pending') {
                <button type="button"
                  class="btn-primary shrink-0 !py-2.5 !px-5"
                  (click)="openCheckout(p)">
                  Pagar
                </button>
              }
              @if (tab() === 'paid') {
                <button type="button"
                  class="btn-secondary shrink-0 !py-2.5 !px-5"
                  (click)="openReceipt(p)">
                  Ver comprobante
                </button>
              }
            </div>
          }
        </div>

      }

      <app-student-visa-checkout-modal
        [open]="checkoutOpen()"
        [payment]="checkoutPayment()"
        (close)="closeCheckout()"
        (paid)="onPaymentCompleted()" />

      <app-student-payment-receipt-modal
        [open]="receiptOpen()"
        [payment]="receiptPayment()"
        (close)="closeReceipt()" />
    </div>

  `,

})

export class StudentPaymentsComponent implements OnInit {

  private readonly paymentService = inject(StudentPaymentService);



  protected readonly payments = signal<StudentPayment[]>([]);

  protected readonly accountSummary = signal<{ pendingAmount: number; nextDueDate?: string; statusLabel: string } | null>(null);

  protected readonly loading = signal(true);

  protected readonly tab = signal<PaymentTab>('pending');
  protected readonly checkoutOpen = signal(false);
  protected readonly checkoutPayment = signal<StudentPayment | null>(null);
  protected readonly receiptOpen = signal(false);
  protected readonly receiptPayment = signal<StudentPayment | null>(null);



  ngOnInit(): void {

    this.paymentService.getAccountSummary().subscribe(acc => this.accountSummary.set(acc));

    this.load();

  }



  protected setTab(tab: PaymentTab): void {

    this.tab.set(tab);

    this.load();

  }

  protected openCheckout(payment: StudentPayment): void {
    this.checkoutPayment.set(payment);
    this.checkoutOpen.set(true);
  }

  protected closeCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutPayment.set(null);
  }

  protected openReceipt(payment: StudentPayment): void {
    this.receiptPayment.set(payment);
    this.receiptOpen.set(true);
  }

  protected closeReceipt(): void {
    this.receiptOpen.set(false);
    this.receiptPayment.set(null);
  }

  protected onPaymentCompleted(): void {
    this.paymentService.getAccountSummary().subscribe(acc => this.accountSummary.set(acc));
    this.load();
  }

  private load(): void {

    this.loading.set(true);

    const request$ = this.tab() === 'pending'

      ? this.paymentService.getPendingPayments()

      : this.paymentService.getPaymentHistory({ status: StudentPaymentStatus.PAID });

    request$.subscribe({

      next: list => {

        this.payments.set(list);

        this.loading.set(false);

      },

      error: () => this.loading.set(false),

    });

  }



  protected statusLabel(status: StudentPaymentStatus): string {

    return STUDENT_PAYMENT_STATUS_LABELS[status];

  }



  protected statusClass(status: StudentPaymentStatus): string {

    switch (status) {

      case StudentPaymentStatus.PAID: return 'bg-green-100 text-green-800';

      case StudentPaymentStatus.PENDING: return 'bg-amber-100 text-amber-800';

      case StudentPaymentStatus.OVERDUE: return 'bg-red-100 text-red-800';

      default: return 'bg-slate-100 text-slate-600';

    }

  }

}

