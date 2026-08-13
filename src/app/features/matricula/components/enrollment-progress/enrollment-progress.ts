import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export interface ProgressItem {
  label: string;
  done: boolean;
}

@Component({
  selector: 'app-enrollment-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-card p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Estado del proceso</h3>
      <ul class="space-y-2">
        @for (item of items(); track item.label) {
          <li class="flex items-center gap-2 text-sm">
            <span class="w-5 text-center font-bold"
              [class]="item.done ? 'text-green-600' : 'text-slate-300'"
              aria-hidden="true">{{ item.done ? '✓' : '○' }}</span>
            <span [class]="item.done ? 'text-slate-800' : 'text-slate-400'">{{ item.label }}</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class EnrollmentProgressComponent {
  readonly items = input.required<ProgressItem[]>();
}
