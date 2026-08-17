import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MemberProfileService } from '../../services/member-profile.service';
import { MemberSessionService } from '../../services/member-session.service';
import { MemberAccountFacade } from '../../facades/member-account.facade';
import { MemberAccount, MemberProfile, MemberProfileField } from '../../models/member-portal.model';
import { MemberStatusComponent } from '../../components/member-status/member-status';
import { MEMBER_PORTAL_LOGIN_ROUTE, MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MemberStatusComponent],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="mp-page-title">Mi Perfil</h1>
        <p class="mp-page-subtitle">Información de tu membresía y datos de contacto.</p>
      </header>

      @if (loading()) {
        <div class="space-y-4 animate-pulse">
          <div class="h-28 bg-slate-200/80 rounded-3xl"></div>
          <div class="h-48 bg-slate-200/80 rounded-3xl"></div>
          <div class="h-40 bg-slate-200/80 rounded-3xl"></div>
        </div>
      } @else if (profile(); as p) {
        <section class="mp-card p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="w-14 h-14 rounded-2xl text-white font-bold text-lg flex items-center justify-center shrink-0"
                style="background: linear-gradient(135deg, #1A3263, #b45309)" aria-hidden="true">
                {{ initials(p.fullName) }}
              </span>
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ p.fullName }}</h2>
                <p class="text-sm font-mono text-slate-500 mt-0.5">{{ p.code }}</p>
                <p class="text-sm text-slate-600 mt-1">{{ p.memberType }} · {{ p.category }}</p>
              </div>
            </div>
            <app-member-status [status]="p.status" />
          </div>
        </section>

        @if (account(); as a) {
          <section class="mp-card p-5 sm:p-6 space-y-4" aria-labelledby="datos-socio-heading">
            <h2 id="datos-socio-heading" class="text-sm font-bold uppercase tracking-wide text-slate-500">Datos del socio</h2>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
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
        }

        <section class="mp-card p-5 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-bold text-slate-900">Datos de contacto</h2>
            @if (!editing()) {
              <button type="button" class="btn-secondary !text-sm" (click)="startEdit()">Editar teléfono</button>
            }
          </div>

          @if (editing()) {
            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
              @for (field of editableFields(); track field.key) {
                @if (field.editable) {
                  <div>
                    <label [for]="field.key" class="block text-sm font-medium text-slate-700 mb-1">{{ field.label }}</label>
                    <input [id]="field.key" type="text" [formControlName]="field.key" class="input-modern w-full" />
                  </div>
                }
              }
              @if (saveMessage()) {
                <p class="text-sm text-emerald-700" role="status">{{ saveMessage() }}</p>
              }
              @if (saveError()) {
                <p class="text-sm text-rose-600" role="alert">{{ saveError() }}</p>
              }
              <div class="flex gap-3">
                <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
                  {{ saving() ? 'Guardando...' : 'Guardar' }}
                </button>
                <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
              </div>
            </form>
          } @else {
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              @for (field of fields(); track field.key) {
                <div>
                  <dt class="text-slate-500">{{ field.label }}</dt>
                  <dd class="font-semibold text-slate-900 mt-0.5">{{ field.value }}</dd>
                </div>
              }
            </dl>
            <p class="text-xs text-slate-400 border-t border-slate-100 pt-3">
              Los datos maestros se modifican en recepción. Solo el teléfono es editable desde el portal.
            </p>
          }
        </section>

        @if (account(); as a) {
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
            <a [routerLink]="paymentsRoute" class="btn-primary inline-block !text-sm !py-2.5 mt-2">
              Ver estado de cuenta y pagos
            </a>
          </section>
        }

        <section class="mp-card p-5 sm:p-6 space-y-3">
          <h2 class="text-lg font-bold text-slate-900">Accesos rápidos</h2>
          <div class="flex flex-wrap gap-2">
            <a [routerLink]="familyRoute" class="mp-btn-soft !text-sm">Mi familia</a>
            <a [routerLink]="paymentsRoute" class="mp-btn-soft !text-sm">Pagos</a>
          </div>
        </section>

        <section class="mp-card p-5 sm:p-6 space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Seguridad</h2>
          <p class="text-sm text-slate-600">Cierra tu sesión en este dispositivo.</p>
          <button type="button" class="btn-secondary text-rose-700 border-rose-200 hover:bg-rose-50" (click)="logout()">
            Cerrar sesión
          </button>
        </section>
      } @else if (error()) {
        <div class="mp-card p-10 text-center space-y-4">
          <p class="text-slate-600">{{ error() }}</p>
          <button type="button" class="btn-primary" (click)="load()">Reintentar</button>
        </div>
      }
    </div>
  `,
})
export class MemberProfilePageComponent implements OnInit {
  private readonly profileService = inject(MemberProfileService);
  private readonly accountFacade = inject(MemberAccountFacade);
  private readonly sessionService = inject(MemberSessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly profile = signal<MemberProfile | null>(null);
  protected readonly account = signal<MemberAccount | null>(null);
  protected readonly fields = signal<MemberProfileField[]>([]);
  protected readonly editableFields = signal<MemberProfileField[]>([]);
  protected readonly loading = signal(true);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveMessage = signal('');
  protected readonly saveError = signal('');
  protected readonly error = signal<string | null>(null);

  protected readonly familyRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/familia`;
  protected readonly paymentsRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`;

  protected readonly form = this.fb.nonNullable.group({ phone: [''] });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      profile: this.profileService.getProfile(),
      account: this.accountFacade.loadAccount(),
    }).subscribe({
      next: ({ profile, account }) => {
        this.profile.set(profile);
        this.account.set(account);
        this.fields.set(this.profileService.getEditableFields(profile));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tu perfil. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  protected initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected startEdit(): void {
    const p = this.profile();
    if (!p) return;
    const editable = this.profileService.getEditableFields(p).filter(f => f.editable);
    this.editableFields.set(editable);
    this.form.patchValue({ phone: p.phone });
    this.editing.set(true);
    this.saveMessage.set('');
    this.saveError.set('');
  }

  protected cancelEdit(): void {
    this.editing.set(false);
    this.form.reset();
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveMessage.set('');
    this.saveError.set('');
    this.profileService.updateProfile({ phone: this.form.getRawValue().phone }).subscribe({
      next: p => {
        this.profile.set(p);
        this.fields.set(this.profileService.getEditableFields(p));
        this.editing.set(false);
        this.saveMessage.set('Tu teléfono se actualizó correctamente.');
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('No pudimos guardar los cambios. Intenta nuevamente.');
        this.saving.set(false);
      },
    });
  }

  protected logout(): void {
    this.sessionService.logout();
    void this.router.navigate([MEMBER_PORTAL_LOGIN_ROUTE]);
  }
}
