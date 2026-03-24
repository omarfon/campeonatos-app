import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AccesoService } from '../../core/services/acceso.service';
import {
  ESTADO_CARNET_LABELS,
  EstadoCarnet,
} from '../../core/models/acceso.model';

@Component({
  selector: 'app-carnet-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Gestión de Carnets</h2>
          <p class="mt-0.5 text-sm text-slate-500">Carnets de acceso emitidos a alumnos</p>
        </div>
        <button
          type="button"
          (click)="cerrar()"
          class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
          aria-label="Cerrar panel"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <!-- Filtro -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              class="input-modern !pl-10 w-full"
              placeholder="Buscar por nombre o DNI..."
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              aria-label="Buscar carnet"
            />
          </div>
          <select
            class="input-modern !py-1.5 !text-sm"
            [value]="filtroEstado()"
            (change)="filtroEstado.set($any($event.target).value)"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="bloqueado">Bloqueados</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <!-- Tarjetas de carnets -->
        @for (c of carnetsFiltered(); track c.id) {
          <div class="rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-slate-800">{{ c.socioNombre }}</p>
                <p class="text-xs text-slate-500">DNI: {{ c.socioDni }}</p>
              </div>
              <div class="flex items-center gap-2">
                @if (c.penalidades > 0) {
                  <span class="rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5 font-medium">
                    {{ c.penalidades }} pen.
                  </span>
                }
                <span class="rounded-full text-xs px-2 py-0.5 font-medium
                  {{ c.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' :
                     c.estado === 'bloqueado' ? 'bg-red-100 text-red-700' :
                     'bg-slate-100 text-slate-500' }}">
                  {{ estadoLabel(c.estado) }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-600">
              <div class="font-mono bg-slate-50 rounded px-2 py-1 border border-slate-200">
                {{ c.codigoCarnet }}
              </div>
              <div>
                <span class="text-slate-400">Condición: </span>
                <span class="font-medium capitalize">{{ c.condicion }}</span>
              </div>
              <div>
                <span class="text-slate-400">Emitido: </span>
                <span>{{ c.emitidoEn }}</span>
              </div>
            </div>
            <div class="flex gap-2 pt-1 border-t border-slate-100">
              @if (c.estado !== 'activo') {
                <button
                  type="button"
                  (click)="cambiarEstado(c.id, 'activo')"
                  class="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-medium hover:bg-emerald-100 transition-colors"
                >
                  Activar
                </button>
              } @else {
                <button
                  type="button"
                  (click)="cambiarEstado(c.id, 'bloqueado')"
                  class="rounded-lg bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  Bloquear
                </button>
              }
              <button
                type="button"
                (click)="cambiarEstado(c.id, 'inactivo')"
                class="rounded-lg bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-100 transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center text-slate-400 text-sm">
            <p>No se encontraron carnets.</p>
          </div>
        }
      </div>

      <div class="px-6 py-4 border-t border-slate-100">
        <button type="button" (click)="cerrar()" class="btn-secondary w-full">Cerrar</button>
      </div>
    </div>
  `,
})
export class CarnetListComponent {
  private readonly router = inject(Router);
  private readonly svc = inject(AccesoService);

  readonly busqueda = signal('');
  readonly filtroEstado = signal<string>('todos');

  readonly carnetsFiltered = computed(() => {
    const q = this.busqueda().toLowerCase();
    const estado = this.filtroEstado();
    return this.svc.carnetsDetallados().filter((c) => {
      const matchQ = !q || c.socioNombre.toLowerCase().includes(q) || c.socioDni.includes(q);
      const matchE = estado === 'todos' || c.estado === estado;
      return matchQ && matchE;
    });
  });

  estadoLabel(estado: EstadoCarnet): string {
    return ESTADO_CARNET_LABELS[estado];
  }

  cambiarEstado(id: string, estado: EstadoCarnet): void {
    this.svc.cambiarEstadoCarnet(id, estado);
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
