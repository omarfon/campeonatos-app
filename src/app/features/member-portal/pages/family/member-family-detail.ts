import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberFamilyFacade } from '../../facades/member-family.facade';
import { ParticipantContextService } from '../../services/participant-context.service';
import { FamilyMemberDetail } from '../../models/member-portal.model';
import { MemberStatusComponent } from '../../components/member-status/member-status';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-family-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberStatusComponent],
  template: `
    @if (loading()) {
      <div class="space-y-4 animate-pulse">
        <div class="h-8 bg-slate-200/80 rounded-xl w-64"></div>
        <div class="h-48 bg-slate-200/80 rounded-3xl"></div>
      </div>
    } @else if (member(); as m) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500" aria-label="Ruta de navegación">
          <a [routerLink]="familyRoute" class="hover:text-brand">Mi Familia</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <span class="text-slate-800 font-medium">{{ m.fullName }}</span>
        </nav>

        <header class="mp-card p-5 sm:p-6">
          <div class="flex flex-wrap items-start gap-4">
            <span class="w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-lg"
              style="background: linear-gradient(135deg, #1A3263, #b45309)"
              aria-hidden="true">
              {{ initials() }}
            </span>
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-extrabold text-slate-900">{{ m.fullName }}</h1>
              <p class="text-slate-600 mt-1">{{ m.relationship }} · {{ m.age }} años</p>
              <div class="mt-3">
                <app-member-status [status]="m.status" />
              </div>
            </div>
          </div>
        </header>

        @if (m.email || m.phone) {
          <section class="mp-card p-5 sm:p-6 space-y-3">
            <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Contacto</h2>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              @if (m.email) {
                <div>
                  <dt class="text-slate-500">Correo</dt>
                  <dd class="font-medium text-slate-800 mt-0.5">{{ m.email }}</dd>
                </div>
              }
              @if (m.phone) {
                <div>
                  <dt class="text-slate-500">Teléfono</dt>
                  <dd class="font-medium text-slate-800 mt-0.5">{{ m.phone }}</dd>
                </div>
              }
              <div>
                <dt class="text-slate-500">Documento</dt>
                <dd class="font-medium text-slate-800 mt-0.5">{{ m.documentType }} {{ m.documentNumber }}</dd>
              </div>
            </dl>
          </section>
        }

        <section class="mp-card p-5 sm:p-6 space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Actividades</h2>
          @if (m.activities.length === 0) {
            <p class="text-sm text-slate-500">Sin actividades activas.</p>
          } @else {
            <ul class="space-y-3">
              @for (act of m.activities; track act.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p class="font-semibold text-slate-900">{{ act.name }}</p>
                    <p class="text-sm text-slate-500">{{ act.schedule }}</p>
                  </div>
                  <span class="text-xs font-bold uppercase px-2 py-1 rounded-full"
                    [class]="act.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                    {{ act.status === 'active' ? 'Activa' : act.status === 'pending' ? 'Pendiente' : 'Cancelada' }}
                  </span>
                </li>
              }
            </ul>
          }
          @if (m.nextActivityLabel) {
            <p class="text-sm text-brand font-semibold">Próxima actividad: {{ m.nextActivityLabel }}</p>
          }
        </section>

        <section class="mp-card p-5 sm:p-6 space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Eventos</h2>
          @if (m.upcomingEvents.length === 0) {
            <p class="text-sm text-slate-500">Sin eventos próximos.</p>
          } @else {
            <ul class="space-y-2">
              @for (evt of m.upcomingEvents; track evt.id) {
                <li class="flex justify-between gap-2 text-sm py-2 border-b border-slate-100 last:border-0">
                  <span class="font-medium text-slate-900">{{ evt.name }}</span>
                  <span class="text-slate-500 shrink-0">{{ evt.dateLabel }}</span>
                </li>
              }
            </ul>
            <p class="text-xs text-slate-500">{{ m.upcomingEventsCount }} evento(s) próximo(s)</p>
          }
        </section>

        <div class="flex flex-wrap gap-3">
          <a [routerLink]="familyRoute" class="btn-secondary">Volver a Mi Familia</a>
          <a [routerLink]="activitiesRoute" class="btn-primary !text-sm"
            (click)="selectForEnrollment(m.personId)">
            Inscribir actividad
          </a>
        </div>
      </div>
    } @else if (error()) {
      <div class="mp-card p-10 text-center space-y-4">
        <p class="text-slate-600">{{ error() }}</p>
        <a [routerLink]="familyRoute" class="btn-primary inline-block">Volver a Mi Familia</a>
      </div>
    }
  `,
})
export class MemberFamilyDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MemberFamilyFacade);
  private readonly participantService = inject(ParticipantContextService);

  protected readonly loading = signal(true);
  protected readonly member = signal<FamilyMemberDetail | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly familyRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/familia`;
  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;

  ngOnInit(): void {
    const personId = Number(this.route.snapshot.paramMap.get('personId'));
    if (!personId || Number.isNaN(personId)) {
      this.error.set('Integrante no válido.');
      this.loading.set(false);
      return;
    }
    this.facade.loadMemberDetail(personId).subscribe({
      next: m => { this.member.set(m); this.loading.set(false); },
      error: (err: Error) => {
        this.error.set(err.message ?? 'No pudimos cargar el detalle del familiar.');
        this.loading.set(false);
      },
    });
  }

  protected initials(): string {
    const name = this.member()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  protected selectForEnrollment(personId: number): void {
    try {
      this.participantService.selectParticipantById(personId);
    } catch {
      // La página de actividades usará el contexto en fase 5
    }
  }
}
