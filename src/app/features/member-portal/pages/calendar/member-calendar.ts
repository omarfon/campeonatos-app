import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemberCalendarService } from '../../services/member-calendar.service';
import { ParticipantContextService } from '../../services/participant-context.service';
import { MemberCalendarEvent, MemberCalendarFilters } from '../../models/member-portal.model';
import { MemberCalendarEventType } from '../../enums/member-calendar-event-type.enum';
import { MemberFamilyCalendarComponent } from '../../components/member-family-calendar/member-family-calendar';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MOCK_PARTICIPANTS } from '../../mocks/member-portal.mock';
import {
  MEMBER_PARTICIPANT_COLORS,
  MEMBER_EVENT_TYPE_COLOR,
} from '../../mocks/member-calendar.mock';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';
import { formatLocalDate } from '../../../student-portal/utils/schedule-calendar.utils';

@Component({
  selector: 'app-member-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberFamilyCalendarComponent, MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="mp-page-title">Calendario Familiar</h1>
          <p class="mp-page-subtitle">Actividades y eventos de todos los integrantes de tu familia.</p>
        </div>
        <a [routerLink]="activitiesRoute" class="btn-secondary text-center shrink-0 self-start sm:self-center !text-sm">
          Inscribir actividad
        </a>
      </header>

      <section class="space-y-4" aria-labelledby="filtros-calendario">
        <h2 id="filtros-calendario" class="sr-only">Filtros del calendario</h2>

        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por integrante">
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="participantFilter() === 'all'"
            [attr.aria-selected]="participantFilter() === 'all'"
            (click)="setParticipantFilter('all')">Todos</button>
          @for (p of participants(); track p.personId) {
            <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
              [class.!bg-amber-100]="participantFilter() === p.personId"
              [attr.aria-selected]="participantFilter() === p.personId"
              (click)="setParticipantFilter(p.personId)">{{ p.firstName }}</button>
          }
        </div>

        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por tipo">
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="typeFilter() === 'all'"
            [attr.aria-selected]="typeFilter() === 'all'"
            (click)="setTypeFilter('all')">Todos</button>
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="typeFilter() === typeActivity"
            [attr.aria-selected]="typeFilter() === typeActivity"
            (click)="setTypeFilter(typeActivity)">Actividades</button>
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="typeFilter() === typeEvent"
            [attr.aria-selected]="typeFilter() === typeEvent"
            (click)="setTypeFilter(typeEvent)">Eventos</button>
        </div>

        <div class="mp-card p-4 flex flex-wrap gap-3" aria-label="Leyenda de colores">
          <p class="text-xs font-bold text-slate-600 w-full sm:w-auto sm:mr-2">Leyenda:</p>
          @for (p of participants(); track p.personId) {
            <span class="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span class="w-3 h-3 rounded-full shrink-0" [style.background]="participantColor(p.personId)" aria-hidden="true"></span>
              {{ p.firstName }}
            </span>
          }
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span class="w-3 h-3 rounded-full shrink-0" [style.background]="eventColor" aria-hidden="true"></span>
            Eventos
          </span>
        </div>
      </section>

      @if (loading()) {
        <div class="mp-card p-6 space-y-4 animate-pulse">
          <div class="h-8 bg-slate-200/80 rounded-xl w-48 mx-auto"></div>
          <div class="grid grid-cols-7 gap-2">
            @for (i of [1,2,3,4,5,6,7]; track i) {
              <div class="h-24 bg-slate-200/80 rounded-xl"></div>
            }
          </div>
        </div>
      } @else if (events().length === 0) {
        <app-member-empty-state
          title="Sin eventos en este periodo"
          description="No hay actividades ni eventos con los filtros seleccionados."
          icon="📅"
          actionLabel="Explorar actividades"
          (actionClick)="navigateActivities()"
        />
      } @else {
        <app-member-family-calendar
          [events]="events()"
          (viewChange)="onViewChange($event)"
          (periodChange)="onPeriodChange($event)" />
      }
    </div>
  `,
})
export class MemberCalendarPageComponent implements OnInit {
  private readonly calendarService = inject(MemberCalendarService);
  private readonly participantService = inject(ParticipantContextService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly events = signal<MemberCalendarEvent[]>([]);
  protected readonly participantFilter = signal<number | 'all'>('all');
  protected readonly typeFilter = signal<MemberCalendarFilters['eventType']>('all');
  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;
  protected readonly typeActivity = MemberCalendarEventType.ACTIVITY;
  protected readonly typeEvent = MemberCalendarEventType.EVENT;
  protected readonly eventColor = MEMBER_EVENT_TYPE_COLOR;

  private view: 'week' | 'month' = 'week';
  private anchorDate = formatLocalDate(new Date());

  protected readonly participants = computed(() =>
    MOCK_PARTICIPANTS.map(p => ({
      personId: p.personId,
      firstName: p.fullName.split(' ')[0],
    })),
  );

  ngOnInit(): void {
    this.participantService.loadAuthorizedParticipants().subscribe();
    this.load();
  }

  protected setParticipantFilter(value: number | 'all'): void {
    this.participantFilter.set(value);
    this.load();
  }

  protected setTypeFilter(value: MemberCalendarFilters['eventType']): void {
    this.typeFilter.set(value);
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

  protected participantColor(personId: number): string {
    return MEMBER_PARTICIPANT_COLORS[personId] ?? 'linear-gradient(135deg, #1A3263, #0d9488)';
  }

  protected navigateActivities(): void {
    void this.router.navigate([this.activitiesRoute]);
  }

  private load(): void {
    this.loading.set(true);
    const filters: MemberCalendarFilters = {
      participantPersonId: this.participantFilter(),
      eventType: this.typeFilter(),
    };
    const request$ = this.view === 'week'
      ? this.calendarService.getWeeklyEvents(this.anchorDate, filters)
      : this.calendarService.getMonthlyEvents(this.anchorDate, filters);

    request$.subscribe({
      next: list => { this.events.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
