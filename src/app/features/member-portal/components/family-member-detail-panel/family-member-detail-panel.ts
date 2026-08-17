import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FamilyMemberDetail } from '../../models/member-portal.model';
import { MemberStatusComponent } from '../member-status/member-status';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-family-member-detail-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberStatusComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex justify-end" role="presentation">
        <button type="button"
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          aria-label="Cerrar detalle del familiar"
          (click)="closed.emit()"></button>

        <aside
          class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="family-member-drawer-title"
          (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-slate-50 to-white">
            <h2 id="family-member-drawer-title" class="text-sm font-bold uppercase tracking-wide text-slate-500">
              Detalle del integrante
            </h2>
            <button type="button"
              class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Cerrar panel"
              (click)="closed.emit()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          @if (error()) {
            <div class="p-5 flex-1">
              <p class="text-sm text-slate-600" role="alert">{{ error() }}</p>
            </div>
          } @else if (member(); as m) {
            <div class="overflow-y-auto flex-1 p-5 space-y-5">
              <div class="flex items-start gap-4">
                <span class="w-14 h-14 rounded-2xl text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg"
                  style="background: linear-gradient(135deg, #1A3263, #b45309)"
                  aria-hidden="true">
                  {{ initials(m.fullName) }}
                </span>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-extrabold text-slate-900">{{ m.fullName }}</h3>
                  <p class="text-sm text-slate-600 mt-1">{{ m.relationship }} · {{ m.age }} años</p>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <app-member-status [status]="m.status" />
                    @if (m.isHolder) {
                      <span class="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                        Titular
                      </span>
                    }
                  </div>
                </div>
              </div>

              <section class="space-y-3" aria-labelledby="personal-heading">
                <h4 id="personal-heading" class="text-xs font-bold uppercase tracking-wide text-slate-500">Datos personales</h4>
                <dl class="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <dt class="text-slate-500">Nombre</dt>
                    <dd class="font-medium text-slate-800 mt-0.5">{{ m.firstName }}</dd>
                  </div>
                  <div>
                    <dt class="text-slate-500">Fecha de nacimiento</dt>
                    <dd class="font-medium text-slate-800 mt-0.5">{{ formatDate(m.birthDate) }}</dd>
                  </div>
                  <div>
                    <dt class="text-slate-500">Código de integrante</dt>
                    <dd class="font-mono font-semibold text-slate-900 mt-0.5">{{ m.memberId }}</dd>
                  </div>
                  <div>
                    <dt class="text-slate-500">Parentesco</dt>
                    <dd class="font-medium text-slate-800 mt-0.5">{{ m.relationship }}</dd>
                  </div>
                </dl>
              </section>

              <section class="space-y-3" aria-labelledby="contact-heading">
                <h4 id="contact-heading" class="text-xs font-bold uppercase tracking-wide text-slate-500">Contacto</h4>
                <dl class="grid grid-cols-1 gap-3 text-sm">
                  @if (m.email) {
                    <div>
                      <dt class="text-slate-500">Correo</dt>
                      <dd class="font-medium text-slate-800 mt-0.5 break-all">{{ m.email }}</dd>
                    </div>
                  } @else {
                    <div>
                      <dt class="text-slate-500">Correo</dt>
                      <dd class="text-slate-400 mt-0.5">No registrado</dd>
                    </div>
                  }
                  @if (m.phone) {
                    <div>
                      <dt class="text-slate-500">Teléfono</dt>
                      <dd class="font-medium text-slate-800 mt-0.5">{{ m.phone }}</dd>
                    </div>
                  } @else {
                    <div>
                      <dt class="text-slate-500">Teléfono</dt>
                      <dd class="text-slate-400 mt-0.5">No registrado</dd>
                    </div>
                  }
                  <div>
                    <dt class="text-slate-500">Documento</dt>
                    <dd class="font-medium text-slate-800 mt-0.5">{{ m.documentType }} {{ m.documentNumber }}</dd>
                  </div>
                </dl>
              </section>

              <section class="space-y-3" aria-labelledby="activities-heading">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h4 id="activities-heading" class="text-xs font-bold uppercase tracking-wide text-slate-500">Actividades</h4>
                  <span class="text-xs font-semibold text-slate-500">{{ m.activityCount }} activa(s)</span>
                </div>

                @if (m.activeActivities.length > 0) {
                  <p class="text-sm text-slate-700">
                    <span class="font-semibold text-slate-900">Resumen:</span>
                    {{ m.activeActivities.join(', ') }}
                  </p>
                }

                @if (m.activities.length === 0) {
                  <p class="text-sm text-slate-500">Sin actividades activas.</p>
                } @else {
                  <ul class="space-y-3">
                    @for (act of m.activities; track act.id) {
                      <li class="py-2 border-b border-slate-100 last:border-0">
                        <p class="font-semibold text-slate-900 text-sm">{{ act.name }}</p>
                        <p class="text-xs text-slate-500 mt-0.5">{{ act.schedule }}</p>
                        <span class="inline-block mt-1.5 text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                          [class]="activityStatusClass(act.status)">
                          {{ activityStatusLabel(act.status) }}
                        </span>
                      </li>
                    }
                  </ul>
                }

                @if (m.nextActivityLabel) {
                  <p class="text-sm text-brand font-semibold">Próxima actividad: {{ m.nextActivityLabel }}</p>
                }
              </section>

              <section class="space-y-3" aria-labelledby="events-heading">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h4 id="events-heading" class="text-xs font-bold uppercase tracking-wide text-slate-500">Eventos</h4>
                  <span class="text-xs font-semibold text-slate-500">{{ m.upcomingEventsCount }} próximo(s)</span>
                </div>

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
                }
              </section>

              <a [routerLink]="activitiesRoute"
                class="btn-primary w-full !text-sm text-center block"
                (click)="enroll.emit(m.personId)">
                Inscribir actividad
              </a>
            </div>
          }
        </aside>
      </div>
    }
  `,
})
export class FamilyMemberDetailPanelComponent {
  readonly open = input(false);
  readonly member = input<FamilyMemberDetail | null>(null);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly enroll = output<number>();

  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;

  protected initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected activityStatusLabel(status: 'active' | 'pending' | 'cancelled'): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
    }
  }

  protected activityStatusClass(status: 'active' | 'pending' | 'cancelled'): string {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-slate-100 text-slate-600';
    }
  }
}
