import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { EnrollmentHistoryEntry } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-history-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      @for (entry of entries(); track entry.id) {
        <div class="flex gap-3">
          <div class="flex flex-col items-center">
            <div class="w-2 h-2 rounded-full bg-brand mt-2"></div>
            @if (!$last) { <div class="w-px flex-1 bg-slate-200 min-h-[2rem]"></div> }
          </div>
          <div class="pb-4">
            <p class="text-xs text-slate-500">{{ formatDate(entry.timestamp) }}</p>
            <p class="font-semibold text-slate-900">{{ entry.action }}</p>
            @if (entry.detail) {
              <p class="text-sm text-slate-600">{{ entry.detail }}</p>
            }
            <p class="text-xs text-slate-400 mt-0.5">{{ entry.user }}</p>
          </div>
        </div>
      } @empty {
        <p class="text-slate-400 text-sm">Sin historial registrado</p>
      }
    </div>
  `,
})
export class EnrollmentHistoryTimelineComponent {
  readonly entries = input.required<EnrollmentHistoryEntry[]>();

  protected formatDate(ts: string): string {
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
