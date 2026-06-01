import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostulanteService } from '../../core/services/postulante.service';
import {
  EstadoPostulante,
  ESTADO_POSTULANTE_LABELS,
  ESTADO_POSTULANTE_CLASSES,
} from '../../core/models/postulante.model';
import { confirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-postulante-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-5 text-white shadow-xl shadow-indigo-200">
        <div class="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%228%22%20fill%3D%22rgba(255%2C255%2C255%2C0.04)%22%2F%3E%3C%2Fsvg%3E')]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight">Postulantes</h2>
            <p class="text-indigo-200 text-sm mt-0.5">Seguimiento del proceso de admisión de nuevos socios.</p>
          </div>
          <a [routerLink]="['/', 'maestros', 'socios', { outlets: { primary: ['postulantes'], panel: ['postulante', 'nuevo'] } }]"
             class="btn-primary !from-white !to-slate-50 !text-indigo-700 !shadow-xl !shadow-indigo-900/20 !text-xs !px-3 !py-1.5 shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nuevo Postulante
          </a>
        </div>

        <!-- KPIs -->
        <div class="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ postulanteService.items().length }}</p>
            <p class="text-[11px] text-indigo-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ postulanteService.enProceso().length }}</p>
            <p class="text-[11px] text-indigo-200">En proceso</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ postulanteService.aprobados().length }}</p>
            <p class="text-[11px] text-indigo-200">Aprobados</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ postulanteService.rechazados().length }}</p>
            <p class="text-[11px] text-indigo-200">Rechazados</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="busq-post" class="block text-xs font-semibold text-slate-500 mb-1">Buscar</label>
            <input id="busq-post" type="search" placeholder="Nombre, apellido, DNI o código..."
              class="input-modern !py-1.5 !text-sm"
              [value]="busqueda()"
              (input)="setBusqueda($any($event.target).value)" />
          </div>
          <div class="sm:w-48">
            <label for="filtro-estado-post" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filtro-estado-post" class="input-modern !py-1.5 !text-sm"
              [value]="filtroEstado()"
              (change)="setFiltroEstado($any($event.target).value)">
              <option value="todos">Todos</option>
              <option value="ingresado">Ingresado</option>
              <option value="documentacion_pendiente">Doc. Pendiente</option>
              <option value="documentacion_completa">Doc. Completa</option>
              <option value="en_evaluacion">En Evaluación</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
        @if (filtrados().length !== postulanteService.items().length) {
          <p class="text-xs text-slate-400 mt-2">{{ filtrados().length }} resultado(s) encontrado(s)</p>
        }
      </div>

      <!-- Tabla -->
      <div class="section-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Postulante</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">DNI</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Condición deseada</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Ingreso</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of paginados(); track p.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <a [routerLink]="['/', 'maestros', 'socios', { outlets: { primary: ['postulantes'], panel: ['postulante', p.id, 'detalle'] } }]"
                       class="font-semibold text-indigo-600 hover:text-indigo-800 text-sm">
                      {{ p.apellido }}, {{ p.nombre }}
                    </a>
                    @if (p.codigoPostulante) {
                      <p class="text-[10px] text-slate-400 font-mono">{{ p.codigoPostulante }}</p>
                    }
                  </td>
                  <td class="px-4 py-3 font-mono text-sm text-slate-600">{{ p.dni }}</td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    @if (p.condicionDeseada) {
                      <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {{ condicionLabels[p.condicionDeseada] }}
                      </span>
                    } @else {
                      <span class="text-slate-300 text-xs">—</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <!-- Workflow visual compacto -->
                    <div class="flex flex-col gap-1">
                      <span class="text-xs px-2 py-0.5 rounded font-medium inline-flex items-center gap-1 w-fit"
                        [class]="estadoClasses[p.estado]">
                        @if (p.estado === 'aprobado') {
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                        } @else if (p.estado === 'rechazado') {
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
                        }
                        {{ estadoLabels[p.estado] }}
                      </span>
                      <!-- Mini stepper -->
                      <div class="flex items-center gap-0.5">
                        @for (step of workflowSteps; track step) {
                          @if (step !== 'aprobado' || p.estado === 'aprobado') {
                            <div class="h-1 w-5 rounded-full transition-colors"
                              [class]="getStepClass(p.estado, step)">
                            </div>
                          }
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{{ p.fechaIngreso }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1">
                      <a [routerLink]="['/', 'maestros', 'socios', { outlets: { primary: ['postulantes'], panel: ['postulante', p.id, 'detalle'] } }]"
                         class="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                         title="Ver / Gestionar" [attr.aria-label]="'Ver postulante ' + p.apellido">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      </a>
                      @if (p.estado === 'ingresado' || p.estado === 'rechazado') {
                        <button (click)="eliminar(p.id)"
                          class="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar" [attr.aria-label]="'Eliminar postulante ' + p.apellido">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
                    No hay postulantes con los filtros aplicados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginado -->
        @if (totalPaginas() > 1) {
          <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500">{{ rangoInicio() }}–{{ rangoFin() }} de {{ filtrados().length }}</p>
            <nav class="flex items-center gap-1" aria-label="Paginación postulantes">
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                [disabled]="pagina() === 1" (click)="irAPagina(1)" aria-label="Primera página">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
              </button>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                [disabled]="pagina() === 1" (click)="irAPagina(pagina() - 1)" aria-label="Anterior">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span class="text-xs font-medium text-slate-700 px-2">{{ pagina() }} / {{ totalPaginas() }}</span>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                [disabled]="pagina() === totalPaginas()" (click)="irAPagina(pagina() + 1)" aria-label="Siguiente">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                [disabled]="pagina() === totalPaginas()" (click)="irAPagina(totalPaginas())" aria-label="Última página">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            </nav>
          </div>
        }
      </div>
    </div>
  `,
})
export class PostulanteListComponent {
  protected readonly postulanteService = inject(PostulanteService);

  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<string>('todos');
  protected readonly pagina = signal(1);
  protected readonly PAGE_SIZE = 10;

  protected readonly estadoLabels = ESTADO_POSTULANTE_LABELS;
  protected readonly estadoClasses = ESTADO_POSTULANTE_CLASSES;
  protected readonly workflowSteps: EstadoPostulante[] = [
    'ingresado',
    'documentacion_pendiente',
    'documentacion_completa',
    'en_evaluacion',
    'aprobado',
  ];

  protected readonly condicionLabels: Record<string, string> = {
    individual: 'Individual',
    familiar: 'Familiar',
    transitorio_menor: 'Trans. Menor',
    transitorio_mayor: 'Trans. Mayor',
  };

  protected readonly filtrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    const estado = this.filtroEstado();
    return this.postulanteService.items().filter(p => {
      const matchQ =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.apellido.toLowerCase().includes(q) ||
        p.dni.includes(q) ||
        (p.codigoPostulante ?? '').toLowerCase().includes(q);
      const matchEstado = estado === 'todos' || p.estado === estado;
      return matchQ && matchEstado;
    });
  });

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / this.PAGE_SIZE))
  );
  protected readonly paginados = computed(() => {
    const p = Math.min(this.pagina(), this.totalPaginas());
    return this.filtrados().slice((p - 1) * this.PAGE_SIZE, p * this.PAGE_SIZE);
  });
  protected readonly rangoInicio = computed(() =>
    this.filtrados().length === 0 ? 0 : (this.pagina() - 1) * this.PAGE_SIZE + 1
  );
  protected readonly rangoFin = computed(() =>
    Math.min(this.pagina() * this.PAGE_SIZE, this.filtrados().length)
  );

  protected setBusqueda(v: string): void { this.busqueda.set(v); this.pagina.set(1); }
  protected setFiltroEstado(v: string): void { this.filtroEstado.set(v); this.pagina.set(1); }
  protected irAPagina(n: number): void {
    this.pagina.set(Math.max(1, Math.min(n, this.totalPaginas())));
  }

  /** Retorna color del paso en el mini stepper */
  protected getStepClass(estadoActual: EstadoPostulante, step: EstadoPostulante): string {
    const order: EstadoPostulante[] = [
      'ingresado',
      'documentacion_pendiente',
      'documentacion_completa',
      'en_evaluacion',
      'aprobado',
    ];
    if (estadoActual === 'rechazado') return 'bg-red-300';
    const currentIdx = order.indexOf(estadoActual);
    const stepIdx = order.indexOf(step);
    if (stepIdx <= currentIdx) return 'bg-indigo-500';
    return 'bg-slate-200';
  }

  protected async eliminar(id: string): Promise<void> {
    const ok = await confirmDialog({
      title: 'Eliminar postulante',
      text: '¿Está seguro de eliminar este postulante? Esta acción no se puede deshacer.',
    });
    if (ok) {
      this.postulanteService.delete(id);
    }
  }
}
