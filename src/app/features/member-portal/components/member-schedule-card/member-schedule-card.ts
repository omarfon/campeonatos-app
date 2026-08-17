import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MemberActivitySchedule } from '../../models/member-portal.model';
import { MemberScheduleAvailability, MEMBER_SCHEDULE_AVAILABILITY_LABELS } from '../../enums/member-schedule-availability.enum';

@Component({
  selector: 'app-member-schedule-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (schedule(); as s) {
      <article class="mp-card p-4 sm:p-5 transition-all"
        [class.ring-2]="selected()"
        [class.ring-amber-500]="selected()"
        [class.opacity-60]="s.availability === fullStatus">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900">{{ s.days }}</h3>
            <p class="text-sm font-semibold text-brand mt-0.5">{{ s.timeStart }} – {{ s.timeEnd }}</p>
            <p class="text-sm text-slate-600 mt-2">{{ s.venue }}</p>
            <p class="text-xs text-slate-500 mt-1">Profesor: {{ s.teacher }}</p>
          </div>
          <span class="text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0" [class]="availabilityClass(s.availability)">
            {{ availabilityLabel(s.availability) }}
          </span>
        </div>
        <p class="text-sm text-slate-600 mt-3">
          @if (s.availability === fullStatus) {
            Sin cupos disponibles
          } @else {
            {{ s.availableSpots }} cupo{{ s.availableSpots === 1 ? '' : 's' }} disponible{{ s.availableSpots === 1 ? '' : 's' }}
          }
        </p>
        @if (selectable() && s.availability !== fullStatus) {
          <button type="button"
            class="w-full mt-4 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
            [class]="selected()
              ? 'text-white shadow-md'
              : 'bg-slate-100 text-slate-800 hover:bg-amber-50 hover:text-amber-900'"
            [style.background]="selected() ? 'linear-gradient(135deg, #1A3263, #b45309)' : null"
            [attr.aria-pressed]="selected()"
            (click)="scheduleSelect.emit(s)">
            @if (selected()) { ✓ Seleccionado } @else { Seleccionar }
          </button>
        }
      </article>
    }
  `,
})
export class MemberScheduleCardComponent {
  readonly schedule = input.required<MemberActivitySchedule>();
  readonly selected = input(false);
  readonly selectable = input(true);
  readonly scheduleSelect = output<MemberActivitySchedule>();

  protected readonly fullStatus = MemberScheduleAvailability.FULL;

  protected availabilityLabel(status: MemberScheduleAvailability): string {
    return MEMBER_SCHEDULE_AVAILABILITY_LABELS[status];
  }

  protected availabilityClass(status: MemberScheduleAvailability): string {
    switch (status) {
      case MemberScheduleAvailability.AVAILABLE: return 'bg-emerald-100 text-emerald-800';
      case MemberScheduleAvailability.LAST_SPOTS: return 'bg-amber-100 text-amber-800';
      case MemberScheduleAvailability.FULL: return 'bg-slate-100 text-slate-600';
    }
  }
}
