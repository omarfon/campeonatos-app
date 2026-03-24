import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SancionService } from '../../core/services/sancion.service';
import { EquipoService } from '../../core/services/equipo.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { CompetenciaService } from '../../core/services/competencia.service';

@Component({
  selector: 'app-sancion-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10V0%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Sanciones y Comisión de Justicia</h2>
            <p class="text-slate-300 text-xs mt-0.5">Tarjetas, sanciones e inhabilitaciones</p>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/', { outlets: { primary: ['gestion', 'sanciones'], panel: ['gestion', 'sanciones', 'tarjeta'] } }]" class="btn-primary !from-yellow-400 !to-yellow-500 !text-yellow-900 !shadow-xl !shadow-yellow-900/20 shrink-0 !text-xs !px-3 !py-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              Tarjeta
            </a>
            <a [routerLink]="['/', { outlets: { primary: ['gestion', 'sanciones'], panel: ['gestion', 'sanciones', 'sancion'] } }]" class="btn-primary !from-red-500 !to-red-600 !text-white !shadow-xl !shadow-red-900/20 shrink-0 !text-xs !px-3 !py-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              Sanción
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="relative mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().tarjetas }}</p>
            <p class="text-[10px] text-green-200">Tarjetas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().sanciones }}</p>
            <p class="text-[10px] text-green-200">Sanciones</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().activas }}</p>
            <p class="text-[10px] text-green-200">Activas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().resoluciones }}</p>
            <p class="text-[10px] text-green-200">Resoluciones</p>
          </div>
        </div>
      </div>

      <!-- Buscador y filtros -->
      <div class="section-card">
        <div class="flex flex-col gap-4">
          <!-- Barra de búsqueda -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
            </svg>
            <input
              type="search"
              class="input-modern !pl-10"
              placeholder="Buscar por jugador, equipo o motivo..."
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              aria-label="Buscar sanciones"
            />
          </div>

          <!-- Filtros en fila -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label for="filtro-equipo" class="block text-xs font-semibold text-slate-500 mb-1">Equipo</label>
              <select id="filtro-equipo" class="input-modern !py-1.5 !text-sm"
                [value]="filtroEquipo()"
                (change)="filtroEquipo.set($any($event.target).value)">
                <option value="todos">Todos los equipos</option>
                @for (eq of equiposDisponibles(); track eq.id) {
                  <option [value]="eq.id">{{ eq.nombre }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-competencia" class="block text-xs font-semibold text-slate-500 mb-1">Competencia</label>
              <select id="filtro-competencia" class="input-modern !py-1.5 !text-sm"
                [value]="filtroCompetencia()"
                (change)="filtroCompetencia.set($any($event.target).value)">
                <option value="todos">Todas las competencias</option>
                @for (c of competenciasDisponibles(); track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-tipo-tarjeta" class="block text-xs font-semibold text-slate-500 mb-1">Tipo tarjeta</label>
              <select id="filtro-tipo-tarjeta" class="input-modern !py-1.5 !text-sm"
                [value]="filtroTipoTarjeta()"
                (change)="filtroTipoTarjeta.set($any($event.target).value)">
                <option value="todos">Todas</option>
                <option value="amarilla">Amarilla</option>
                <option value="roja_directa">Roja directa</option>
                <option value="doble_amarilla">Doble amarilla</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'tarjetas' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('tarjetas')"
        >Tarjetas ({{ tarjetasFiltradas().length }})</button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'sanciones' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('sanciones')"
        >Sanciones ({{ sancionesFiltradas().length }})</button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'resoluciones' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('resoluciones')"
        >Resoluciones ({{ resoluciones().length }})</button>
      </div>

      <!-- Tarjetas -->
      @if (activeTab() === 'tarjetas') {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Minuto</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Motivo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Encuentro</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (t of tarjetasFiltradas(); track t.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-3">
                      @switch (t.tipo) {
                        @case ('amarilla') {
                          <span class="inline-block w-5 h-7 bg-yellow-400 rounded-sm" title="Amarilla"></span>
                        }
                        @case ('roja_directa') {
                          <span class="inline-block w-5 h-7 bg-red-600 rounded-sm" title="Roja directa"></span>
                        }
                        @case ('doble_amarilla') {
                          <span class="inline-flex gap-0.5" title="Doble amarilla">
                            <span class="inline-block w-4 h-6 bg-yellow-400 rounded-sm"></span>
                            <span class="inline-block w-4 h-6 bg-red-600 rounded-sm"></span>
                          </span>
                        }
                      }
                    </td>
                    <td class="px-6 py-3 font-medium">{{ getParticipanteNombre(t.participanteId) }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ getEquipoNombre(t.equipoId) }}</td>
                    <td class="px-6 py-3 font-mono">{{ t.minuto }}'</td>
                    <td class="px-6 py-3 text-slate-600">{{ t.motivo }}</td>
                    <td class="px-6 py-3 text-sm text-slate-500">{{ getEncuentroInfo(t.encuentroId) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                      @if (hayFiltrosActivos()) {
                        No se encontraron tarjetas con los filtros aplicados
                      } @else {
                        No hay tarjetas registradas
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Sanciones -->
      @if (activeTab() === 'sanciones') {
        <div class="space-y-3">
          @for (s of sancionesFiltradas(); track s.id) {
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [class]="s.tipo === 'deportiva' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'">
                      {{ s.tipo }}
                    </span>
                    <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [class]="sancionEstadoClasses[s.estado]">
                      {{ s.estado }}
                    </span>
                  </div>
                  <p class="font-medium text-slate-900 mt-2">{{ getParticipanteNombre(s.participanteId) }}</p>
                  <p class="text-sm text-slate-600 mt-1">{{ s.descripcion }}</p>
                </div>
                <div class="text-right text-sm">
                  <p class="text-slate-500">{{ s.fechaInicio }} — {{ s.fechaFin ?? 'Indefinido' }}</p>
                  @if (s.fechasInhabilitacion > 0) {
                    <p class="text-red-600 font-medium">{{ s.fechasInhabilitacion }} fecha(s)</p>
                  }
                  @if (s.montoEconomico) {
                    <p class="text-purple-600 font-medium">\${{ s.montoEconomico }}</p>
                  }
                </div>
              </div>
              <div class="mt-3 pt-3 border-t flex gap-3">
                <a [routerLink]="['resolucion']" [queryParams]="{sancionId: s.id}"
                  class="text-brand hover:text-brand-700 text-sm font-medium">Agregar resolución</a>
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
              @if (hayFiltrosActivos()) {
                No se encontraron sanciones con los filtros aplicados
              } @else {
                No hay sanciones registradas
              }
            </div>
          }
        </div>
      }

      <!-- Resoluciones -->
      @if (activeTab() === 'resoluciones') {
        <div class="space-y-3">
          @for (r of resoluciones(); track r.id) {
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  [class]="dictamenClasses[r.dictamen]">
                  {{ r.dictamen }}
                </span>
                <span class="text-sm text-slate-500">{{ r.fecha }}</span>
              </div>
              <p class="text-slate-700">{{ r.resolucion }}</p>
              <p class="text-xs text-slate-400 mt-2">Comisión: {{ r.miembrosComision.join(', ') }}</p>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
              No hay resoluciones registradas
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SancionListComponent {
  private readonly sancionService = inject(SancionService);
  private readonly equipoService = inject(EquipoService);
  private readonly encuentroService = inject(EncuentroService);
  private readonly competenciaService = inject(CompetenciaService);

  protected readonly activeTab = signal<'tarjetas' | 'sanciones' | 'resoluciones'>('tarjetas');
  protected readonly busqueda = signal('');
  protected readonly filtroEquipo = signal('todos');
  protected readonly filtroCompetencia = signal('todos');
  protected readonly filtroTipoTarjeta = signal('todos');

  protected readonly stats = computed(() => ({
    tarjetas: this.sancionService.tarjetas().length,
    sanciones: this.sancionService.sanciones().length,
    activas: this.sancionService.sanciones().filter(s => s.estado === 'activa').length,
    resoluciones: this.sancionService.resoluciones().length,
  }));

  protected readonly equiposDisponibles = computed(() => this.equipoService.equipos());
  protected readonly competenciasDisponibles = computed(() => this.competenciaService.items());

  protected readonly tarjetasFiltradas = computed(() => {
    let items = this.sancionService.tarjetas();
    const term = this.busqueda().toLowerCase().trim();
    const equipo = this.filtroEquipo();
    const tipoTarjeta = this.filtroTipoTarjeta();

    if (term) {
      items = items.filter(t => {
        const jugador = this.getParticipanteNombre(t.participanteId).toLowerCase();
        const eq = this.getEquipoNombre(t.equipoId).toLowerCase();
        return jugador.includes(term) || eq.includes(term) || t.motivo.toLowerCase().includes(term);
      });
    }
    if (equipo !== 'todos') {
      items = items.filter(t => t.equipoId === equipo);
    }
    if (tipoTarjeta !== 'todos') {
      items = items.filter(t => t.tipo === tipoTarjeta);
    }
    return items;
  });

  protected readonly sancionesFiltradas = computed(() => {
    let items = this.sancionService.sanciones();
    const term = this.busqueda().toLowerCase().trim();
    const equipo = this.filtroEquipo();
    const comp = this.filtroCompetencia();

    if (term) {
      items = items.filter(s => {
        const jugador = this.getParticipanteNombre(s.participanteId).toLowerCase();
        const eq = s.equipoId ? this.getEquipoNombre(s.equipoId).toLowerCase() : '';
        return jugador.includes(term) || eq.includes(term) || s.descripcion.toLowerCase().includes(term);
      });
    }
    if (equipo !== 'todos') {
      items = items.filter(s => s.equipoId === equipo);
    }
    if (comp !== 'todos') {
      items = items.filter(s => s.competenciaId === comp);
    }
    return items;
  });

  protected readonly resoluciones = this.sancionService.resoluciones;

  protected readonly hayFiltrosActivos = computed(() =>
    this.busqueda().trim() !== '' || this.filtroEquipo() !== 'todos' ||
    this.filtroCompetencia() !== 'todos' || this.filtroTipoTarjeta() !== 'todos'
  );

  protected readonly sancionEstadoClasses: Record<string, string> = {
    activa: 'bg-red-100 text-red-800',
    cumplida: 'bg-slate-100 text-slate-800',
    apelada: 'bg-yellow-100 text-yellow-800',
    revocada: 'bg-green-100 text-green-800',
  };

  protected readonly dictamenClasses: Record<string, string> = {
    confirmada: 'bg-red-100 text-red-800',
    reducida: 'bg-yellow-100 text-yellow-800',
    revocada: 'bg-green-100 text-green-800',
    ampliada: 'bg-purple-100 text-purple-800',
  };

  protected getParticipanteNombre(id: string): string {
    const p = this.equipoService.getParticipante(id);
    return p ? `${p.apellido}, ${p.nombre}` : id;
  }

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? id;
  }

  protected getEncuentroInfo(id: string): string {
    const enc = this.encuentroService.getById(id);
    if (!enc) return id;
    return `F${enc.numeroFecha}`;
  }
}
