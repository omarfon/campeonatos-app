import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AccesoService } from '../../core/services/acceso.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  RESULTADO_ACCESO_LABELS,
  RESULTADO_ACCESO_COLORS,
  TIPO_ACCESO_LABELS,
  ResultadoAcceso,
} from '../../core/models/acceso.model';

@Component({
  selector: 'app-acceso-monitor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UpperCasePipe],
  template: `
    <div class="space-y-6">
      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Control de Acceso (Molinetes)</h2>
            <p class="text-brand-200 text-xs mt-0.5">Validación de carnets, tolerancias y penalidades</p>
          </div>
          <button
            type="button"
            (click)="irAGestionCarnets()"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5m-4 0V5a2 2 0 1 1 4 0v1"/></svg>
            Gestión de Carnets
          </button>
        </div>
        <!-- KPIs -->
        <div class="relative mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ kpis().accesosHoy }}</p>
            <p class="text-[10px] text-brand-200">Accesos hoy</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold text-red-300">{{ kpis().bloqueadosHoy }}</p>
            <p class="text-[10px] text-brand-200">Bloqueados hoy</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold text-amber-300">{{ kpis().penalidadesPendientes }}</p>
            <p class="text-[10px] text-brand-200">Penalidades pend.</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold text-emerald-300">{{ kpis().carnetsActivos }}</p>
            <p class="text-[10px] text-brand-200">Carnets activos</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center col-span-2 sm:col-span-1">
            <p class="text-lg font-bold text-amber-300">S/ {{ kpis().montoPendiente }}</p>
            <p class="text-[10px] text-brand-200">Monto pendiente</p>
          </div>
        </div>
      </div>

      <!-- Simulador de Molinete -->
      <div class="section-card space-y-4">
        <h3 class="text-sm font-semibold text-slate-700">Simulador de Escaneo (Molinete)</h3>
        <form [formGroup]="scanForm" (ngSubmit)="simularAcceso()" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="codigoCarnet" class="block text-xs font-medium text-slate-700 mb-1">
                Código de Carnet
              </label>
              <input
                id="codigoCarnet"
                type="text"
                formControlName="codigoCarnet"
                class="input-modern w-full font-mono"
                placeholder="Ej: ACE-2026-001"
                aria-label="Código de carnet"
              />
            </div>
            <div>
              <label for="tipoAcceso" class="block text-xs font-medium text-slate-700 mb-1">
                Tipo de Movimiento
              </label>
              <select id="tipoAcceso" formControlName="tipo" class="input-modern w-full">
                <option value="ingreso">Ingreso</option>
                <option value="salida">Salida</option>
              </select>
            </div>
            <div>
              <label for="fechaHoraAcceso" class="block text-xs font-medium text-slate-700 mb-1">
                Fecha y Hora
              </label>
              <input
                id="fechaHoraAcceso"
                type="datetime-local"
                formControlName="fechaHora"
                class="input-modern w-full"
              />
            </div>
            <div>
              <label for="personal" class="block text-xs font-medium text-slate-700 mb-1">
                Personal de Seguridad
              </label>
              <input
                id="personal"
                type="text"
                formControlName="registradoPor"
                class="input-modern w-full"
                placeholder="Nombre del operador"
              />
            </div>
          </div>
          <button
            type="submit"
            [disabled]="scanForm.invalid"
            class="btn-primary w-full disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.24M16.93 7.07A10 10 0 0 1 19 12H5a10 10 0 0 1 2.07-4.93"/></svg>
            Verificar Acceso
          </button>
        </form>

        <!-- Resultado del escaneo -->
        @if (resultadoEscaneo()) {
          <div class="rounded-xl border-2 p-4
            {{ resultadoEscaneo()!.resultado === 'permitido' ? 'border-emerald-300 bg-emerald-50' :
               resultadoEscaneo()!.resultado === 'alerta_tiempo' ? 'border-amber-300 bg-amber-50' :
               'border-red-300 bg-red-50' }}">
            <div class="flex items-center gap-3">
              <!-- Semáforo visual -->
              <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                {{ resultadoEscaneo()!.resultado === 'permitido' ? 'bg-emerald-500' :
                   resultadoEscaneo()!.resultado === 'alerta_tiempo' ? 'bg-amber-500' :
                   'bg-red-600' }}">
                @if (resultadoEscaneo()!.resultado === 'permitido') {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                } @else {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                }
              </div>
              <div>
                <p class="font-bold text-lg
                  {{ resultadoEscaneo()!.resultado === 'permitido' ? 'text-emerald-700' :
                     resultadoEscaneo()!.resultado === 'alerta_tiempo' ? 'text-amber-700' :
                     'text-red-700' }}">
                  {{ resultadoLabel(resultadoEscaneo()!.resultado) | uppercase }}
                </p>
                @if (resultadoEscaneo()!.socioNombre) {
                  <p class="text-sm font-medium text-slate-700">{{ resultadoEscaneo()!.socioNombre }}</p>
                }
                @if (resultadoEscaneo()!.cursoNombre) {
                  <p class="text-xs text-slate-500">Clase: {{ resultadoEscaneo()!.cursoNombre }}</p>
                }
                @if (resultadoEscaneo()!.motivo) {
                  <p class="text-sm text-red-700 mt-1">{{ resultadoEscaneo()!.motivo }}</p>
                }
                @if (resultadoEscaneo()!.derivadoPenalidad) {
                  <div class="mt-2">
                    <button
                      type="button"
                      (click)="irAPenalidades()"
                      class="text-xs font-semibold text-amber-700 underline hover:text-amber-900"
                    >
                      → Registrar penalidad en secretaría
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Log de Accesos -->
      <div class="section-card overflow-hidden !p-0">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-700">Registro de Accesos</h3>
          <div class="flex gap-2">
            <select
              class="input-modern !py-1 !text-xs"
              [value]="filtroResultado()"
              (change)="filtroResultado.set($any($event.target).value)"
              aria-label="Filtrar por resultado"
            >
              <option value="todos">Todos</option>
              <option value="permitido">Permitidos</option>
              <option value="bloqueado">Bloqueados</option>
              <option value="alerta_tiempo">Alertas</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Alumno</th>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Clase</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-slate-500">Tipo</th>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Fecha/Hora</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-slate-500">Resultado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (r of registrosFiltered(); track r.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-2 font-medium text-slate-800">{{ r.socioNombre }}</td>
                  <td class="px-4 py-2 text-slate-600 text-xs">{{ r.cursoNombre }}</td>
                  <td class="px-4 py-2 text-center text-xs text-slate-600">{{ tipoLabel(r.tipo) }}</td>
                  <td class="px-4 py-2 text-xs text-slate-600">{{ r.fechaHora.replace('T', ' ').substring(0, 16) }}</td>
                  <td class="px-4 py-2 text-center">
                    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {{ resultadoColor(r.resultado) }}">
                      {{ resultadoLabel(r.resultado) }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-400">Sin registros</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AccesoMonitorComponent {
  private readonly router = inject(Router);
  private readonly svc = inject(AccesoService);
  private readonly fb = inject(FormBuilder);

  readonly kpis = this.svc.kpis;
  readonly filtroResultado = signal<string>('todos');
  readonly resultadoEscaneo = signal<ReturnType<AccesoService['simularAcceso']> | null>(null);

  readonly scanForm = this.fb.group({
    codigoCarnet: ['', Validators.required],
    tipo: ['ingreso', Validators.required],
    fechaHora: [new Date().toISOString().substring(0, 16), Validators.required],
    registradoPor: ['', Validators.required],
  });

  readonly registrosFiltered = computed(() => {
    const f = this.filtroResultado();
    const all = this.svc.registrosDetallados();
    return f === 'todos' ? all : all.filter((r) => r.resultado === f);
  });

  resultadoLabel(r: string): string {
    return RESULTADO_ACCESO_LABELS[r as keyof typeof RESULTADO_ACCESO_LABELS] ?? r;
  }

  resultadoColor(r: string): string {
    return RESULTADO_ACCESO_COLORS[r as keyof typeof RESULTADO_ACCESO_COLORS] ?? '';
  }

  tipoLabel(t: string): string {
    return TIPO_ACCESO_LABELS[t as keyof typeof TIPO_ACCESO_LABELS] ?? t;
  }

  simularAcceso(): void {
    if (this.scanForm.invalid) return;
    const val = this.scanForm.getRawValue();
    const resultado = this.svc.simularAcceso(
      val.codigoCarnet ?? '',
      (val.tipo as 'ingreso' | 'salida') ?? 'ingreso',
      val.fechaHora ?? '',
      val.registradoPor ?? ''
    );
    this.resultadoEscaneo.set(resultado);
  }

  irAGestionCarnets(): void {
    this.router.navigate(['/', { outlets: { panel: ['acceso', 'carnets'] } }]);
  }

  irAPenalidades(): void {
    this.router.navigate(['/acceso/penalidades']);
  }
}
