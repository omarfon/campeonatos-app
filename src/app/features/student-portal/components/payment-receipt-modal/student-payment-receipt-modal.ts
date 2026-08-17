import { Component, inject, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { StudentPayment } from '../../models/student-portal.model';
import { StudentSessionService } from '../../services/student-session.service';
import { STUDENT_PORTAL_NAME } from '../../student-portal.constants';

@Component({
  selector: 'app-student-payment-receipt-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open() && payment(); as p) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
        <button type="button"
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          aria-label="Cerrar comprobante"
          (click)="close.emit()"></button>

        <div class="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-[scaleIn_0.2s_ease-out] bg-white"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()">
          <div class="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Comprobante de pago</p>
              <h2 [id]="titleId" class="text-lg font-bold text-slate-900 mt-0.5">Boleta electrónica</h2>
            </div>
            <button type="button"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Cerrar modal"
              (click)="close.emit()">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <div class="rounded-xl border border-dashed border-slate-200 p-4 space-y-4 bg-slate-50/50">
              <div class="text-center pb-3 border-b border-slate-200">
                <p class="text-sm font-bold text-brand">{{ portalName }}</p>
                <p class="text-xs text-slate-500 mt-1">RUC 20123456789</p>
              </div>

              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500 shrink-0">N.° comprobante</dt>
                  <dd class="font-mono font-semibold text-slate-900 text-right">{{ receiptNumber() }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500 shrink-0">Fecha de pago</dt>
                  <dd class="font-semibold text-slate-900 text-right">{{ p.paidAt ?? '—' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500 shrink-0">Cliente</dt>
                  <dd class="font-semibold text-slate-900 text-right">{{ studentName() }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500 shrink-0">Concepto</dt>
                  <dd class="font-semibold text-slate-900 text-right">{{ p.concept }}</dd>
                </div>
                @if (p.courseName) {
                  <div class="flex justify-between gap-4">
                    <dt class="text-slate-500 shrink-0">Curso</dt>
                    <dd class="font-semibold text-slate-900 text-right">{{ p.courseName }}</dd>
                  </div>
                }
                @if (p.period) {
                  <div class="flex justify-between gap-4">
                    <dt class="text-slate-500 shrink-0">Periodo</dt>
                    <dd class="font-semibold text-slate-900 text-right">{{ p.period }}</dd>
                  </div>
                }
                @if (p.method) {
                  <div class="flex justify-between gap-4">
                    <dt class="text-slate-500 shrink-0">Método de pago</dt>
                    <dd class="font-semibold text-slate-900 text-right">{{ p.method }}</dd>
                  </div>
                }
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500 shrink-0">Código de pago</dt>
                  <dd class="font-mono font-semibold text-slate-900 text-right">{{ p.code }}</dd>
                </div>
              </dl>

              <div class="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span class="text-sm font-semibold text-slate-700">Total pagado</span>
                <span class="text-2xl font-extrabold text-slate-900">S/ {{ p.amount.toFixed(2) }}</span>
              </div>
            </div>

            <p class="text-xs text-center text-slate-500">
              Documento generado electrónicamente. Válido como comprobante de pago.
            </p>
          </div>

          <div class="px-5 py-4 border-t border-slate-100 shrink-0">
            <button type="button" class="btn-primary w-full" (click)="close.emit()">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class StudentPaymentReceiptModalComponent {
  private readonly sessionService = inject(StudentSessionService);

  readonly open = input(false);
  readonly payment = input<StudentPayment | null>(null);
  readonly close = output<void>();

  protected readonly portalName = STUDENT_PORTAL_NAME;
  protected readonly titleId = `receipt-modal-title-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly studentName = computed(
    () => this.sessionService.session()?.fullName ?? 'Alumno',
  );

  protected readonly receiptNumber = computed(() => {
    const p = this.payment();
    return p?.receiptNumber ?? p?.code ?? '—';
  });

  protected onKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close.emit();
    }
  }
}
