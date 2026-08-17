import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { StudentAttendanceRecord, StudentAttendanceSummary } from '../../models/student-portal.model';
import {
  STUDENT_ATTENDANCE_STATUS_LABELS,
  StudentAttendanceStatus,
} from '../../enums/student-attendance-status.enum';
import { StudentAttendanceProgressComponent } from '../attendance-progress/attendance-progress';

type CourseSummary = StudentAttendanceSummary['courses'][number];

interface MonthGrid {
  label: string;
  weekDays: string[];
  cells: { day: number | null; date: string | null; status: StudentAttendanceStatus | null }[];
}

@Component({
  selector: 'app-student-attendance-detail-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StudentAttendanceProgressComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex justify-end" role="presentation">
        <button type="button"
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          aria-label="Cerrar detalle de asistencia"
          (click)="close.emit()"></button>

        <aside
          class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()">
          <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Asistencia del curso</p>
                <h2 [id]="titleId" class="text-lg font-bold text-slate-900 truncate">{{ course()?.courseName }}</h2>
              </div>
              <button type="button"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Cerrar panel"
                (click)="close.emit()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            @if (course(); as c) {
              <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div class="rounded-xl bg-emerald-50 py-2 px-1 border border-emerald-100">
                  <p class="font-bold text-emerald-700 text-base">{{ c.present }}</p>
                  <p class="text-emerald-600">Presente</p>
                </div>
                <div class="rounded-xl bg-rose-50 py-2 px-1 border border-rose-100">
                  <p class="font-bold text-rose-700 text-base">{{ c.absent }}</p>
                  <p class="text-rose-600">Ausente</p>
                </div>
                <div class="rounded-xl bg-amber-50 py-2 px-1 border border-amber-100">
                  <p class="font-bold text-amber-700 text-base">{{ c.justified }}</p>
                  <p class="text-amber-600">Justificada</p>
                </div>
              </div>
              <div class="mt-3">
                <app-attendance-progress [percentage]="c.percentage" label="Asistencia del curso" />
              </div>
            }
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            @if (loading()) {
              <div class="space-y-3 animate-pulse">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <div class="h-12 bg-slate-200/80 rounded-xl"></div>
                }
              </div>
            } @else if (records().length === 0) {
              <p class="text-sm text-slate-500 text-center py-8">No hay registros de asistencia para este curso.</p>
            } @else {
              <div class="flex flex-wrap gap-3 text-xs">
                @for (item of legend; track item.status) {
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full" [class]="item.dotClass" aria-hidden="true"></span>
                    {{ item.label }}
                  </span>
                }
              </div>

              @for (month of monthGrids(); track month.label) {
                <section>
                  <h3 class="text-sm font-bold text-slate-800 mb-2 capitalize">{{ month.label }}</h3>
                  <div class="grid grid-cols-7 gap-1 mb-1">
                    @for (d of month.weekDays; track d) {
                      <div class="text-center text-[10px] font-semibold text-slate-400 py-0.5">{{ d }}</div>
                    }
                  </div>
                  <div class="grid grid-cols-7 gap-1">
                    @for (cell of month.cells; track $index) {
                      @if (cell.day === null) {
                        <div class="aspect-square" aria-hidden="true"></div>
                      } @else {
                        <div class="aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold border"
                          [class]="cellClass(cell.status)"
                          [attr.aria-label]="cell.date ? ariaDayLabel(cell.date, cell.status) : null"
                          [title]="cell.date ?? ''">
                          <span>{{ cell.day }}</span>
                          @if (cell.status) {
                            <span class="text-[8px] font-normal mt-0.5 opacity-80">{{ statusShort(cell.status) }}</span>
                          }
                        </div>
                      }
                    }
                  </div>
                </section>
              }

              <section>
                <h3 class="text-sm font-bold text-slate-800 mb-2">Detalle por día</h3>
                <ul class="space-y-2">
                  @for (r of sortedRecords(); track r.id) {
                    <li class="flex items-center gap-3 sp-card !shadow-none px-3 py-2.5 border-l-4"
                      [class]="recordBorderClass(r.status)">
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-slate-900 text-sm">{{ r.dateLabel }}</p>
                        <p class="text-xs text-slate-500">{{ formatWeekday(r.date) }}</p>
                      </div>
                      <span class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                        [class]="statusBadgeClass(r.status)">
                        {{ statusLabel(r.status) }}
                      </span>
                    </li>
                  }
                </ul>
              </section>
            }
          </div>
        </aside>
      </div>
    }
  `,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class StudentAttendanceDetailPanelComponent {
  readonly open = input(false);
  readonly course = input<CourseSummary | null>(null);
  readonly records = input<StudentAttendanceRecord[]>([]);
  readonly loading = input(false);
  readonly close = output<void>();

  protected readonly titleId = 'attendance-panel-title';
  protected readonly legend = [
    { status: StudentAttendanceStatus.PRESENT, label: 'Presente', dotClass: 'bg-emerald-500' },
    { status: StudentAttendanceStatus.ABSENT, label: 'Ausente', dotClass: 'bg-rose-500' },
    { status: StudentAttendanceStatus.JUSTIFIED, label: 'Justificada', dotClass: 'bg-amber-500' },
  ];

  protected readonly sortedRecords = computed(() =>
    [...this.records()].sort((a, b) => b.date.localeCompare(a.date)),
  );

  protected readonly monthGrids = computed((): MonthGrid[] => {
    const records = this.records();
    if (records.length === 0) return [];

    const byMonth = new Map<string, StudentAttendanceRecord[]>();
    for (const r of records) {
      const key = r.date.slice(0, 7);
      const list = byMonth.get(key) ?? [];
      list.push(r);
      byMonth.set(key, list);
    }

    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const months: MonthGrid[] = [];

    for (const [key, monthRecords] of [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
      const [y, m] = key.split('-').map(Number);
      const first = new Date(y, m - 1, 1);
      const lastDay = new Date(y, m, 0).getDate();
      const startPad = (first.getDay() + 6) % 7;
      const statusByDate = new Map(monthRecords.map(r => [r.date, r.status]));

      const cells: MonthGrid['cells'] = [];
      for (let i = 0; i < startPad; i++) cells.push({ day: null, date: null, status: null });
      for (let d = 1; d <= lastDay; d++) {
        const date = `${key}-${String(d).padStart(2, '0')}`;
        cells.push({ day: d, date, status: statusByDate.get(date) ?? null });
      }

      months.push({
        label: first.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }),
        weekDays,
        cells,
      });
    }

    return months;
  });

  protected onKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close.emit();
    }
  }

  protected statusLabel(status: StudentAttendanceStatus): string {
    return STUDENT_ATTENDANCE_STATUS_LABELS[status];
  }

  protected statusShort(status: StudentAttendanceStatus): string {
    return status === StudentAttendanceStatus.PRESENT ? 'P'
      : status === StudentAttendanceStatus.ABSENT ? 'A' : 'J';
  }

  protected statusBadgeClass(status: StudentAttendanceStatus): string {
    switch (status) {
      case StudentAttendanceStatus.PRESENT: return 'bg-emerald-100 text-emerald-800';
      case StudentAttendanceStatus.ABSENT: return 'bg-rose-100 text-rose-800';
      case StudentAttendanceStatus.JUSTIFIED: return 'bg-amber-100 text-amber-800';
    }
  }

  protected recordBorderClass(status: StudentAttendanceStatus): string {
    switch (status) {
      case StudentAttendanceStatus.PRESENT: return 'border-emerald-500';
      case StudentAttendanceStatus.ABSENT: return 'border-rose-500';
      case StudentAttendanceStatus.JUSTIFIED: return 'border-amber-500';
    }
  }

  protected cellClass(status: StudentAttendanceStatus | null): string {
    if (!status) return 'border-slate-100 bg-slate-50/50 text-slate-300';
    switch (status) {
      case StudentAttendanceStatus.PRESENT: return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case StudentAttendanceStatus.ABSENT: return 'border-rose-200 bg-rose-50 text-rose-800';
      case StudentAttendanceStatus.JUSTIFIED: return 'border-amber-200 bg-amber-50 text-amber-800';
    }
  }

  protected formatWeekday(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-PE', { weekday: 'long' });
  }

  protected ariaDayLabel(date: string, status: StudentAttendanceStatus | null): string {
    const weekday = this.formatWeekday(date);
    if (!status) return `${weekday} ${date}, sin registro`;
    return `${weekday} ${date}, ${this.statusLabel(status)}`;
  }
}
