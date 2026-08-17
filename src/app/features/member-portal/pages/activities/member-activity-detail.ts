import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberActivitiesService } from '../../services/member-activities.service';
import { ParticipantContextService } from '../../services/participant-context.service';
import { MemberActivity, MemberActivitySchedule, ParticipantContext } from '../../models/member-portal.model';
import { MemberScheduleCardComponent } from '../../components/member-schedule-card/member-schedule-card';
import { ParticipantSelectorComponent } from '../../components/participant-selector/participant-selector';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-activity-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberScheduleCardComponent, ParticipantSelectorComponent],
  template: `
    @if (loading()) {
      <div class="space-y-4 animate-pulse">
        <div class="h-8 bg-slate-200/80 rounded-xl w-64"></div>
        <div class="h-40 bg-slate-200/80 rounded-3xl"></div>
      </div>
    } @else if (activity(); as a) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500">
          <a [routerLink]="activitiesRoute" class="hover:text-brand">Actividades</a>
          <span class="mx-2">/</span>
          <span class="text-slate-800 font-medium">{{ a.name }}</span>
        </nav>

        <header class="mp-card p-5 sm:p-6">
          <p class="text-xs font-bold uppercase tracking-wide text-amber-700">{{ a.discipline }}</p>
          <h1 class="text-2xl font-extrabold text-slate-900 mt-1">{{ a.name }}</h1>
          <p class="text-sm text-slate-600 mt-2">{{ a.description }}</p>
          <dl class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><dt class="text-slate-400">Nivel</dt><dd class="font-semibold">{{ a.level }}</dd></div>
            <div><dt class="text-slate-400">Modalidad</dt><dd class="font-semibold">{{ a.modality }}</dd></div>
            <div><dt class="text-slate-400">Sede</dt><dd class="font-semibold">{{ a.campus }}</dd></div>
            <div><dt class="text-slate-400">Desde</dt><dd class="font-bold text-slate-900">S/ {{ a.basePrice.toFixed(2) }}</dd></div>
          </dl>
        </header>

        <app-participant-selector label="¿Para quién es la inscripción?"
          (participantSelected)="onParticipantSelected($event)" />

        <section class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Horarios disponibles</h2>
          @if (schedulesLoading()) {
            <div class="space-y-3 animate-pulse">
              @for (i of [1,2,3]; track i) {
                <div class="h-32 bg-slate-200/80 rounded-2xl"></div>
              }
            </div>
          } @else if (schedules().length === 0) {
            <p class="text-sm text-slate-500">No hay horarios publicados para esta actividad.</p>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (s of schedules(); track s.id) {
                <app-member-schedule-card [schedule]="s" [selectable]="false" />
              }
            </div>
          }
        </section>

        <div class="flex flex-wrap gap-3">
          <a [routerLink]="activitiesRoute" class="btn-secondary">Volver al catálogo</a>
          @if (selectedParticipant()) {
            <a [routerLink]="enrollRoute" [queryParams]="enrollQueryParams()"
              class="btn-primary !text-sm">
              Iniciar inscripción
            </a>
          } @else {
            <p class="text-sm text-amber-700 self-center">Selecciona un participante para continuar.</p>
          }
        </div>
      </div>
    } @else if (error()) {
      <div class="mp-card p-10 text-center space-y-4">
        <p class="text-slate-600">{{ error() }}</p>
        <a [routerLink]="activitiesRoute" class="btn-primary inline-block">Volver al catálogo</a>
      </div>
    }
  `,
})
export class MemberActivityDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly activitiesService = inject(MemberActivitiesService);
  private readonly participantService = inject(ParticipantContextService);

  protected readonly loading = signal(true);
  protected readonly schedulesLoading = signal(false);
  protected readonly activity = signal<MemberActivity | null>(null);
  protected readonly schedules = signal<MemberActivitySchedule[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedParticipant = this.participantService.selectedParticipant;

  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;
  protected readonly enrollRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades/inscribir`;

  ngOnInit(): void {
    this.participantService.loadAuthorizedParticipants().subscribe();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error.set('Actividad no válida.');
      this.loading.set(false);
      return;
    }
    this.activitiesService.getActivity(id).subscribe({
      next: act => {
        if (!act) {
          this.error.set('No encontramos esta actividad.');
          this.loading.set(false);
          return;
        }
        this.activity.set(act);
        this.loading.set(false);
        this.loadSchedules(act.id);
      },
      error: () => {
        this.error.set('No pudimos cargar la actividad.');
        this.loading.set(false);
      },
    });
  }

  protected enrollQueryParams(): Record<string, number> {
    const params: Record<string, number> = { actividad: this.activity()!.id };
    const p = this.selectedParticipant();
    if (p) params['participante'] = p.personId;
    return params;
  }

  protected onParticipantSelected(_participant: ParticipantContext): void {
    const act = this.activity();
    if (act) this.loadSchedules(act.id);
  }

  private loadSchedules(activityId: number): void {
    this.schedulesLoading.set(true);
    const personId = this.selectedParticipant()?.personId;
    this.activitiesService.getSchedules(activityId, personId).subscribe({
      next: list => { this.schedules.set(list); this.schedulesLoading.set(false); },
      error: () => this.schedulesLoading.set(false),
    });
  }
}
