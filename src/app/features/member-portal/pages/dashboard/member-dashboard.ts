import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberDashboardService } from '../../services/member-dashboard.service';
import { MemberDashboard } from '../../models/member-portal.model';
import { MemberAccountStatus, MEMBER_ACCOUNT_STATUS_LABELS } from '../../enums/member-status.enum';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <div class="space-y-6 animate-pulse">
        <div class="h-10 bg-slate-200/80 rounded-2xl w-72"></div>
        <div class="h-40 bg-slate-200/80 rounded-3xl"></div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="h-28 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      </div>
    } @else if (data(); as d) {
      <div class="space-y-8">
        <header class="relative z-10 rounded-2xl overflow-hidden px-5 py-5 sm:py-6 shadow-lg"
          style="background: linear-gradient(135deg, #1A3263 0%, #2d4a7c 50%, #b45309 100%)">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {{ d.greeting }}, {{ d.profile.firstName }}
              </h1>
              <p class="text-sm text-white/80 mt-1 font-mono">Socio {{ d.profile.code }}</p>
            </div>
            <span [class]="statusClass(d.profile.status)">{{ statusLabel(d.profile.status) }}</span>
          </div>
        </header>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <a [routerLink]="familyRoute" class="mp-stat group">
            <div class="mp-stat-icon bg-violet-100 text-violet-600">👨‍👩‍👧</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Familia</p>
            <p class="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">{{ d.stats.familyCount }}</p>
            <p class="text-xs text-slate-400 mt-0.5">integrantes</p>
          </a>
          <a [routerLink]="activitiesRoute" class="mp-stat group">
            <div class="mp-stat-icon bg-sky-100 text-sky-600">🏊</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actividades</p>
            <p class="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">{{ d.stats.activeActivities }}</p>
            <p class="text-xs text-slate-400 mt-0.5">activas</p>
          </a>
          <a [routerLink]="paymentsRoute" class="mp-stat group">
            <div class="mp-stat-icon" [class]="d.stats.pendingAmount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'">💳</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pagos pendientes</p>
            <p class="text-xl font-bold mt-1" [class]="d.stats.pendingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'">
              @if (d.stats.pendingAmount > 0) {
                S/ {{ d.stats.pendingAmount.toFixed(2) }}
              } @else {
                Al día
              }
            </p>
          </a>
        </div>

        @if (d.nextActivity; as act) {
          <section class="mp-card p-5 sm:p-6">
            <p class="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">Próxima actividad</p>
            <h2 class="text-xl font-extrabold text-slate-900">{{ act.activityName }}</h2>
            <p class="text-sm font-semibold text-brand mt-1">{{ act.participantName }}</p>
            <div class="mt-4 space-y-1 text-sm text-slate-600">
              <p><span class="font-semibold text-slate-800">{{ act.dateLabel }}</span> · {{ act.timeStart }} – {{ act.timeEnd }}</p>
              <p>{{ act.venue }}</p>
            </div>
            <a [routerLink]="act.route" class="btn-primary inline-block mt-5 !text-sm !py-2.5">Ver actividad</a>
          </section>
        }

        <section class="mp-card p-5 sm:p-6">
          <h2 class="text-sm font-bold text-slate-900 mb-4">Acciones rápidas</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <a [routerLink]="activitiesRoute" class="btn-primary !text-xs !py-2.5 !rounded-2xl text-center">Inscribir actividad</a>
            <a [routerLink]="calendarRoute" class="mp-btn-soft !text-xs !py-2.5 text-center">Ver calendario</a>
            <a [routerLink]="myActivitiesRoute" class="mp-btn-soft !text-xs !py-2.5 text-center">Mis actividades</a>
            <a [routerLink]="paymentsRoute" class="mp-btn-soft !text-xs !py-2.5 text-center">Consultar pagos</a>
          </div>
        </section>
      </div>
    } @else if (error()) {
      <div class="mp-card p-10 text-center space-y-4">
        <p class="text-4xl" aria-hidden="true">😕</p>
        <p class="text-slate-600">{{ error() }}</p>
        <button type="button" class="btn-primary" (click)="load()">Reintentar</button>
      </div>
    }
  `,
})
export class MemberDashboardComponent implements OnInit {
  private readonly dashboardService = inject(MemberDashboardService);

  protected readonly loading = signal(true);
  protected readonly data = signal<MemberDashboard | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly familyRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/familia`;
  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;
  protected readonly myActivitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/mis-actividades`;
  protected readonly calendarRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/calendario`;
  protected readonly paymentsRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getDashboard().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => {
        this.error.set('No pudimos cargar tu panel. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  protected statusLabel(status: MemberAccountStatus): string {
    return MEMBER_ACCOUNT_STATUS_LABELS[status].toUpperCase();
  }

  protected statusClass(status: MemberAccountStatus): string {
    switch (status) {
      case MemberAccountStatus.ENABLED: return 'mp-status-enabled';
      case MemberAccountStatus.RESTRICTED: return 'mp-status-restricted';
      case MemberAccountStatus.SUSPENDED: return 'mp-status-suspended';
    }
  }
}
