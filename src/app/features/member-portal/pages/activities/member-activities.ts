import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberActivitiesService } from '../../services/member-activities.service';
import { ParticipantContextService } from '../../services/participant-context.service';
import { MemberActivity, MemberActivityFilters } from '../../models/member-portal.model';
import { MemberActivityCardComponent } from '../../components/member-activity-card/member-activity-card';
import { ParticipantSelectorComponent } from '../../components/participant-selector/participant-selector';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';
import { MOCK_MEMBER_ACTIVITIES } from '../../mocks/member-activities.mock';
import { MemberScheduleAvailability } from '../../enums/member-schedule-availability.enum';

@Component({
  selector: 'app-member-activities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, MemberActivityCardComponent, ParticipantSelectorComponent, MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="mp-page-title">Actividades</h1>
          <p class="mp-page-subtitle">Explora el catálogo e inscribe a un integrante de tu familia.</p>
        </div>
        <a [routerLink]="myActivitiesRoute" class="btn-secondary text-center shrink-0 self-start sm:self-center">
          Mis actividades
        </a>
      </header>

      <app-participant-selector label="¿Para quién deseas inscribir?" />

      <section class="space-y-4" aria-labelledby="filtros-actividades">
        <h2 id="filtros-actividades" class="sr-only">Filtros de actividades</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label for="filter-search" class="block text-xs font-semibold text-slate-600 mb-1">Buscar</label>
            <input id="filter-search" type="search" class="input-modern w-full !py-2.5"
              [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); load()" placeholder="Natación, karate..." />
          </div>
          <div>
            <label for="filter-discipline" class="block text-xs font-semibold text-slate-600 mb-1">Disciplina</label>
            <select id="filter-discipline" class="input-modern w-full !py-2.5"
              [ngModel]="disciplineFilter()" (ngModelChange)="disciplineFilter.set($event); load()">
              <option value="all">Todas</option>
              @for (d of disciplines(); track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-modality" class="block text-xs font-semibold text-slate-600 mb-1">Modalidad</label>
            <select id="filter-modality" class="input-modern w-full !py-2.5"
              [ngModel]="modalityFilter()" (ngModelChange)="modalityFilter.set($event); load()">
              <option value="all">Todas</option>
              @for (m of modalities(); track m) {
                <option [value]="m">{{ m }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-availability" class="block text-xs font-semibold text-slate-600 mb-1">Disponibilidad</label>
            <select id="filter-availability" class="input-modern w-full !py-2.5"
              [ngModel]="availabilityFilter()" (ngModelChange)="availabilityFilter.set($event); load()">
              <option value="all">Todas</option>
              <option [value]="availAvailable">Con cupos</option>
              <option [value]="availLastSpots">Últimos cupos</option>
            </select>
          </div>
        </div>
        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoría">
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="categoryFilter() === 'all'"
            (click)="categoryFilter.set('all'); load()">Todas</button>
          @for (c of categories(); track c) {
            <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
              [class.!bg-amber-100]="categoryFilter() === c"
              (click)="categoryFilter.set(c); load()">{{ c }}</button>
          }
        </div>
      </section>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="h-72 bg-slate-200/80 rounded-3xl"></div>
          }
        </div>
      } @else if (activities().length === 0) {
        <app-member-empty-state
          title="Sin actividades"
          description="No encontramos actividades con los filtros seleccionados."
          icon="🏊"
          actionLabel="Limpiar filtros"
          (actionClick)="clearFilters()"
        />
      } @else {
        <p class="text-sm text-slate-500">{{ activities().length }} actividad{{ activities().length === 1 ? '' : 'es' }} encontrada{{ activities().length === 1 ? '' : 's' }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (a of activities(); track a.id) {
            <app-member-activity-card [activity]="a" />
          }
        </div>
      }
    </div>
  `,
})
export class MemberActivitiesPageComponent implements OnInit {
  private readonly activitiesService = inject(MemberActivitiesService);
  private readonly participantService = inject(ParticipantContextService);

  protected readonly loading = signal(true);
  protected readonly activities = signal<MemberActivity[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly disciplineFilter = signal('all');
  protected readonly categoryFilter = signal('all');
  protected readonly modalityFilter = signal('all');
  protected readonly availabilityFilter = signal<string>('all');
  protected readonly myActivitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/mis-actividades`;
  protected readonly availAvailable = MemberScheduleAvailability.AVAILABLE;
  protected readonly availLastSpots = MemberScheduleAvailability.LAST_SPOTS;

  protected readonly disciplines = computed(() =>
    [...new Set(MOCK_MEMBER_ACTIVITIES.map(a => a.discipline))].sort(),
  );
  protected readonly categories = computed(() =>
    [...new Set(MOCK_MEMBER_ACTIVITIES.map(a => a.category))].sort(),
  );
  protected readonly modalities = computed(() =>
    [...new Set(MOCK_MEMBER_ACTIVITIES.map(a => a.modality))].sort(),
  );

  ngOnInit(): void {
    this.participantService.loadAuthorizedParticipants().subscribe();
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    const filters: MemberActivityFilters = {
      query: this.searchQuery(),
      discipline: this.disciplineFilter(),
      category: this.categoryFilter(),
      modality: this.modalityFilter(),
      availability: this.availabilityFilter() as MemberActivityFilters['availability'],
    };
    this.activitiesService.getActivities(filters).subscribe({
      next: list => { this.activities.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.disciplineFilter.set('all');
    this.categoryFilter.set('all');
    this.modalityFilter.set('all');
    this.availabilityFilter.set('all');
    this.load();
  }
}
