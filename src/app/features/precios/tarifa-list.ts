import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { TarifaService } from '../../core/services/tarifa.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Tarifa,
  CampanaPromo,
  CONDICION_CLIENTE_LABELS,
  FRECUENCIA_LABELS,
} from '../../core/models/tarifa.model';

type FiltroCondicion = 'todos' | 'socio' | 'dependiente' | 'no_socio' | 'trabajador';
type VistaPrincipal = 'tarifas' | 'campanas';

@Component({
  selector: 'app-tarifa-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Motor de Precios</h1>
          <p class="text-sm text-slate-500 mt-0.5">Maestro de Tarifas y Campañas Promocionales</p>
        </div>
        <div class="flex gap-2">
          @if (vista() === 'tarifas') {
            <button
              class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              (click)="nuevaTarifa()"
            >
              + Nueva Regla
            </button>
          } @else {
            <button
              class="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              (click)="nuevaCampana()"
            >
              + Nueva Campaña
            </button>
          }
        </div>
      </div>

      <!-- Banner conceptual -->
      <div class="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-800">
        <strong>Cómo funciona el motor:</strong> al registrar una matrícula, el sistema cruza la
        disciplina, frecuencia y condición del alumno contra estas reglas y selecciona automáticamente
        el precio exacto. Las campañas activas sobreescriben el precio base durante su vigencia.
      </div>

      <!-- Tabs de vista -->
      <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          class="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          [class.bg-white]="vista() === 'tarifas'"
          [class.shadow-sm]="vista() === 'tarifas'"
          [class.text-slate-800]="vista() === 'tarifas'"
          [class.text-slate-500]="vista() !== 'tarifas'"
          (click)="vista.set('tarifas')"
        >
          Tarifas Base
          <span class="ml-1.5 text-xs text-slate-400">({{ svc.tarifas().length }})</span>
        </button>
        <button
          class="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          [class.bg-white]="vista() === 'campanas'"
          [class.shadow-sm]="vista() === 'campanas'"
          [class.text-slate-800]="vista() === 'campanas'"
          [class.text-slate-500]="vista() !== 'campanas'"
          (click)="vista.set('campanas')"
        >
          Campañas Promo
          <span class="ml-1.5 text-xs text-amber-500 font-semibold">● {{ campanasActivas() }}</span>
        </button>
      </div>

      <!-- ─── Vista Tarifas ─── -->
      @if (vista() === 'tarifas') {
        <!-- Filtros -->
        <div class="flex flex-wrap gap-2">
          @for (f of filtrosCondicion; track f.value) {
            <button
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
              [class.bg-indigo-600]="filtroCondicion() === f.value"
              [class.text-white]="filtroCondicion() === f.value"
              [class.border-indigo-600]="filtroCondicion() === f.value"
              [class.bg-white]="filtroCondicion() !== f.value"
              [class.text-slate-600]="filtroCondicion() !== f.value"
              [class.border-slate-200]="filtroCondicion() !== f.value"
              (click)="filtroCondicion.set(f.value)"
            >
              {{ f.label }}
            </button>
          }
        </div>
        <!-- Tabla de tarifas -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          @if (tarifasFiltradas().length === 0) {
            <div class="py-16 text-center text-slate-400">
              <p class="font-medium">No hay tarifas para este filtro.</p>
            </div>
          } @else {
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Curso</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Frecuencia</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Condición</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Matrí.</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioridad</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (t of tarifasFiltradas(); track t.id) {
                  <tr class="hover:bg-slate-50 transition-colors" [class.opacity-50]="!t.vigente">
                    <td class="px-4 py-3 font-medium text-slate-800">{{ t.nombre }}</td>
                    <td class="px-4 py-3 text-slate-600">
                      @if (t.cursoId) {
                        {{ getNombreCurso(t.cursoId) }}
                      } @else {
                        <span class="text-slate-400 italic">Todos los cursos</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-slate-600">
                      @if (t.frecuenciaSemanal) {
                        {{ frecuenciaLabel(t.frecuenciaSemanal) }}
                      } @else {
                        <span class="text-slate-400 italic">Cualquiera</span>
                      }
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-teal-100]="t.condicionCliente === 'socio'"
                        [class.text-teal-700]="t.condicionCliente === 'socio'"
                        [class.bg-blue-100]="t.condicionCliente === 'dependiente'"
                        [class.text-blue-700]="t.condicionCliente === 'dependiente'"
                        [class.bg-orange-100]="t.condicionCliente === 'no_socio'"
                        [class.text-orange-700]="t.condicionCliente === 'no_socio'"
                        [class.bg-violet-100]="t.condicionCliente === 'trabajador'"
                        [class.text-violet-700]="t.condicionCliente === 'trabajador'"
                      >
                        {{ condicionLabel(t.condicionCliente) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-semibold text-slate-800">S/ {{ t.monto.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-right text-slate-500">
                      @if (t.montoMatricula) { S/ {{ t.montoMatricula.toFixed(2) }} }
                      @else { — }
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs font-bold text-slate-600">{{ t.prioridad }}</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-emerald-100]="t.vigente"
                        [class.text-emerald-700]="t.vigente"
                        [class.bg-slate-100]="!t.vigente"
                        [class.text-slate-500]="!t.vigente"
                      >
                        {{ t.vigente ? 'Vigente' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button
                        class="text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                        (click)="svc.toggleVigencia(t.id)"
                        [attr.aria-label]="t.vigente ? 'Desactivar tarifa' : 'Activar tarifa'"
                      >
                        {{ t.vigente ? 'Desactivar' : 'Activar' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      <!-- ─── Vista Campañas ─── -->
      @if (vista() === 'campanas') {
        <div class="grid gap-4">
          @if (svc.campanas().length === 0) {
            <div class="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <p class="font-medium">Sin campañas configuradas.</p>
            </div>
          }
          @for (c of svc.campanas(); track c.id) {
            <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-800">{{ c.nombre }}</span>
                    @if (esCampanaActiva(c)) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
                        ● En curso
                      </span>
                    } @else if (c.fechaFin < hoy()) {
                      <span class="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">Vencida</span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">Programada</span>
                    }
                  </div>
                  @if (c.descripcion) {
                    <p class="text-sm text-slate-500 mt-0.5">{{ c.descripcion }}</p>
                  }
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xl font-bold text-amber-600">S/ {{ c.montoPromo.toFixed(2) }}</div>
                  <div class="text-xs text-slate-400">precio promo</div>
                </div>
              </div>
              <div class="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>📅 {{ c.fechaInicio }} → {{ c.fechaFin }}</span>
                <span>📌 Aplica a {{ c.tarifaIds.length === 0 ? 'todas las tarifas' : c.tarifaIds.length + ' tarifas' }}</span>
                @if (c.condicionCliente) {
                  <span>👤 {{ condicionLabel(c.condicionCliente) }}</span>
                }
              </div>
              <div class="flex gap-2 justify-end">
                <button
                  class="text-xs px-3 py-1.5 rounded border text-slate-500 border-slate-200 hover:bg-slate-50 transition-colors"
                  (click)="svc.actualizarCampana(c.id, { activa: !c.activa })"
                >
                  {{ c.activa ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TarifaListComponent {
  protected readonly svc = inject(TarifaService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);

  readonly vista = signal<VistaPrincipal>('tarifas');
  readonly filtroCondicion = signal<FiltroCondicion>('todos');

  protected readonly filtrosCondicion: { value: FiltroCondicion; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'socio', label: 'Socio' },
    { value: 'dependiente', label: 'Dependiente' },
    { value: 'no_socio', label: 'No Socio' },
    { value: 'trabajador', label: 'Trabajador' },
  ];

  readonly tarifasFiltradas = computed(() => {
    const f = this.filtroCondicion();
    const ts = this.svc.tarifas().slice().sort((a, b) => b.prioridad - a.prioridad);
    if (f === 'todos') return ts;
    return ts.filter((t) => t.condicionCliente === f);
  });

  readonly campanasActivas = computed(() =>
    this.svc.campanas().filter((c) => c.activa && c.fechaFin >= this.hoy()).length,
  );

  hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  esCampanaActiva(c: CampanaPromo): boolean {
    const h = this.hoy();
    return c.activa && c.fechaInicio <= h && c.fechaFin >= h;
  }

  getNombreCurso(cursoId: string): string {
    return this.academiaService.getCursoById(cursoId)?.nombre ?? cursoId;
  }

  condicionLabel(c: string): string {
    return CONDICION_CLIENTE_LABELS[c as keyof typeof CONDICION_CLIENTE_LABELS] ?? c;
  }

  frecuenciaLabel(f: number): string {
    return FRECUENCIA_LABELS[f] ?? `${f}x/semana`;
  }

  nuevaTarifa(): void {
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'tarifas', 'nueva'] } }]);
  }

  nuevaCampana(): void {
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'campanas', 'nueva'] } }]);
  }
}
