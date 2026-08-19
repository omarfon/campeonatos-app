import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ClassSession } from '../../models/class.model';
import { MOCK_ROOMS, MOCK_TEACHERS } from '../../mocks/classes.mock';

@Component({
  selector: 'app-class-session-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-700">Calendario generado</h3>
          <p class="text-sm text-slate-500">{{ facade.draft().sessions.length }} sesiones</p>
        </div>
        <div class="flex gap-2">
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
          <button type="button" class="btn-primary !text-sm" (click)="regenerate()">
            Regenerar sesiones
          </button>
        </div>
      </div>

      @if (facade.draft().sessions.length === 0) {
        <p class="text-sm text-slate-600">No existen sesiones generadas. Configura la programación y pulsa regenerar.</p>
      } @else if (viewMode() === 'list') {
        <ul class="space-y-2 max-h-96 overflow-y-auto">
          @for (s of facade.draft().sessions; track s.id) {
            <li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-slate-100 bg-white">
              <div>
                <span class="font-semibold text-slate-800">{{ formatDate(s.date) }}</span>
                <span class="text-sm text-slate-600 ml-2">{{ s.startTime }} - {{ s.endTime }}</span>
              </div>
              <div class="text-xs text-slate-500">
                {{ teacherName(s.teacherId) }} · {{ roomName(s.roomId) }}
              </div>
              @if (s.holidayWarning) {
                <p class="text-xs text-amber-700 font-medium" role="alert">
                  {{ s.date }}: {{ s.holidayReason }} — día no laborable
                </p>
              }
            </li>
          }
        </ul>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          @for (group of calendarGroups(); track group.date) {
            <div class="rounded-lg border p-2 text-xs" [class.border-amber-300]="group.holiday" [class.bg-amber-50]="group.holiday">
              <p class="font-semibold">{{ formatDateShort(group.date) }}</p>
              @for (s of group.sessions; track s.id) {
                <p class="text-slate-600 mt-1">{{ s.startTime }}-{{ s.endTime }}</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ClassSessionListComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);
  protected readonly viewMode = signal<'list' | 'calendar'>('list');

  protected regenerate(): void {
    this.facade.generateSessions();
  }

  protected formatDate(date: string): string {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  protected formatDateShort(date: string): string {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).toUpperCase();
  }

  protected teacherName(id: number): string {
    const t = MOCK_TEACHERS.find(x => x.id === id);
    return t ? `${t.firstName} ${t.lastName}` : '—';
  }

  protected roomName(id?: number): string {
    if (!id) return '—';
    return MOCK_ROOMS.find(r => r.id === id)?.name ?? '—';
  }

  protected calendarGroups(): { date: string; holiday: boolean; sessions: ClassSession[] }[] {
    const map = new Map<string, { date: string; holiday: boolean; sessions: ClassSession[] }>();
    for (const s of this.facade.draft().sessions) {
      const existing = map.get(s.date) ?? { date: s.date, holiday: !!s.holidayWarning, sessions: [] };
      existing.sessions.push(s);
      map.set(s.date, existing);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
