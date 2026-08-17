import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-member-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mp-card p-10 text-center space-y-4">
      @if (icon()) {
        <p class="text-4xl" aria-hidden="true">{{ icon() }}</p>
      }
      <div>
        <h2 class="font-bold text-slate-900 text-lg">{{ title() }}</h2>
        <p class="text-sm text-slate-500 mt-2 max-w-sm mx-auto">{{ description() }}</p>
      </div>
      @if (actionLabel()) {
        <button type="button" class="btn-primary" (click)="actionClick.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class MemberEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionClick = output<void>();
}
