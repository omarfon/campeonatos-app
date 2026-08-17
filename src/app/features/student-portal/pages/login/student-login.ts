import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StudentSessionService } from '../../services/student-session.service';
import { MOCK_PORTAL_LOGIN } from '../../mocks/student-portal.mock';
import { STUDENT_PORTAL_NAME, STUDENT_PORTAL_ROUTE_PREFIX, STUDENT_PORTAL_TAGLINE } from '../../student-portal.constants';

@Component({
  selector: 'app-student-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      <!-- Decoración fondo -->
      <div class="absolute inset-0 pointer-events-none lg:hidden" aria-hidden="true">
        <div class="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div class="absolute bottom-0 -left-16 w-48 h-48 rounded-full bg-teal-200/30 blur-3xl"></div>
      </div>

      <!-- Panel izquierdo -->
      <div class="lg:w-[52%] relative text-white p-8 lg:p-14 flex flex-col justify-center overflow-hidden"
        style="background: linear-gradient(145deg, #0f2744 0%, #1A3263 35%, #1e4d6b 70%, #0d9488 100%)">
        <div class="absolute inset-0 opacity-20" aria-hidden="true"
          style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"></div>
        <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl" aria-hidden="true"></div>
        <div class="absolute top-20 -left-20 w-64 h-64 rounded-full bg-sky-400/15 blur-3xl" aria-hidden="true"></div>

        <div class="relative max-w-md mx-auto lg:mx-0 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-xl" aria-hidden="true">
              <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-2xl tracking-tight">AELU</span>
                <span class="rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-white/20 border border-white/30">Alumno</span>
              </div>
              <p class="text-sm text-white/70 mt-0.5">{{ portalName }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h1 class="text-3xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight">
              Tu formación,<br/>a un clic.
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

          <p class="text-xs text-white/40 pt-2 border-t border-white/10">
            ¿Eres socio? <span class="text-white/70 font-medium">Portal Socio</span> — próximamente
          </p>
        </div>
      </div>

      <!-- Panel login -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12 relative"
        style="background: linear-gradient(180deg, #f4f7fb 0%, #eef6f9 100%)">
        <div class="w-full max-w-[26rem] space-y-6 relative">
          <div class="lg:hidden text-center">
            <span class="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {{ portalName }}
            </span>
          </div>

          <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100/80 space-y-6">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Iniciar sesión</h2>
              <p class="text-sm text-slate-500 mt-1.5">Accede con tu cuenta de alumno</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Correo / usuario</label>
                <input id="email" type="email" formControlName="email"
                  class="input-modern !rounded-2xl !border-slate-200 focus:!ring-teal-100 focus:!border-teal-400"
                  autocomplete="username" />
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <input id="password" type="password" formControlName="password"
                  class="input-modern !rounded-2xl !border-slate-200 focus:!ring-teal-100 focus:!border-teal-400"
                  autocomplete="current-password" />
              </div>
              @if (error()) {
                <p class="text-sm text-rose-700 bg-rose-50 rounded-2xl px-4 py-3 border border-rose-100" role="alert">{{ error() }}</p>
              }
              <button type="submit"
                class="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                style="background: linear-gradient(135deg, #1A3263, #0d9488)"
                [disabled]="loading() || form.invalid">
                {{ loading() ? 'Ingresando...' : 'Ingresar al Portal Alumno' }}
              </button>
            </form>

            <p class="text-xs text-center text-slate-400 pt-2 border-t border-slate-100">
              Demo: {{ demoEmail }} / {{ demoPassword }}
            </p>
            <button type="button" class="btn-ghost w-full text-sm !rounded-2xl">¿Olvidaste tu contraseña?</button>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class StudentLoginComponent {
  private readonly sessionService = inject(StudentSessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly portalName = STUDENT_PORTAL_NAME;
  protected readonly portalTagline = STUDENT_PORTAL_TAGLINE;
  protected readonly demoEmail = MOCK_PORTAL_LOGIN.email;
  protected readonly demoPassword = MOCK_PORTAL_LOGIN.password;
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly features = [
    'Consulta tus cursos y horarios',
    'Realiza tu matrícula en línea',
    'Revisa pagos y asistencia',
  ];

  protected readonly form = this.fb.nonNullable.group({
    email: [MOCK_PORTAL_LOGIN.email, [Validators.required, Validators.email]],
    password: [MOCK_PORTAL_LOGIN.password, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.sessionService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([`${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`]),
      error: () => {
        this.error.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
