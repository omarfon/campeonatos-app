import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberAccountFacade } from '../../facades/member-account.facade';
import { MemberAccount } from '../../models/member-portal.model';
import { MemberStatusComponent } from '../../components/member-status/member-status';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberStatusComponent],
  template: `
    @if (loading()) {
      <div class="space-y-4 animate-pulse">
        <div class="h-10 bg-slate-200/80 rounded-2xl w-48"></div>
        <div class="h-64 bg-slate-200/80 rounded-3xl"></div>
        <div class="h-40 bg-slate-200/80 rounded-3xl"></div>
      </div>
    } @else if (account(); as a) {
      <div class="space-y-6">
        <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 class="mp-page-title">Mi Cuenta</h1>
            <p class="mp-page-subtitle">Información de tu membresía institucional.</p>
          </div>
          <app-member-status [status]="a.profile.status" />
        </header>

        <section class="mp-card p-5 sm:p-6 space-y-4" aria-labelledby="datos-socio-heading">
          <h2 id="datos-socio-heading" class="text-sm font-bold uppercase tracking-wide text-slate-500">Datos del socio</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt class="text-slate-500">Código socio</dt>
              <dd class="font-mono font-semibold text-slate-900 mt-0.5">{{ a.profile.code }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Nombre</dt>
              <dd class="font-semibold text-slate-900 mt-0.5">{{ a.profile.fullName }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Categoría</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.profile.category }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Tipo</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.profile.memberType }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Fecha de afiliación</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ formatDate(a.profile.affiliationDate) }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Vigencia</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ formatDate(a.profile.validityDate) }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Documento</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.documentType }} {{ a.documentNumber }}</dd>
            </div>
          </dl>
        </section>

        <section class="mp-card p-5 sm:p-6 space-y-4" aria-labelledby="contacto-heading">
          <h2 id="contacto-heading" class="text-sm font-bold uppercase tracking-wide text-slate-500">Datos de contacto</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt class="text-slate-500">Correo</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.email }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">
                Teléfono
                @if (isEditable('phone')) {
                  <span class="text-xs text-brand font-normal ml-1">(editable)</span>
                }
              </dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.phone }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-slate-500">Dirección</dt>
              <dd class="font-medium text-slate-800 mt-0.5">{{ a.address }}, {{ a.district }}</dd>
            </div>
          </dl>
          <p class="text-xs text-slate-400 border-t border-slate-100 pt-3">
            Los datos maestros solo pueden modificarse en recepción o administración.
          </p>
        </section>

        <section class="mp-card p-5 sm:p-6 space-y-4" aria-labelledby="beneficios-heading">
          <h2 id="beneficios-heading" class="text-sm font-bold uppercase tracking-wide text-slate-500">Beneficios activos</h2>
          <div class="space-y-3">
            @for (b of a.benefits; track b.id) {
              <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p class="font-semibold text-slate-900">{{ b.name }}</p>
                <p class="text-sm text-amber-700 font-medium mt-0.5">{{ b.discountLabel }}</p>
                <p class="text-xs text-slate-500 mt-2">Vigencia hasta {{ formatDate(b.validUntil) }}</p>
                <p class="text-xs text-slate-600 mt-1">Aplicable: {{ b.applicableTo.join(', ') }}</p>
              </div>
            }
          </div>
          <a [routerLink]="benefitsRoute" class="text-sm font-semibold text-brand hover:underline">Ver todos los beneficios →</a>
        </section>

        <section class="mp-card p-5 sm:p-6 space-y-3" aria-labelledby="economico-heading">
          <h2 id="economico-heading" class="text-sm font-bold uppercase tracking-wide text-slate-500">Estado económico</h2>
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-sm text-slate-600">{{ a.economicStatus.label }}</p>
              @if (!a.economicStatus.isUpToDate) {
                <p class="text-2xl font-extrabold text-rose-700 mt-1">S/ {{ a.economicStatus.pendingAmount.toFixed(2) }}</p>
                <p class="text-xs text-slate-500 mt-1">Total pendiente</p>
              } @else {
                <p class="text-xl font-bold text-emerald-700 mt-1">Al día</p>
              }
            </div>
            @if (a.economicStatus.lastPaymentDate) {
              <p class="text-xs text-slate-500">Último pago: {{ formatDate(a.economicStatus.lastPaymentDate) }}</p>
            }
          </div>
          <a [routerLink]="accountStatementRoute" class="btn-primary inline-block !text-sm !py-2.5 mt-2">
            Ver estado de cuenta y pagos
          </a>
        </section>
      </div>
    } @else if (error()) {
      <div class="mp-card p-10 text-center space-y-4">
        <p class="text-slate-600">{{ error() }}</p>
        <button type="button" class="btn-primary" (click)="load()">Reintentar</button>
      </div>
    }
  `,
})
export class MemberAccountPageComponent implements OnInit {
  private readonly facade = inject(MemberAccountFacade);

  protected readonly loading = signal(true);
  protected readonly account = signal<MemberAccount | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly benefitsRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/beneficios`;
  protected readonly accountStatementRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.facade.loadAccount().subscribe({
      next: a => { this.account.set(a); this.loading.set(false); },
      error: () => {
        this.error.set('No pudimos cargar la información de tu cuenta. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  protected isEditable(field: string): boolean {
    return this.account()?.editableFields.includes(field) ?? false;
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
