import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { ResultadoService } from '../../core/services/resultado.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { confirmDialog } from '../../shared/confirm-dialog';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { EstadoResultado } from '../../core/models/resultado.model';

@Component({
  selector: 'app-resultado-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UpperCasePipe],
  template: `
    <div class="space-y-6">
      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10V0%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Registro de Resultados</h2>
            <p class="text-slate-300 text-xs mt-0.5">Scores, penales y cierres de partido</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['gestion', 'resultados'], panel: ['gestion', 'resultados', 'nuevo'] } }]" class="btn-primary !from-white !to-green-50 !text-green-700 !shadow-xl !shadow-green-900/20 shrink-0 !text-xs !px-3 !py-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Registrar Resultado
          </a>
        </div>

        <!-- Stats -->
        <div class="relative mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().total }}</p>
            <p class="text-[10px] text-green-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().parciales }}</p>
            <p class="text-[10px] text-green-200">Parciales</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().oficiales }}</p>
            <p class="text-[10px] text-green-200">Oficiales</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().cerrados }}</p>
            <p class="text-[10px] text-green-200">Cerrados</p>
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
              placeholder="Buscar por equipo..."
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              aria-label="Buscar resultados"
            />
          </div>

          <!-- Filtros en fila -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label for="filtro-estado" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
              <select id="filtro-estado" class="input-modern !py-1.5 !text-sm"
                [value]="filtroEstado()"
                (change)="filtroEstado.set($any($event.target).value)">
                <option value="todos">Todos los estados</option>
                <option value="parcial">Parcial</option>
                <option value="oficial">Oficial</option>
                <option value="cerrado">Cerrado</option>
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
          </div>
        </div>
      </div>

      <!-- Encuentros con resultado -->
      <div class="space-y-3">
        @for (item of resultadosFiltrados(); track item.resultado.id) {
          <div class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="font-semibold text-slate-900 text-lg">{{ item.localNombre }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-3xl font-bold text-slate-900 w-10 text-right">{{ item.resultado.golesLocal }}</span>
                  <span class="text-slate-400 text-lg">-</span>
                  <span class="text-3xl font-bold text-slate-900 w-10">{{ item.resultado.golesVisitante }}</span>
                </div>
                <div>
                  <p class="font-semibold text-slate-900 text-lg">{{ item.visitanteNombre }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  [class]="item.resultado.estado === 'cerrado' ? 'bg-slate-100 text-slate-800' : item.resultado.estado === 'oficial' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ item.resultado.estado | uppercase }}
                </span>
                @if (item.competenciaNombre) {
                  <span class="text-xs text-slate-500">{{ item.competenciaNombre }}</span>
                }
                @if (item.resultado.tiempoExtra) {
                  <span class="text-xs text-orange-600">Tiempo extra</span>
                }
                @if (item.resultado.penalesLocal != null) {
                  <span class="text-xs text-purple-600">Penales: {{ item.resultado.penalesLocal }} - {{ item.resultado.penalesVisitante }}</span>
                }
              </div>
            </div>

            @if (item.goles.length > 0) {
              <div class="mt-4 pt-3 border-t">
                <p class="text-xs text-slate-400 uppercase font-semibold mb-2">Goles</p>
                <div class="flex flex-wrap gap-2">
                  @for (gol of item.goles; track gol.id) {
                    <span class="inline-flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-xs">
                      <span class="font-medium">{{ getParticipanteNombre(gol.participanteId) }}</span>
                      <span class="text-slate-400">{{ gol.minuto }}'</span>
                      @if (gol.tipo !== 'normal') {
                        <span class="text-slate-500">({{ gol.tipo }})</span>
                      }
                    </span>
                  }
                </div>
              </div>
            }

            <div class="mt-3 flex gap-3">
              <a [routerLink]="[item.resultado.id, 'editar']" class="text-brand hover:text-brand-700 text-sm font-medium">Editar</a>
              @if (item.resultado.estado !== 'cerrado') {
                <button (click)="cerrarPartido(item.resultado.id)" class="text-brand hover:text-brand-700 text-sm font-medium">Cerrar partido</button>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
            @if (busqueda() || filtroEstado() !== 'todos' || filtroCompetencia() !== 'todos' || filtroEquipo() !== 'todos') {
              No se encontraron resultados con los filtros aplicados
            } @else {
              No hay resultados registrados
            }
          </div>
        }
      </div>

      <!-- Encuentros sin resultado -->
      @if (encuentrosSinResultadoFiltrados().length > 0) {
        <div>
          <h3 class="text-lg font-semibold text-slate-900 mb-3">Encuentros sin resultado</h3>
          <div class="space-y-2">
            @for (enc of encuentrosSinResultadoFiltrados(); track enc.id) {
              <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-medium">{{ getEquipoNombre(enc.equipoLocalId) }}</span>
                  <span class="text-slate-400">vs</span>
                  <span class="font-medium">{{ getEquipoNombre(enc.equipoVisitanteId) }}</span>
                  <span class="text-sm text-slate-500">— Fecha {{ enc.numeroFecha }}</span>
                </div>
                <a [routerLink]="['/', { outlets: { primary: ['gestion', 'resultados'], panel: ['gestion', 'resultados', 'nuevo'] } }]" [queryParams]="{encuentroId: enc.id}"
                  class="text-brand hover:text-brand-700 text-sm font-medium">Registrar</a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ResultadoListComponent {
  private readonly resultadoService = inject(ResultadoService);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);

  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal<string>('todos');
  protected readonly filtroCompetencia = signal('todos');
  protected readonly filtroEquipo = signal('todos');

  protected readonly stats = computed(() => {
    const resultados = this.resultadoService.resultados();
    return {
      total: resultados.length,
      parciales: resultados.filter(r => r.estado === 'parcial').length,
      oficiales: resultados.filter(r => r.estado === 'oficial').length,
      cerrados: resultados.filter(r => r.estado === 'cerrado').length,
    };
  });

  protected readonly competenciasDisponibles = computed(() => {
    return this.competenciaService.items();
  });

  protected readonly equiposDisponibles = computed(() => {
    return this.equipoService.equipos();
  });

  private readonly resultadosConInfo = computed(() => {
    return this.resultadoService.resultados().map((resultado) => {
      const encuentro = this.encuentroService.getById(resultado.encuentroId);
      const goles = this.resultadoService.getGolesByResultado(resultado.id);
      return {
        resultado,
        encuentro,
        localNombre: encuentro ? this.equipoService.getEquipoById(encuentro.equipoLocalId)?.nombre ?? 'Desconocido' : 'Desconocido',
        visitanteNombre: encuentro ? this.equipoService.getEquipoById(encuentro.equipoVisitanteId)?.nombre ?? 'Desconocido' : 'Desconocido',
        competenciaNombre: encuentro ? this.competenciaService.getById(encuentro.competenciaId)?.nombre : undefined,
        goles,
      };
    });
  });

  protected readonly resultadosFiltrados = computed(() => {
    let items = this.resultadosConInfo();
    const term = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    const comp = this.filtroCompetencia();
    const equipo = this.filtroEquipo();

    if (term) {
      items = items.filter(i =>
        i.localNombre.toLowerCase().includes(term) ||
        i.visitanteNombre.toLowerCase().includes(term)
      );
    }
    if (estado !== 'todos') {
      items = items.filter(i => i.resultado.estado === estado);
    }
    if (comp !== 'todos') {
      items = items.filter(i => i.encuentro?.competenciaId === comp);
    }
    if (equipo !== 'todos') {
      items = items.filter(i =>
        i.encuentro?.equipoLocalId === equipo || i.encuentro?.equipoVisitanteId === equipo
      );
    }
    return items;
  });

  private readonly encuentrosSinResultado = computed(() => {
    const resultadoEncuentros = new Set(this.resultadoService.resultados().map((r) => r.encuentroId));
    return this.encuentroService.encuentros().filter(
      (e) => !resultadoEncuentros.has(e.id) && e.estado === 'finalizado'
    );
  });

  protected readonly encuentrosSinResultadoFiltrados = computed(() => {
    let items = this.encuentrosSinResultado();
    const term = this.busqueda().toLowerCase().trim();
    const comp = this.filtroCompetencia();
    const equipo = this.filtroEquipo();

    if (term) {
      items = items.filter(e => {
        const local = this.getEquipoNombre(e.equipoLocalId).toLowerCase();
        const visitante = this.getEquipoNombre(e.equipoVisitanteId).toLowerCase();
        return local.includes(term) || visitante.includes(term);
      });
    }
    if (comp !== 'todos') {
      items = items.filter(e => e.competenciaId === comp);
    }
    if (equipo !== 'todos') {
      items = items.filter(e => e.equipoLocalId === equipo || e.equipoVisitanteId === equipo);
    }
    return items;
  });

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? 'Desconocido';
  }

  protected getParticipanteNombre(id: string): string {
    const p = this.equipoService.getParticipante(id);
    return p ? `${p.apellido}` : id;
  }

  protected async cerrarPartido(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Cerrar partido', text: '¿Cerrar este partido? No podrá modificarse.', icon: 'warning' });
    if (ok) {
      this.resultadoService.cerrarPartido(id, 'admin');
    }
  }
}
