import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { ClassSession } from '../../models/class.model';
import { ClassSessionStatus, CLASS_SESSION_STATUS_LABELS } from '../../enums/class-session-status.enum';
import { MOCK_TEACHERS, MOCK_ROOMS } from '../../mocks/classes.mock';

@Component({
  selector: 'app-class-session-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sessions().length === 0) {
      <p class="text-slate-600">No existen sesiones generadas. Configura la programación de la clase.</p>
    } @else {
      <div class="flex gap-2 mb-4">
        <button
          type="button"
          class="btn-secondary !text-sm"
          [class.bg-brand]="viewMode() === 'list'"
          [class.text-white]="viewMode() === 'list'"
          (click)="viewMode.set('list')"
        >
          Lista
        </button>
        <button
          type="button"
          class="btn-secondary !text-sm"
          [class.bg-brand]="viewMode() === 'calendar'"
          [class.text-white]="viewMode() === 'calendar'"
          (click)="viewMode.set('calendar')"
        >
          Calendario
        </button>
      </div>

      @if (viewMode() === 'list') {
        <ul class="space-y-1">
          @for (s of sessions(); track s.id) {
            <li>
              <button
                type="button"
                class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border text-left transition-colors hover:bg-slate-50"
                [class.border-brand]="selectedId() === s.id"
                [class.bg-brand/5]="selectedId() === s.id"
                [class.border-slate-100]="selectedId() !== s.id"
                (click)="selectSession.emit(s)"
              >
                <span class="font-semibold text-slate-800">{{ formatDate(s.date) }}</span>
                <span class="text-sm text-slate-600">{{ s.startTime }} - {{ s.endTime }}</span>
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
                  [class]="statusClass(s.status)"
                >
                  {{ statusLabel(s.status) }}
                </span>
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          @for (g of calendarGroups(); track g.date) {
            <button
              type="button"
              class="rounded-lg border p-2 text-xs text-left hover:border-brand"
              [class.border-amber-300]="g.holiday"
              [class.bg-amber-50]="g.holiday"
              (click)="selectSession.emit(g.sessions[0])"
            >
              <p class="font-semibold">{{ formatDateShort(g.date) }}</p>
              @for (s of g.sessions; track s.id) {
                <p class="text-slate-600 mt-1">{{ s.startTime }}-{{ s.endTime }}</p>
              }
            </button>
          }
        </div>
      }
    }
  `,
})
export class ClassSessionCalendarComponent {
  readonly sessions = input.required<ClassSession[]>();
  readonly selectedId = input<number | null>(null);
  readonly selectSession = output<ClassSession>();

  protected readonly viewMode = signal<'list' | 'calendar'>('list');

  protected formatDate(date: string): string {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  protected formatDateShort(date: string): string {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).toUpperCase();
  }

  protected statusLabel(status: ClassSessionStatus): string {
    return CLASS_SESSION_STATUS_LABELS[status];
  }

  protected statusClass(status: ClassSessionStatus): string {
    switch (status) {
      case ClassSessionStatus.COMPLETED: return 'bg-purple-100 text-purple-800';
      case ClassSessionStatus.CANCELLED: return 'bg-red-100 text-red-800';
      case ClassSessionStatus.RESCHEDULED: return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  protected calendarGroups(): { date: string; holiday: boolean; sessions: ClassSession[] }[] {
    const map = new Map<string, { date: string; holiday: boolean; sessions: ClassSession[] }>();
    for (const s of this.sessions()) {
      const existing = map.get(s.date) ?? { date: s.date, holiday: !!s.holidayWarning, sessions: [] };
      existing.sessions.push(s);
      map.set(s.date, existing);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
