import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemberBenefitService } from '../../services/member-benefit.service';
import { MemberBenefit } from '../../models/member-portal.model';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

type BenefitFilter = 'all' | 'active' | 'expired';

@Component({
  selector: 'app-member-benefits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="mp-page-title">Beneficios</h1>
        <p class="mp-page-subtitle">Convenios y descuentos activos de tu membresía familiar.</p>
      </header>

      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar beneficios">
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="filter() === 'all'"
          [attr.aria-selected]="filter() === 'all'"
          (click)="filter.set('all')">Todos</button>
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="filter() === 'active'"
          [attr.aria-selected]="filter() === 'active'"
          (click)="filter.set('active')">Activos</button>
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="filter() === 'expired'"
          [attr.aria-selected]="filter() === 'expired'"
          (click)="filter.set('expired')">Vencidos</button>
      </div>

      @if (loading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1, 2]; track i) {
            <div class="h-36 bg-slate-200/80 rounded-3xl"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <app-member-empty-state
          title="Sin beneficios"
          description="No hay beneficios en esta categoría."
          icon="🎁"
          actionLabel="Explorar actividades"
          (actionClick)="navigateActivities()"
        />
      } @else {
        <div class="space-y-4">
          @for (b of filtered(); track b.id) {
            <article class="mp-card p-5 sm:p-6 space-y-3">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-bold text-slate-900">{{ b.name }}</h2>
                  @if (b.sponsor) {
                    <p class="text-xs text-slate-500 mt-0.5">{{ b.sponsor }}</p>
                  }
                </div>
                <span class="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
                  [class.bg-emerald-100]="b.status === 'active'"
                  [class.text-emerald-800]="b.status === 'active'"
                  [class.bg-slate-100]="b.status === 'expired'"
                  [class.text-slate-600]="b.status === 'expired'">
                  {{ statusLabel(b.status) }}
                </span>
              </div>
              <p class="text-sm font-semibold text-amber-700">{{ b.discountLabel }}</p>
              <p class="text-sm text-slate-600">{{ b.description }}</p>
              <div class="flex flex-wrap gap-1.5 pt-1">
                @for (d of b.applicableTo; track d) {
                  <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{{ d }}</span>
                }
              </div>
              <p class="text-xs text-slate-500 border-t border-slate-100 pt-3">
                Vigencia hasta {{ formatDate(b.validUntil) }}
              </p>
              @if (b.status === 'active') {
                <a [routerLink]="activitiesRoute" class="text-sm font-semibold text-brand hover:underline inline-block">
                  Usar en inscripción →
                </a>
              }
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class MemberBenefitsPageComponent implements OnInit {
  private readonly benefitService = inject(MemberBenefitService);
  private readonly router = inject(Router);

  protected readonly benefits = signal<MemberBenefit[]>([]);
  protected readonly loading = signal(true);
  protected readonly filter = signal<BenefitFilter>('all');
  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;

  protected readonly filtered = computed(() => {
    const f = this.filter();
    const list = this.benefits();
    if (f === 'all') return list;
    return list.filter(b => b.status === f);
  });

  ngOnInit(): void {
    this.benefitService.getBenefits().subscribe({
      next: list => { this.benefits.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected statusLabel(status: MemberBenefit['status']): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'expired': return 'Vencido';
      case 'pending': return 'Pendiente';
    }
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected navigateActivities(): void {
    void this.router.navigate([this.activitiesRoute]);
  }
}
