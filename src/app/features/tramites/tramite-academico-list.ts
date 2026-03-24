import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TramiteAcademicoService } from '../../core/services/tramite-academico.service';
import {
  TIPO_TRAMITE_ACADEMICO_LABELS,
  ESTADO_TRAMITE_ACADEMICO_LABELS,
  ESTADO_TRAMITE_ACADEMICO_CLASSES,
  TipoTramiteAcademico,
  EstadoTramiteAcademico,
} from '../../core/models/tramite-academico.model';

@Component({
  selector: 'app-tramite-academico-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 p-5 text-white shadow-xl shadow-indigo-200">
        <div class="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.06)%22%2F%3E%3C%2Fsvg%3E')]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight">Trámites del Alumno</h2>
            <p class="text-indigo-200 text-sm mt-0.5">Gestión de solicitudes académicas de alumnos matriculados.</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['tramites'], panel: ['tramites', 'nuevo'] } }]"
             class="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva Solicitud
          </a>
        </div>

        <!-- KPIs -->
        <div class="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ service.tramites().length }}</p>
            <p class="text-[11px] text-indigo-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ service.tramitesPendientes().length }}</p>
            <p class="text-[11px] text-indigo-200">Pendientes</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ service.tramitesAprobados().length }}</p>
            <p class="text-[11px] text-indigo-200">Aprobadas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ service.tramitesRechazados().length }}</p>
            <p class="text-[11px] text-indigo-200">Rechazadas</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="filtro-busq-ta" class="block text-xs font-semibold text-slate-500 mb-1">Buscar alumno</label>
            <input id="filtro-busq-ta" type="search" placeholder="Nombre, apellido o DNI..."
              class="input-modern !py-1.5 !text-sm"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)" />
          </div>
          <div class="sm:w-44">
            <label for="filtro-estado-ta" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filtro-estado-ta" class="input-modern !py-1.5 !text-sm"
              [value]="filtroEstado()"
              (change)="filtroEstado.set($any($event.target).value)">
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          <div class="sm:w-52">
            <label for="filtro-tipo-ta" class="block text-xs font-semibold text-slate-500 mb-1">Tipo de trámite</label>
            <select id="filtro-tipo-ta" class="input-modern !py-1.5 !text-sm"
              [value]="filtroTipo()"
              (change)="filtroTipo.set($any($event.target).value)">
              <option value="todos">Todos los tipos</option>
              @for (opt of tipoOpts; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Lista -->
      @if (tramitesFiltrados().length === 0) {
        <div class="section-card text-center py-12">
          <svg class="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6"/>
          </svg>
          <p class="text-slate-400 text-sm">No se encontraron trámites con los filtros aplicados.</p>
        </div>
      }

      <div class="space-y-3">
        @for (t of tramitesFiltrados(); track t.id) {
          <div class="section-card hover:shadow-md transition-shadow">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <!-- Ícono tipo -->
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 12h6M9 16h4"/>
                </svg>
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-slate-800">{{ tipoLabels[t.tipo] }}</p>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    [class]="estadoClasses[t.estado]">
                    {{ estadoLabels[t.estado] }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 mt-0.5 font-medium">{{ t.alumnoNombre }}
                  <span class="text-slate-400 font-normal">· DNI: {{ t.alumnoDni }}</span>
                </p>
                @if (t.cursoNombre) {
                  <p class="text-xs text-slate-400 mt-0.5">{{ t.cursoNombre }}</p>
                }
                <p class="text-xs text-slate-400 mt-1">Creado: {{ t.fechaCreacion }} · Última acción: {{ t.fechaUltimaAccion }}</p>
              </div>
              <!-- Acción -->
              <a [routerLink]="['/', { outlets: { primary: ['tramites'], panel: ['tramites', t.id, 'detalle'] } }]"
                class="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50">
                Ver detalle
              </a>
            </div>
          </div>
        }
      </div>

    </div>
  `,
})
export class TramiteAcademicoListComponent {
  protected readonly service = inject(TramiteAcademicoService);

  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<string>('todos');
  protected readonly filtroTipo = signal<string>('todos');

  protected readonly tipoLabels = TIPO_TRAMITE_ACADEMICO_LABELS;
  protected readonly estadoLabels = ESTADO_TRAMITE_ACADEMICO_LABELS;
  protected readonly estadoClasses = ESTADO_TRAMITE_ACADEMICO_CLASSES;

  protected readonly tipoOpts = Object.entries(TIPO_TRAMITE_ACADEMICO_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  protected readonly tramitesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();
    return this.service.tramites().filter((t) => {
      const matchQ =
        !q ||
        t.alumnoNombre.toLowerCase().includes(q) ||
        t.alumnoDni.includes(q) ||
        (t.cursoNombre?.toLowerCase().includes(q) ?? false);
      const matchEstado = estado === 'todos' || t.estado === estado;
      const matchTipo = tipo === 'todos' || t.tipo === tipo;
      return matchQ && matchEstado && matchTipo;
    });
  });
}
