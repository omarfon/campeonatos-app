import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-student-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sp-card p-8 sm:p-10 text-center space-y-3">
      @if (icon(); as i) {
        <div class="text-4xl" aria-hidden="true">{{ i }}</div>
      }
      <h3 class="text-lg font-bold text-slate-900">{{ title() }}</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto">{{ description() }}</p>
      @if (actionLabel()) {
        <button type="button" class="btn-primary mt-2" (click)="actionClick.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
})
export class StudentEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionClick = output<void>();
}
