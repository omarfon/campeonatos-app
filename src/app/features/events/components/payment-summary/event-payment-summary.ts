import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export interface PaymentLine {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-event-payment-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      @for (line of lines(); track line.label) {
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">{{ line.label }}</span>
          <span class="font-medium text-slate-800">S/ {{ line.amount.toFixed(2) }}</span>
        </div>
      }
      <div class="border-t border-slate-200 pt-2 flex items-center justify-between">
        <span class="font-bold text-slate-900">TOTAL</span>
        <span class="text-lg font-bold text-brand">S/ {{ total().toFixed(2) }}</span>
      </div>
    </div>
  `,
})
export class EventPaymentSummaryComponent {
  readonly lines = input.required<PaymentLine[]>();
  readonly total = input.required<number>();
}
