import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { StudentPaymentService } from '../../services/student-payment.service';

import { StudentPayment } from '../../models/student-portal.model';

import {

  StudentPaymentStatus,

  STUDENT_PAYMENT_STATUS_LABELS,

} from '../../enums/student-payment-status.enum';

import { StudentVisaCheckoutModalComponent } from '../../components/visa-checkout-modal/student-visa-checkout-modal';



@Component({

  selector: 'app-student-payment-detail',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, StudentVisaCheckoutModalComponent],

  template: `

    <div class="space-y-6">

      <nav class="text-sm text-slate-500">

        <a routerLink="/portal-alumno/pagos" class="hover:text-brand">Pagos</a>

        <span class="mx-2">/</span>

        <span class="text-slate-800 font-medium">Detalle</span>

      </nav>



      @if (loading()) {

        <div class="sp-card p-8 animate-pulse">

          <div class="h-6 bg-slate-200 rounded w-48"></div>

        </div>

      } @else if (payment(); as p) {

        <div class="space-y-4">

          <div class="flex flex-wrap items-start justify-between gap-3">

            <div>

              <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>

              <h1 class="text-2xl font-extrabold text-slate-900 mt-1">{{ p.concept }}</h1>

              @if (p.courseName) {

                <p class="text-sm text-slate-600 mt-1">{{ p.courseName }} · {{ p.period }}</p>

              }

            </div>

            <span class="text-xs font-semibold px-2.5 py-1 rounded-full"

              [class]="statusClass(p.status)">

              {{ statusLabel(p.status) }}

            </span>

          </div>



          <div class="sp-card p-5 space-y-4">

            <div class="flex justify-between items-center">

              <span class="text-slate-600">Monto</span>

              <span class="text-2xl font-extrabold text-slate-900">S/ {{ p.amount.toFixed(2) }}</span>

            </div>

            @if (p.dueDate) {

              <div class="flex justify-between text-sm">

                <span class="text-slate-500">Fecha de vencimiento</span>

                <span class="font-semibold text-slate-900">{{ p.dueDate }}</span>

              </div>

            }

            @if (p.paidAt) {

              <div class="flex justify-between text-sm">

                <span class="text-slate-500">Fecha de pago</span>

                <span class="font-semibold text-slate-900">{{ p.paidAt }}</span>

              </div>

            }

            @if (p.method) {

              <div class="flex justify-between text-sm">

                <span class="text-slate-500">Método de pago</span>

                <span class="font-semibold text-slate-900">{{ p.method }}</span>

              </div>

            }

            @if (p.receiptNumber) {

              <div class="flex justify-between text-sm">

                <span class="text-slate-500">Comprobante</span>

                <span class="font-mono font-semibold text-slate-900">{{ p.receiptNumber }}</span>

              </div>

            }

            @if (p.enrollmentId) {

              <a [routerLink]="['/portal-alumno/matriculas', p.enrollmentId]"

                class="inline-block text-sm font-semibold text-brand hover:underline">

                Ver matrícula relacionada →

              </a>

            }

          </div>



          @if (isPayable(p.status)) {
            <button type="button" class="btn-primary w-full sm:w-auto" (click)="openCheckout()">
              Pagar
            </button>
          }

        </div>

      } @else {

        <div class="sp-card p-8 text-center space-y-3">

          <p class="text-slate-600">Pago no encontrado.</p>

          <a routerLink="/portal-alumno/pagos" class="btn-primary inline-block">Volver a pagos</a>

        </div>

      }

      <app-student-visa-checkout-modal
        [open]="checkoutOpen()"
        [payment]="payment()"
        (close)="closeCheckout()"
        (paid)="onPaymentCompleted($event)" />
    </div>

  `,

})

export class StudentPaymentDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly paymentService = inject(StudentPaymentService);



  protected readonly payment = signal<StudentPayment | null>(null);

  protected readonly loading = signal(true);
  protected readonly checkoutOpen = signal(false);

  protected isPayable(status: StudentPaymentStatus): boolean {
    return status === StudentPaymentStatus.PENDING || status === StudentPaymentStatus.OVERDUE;
  }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.paymentService.getPaymentDetail(id).subscribe({

      next: p => {

        this.payment.set(p ?? null);

        this.loading.set(false);

      },

      error: () => this.loading.set(false),

    });

  }



  protected openCheckout(): void {
    this.checkoutOpen.set(true);
  }

  protected closeCheckout(): void {
    this.checkoutOpen.set(false);
  }

  protected onPaymentCompleted(updated: StudentPayment): void {
    this.payment.set(updated);
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

