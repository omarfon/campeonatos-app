import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { EnrollmentCharge, EnrollmentAgreement } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-charge-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-card p-4 space-y-3">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Resumen de cobranza</h3>
      <div class="space-y-2 text-sm">
        @for (c of charges(); track c.id) {
          @if (c.finalAmount >= 0) {
            <div class="flex justify-between">
              <span class="text-slate-700">{{ c.conceptName }}</span>
              <span class="font-medium">S/ {{ c.finalAmount.toFixed(2) }}</span>
            </div>
          }
        }
        <div class="border-t border-slate-200 pt-2 flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>S/ {{ subtotal().toFixed(2) }}</span>
        </div>
        @if (discount() > 0) {
          @if (agreement(); as agr) {
            <p class="text-xs text-brand font-medium">Beneficio aplicado: {{ agr.name }}</p>
          }
          <div class="flex justify-between text-green-700">
            <span>Descuento convenio</span>
            <span>-S/ {{ discount().toFixed(2) }}</span>
          </div>
        }
        <div class="border-t border-slate-200 pt-2 flex justify-between text-lg font-extrabold text-brand">
          <span>TOTAL</span>
          <span>S/ {{ total().toFixed(2) }}</span>
        </div>
        @if (fullyCovered()) {
          <div class="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            <p class="font-bold">CONVENIO 100%</p>
            <p>Importe estudiante: S/ 0.00</p>
            <p>No requiere pago del estudiante.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class EnrollmentChargeSummaryComponent {
  readonly charges = input.required<EnrollmentCharge[]>();
  readonly agreement = input<EnrollmentAgreement | null>(null);
  readonly fullyCovered = input(false);

  protected readonly subtotal = computed(() =>
    this.charges().filter(c => c.finalAmount >= 0).reduce((s, c) => s + c.finalAmount, 0),
  );
  protected readonly discount = computed(() =>
    this.charges().reduce((s, c) => s + (c.discountAmount || 0), 0),
  );
  protected readonly total = computed(() => Math.max(this.subtotal() - this.discount(), 0));
}
