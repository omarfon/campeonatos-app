import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocioService } from '../../core/services/socio.service';
import { TramiteSocietarioService } from '../../core/services/tramite-societario.service';
import {
  ESTADO_SOCIO_LABELS,
  EstadoSocio,
  CONDICION_SOCIETARIA_LABELS,
  CondicionSocietaria,
} from '../../core/models/socio.model';
import { confirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-socio-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-5 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.06)%22%2F%3E%3C%2Fsvg%3E')]"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight">Socios</h2>
            <p class="text-brand-200 text-sm mt-0.5">Gestión de membresías, dependientes y trámites societarios.</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <a routerLink="/maestros/socios/solicitudes" class="btn-secondary !text-xs !px-3 !py-1.5">
              Solicitudes
            </a>
            <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', 'nuevo'] } }]" class="btn-primary !from-white !to-slate-50 !text-brand !shadow-xl !shadow-brand-900/20 !text-xs !px-3 !py-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              Nuevo Socio
            </a>
          </div>
        </div>

        <!-- KPIs -->
        <div class="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ socioService.items().length }}</p>
            <p class="text-[11px] text-brand-200">Total socios</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ socioService.sociosActivos().length }}</p>
            <p class="text-[11px] text-brand-200">Activos</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ socioService.sociosSuspendidos().length }}</p>
            <p class="text-[11px] text-brand-200">Suspendidos</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-center">
            <p class="text-xl font-bold">{{ tramiteService.solicitudesPendientes().length }}</p>
            <p class="text-[11px] text-brand-200">Trámites pendientes</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="busqueda" class="block text-xs font-semibold text-slate-500 mb-1">Buscar</label>
            <input
              id="busqueda"
              type="search"
              placeholder="Nombre, apellido, DNI o código..."
              class="input-modern !py-1.5 !text-sm"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
            />
          </div>
          <div class="sm:w-44">
            <label for="filtro-estado" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filtro-estado" class="input-modern !py-1.5 !text-sm"
              [value]="filtroEstado()"
              (change)="filtroEstado.set($any($event.target).value)">
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div class="sm:w-52">
            <label for="filtro-condicion" class="block text-xs font-semibold text-slate-500 mb-1">Condición societal.</label>
            <select id="filtro-condicion" class="input-modern !py-1.5 !text-sm"
              [value]="filtroCondicion()"
              (change)="filtroCondicion.set($any($event.target).value)">
              <option value="todos">Todas</option>
              <option value="individual">Individual</option>
              <option value="familiar">Familiar</option>
              <option value="transitorio_menor">Transitorio Menor</option>
              <option value="transitorio_mayor">Transitorio Mayor</option>
            </select>
          </div>
        </div>
        @if (filteredSocios().length !== socioService.items().length) {
          <p class="text-xs text-slate-400 mt-2">{{ filteredSocios().length }} resultado(s) encontrado(s)</p>
        }
      </div>

      <div class="section-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Socio</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">DNI</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Condición</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Contacto</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Alta</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (socio of filteredSocios(); track socio.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', socio.id, 'detalle'] } }]"
                       class="font-semibold text-brand hover:text-brand-700 text-sm">
                      {{ socio.apellido }}, {{ socio.nombre }}
                    </a>
                    @if (socio.codigoSocio) {
                      <p class="text-[10px] text-slate-400 font-mono">{{ socio.codigoSocio }}</p>
                    }
                    @if ((socio.dependientes ?? []).length > 0) {
                      <p class="text-[10px] text-brand-600">{{ (socio.dependientes ?? []).length }} dependiente(s)</p>
                    }
                  </td>
                  <td class="px-4 py-3 text-slate-600 font-mono text-sm">{{ socio.dni }}</td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    @if (socio.condicionSocietaria) {
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="condicionClasses[socio.condicionSocietaria]">
                        {{ condicionLabels[socio.condicionSocietaria] }}
                      </span>
                    } @else {
                      <span class="text-slate-300 text-xs">—</span>
                    }
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-sm hidden lg:table-cell">
                    <div>{{ socio.email ?? '—' }}</div>
                    <div class="text-xs text-slate-400">{{ socio.telefono ?? '' }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium"
                      [class]="estadoClasses[socio.estado]">
                      {{ estadoLabels[socio.estado] }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{{ socio.fechaAlta }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1">
                      <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', socio.id, 'editar'] } }]"
                         class="text-xs text-brand hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors">Editar</a>
                      <button (click)="eliminar(socio.id)"
                        class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                    <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
                    No se encontraron socios con los filtros aplicados
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
export class SocioListComponent {
  protected readonly socioService = inject(SocioService);
  protected readonly tramiteService = inject(TramiteSocietarioService);

  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<string>('todos');
  protected readonly filtroCondicion = signal<string>('todos');

  protected readonly filteredSocios = computed(() => {
    const q = this.busqueda().toLowerCase();
    const estado = this.filtroEstado();
    const condicion = this.filtroCondicion();
    return this.socioService.items().filter((s) => {
      const matchQ =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.apellido.toLowerCase().includes(q) ||
        s.dni.includes(q) ||
        (s.codigoSocio ?? '').toLowerCase().includes(q);
      const matchEstado = estado === 'todos' || s.estado === estado;
      const matchCondicion = condicion === 'todos' || s.condicionSocietaria === condicion;
      return matchQ && matchEstado && matchCondicion;
    });
  });

  protected readonly estadoLabels = ESTADO_SOCIO_LABELS;
  protected readonly condicionLabels = CONDICION_SOCIETARIA_LABELS;

  protected readonly estadoClasses: Record<EstadoSocio, string> = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-slate-100 text-slate-600',
    suspendido: 'bg-amber-100 text-amber-700',
  };

  protected readonly condicionClasses: Record<CondicionSocietaria, string> = {
    individual: 'bg-blue-100 text-blue-700',
    familiar: 'bg-purple-100 text-purple-700',
    transitorio_menor: 'bg-teal-100 text-teal-700',
    transitorio_mayor: 'bg-indigo-100 text-indigo-700',
  };

  protected async eliminar(id: string): Promise<void> {
    const ok = await confirmDialog({
      title: 'Eliminar socio',
      text: '¿Está seguro de eliminar este socio? Esta acción no se puede deshacer.',
    });
    if (ok) {
      this.socioService.delete(id);
    }
  }
}
