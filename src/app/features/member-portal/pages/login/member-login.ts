import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MemberSessionService } from '../../services/member-session.service';
import { MOCK_MEMBER_LOGIN } from '../../mocks/member-portal.mock';
import { MEMBER_PORTAL_NAME, MEMBER_PORTAL_TAGLINE, MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row relative overflow-hidden member-portal">
      <div class="lg:w-[52%] relative text-white p-8 lg:p-14 flex flex-col justify-center overflow-hidden"
        style="background: linear-gradient(145deg, #0f2744 0%, #1A3263 35%, #78350f 70%, #b45309 100%)">
        <div class="absolute inset-0 opacity-20" aria-hidden="true"
          style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"></div>
        <div class="relative max-w-md mx-auto lg:mx-0 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-xl" aria-hidden="true">
              <span class="text-2xl font-extrabold">A</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-2xl tracking-tight">AELU</span>
                <span class="rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-white/20 border border-white/30">Socio</span>
              </div>
              <p class="text-sm text-white/70 mt-0.5">{{ portalName }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <h1 class="text-3xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight">
              Tu familia,<br/>tu club.
            </h1>
            <p class="text-white/75 text-base leading-relaxed max-w-sm">{{ portalTagline }}</p>
          </div>
          <ul class="space-y-3">
            @for (item of features; track item) {
              <li class="flex items-center gap-3 text-sm text-white/85">
                <span class="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs shrink-0" aria-hidden="true">✓</span>
                {{ item }}
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center p-6 lg:p-12 relative"
        style="background: linear-gradient(180deg, #f8f6f3 0%, #fef3e2 100%)">
        <div class="w-full max-w-[26rem] space-y-6 relative">
          <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100/80 space-y-6">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Iniciar sesión</h2>
              <p class="text-sm text-slate-500 mt-1.5">Accede con tu cuenta de socio</p>
            </div>
            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
              <div>
                <label for="member-email" class="block text-sm font-medium text-slate-700 mb-1.5">Correo</label>
                <input id="member-email" type="email" formControlName="email" autocomplete="username" class="input-modern w-full" />
              </div>
              <div>
                <label for="member-password" class="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <input id="member-password" type="password" formControlName="password" autocomplete="current-password" class="input-modern w-full" />
              </div>
              @if (error()) {
                <p class="text-sm text-rose-600" role="alert">{{ error() }}</p>
              }
              <button type="submit" [disabled]="form.invalid || loading()"
                class="w-full rounded-xl text-white font-semibold py-3 transition-colors disabled:opacity-50"
                style="background: linear-gradient(135deg, #1A3263, #b45309)">
                {{ loading() ? 'Ingresando…' : 'Ingresar al Portal Socio' }}
              </button>
            </form>
            <p class="text-xs text-center text-slate-400">
              Demo: {{ demoEmail }} / {{ demoPassword }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MemberLoginComponent {
  private readonly sessionService = inject(MemberSessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly portalName = MEMBER_PORTAL_NAME;
  protected readonly portalTagline = MEMBER_PORTAL_TAGLINE;
  protected readonly demoEmail = MOCK_MEMBER_LOGIN.email;
  protected readonly demoPassword = MOCK_MEMBER_LOGIN.password;
  protected readonly features = [
    'Gestiona actividades de tu familia',
    'Inscríbete a eventos institucionales',
    'Consulta pagos y beneficios',
    'Accede a tus entradas digitales',
  ];

  protected readonly form = this.fb.nonNullable.group({
    email: [MOCK_MEMBER_LOGIN.email, [Validators.required, Validators.email]],
    password: [MOCK_MEMBER_LOGIN.password, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.sessionService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate([`${MEMBER_PORTAL_ROUTE_PREFIX}/inicio`]);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message ?? 'No se pudo iniciar sesión');
      },
    });
  }
}
