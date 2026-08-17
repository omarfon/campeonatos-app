import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentScheduleEvent } from '../../models/student-portal.model';
import {
  SCHEDULE_WEEK_DAYS,
  SCHEDULE_MONTH_NAMES,
  formatLocalDate,
  parseLocalDate,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  timeToMinutes,
  type ScheduleCalendarDay,
} from '../../utils/schedule-calendar.utils';

type CalendarView = 'week' | 'month';

const HOUR_START = 7;
const HOUR_END = 21;
const HOUR_SLOTS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

@Component({
  selector: 'app-student-schedule-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="sp-card p-4 sm:p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button type="button" class="btn-ghost !px-2 !py-1" (click)="shiftPeriod(-1)" aria-label="Periodo anterior">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-base sm:text-lg font-bold text-slate-800 min-w-[10rem] text-center capitalize">{{ periodLabel() }}</h2>
          <button type="button" class="btn-ghost !px-2 !py-1" (click)="shiftPeriod(1)" aria-label="Periodo siguiente">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="flex gap-2" role="tablist" aria-label="Vista del calendario">
          <button type="button" role="tab"
            class="sp-tab"
            [class.sp-tab-active]="view() === 'week'"
            [attr.aria-selected]="view() === 'week'"
            (click)="setView('week')">
            Semana
          </button>
          <button type="button" role="tab"
            class="sp-tab"
            [class.sp-tab-active]="view() === 'month'"
            [attr.aria-selected]="view() === 'month'"
            (click)="setView('month')">
            Mes
          </button>
        </div>
        <button type="button" class="sp-btn-soft !text-xs !py-2" (click)="goToday()">Hoy</button>
      </div>

      @if (view() === 'week') {
        <div class="overflow-x-auto -mx-1 px-1">
          <div class="min-w-[640px]">
            <div class="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
              <div class="bg-slate-50"></div>
              @for (day of weekDays(); track day.date) {
                <div class="bg-slate-50 px-2 py-2 text-center"
                  [class.bg-teal-50]="day.isToday">
                  <p class="text-[10px] font-semibold uppercase text-slate-500">{{ day.dayLabel }}</p>
                  <p class="text-sm font-bold"
                    [class.text-teal-700]="day.isToday"
                    [class.text-slate-800]="!day.isToday">
                    {{ day.day }}
                  </p>
                </div>
              }

              @for (hour of hourSlots; track hour) {
                <div class="bg-white px-1 py-2 text-[10px] text-slate-400 text-right font-mono border-t border-slate-100">
                  {{ hour }}:00
                </div>
                @for (day of weekDays(); track day.date) {
                  <div class="bg-white min-h-[3rem] relative border-t border-slate-100"
                    [class.bg-teal-50/30]="day.isToday">
                    @for (evt of eventsForCell(day.date, hour); track evt.id) {
                      <button type="button"
                        class="absolute inset-x-0.5 rounded-lg px-1.5 py-1 text-left text-[10px] leading-tight text-white shadow-sm overflow-hidden z-10 hover:brightness-110 transition-all"
                        [style.top.px]="eventTop(evt, hour)"
                        [style.height.px]="eventHeight(evt)"
                        [style.background]="eventColor(evt.courseId)"
                        (click)="selectEvent(evt)">
                        <span class="font-bold block truncate">{{ evt.courseName }}</span>
                        <span class="opacity-90">{{ evt.timeStart }}-{{ evt.timeEnd }}</span>
                      </button>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-7 gap-1 mb-2">
          @for (d of weekDayLabels; track d) {
            <div class="text-center text-xs font-semibold text-slate-500 py-1">{{ d }}</div>
          }
        </div>
        <div class="grid grid-cols-7 gap-1">
          @for (day of monthDays(); track day.date) {
            <div class="min-h-[5.5rem] sm:min-h-[6.5rem] border rounded-xl p-1.5 transition-colors"
              [class.border-teal-300]="day.isToday"
              [class.bg-teal-50/50]="day.isToday"
              [class.border-slate-100]="!day.isToday"
              [class.bg-slate-50/80]="!day.currentMonth && !day.isToday">
              <p class="text-xs font-semibold mb-1"
                [class.text-teal-700]="day.isToday"
                [class.text-slate-400]="!day.currentMonth && !day.isToday"
                [class.text-slate-600]="day.currentMonth && !day.isToday">
                {{ day.day }}
              </p>
              @for (evt of eventsForDate(day.date).slice(0, 2); track evt.id) {
                <button type="button"
                  class="w-full text-left text-[10px] px-1.5 py-1 rounded-lg text-white truncate mb-0.5 hover:brightness-110"
                  [style.background]="eventColor(evt.courseId)"
                  [title]="evt.courseName + ' · ' + evt.timeStart"
                  (click)="selectEvent(evt)">
                  {{ evt.timeStart }} {{ evt.courseName }}
                </button>
              }
              @if (eventsForDate(day.date).length > 2) {
                <p class="text-[10px] text-slate-400 px-1">+{{ eventsForDate(day.date).length - 2 }} más</p>
              }
            </div>
          }
        </div>
      }

      <p class="text-xs text-slate-500">
        {{ periodEvents().length }} clase{{ periodEvents().length === 1 ? '' : 's' }} en este periodo
      </p>
    </div>

    @if (selected(); as evt) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
        role="dialog" aria-modal="true" aria-labelledby="class-dialog-title"
        (click)="selected.set(null)" (keydown.escape)="selected.set(null)">
        <div class="sp-card p-5 sm:p-6 w-full max-w-md space-y-3" (click)="$event.stopPropagation()">
          <h2 id="class-dialog-title" class="text-lg font-bold text-slate-900">{{ evt.courseName }}</h2>
          <p class="text-sm text-slate-600">{{ evt.dayLabel }}, {{ formatDisplayDate(evt.date) }}</p>
          <p class="text-xl font-bold text-brand">{{ evt.timeStart }} – {{ evt.timeEnd }}</p>
          <dl class="grid grid-cols-1 gap-2 text-sm">
            <div><dt class="text-slate-500">Sede</dt><dd class="font-medium">{{ evt.campus }}</dd></div>
            <div><dt class="text-slate-500">Ambiente</dt><dd class="font-medium">{{ evt.environment }}</dd></div>
            <div><dt class="text-slate-500">Profesor</dt><dd class="font-medium">{{ evt.teacher }}</dd></div>
          </dl>
          @if (evt.type === 'important') {
            <span class="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">Importante</span>
          }
          <div class="flex gap-2 pt-2">
            <a [routerLink]="['/portal-alumno/cursos', evt.courseId]"
              class="btn-primary flex-1 text-center"
              (click)="selected.set(null)">
              Ver curso
            </a>
            <button type="button" class="btn-secondary" (click)="selected.set(null)">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    class: 'block',
    '(document:keydown.escape)': 'selected.set(null)',
  },
})
export class StudentScheduleCalendarComponent {
  readonly events = input<StudentScheduleEvent[]>([]);
  readonly viewChange = output<CalendarView>();
  readonly periodChange = output<string>();

  protected readonly view = signal<CalendarView>('week');
  protected readonly anchorDate = signal(formatLocalDate(new Date()));
  protected readonly selected = signal<StudentScheduleEvent | null>(null);

  protected readonly weekDayLabels = SCHEDULE_WEEK_DAYS;
  protected readonly hourSlots = HOUR_SLOTS;

  protected readonly weekDays = computed((): ScheduleCalendarDay[] => {
    const start = startOfWeek(parseLocalDate(this.anchorDate()));
    const today = formatLocalDate(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const date = formatLocalDate(d);
      return {
        date,
        day: d.getDate(),
        dayLabel: SCHEDULE_WEEK_DAYS[i],
        currentMonth: true,
        isToday: date === today,
      };
    });
  });

  protected readonly monthDays = computed((): (ScheduleCalendarDay & { events: StudentScheduleEvent[] })[] => {
    const anchor = parseLocalDate(this.anchorDate());
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    const gridStart = startOfWeek(monthStart);
    const today = formatLocalDate(new Date());
    const days: (ScheduleCalendarDay & { events: StudentScheduleEvent[] })[] = [];

    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const date = formatLocalDate(d);
      days.push({
        date,
        day: d.getDate(),
        dayLabel: SCHEDULE_WEEK_DAYS[(d.getDay() + 6) % 7],
        currentMonth: d.getMonth() === anchor.getMonth(),
        isToday: date === today,
        events: [],
      });
    }
    return days;
  });

  protected readonly periodLabel = computed(() => {
    const anchor = parseLocalDate(this.anchorDate());
    if (this.view() === 'week') {
      const start = startOfWeek(anchor);
      const end = endOfWeek(anchor);
      const startMonth = SCHEDULE_MONTH_NAMES[start.getMonth()];
      const endMonth = SCHEDULE_MONTH_NAMES[end.getMonth()];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} – ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }
    return `${SCHEDULE_MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
  });

  protected readonly periodEvents = computed(() => {
    const anchor = parseLocalDate(this.anchorDate());
    if (this.view() === 'week') {
      const start = formatLocalDate(startOfWeek(anchor));
      const end = formatLocalDate(endOfWeek(anchor));
      return this.events().filter(e => e.date >= start && e.date <= end);
    }
    const start = formatLocalDate(startOfMonth(anchor));
    const end = formatLocalDate(endOfMonth(anchor));
    return this.events().filter(e => e.date >= start && e.date <= end);
  });

  protected setView(view: CalendarView): void {
    this.view.set(view);
    this.viewChange.emit(view);
    this.emitPeriod();
  }

  protected shiftPeriod(direction: number): void {
    const anchor = parseLocalDate(this.anchorDate());
    const next = this.view() === 'week'
      ? addDays(anchor, direction * 7)
      : new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
    this.anchorDate.set(formatLocalDate(next));
    this.emitPeriod();
  }

  protected goToday(): void {
    this.anchorDate.set(formatLocalDate(new Date()));
    this.emitPeriod();
  }

  protected eventsForDate(date: string): StudentScheduleEvent[] {
    return this.events().filter(e => e.date === date);
  }

  protected eventsForCell(date: string, hour: number): StudentScheduleEvent[] {
    return this.events().filter(e => {
      if (e.date !== date) return false;
      const startH = Math.floor(timeToMinutes(e.timeStart) / 60);
      return startH === hour;
    });
  }

  protected eventTop(evt: StudentScheduleEvent, hour: number): number {
    const minutes = timeToMinutes(evt.timeStart) - hour * 60;
    return Math.max(2, (minutes / 60) * 48);
  }

  protected eventHeight(evt: StudentScheduleEvent): number {
    const duration = timeToMinutes(evt.timeEnd) - timeToMinutes(evt.timeStart);
    return Math.max(28, (duration / 60) * 48 - 4);
  }

  protected eventColor(courseId: number): string {
    const colors: Record<number, string> = {
      2: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
      6: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      1: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    };
    return colors[courseId] ?? 'linear-gradient(135deg, #1A3263, #0d9488)';
  }

  protected selectEvent(evt: StudentScheduleEvent): void {
    this.selected.set(evt);
  }

  protected formatDisplayDate(date: string): string {
    const d = parseLocalDate(date);
    return `${d.getDate()} ${SCHEDULE_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  private emitPeriod(): void {
    this.periodChange.emit(this.anchorDate());
  }
}
