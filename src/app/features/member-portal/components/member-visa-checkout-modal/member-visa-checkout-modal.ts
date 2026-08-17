import { Component, effect, inject, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberPaymentService } from '../../services/member-payment.service';
import { MemberPayment } from '../../models/member-portal.model';

@Component({
  selector: 'app-member-visa-checkout-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
        <button type="button"
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          aria-label="Cerrar pago con Visa"
          (click)="closeModal()"></button>

        <div class="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-[scaleIn_0.2s_ease-out]"
          role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()">
          <header class="bg-[#1a1f71] text-white px-5 py-4 shrink-0">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[10px] uppercase tracking-[0.25em] text-white/70">Pago seguro</p>
                <p [id]="titleId" class="text-xl font-black italic tracking-tight mt-0.5" aria-label="Visa">VISA</p>
              </div>
              <button type="button" class="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Cerrar modal" (click)="closeModal()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto bg-slate-50">
            @if (payments().length > 0) {
              @if (success()) {
                <div class="p-6 text-center space-y-4 bg-white">
                  <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto" aria-hidden="true">✓</div>
                  <h2 class="text-lg font-extrabold text-slate-900">Pago confirmado</h2>
                  <p class="text-sm text-slate-600">
                    Tu abono de <strong>S/ {{ totalAmount().toFixed(2) }}</strong> fue procesado correctamente.
                  </p>
                  @if (receiptNumber()) {
                    <p class="text-xs font-mono text-slate-500">Comprobante: {{ receiptNumber() }}</p>
                  }
                  <button type="button" class="btn-primary w-full" (click)="closeModal()">Cerrar</button>
                </div>
              } @else {
                <div class="px-5 py-4 bg-white border-b border-slate-100 space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Resumen del abono</p>
                  @for (p of payments(); track p.id) {
                    <div class="text-sm">
                      <p class="font-semibold text-slate-900">{{ p.concept }}</p>
                      <p class="text-slate-500">{{ p.participantName }} · S/ {{ p.amount.toFixed(2) }}</p>
                    </div>
                  }
                  <p class="text-2xl font-extrabold text-[#1a1f71] pt-2">Total: S/ {{ totalAmount().toFixed(2) }}</p>
                </div>

                <form class="p-5 space-y-4 bg-white" [formGroup]="form" (ngSubmit)="submit()">
                  <fieldset class="space-y-4" [disabled]="processing()">
                    <legend class="sr-only">Datos de tarjeta Visa</legend>
                    <div>
                      <label [for]="fieldId('cardholder')" class="block text-xs font-semibold text-slate-600 mb-1.5">Titular</label>
                      <input [id]="fieldId('cardholder')" type="text" formControlName="cardholderName" class="input-modern w-full" autocomplete="cc-name" />
                    </div>
                    <div>
                      <label [for]="fieldId('card-number')" class="block text-xs font-semibold text-slate-600 mb-1.5">Número de tarjeta</label>
                      <input [id]="fieldId('card-number')" type="text" formControlName="cardNumber"
                        class="input-modern w-full font-mono tracking-wider" inputmode="numeric"
                        autocomplete="cc-number" maxlength="19" placeholder="4111 1111 1111 1111" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label [for]="fieldId('expiry')" class="block text-xs font-semibold text-slate-600 mb-1.5">Vencimiento</label>
                        <input [id]="fieldId('expiry')" type="text" formControlName="expiry"
                          class="input-modern w-full font-mono" maxlength="5" placeholder="MM/AA" />
                      </div>
                      <div>
                        <label [for]="fieldId('cvv')" class="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                        <input [id]="fieldId('cvv')" type="password" formControlName="cvv"
                          class="input-modern w-full font-mono" maxlength="4" placeholder="•••" />
                      </div>
                    </div>
                  </fieldset>

                  @if (errorMessage()) {
                    <p class="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2" role="alert">
                      {{ errorMessage() }}
                    </p>
                  }

                  <button type="submit" class="w-full py-3.5 rounded-xl font-bold text-white transition-opacity"
                    [class]="processing() ? 'bg-[#1a1f71]/70 cursor-wait' : 'bg-[#1a1f71] hover:bg-[#151a5c]'"
                    [disabled]="processing() || form.invalid">
                    {{ processing() ? 'Procesando pago...' : 'Pagar S/ ' + totalAmount().toFixed(2) }}
                  </button>
                  <p class="text-center text-xs text-slate-500">Simulación mock. No se realizará ningún cargo real.</p>
                </form>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`,
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class MemberVisaCheckoutModalComponent {
  private readonly paymentService = inject(MemberPaymentService);
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly payments = input<MemberPayment[]>([]);
  readonly close = output<void>();
  readonly paid = output<MemberPayment[]>();

  protected readonly titleId = `member-visa-title-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly processing = signal(false);
  protected readonly success = signal(false);
  protected readonly receiptNumber = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly totalAmount = computed(() =>
    this.payments().reduce((s, p) => s + p.amount, 0),
  );

  protected readonly form = this.fb.nonNullable.group({
    cardholderName: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  constructor() {
    effect(() => {
      if (this.open()) this.resetForm();
    });
  }

  protected fieldId(name: string): string {
    return `member-visa-${name}`;
  }

  protected closeModal(): void {
    this.close.emit();
  }

  protected submit(): void {
    if (this.form.invalid || this.processing() || this.payments().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);
    const ids = this.payments().map(p => p.id);

    this.paymentService.processPayments(ids).subscribe({
      next: result => {
        this.receiptNumber.set(result.receiptNumber);
        this.success.set(true);
        this.processing.set(false);
        this.paid.emit(result.payments);
      },
      error: () => {
        this.errorMessage.set('No se pudo procesar el pago. Intenta nuevamente.');
        this.processing.set(false);
      },
    });
  }

  protected onKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && this.open()) {
      event.preventDefault();
      this.closeModal();
    }
  }

  private resetForm(): void {
    this.form.reset();
    this.processing.set(false);
    this.success.set(false);
    this.receiptNumber.set(null);
    this.errorMessage.set(null);
  }
}
