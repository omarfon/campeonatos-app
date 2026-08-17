import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AppSessionService } from '../../../../core/services/app-session.service';
import { MOCK_APP_LOGIN } from '../../../../core/mocks/app-session.mock';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6"
      style="background: linear-gradient(180deg, #f4f7fb 0%, #eef6f9 100%)">
      <div class="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100/80 space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white font-extrabold text-xl shadow-lg mx-auto"
            style="background: linear-gradient(135deg, #1A3263, #0d9488)"
            aria-hidden="true">
            A
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Portal principal</h1>
          <p class="text-sm text-slate-500">AELU — Gestión Integral Deportiva</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label for="admin-email" class="block text-sm font-medium text-slate-700 mb-1.5">Correo</label>
            <input id="admin-email" type="email" formControlName="email" autocomplete="username"
              class="input-modern w-full" />
          </div>
          <div>
            <label for="admin-password" class="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
            <input id="admin-password" type="password" formControlName="password" autocomplete="current-password"
              class="input-modern w-full" />
          </div>

          @if (error()) {
            <p class="text-sm text-rose-600" role="alert">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || loading()"
            class="w-full rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold py-3 transition-colors disabled:opacity-50">
            {{ loading() ? 'Ingresando…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="text-xs text-center text-slate-400">
          Demo: {{ demoEmail }} / {{ demoPassword }}
        </p>
      </div>
    </div>
  `,
})
export class AppLoginComponent {
  private readonly sessionService = inject(AppSessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly demoEmail = MOCK_APP_LOGIN.email;
  protected readonly demoPassword = MOCK_APP_LOGIN.password;

  protected readonly form = this.fb.nonNullable.group({
    email: [MOCK_APP_LOGIN.email, [Validators.required, Validators.email]],
    password: [MOCK_APP_LOGIN.password, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.sessionService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/gestion/competencias']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message ?? 'No se pudo iniciar sesión');
      },
    });
  }
}
