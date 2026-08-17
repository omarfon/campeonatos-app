import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StudentScheduleService } from '../../services/student-schedule.service';
import { StudentScheduleEvent } from '../../models/student-portal.model';
import { NextClassCardComponent } from '../../components/next-class/next-class-card';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';
import { StudentScheduleCalendarComponent } from '../../components/schedule-calendar/student-schedule-calendar';
import { formatLocalDate } from '../../utils/schedule-calendar.utils';

@Component({
  selector: 'app-student-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NextClassCardComponent, StudentEmptyStateComponent, StudentScheduleCalendarComponent],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="sp-page-title">Horarios</h1>
        <p class="sp-page-subtitle">Consulta tus clases en el calendario semanal o mensual.</p>
      </header>

      @if (nextClass()) {
        <app-next-class-card [nextClass]="nextClass()!" [compact]="true" />
      }

      @if (loading()) {
        <div class="sp-card p-6 space-y-4 animate-pulse">
          <div class="h-8 bg-slate-200/80 rounded-xl w-48 mx-auto"></div>
          <div class="grid grid-cols-7 gap-2">
            @for (i of [1,2,3,4,5,6,7]; track i) {
              <div class="h-24 bg-slate-200/80 rounded-xl"></div>
            }
          </div>
        </div>
      } @else if (events().length === 0) {
        <app-student-empty-state
          title="Sin clases programadas"
          description="No tienes clases en este periodo."
          icon="📅"
        />
      } @else {
        <app-student-schedule-calendar
          [events]="events()"
          (viewChange)="onViewChange($event)"
          (periodChange)="onPeriodChange($event)" />
      }
    </div>
  `,
})
export class StudentScheduleComponent implements OnInit {
  private readonly scheduleService = inject(StudentScheduleService);

  protected readonly events = signal<StudentScheduleEvent[]>([]);
  protected readonly nextClass = signal<import('../../models/student-portal.model').StudentClass | null>(null);
  protected readonly loading = signal(true);
  private view: 'week' | 'month' = 'week';
  private anchorDate = formatLocalDate(new Date());

  ngOnInit(): void {
    this.scheduleService.getNextClass().subscribe(c => this.nextClass.set(c ?? null));
    this.load();
  }

  protected onViewChange(view: 'week' | 'month'): void {
    this.view = view;
    this.load();
  }

  protected onPeriodChange(anchor: string): void {
    this.anchorDate = anchor;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const request$ = this.view === 'week'
      ? this.scheduleService.getWeeklySchedule(this.anchorDate)
      : this.scheduleService.getMonthlySchedule(this.anchorDate);

    request$.subscribe({
      next: list => {
        this.events.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
