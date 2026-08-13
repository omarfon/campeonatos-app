import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { EventAudit } from '../../models/event.model';

@Component({
  selector: 'app-event-audit-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      @for (entry of audits(); track entry.id) {
        <div class="flex gap-3">
          <div class="w-2 h-2 rounded-full bg-brand mt-2 shrink-0"></div>
          <div>
            <p class="text-xs text-slate-400">{{ formatDate(entry.timestamp) }}</p>
            <p class="text-sm font-semibold text-slate-800">{{ entry.description }}</p>
            <p class="text-xs text-slate-500">Usuario: {{ entry.userName }}</p>
          </div>
        </div>
      } @empty {
        <p class="text-sm text-slate-400 italic">Sin registros de auditoría</p>
      }
    </div>
  `,
})
export class EventAuditTimelineComponent {
  readonly audits = input.required<EventAudit[]>();

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
