import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TramiteSocietarioService } from '../../core/services/tramite-societario.service';
import { SocioService } from '../../core/services/socio.service';
import {
  TIPO_TRAMITE_LABELS,
  ESTADO_SOLICITUD_LABELS,
  ESTADO_SOLICITUD_CLASSES,
  TipoTramite,
  EstadoSolicitud,
} from '../../core/models/tramite-societario.model';

@Component({
  selector: 'app-solicitud-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-5 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.06)%22%2F%3E%3C%2Fsvg%3E')]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight">Solicitudes Societarias</h2>
            <p class="text-brand-200 text-sm mt-0.5">Gestión del flujo de trámites y evaluaciones de membresía.</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'solicitudes'], panel: ['maestros', 'socios', 'solicitud', 'nueva'] } }]"
             class="btn-primary !from-white !to-slate-50 !text-brand !shadow-xl !shadow-brand-900/20 !text-xs !px-3 !py-1.5 shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nueva Solicitud
          </a>
        </div>

        <!-- KPIs -->
        <div class="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ tramiteService.solicitudes().length }}</p>
            <p class="text-[11px] text-brand-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ tramiteService.solicitudesPendientes().length }}</p>
            <p class="text-[11px] text-brand-200">Pendientes</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ tramiteService.solicitudesAprobadas().length }}</p>
            <p class="text-[11px] text-brand-200">Aprobadas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ tramiteService.solicitudesRechazadas().length }}</p>
            <p class="text-[11px] text-brand-200">Rechazadas</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="filtro-busq" class="block text-xs font-semibold text-slate-500 mb-1">Buscar socio</label>
            <input id="filtro-busq" type="search" placeholder="Nombre, apellido o DNI..."
              class="input-modern !py-1.5 !text-sm"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)" />
          </div>
          <div class="sm:w-44">
            <label for="filtro-estado-sol" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filtro-estado-sol" class="input-modern !py-1.5 !text-sm"
              [value]="filtroEstado()"
              (change)="filtroEstado.set($any($event.target).value)">
              <option value="todos">Todos</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="en_evaluacion">En evaluación</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          <div class="sm:w-52">
            <label for="filtro-tipo" class="block text-xs font-semibold text-slate-500 mb-1">Tipo de trámite</label>
            <select id="filtro-tipo" class="input-modern !py-1.5 !text-sm"
              [value]="filtroTipo()"
              (change)="filtroTipo.set($any($event.target).value)">
              <option value="todos">Todos</option>
              @for (opt of tipoOpts; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Listado -->
      <div class="section-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Socio</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trámite</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Documentos</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (sol of filteredSolicitudes(); track sol.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    @if (getSocio(sol.socioId); as s) {
                      <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', s.id, 'detalle'] } }]"
                         class="font-semibold text-brand hover:text-brand-700 text-sm">
                        {{ s.apellido }}, {{ s.nombre }}
                      </a>
                      <p class="text-xs text-slate-400">DNI: {{ s.dni }}</p>
                    } @else {
                      <span class="text-xs text-slate-400">Socio no encontrado</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <p class="text-sm font-medium text-slate-800">{{ tipoLabels[sol.tipo] }}</p>
                    <p class="text-xs text-slate-500 max-w-xs truncate">{{ sol.descripcion }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="estadoClasses[sol.estado]">
                      {{ estadoLabels[sol.estado] }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                    <div>Creada: {{ sol.fechaCreacion }}</div>
                    <div>Última: {{ sol.fechaUltimaAccion }}</div>
                  </td>
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <span class="text-xs text-slate-500">{{ sol.documentos.length }} doc(s)</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1 flex-wrap">
                      <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'solicitudes'], panel: ['maestros', 'socios', 'solicitud', sol.id, 'evaluar'] } }]"
                         class="text-xs text-brand hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors">
                        Ver
                      </a>
                      @if (sol.estado === 'enviada') {
                        <button type="button"
                          (click)="derivar(sol.id)"
                          class="text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-amber-50 transition-colors">
                          Evaluar
                        </button>
                      }
                      @if (sol.estado === 'en_evaluacion') {
                        <button type="button"
                          (click)="aprobarDirecto(sol.id)"
                          class="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors">
                          Aprobar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    No se encontraron solicitudes con los filtros aplicados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SolicitudListComponent {
  protected readonly tramiteService = inject(TramiteSocietarioService);
  private readonly socioService = inject(SocioService);

  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<string>('todos');
  protected readonly filtroTipo = signal<string>('todos');

  protected readonly tipoOpts = Object.entries(TIPO_TRAMITE_LABELS).map(([value, label]) => ({ value: value as TipoTramite, label }));
  protected readonly tipoLabels = TIPO_TRAMITE_LABELS;
  protected readonly estadoLabels = ESTADO_SOLICITUD_LABELS;
  protected readonly estadoClasses = ESTADO_SOLICITUD_CLASSES;

  protected readonly filteredSolicitudes = computed(() => {
    const q = this.busqueda().toLowerCase();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();

    return this.tramiteService.solicitudes().filter((sol) => {
      const matchEstado = estado === 'todos' || sol.estado === estado;
      const matchTipo = tipo === 'todos' || sol.tipo === tipo;
      if (!matchEstado || !matchTipo) return false;
      if (!q) return true;
      const socio = this.socioService.getById(sol.socioId);
      return (
        socio?.nombre.toLowerCase().includes(q) ||
        socio?.apellido.toLowerCase().includes(q) ||
        socio?.dni.includes(q) ||
        false
      );
    });
  });

  protected getSocio(socioId: string) {
    return this.socioService.getById(socioId);
  }

  protected derivar(id: string): void {
    this.tramiteService.derivarParaEvaluacion(id, 'Evaluador Asignado');
  }

  protected aprobarDirecto(id: string): void {
    this.tramiteService.aprobar(id, 'Gerencia', 'Aprobada desde listado');
  }
}
