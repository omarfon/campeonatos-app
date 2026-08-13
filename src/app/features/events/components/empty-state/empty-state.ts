import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      @if (icon()) {
        <span class="text-4xl mb-3">{{ icon() }}</span>
      }
      <p class="text-slate-600 font-semibold text-lg">{{ title() }}</p>
      @if (description()) {
        <p class="text-slate-400 text-sm mt-1 max-w-md">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly icon = input<string>('📋');
}
