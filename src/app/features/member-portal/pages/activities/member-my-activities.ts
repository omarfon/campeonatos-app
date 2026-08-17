import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemberActivitiesService } from '../../services/member-activities.service';
import { MemberActivityEnrollment } from '../../models/member-portal.model';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';
import { MOCK_PARTICIPANTS } from '../../mocks/member-portal.mock';

@Component({
  selector: 'app-member-my-activities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="mp-page-title">Mis Actividades</h1>
          <p class="mp-page-subtitle">Actividades activas de tu grupo familiar.</p>
        </div>
        <a [routerLink]="activitiesRoute" class="btn-primary text-center shrink-0 self-start sm:self-center !text-sm">
          Inscribir actividad
        </a>
      </header>

      <div class="space-y-2" role="tablist" aria-label="Filtrar por integrante">
        <button type="button" role="tab"
          class="mp-btn-soft !text-[11px] !py-1 !px-2.5 !rounded-lg"
          [class.!bg-amber-100]="participantFilter() === 'all'"
          [attr.aria-selected]="participantFilter() === 'all'"
          (click)="setFilter('all')">Todos</button>
        <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
          @for (p of participants(); track p.personId) {
            <button type="button" role="tab"
              class="mp-btn-soft !py-1.5 !px-1.5 !rounded-lg min-w-0 text-center"
              [class.!bg-amber-100]="participantFilter() === p.personId"
              [attr.aria-selected]="participantFilter() === p.personId"
              [attr.aria-label]="'Filtrar por ' + p.fullName + ', ' + p.relationship"
              (click)="setFilter(p.personId)">
              <span class="block text-[10px] sm:text-[11px] font-semibold text-slate-900 leading-tight truncate">{{ p.firstName }}</span>
              <span class="block text-[9px] sm:text-[10px] text-slate-500 leading-tight truncate mt-0.5">{{ p.relationship }}</span>
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1,2,3]; track i) {
            <div class="h-28 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      } @else if (enrollments().length === 0) {
        <app-member-empty-state
          title="Sin actividades inscritas"
          [description]="emptyDescription()"
          icon="📋"
          actionLabel="Explorar actividades"
          (actionClick)="navigateActivities()"
        />
      } @else {
        <div class="space-y-3">
          @for (e of enrollments(); track e.id) {
            <article class="mp-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-mono text-slate-500">{{ e.code }}</p>
                  <h2 class="font-bold text-slate-900 mt-0.5">{{ e.participantName }}</h2>
                  <p class="text-sm font-semibold text-brand mt-1">{{ e.activityName }}</p>
                  <p class="text-sm text-slate-600 mt-2">{{ e.days }} · {{ e.timeStart }} – {{ e.timeEnd }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ e.venue }} · {{ e.period }}</p>
                </div>
                <span class="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
                  [class]="e.status === 'active' ? 'bg-emerald-100 text-emerald-800' : e.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'">
                  {{ statusLabel(e.status) }}
                </span>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class MemberMyActivitiesPageComponent implements OnInit {
  private readonly activitiesService = inject(MemberActivitiesService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly enrollments = signal<MemberActivityEnrollment[]>([]);
  protected readonly participantFilter = signal<number | 'all'>('all');
  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;

  protected readonly participants = computed(() =>
    MOCK_PARTICIPANTS.map(p => ({
      personId: p.personId,
      fullName: p.fullName,
      firstName: p.fullName.split(' ')[0],
      relationship: p.relationship,
    })),
  );

  ngOnInit(): void {
    this.load();
  }

  protected setFilter(value: number | 'all'): void {
    this.participantFilter.set(value);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    const filter = this.participantFilter();
    this.activitiesService.getMyEnrollments(filter).subscribe({
      next: list => { this.enrollments.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected statusLabel(status: MemberActivityEnrollment['status']): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
    }
  }

  protected emptyDescription(): string {
    const f = this.participantFilter();
    if (f === 'all') return 'Aún no hay actividades inscritas en tu familia.';
    const name = this.participants().find(p => p.personId === f)?.fullName ?? 'este integrante';
    return `No encontramos actividades activas para ${name}.`;
  }

  protected navigateActivities(): void {
    void this.router.navigate([this.activitiesRoute]);
  }
}
