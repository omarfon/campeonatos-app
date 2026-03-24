import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import {
  EstadoSesionAsistencia,
  ESTADO_SESION_LABELS,
  ESTADO_ASISTENCIA_DOCENTE_COLORS,
  ESTADO_ASISTENCIA_DOCENTE_LABELS,
} from '../../core/models/asistencia.model';

type FiltroEstado = 'todos' | EstadoSesionAsistencia;

@Component({
  selector: 'app-asistencia-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Asistencia a Clases</h2>
            <p class="text-brand-200 text-xs mt-0.5">Registro de asistencia de alumnos y control de docentes</p>
          </div>
          <button
            type="button"
            (click)="generarHoy()"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Generar sesiones del día
          </button>
        </div>
        <!-- KPIs -->
        <div class="relative mt-3 grid grid-cols-3 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ totales().pendientes }}</p>
            <p class="text-[10px] text-brand-200">Pendientes</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ totales().tomadas }}</p>
            <p class="text-[10px] text-brand-200">Tomadas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ totales().canceladas }}</p>
            <p class="text-[10px] text-brand-200">Canceladas</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card space-y-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              class="input-modern !pl-10 w-full"
              placeholder="Buscar por curso o docente..."
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              aria-label="Buscar sesión"
            />
          </div>
          <input
            type="date"
            class="input-modern !py-1.5 !text-sm"
            [value]="filtroFecha()"
            (change)="filtroFecha.set($any($event.target).value)"
            aria-label="Filtrar por fecha"
          />
          <select
            class="input-modern !py-1.5 !text-sm"
            [value]="filtroEstado()"
            (change)="filtroEstado.set($any($event.target).value)"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            @for (e of estados; track e.value) {
              <option [value]="e.value">{{ e.label }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="section-card overflow-hidden !p-0">
        @if (sesionesFiltered().length === 0) {
          <div class="py-12 text-center text-slate-400 text-sm">
            <svg class="mx-auto w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
            <p>No se encontraron sesiones</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Curso / Clase</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Docente</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Alumnos</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Control Docente</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (s of sesionesFiltered(); track s.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="font-semibold text-slate-800">{{ s.fecha }}</p>
                      <p class="text-xs text-slate-500">{{ s.horaInicio }} – {{ s.horaFin }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-medium text-slate-800">{{ s.cursoNombre }}</p>
                      <p class="text-xs text-slate-500">{{ s.periodo }}</p>
                    </td>
                    <td class="px-4 py-3 text-slate-700">{{ s.docenteNombre }}</td>
                    <td class="px-4 py-3 text-center">
                      @if (s.estado === 'tomada') {
                        <span class="text-emerald-700 font-semibold">{{ s.asistieron }}/{{ s.totalAlumnos }}</span>
                      } @else {
                        <span class="text-slate-400">{{ s.totalAlumnos }}</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (s.controlDocente) {
                        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          {{ estadoDocenteColor(s.controlDocente.estado) }}">
                          {{ estadoDocenteLabel(s.controlDocente.estado) }}
                          @if (s.controlDocente.minutosTardanza) {
                            &nbsp;({{ s.controlDocente.minutosTardanza }} min)
                          }
                        </span>
                      } @else {
                        <span class="text-xs text-slate-400">Sin registro</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                        {{ estadoSesionColor(s.estado) }}">
                        {{ estadoSesionLabel(s.estado) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Ver roster / imprimir lista"
                          (click)="verRoster(s.id)"
                          class="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          aria-label="Ver roster"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm1-4h.01"/></svg>
                        </button>
                        <button
                          type="button"
                          title="Registrar asistencia"
                          (click)="registrarAsistencia(s.id)"
                          class="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          aria-label="Registrar asistencia"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                        </button>
                        <button
                          type="button"
                          title="Control de docente"
                          (click)="controlDocente(s.id)"
                          class="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          aria-label="Control de docente"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class AsistenciaListComponent {
  private readonly router = inject(Router);
  private readonly svc = inject(AsistenciaService);

  readonly busqueda = signal('');
  readonly filtroFecha = signal('');
  readonly filtroEstado = signal<FiltroEstado>('todos');

  readonly totales = this.svc.totalesPorEstado;

  readonly estados: { value: EstadoSesionAsistencia; label: string }[] = [
    { value: 'pendiente', label: ESTADO_SESION_LABELS.pendiente },
    { value: 'tomada', label: ESTADO_SESION_LABELS.tomada },
    { value: 'cancelada', label: ESTADO_SESION_LABELS.cancelada },
  ];

  readonly sesionesFiltered = computed(() => {
    const q = this.busqueda().toLowerCase();
    const fecha = this.filtroFecha();
    const estado = this.filtroEstado();
    return this.svc.sesionesDetalladas().filter((s) => {
      const matchQ = !q || s.cursoNombre.toLowerCase().includes(q) || s.docenteNombre.toLowerCase().includes(q);
      const matchFecha = !fecha || s.fecha === fecha;
      const matchEstado = estado === 'todos' || s.estado === estado;
      return matchQ && matchFecha && matchEstado;
    });
  });

  estadoSesionLabel(estado: string): string {
    return ESTADO_SESION_LABELS[estado as keyof typeof ESTADO_SESION_LABELS] ?? estado;
  }

  estadoSesionColor(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-amber-100 text-amber-700',
      tomada: 'bg-emerald-100 text-emerald-700',
      cancelada: 'bg-slate-100 text-slate-500',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-500';
  }

  estadoDocenteLabel(estado: string): string {
    return ESTADO_ASISTENCIA_DOCENTE_LABELS[estado as keyof typeof ESTADO_ASISTENCIA_DOCENTE_LABELS] ?? estado;
  }

  estadoDocenteColor(estado: string): string {
    return ESTADO_ASISTENCIA_DOCENTE_COLORS[estado as keyof typeof ESTADO_ASISTENCIA_DOCENTE_COLORS] ?? '';
  }

  generarHoy(): void {
    const hoy = new Date().toISOString().substring(0, 10);
    this.svc.generarSesionesDelDia(hoy);
  }

  verRoster(sesionId: string): void {
    this.router.navigate(['/', { outlets: { panel: ['asistencia', sesionId, 'roster'] } }]);
  }

  registrarAsistencia(sesionId: string): void {
    this.router.navigate(['/', { outlets: { panel: ['asistencia', sesionId, 'registrar'] } }]);
  }

  controlDocente(sesionId: string): void {
    this.router.navigate(['/', { outlets: { panel: ['asistencia', sesionId, 'docente'] } }]);
  }
}
