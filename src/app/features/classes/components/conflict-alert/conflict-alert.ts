import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ClassConflict } from '../../models/class.model';

@Component({
  selector: 'app-conflict-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (conflicts().length > 0) {
      <div
        class="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2"
        role="alert"
        aria-live="polite"
      >
        <p class="text-sm font-semibold text-amber-900 flex items-center gap-2">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {{ title() }}
        </p>
        <ul class="text-sm text-amber-800 space-y-1 list-disc pl-5">
          @for (c of conflicts(); track c.message) {
            <li>{{ c.message }}</li>
          }
        </ul>
      </div>
    }
  `,
})
export class ConflictAlertComponent {
  readonly conflicts = input.required<ClassConflict[]>();
  readonly title = input('Conflictos detectados');
}
