import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';

@Component({
  selector: 'app-estadisticas-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10V0%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative">
          <h2 class="text-xl font-extrabold tracking-tight">Estadísticas y Tablas</h2>
          <p class="text-slate-300 text-xs mt-0.5">Posiciones, goleadores, amonestados y rankings</p>
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
              class="input-modern !pl-10 !py-4 !text-lg"
              placeholder="Buscar por equipo o jugador..."
              [value]="busqueda()"
              (input)="setBusqueda($any($event.target).value)"
              aria-label="Buscar en estadísticas"
            />
          </div>

          <!-- Filtros en fila -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label for="filtro-competencia" class="block text-xs font-semibold text-slate-500 mb-1">Competencia</label>
              <select id="filtro-competencia" class="input-modern !py-3 !text-base"
                [value]="selectedCompetencia()"
                (change)="setCompetencia($any($event.target).value)">
                @for (camp of competencias(); track camp.id) {
                  <option [value]="camp.id">{{ camp.nombre }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-disciplina" class="block text-xs font-semibold text-slate-500 mb-1">Disciplina</label>
              <select id="filtro-disciplina" class="input-modern !py-3 !text-base"
                [value]="selectedDisciplina()"
                (change)="setDisciplina($any($event.target).value)">
                @for (disc of disciplinas(); track disc.id) {
                  <option [value]="disc.id">{{ disc.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de posiciones -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-semibold text-slate-900">Tabla de Posiciones</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">PJ</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">G</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">E</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">P</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">GF</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">GC</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">DG</th>
                <th class="px-4 py-3 text-xs text-slate-500 uppercase text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of posicionesPaginadas(); track row.equipoId; let i = $index) {
                <tr class="hover:bg-slate-50" [class]="(offsetPosiciones() + i) < 2 ? 'bg-green-50/50' : (offsetPosiciones() + i) >= posicionesFiltradas().length - 1 ? 'bg-red-50/50' : ''">
                  <td class="px-4 py-3 text-slate-500 font-medium">{{ offsetPosiciones() + i + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ row.equipoNombre }}</td>
                  <td class="px-4 py-3 text-center">{{ row.partidosJugados }}</td>
                  <td class="px-4 py-3 text-center text-green-700">{{ row.ganados }}</td>
                  <td class="px-4 py-3 text-center text-yellow-600">{{ row.empatados }}</td>
                  <td class="px-4 py-3 text-center text-red-600">{{ row.perdidos }}</td>
                  <td class="px-4 py-3 text-center">{{ row.golesAFavor }}</td>
                  <td class="px-4 py-3 text-center">{{ row.golesEnContra }}</td>
                  <td class="px-4 py-3 text-center font-medium" [class]="row.diferenciaGoles > 0 ? 'text-green-700' : row.diferenciaGoles < 0 ? 'text-red-600' : ''">
                    {{ row.diferenciaGoles > 0 ? '+' : '' }}{{ row.diferenciaGoles }}
                  </td>
                  <td class="px-4 py-3 text-center font-bold text-lg">{{ row.puntos }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="px-4 py-8 text-center text-slate-400">Sin datos de posiciones</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (totalPaginasPosiciones() > 1) {
          <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500">{{ rangoInicioPosiciones() }}–{{ rangoFinPosiciones() }} de {{ posicionesFiltradas().length }}</p>
            <nav class="flex items-center gap-1" aria-label="Paginación posiciones">
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaPosiciones() === 1" (click)="irAPaginaPosiciones(1)" aria-label="Primera página">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
              </button>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaPosiciones() === 1" (click)="irAPaginaPosiciones(paginaPosiciones() - 1)" aria-label="Anterior">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span class="text-xs font-medium text-slate-700 px-2">{{ paginaPosiciones() }} / {{ totalPaginasPosiciones() }}</span>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaPosiciones() === totalPaginasPosiciones()" (click)="irAPaginaPosiciones(paginaPosiciones() + 1)" aria-label="Siguiente">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
              <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaPosiciones() === totalPaginasPosiciones()" (click)="irAPaginaPosiciones(totalPaginasPosiciones())" aria-label="Última">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            </nav>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Goleadores -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-slate-900">Tabla de Goleadores</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Goles</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (g of goleadoresPaginados(); track g.participanteId; let i = $index) {
                  <tr class="hover:bg-slate-50" [class]="(offsetGoleadores() + i) === 0 ? 'bg-yellow-50/50' : ''">
                    <td class="px-4 py-3 text-slate-500">{{ offsetGoleadores() + i + 1 }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ g.apellido }}, {{ g.nombre }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ g.equipoNombre }}</td>
                    <td class="px-4 py-3 text-center font-bold text-lg">{{ g.goles }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">Sin datos</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (totalPaginasGoleadores() > 1) {
            <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <p class="text-xs text-slate-500">{{ rangoInicioGoleadores() }}–{{ rangoFinGoleadores() }} de {{ goleadoresFiltrados().length }}</p>
              <nav class="flex items-center gap-1" aria-label="Paginación goleadores">
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaGoleadores() === 1" (click)="irAPaginaGoleadores(1)" aria-label="Primera">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
                </button>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaGoleadores() === 1" (click)="irAPaginaGoleadores(paginaGoleadores() - 1)" aria-label="Anterior">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="text-xs font-medium text-slate-700 px-2">{{ paginaGoleadores() }} / {{ totalPaginasGoleadores() }}</span>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaGoleadores() === totalPaginasGoleadores()" (click)="irAPaginaGoleadores(paginaGoleadores() + 1)" aria-label="Siguiente">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaGoleadores() === totalPaginasGoleadores()" (click)="irAPaginaGoleadores(totalPaginasGoleadores())" aria-label="Última">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                </button>
              </nav>
            </div>
          }
        </div>

        <!-- Amonestados -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-slate-900">Amonestados / Fair Play</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Amarillas</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Rojas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (a of amonestadosPaginados(); track a.participanteId; let i = $index) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 text-slate-500">{{ offsetAmonestados() + i + 1 }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ a.apellido }}, {{ a.nombre }}</td>
                    <td class="px-4 py-3 text-center font-semibold text-yellow-600">{{ a.amarillas }}</td>
                    <td class="px-4 py-3 text-center font-semibold text-red-600">{{ a.rojas }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">Sin datos</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (totalPaginasAmonestados() > 1) {
            <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <p class="text-xs text-slate-500">{{ rangoInicioAmonestados() }}–{{ rangoFinAmonestados() }} de {{ amonestadosFiltrados().length }}</p>
              <nav class="flex items-center gap-1" aria-label="Paginación amonestados">
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaAmonestados() === 1" (click)="irAPaginaAmonestados(1)" aria-label="Primera">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
                </button>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaAmonestados() === 1" (click)="irAPaginaAmonestados(paginaAmonestados() - 1)" aria-label="Anterior">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="text-xs font-medium text-slate-700 px-2">{{ paginaAmonestados() }} / {{ totalPaginasAmonestados() }}</span>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaAmonestados() === totalPaginasAmonestados()" (click)="irAPaginaAmonestados(paginaAmonestados() + 1)" aria-label="Siguiente">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button type="button" class="p-1.5 rounded text-slate-500 hover:text-brand hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" [disabled]="paginaAmonestados() === totalPaginasAmonestados()" (click)="irAPaginaAmonestados(totalPaginasAmonestados())" aria-label="Última">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                </button>
              </nav>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class EstadisticasDashboardComponent {
  private readonly estadisticaService = inject(EstadisticaService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly competencias = this.competenciaService.items;
  protected readonly disciplinas = this.disciplinaService.items;
  protected readonly selectedCompetencia = signal('camp-1');
  protected readonly selectedDisciplina = signal('disc-futbol');
  protected readonly busqueda = signal('');

  protected readonly PAGE_SIZE = 10;
  protected readonly paginaPosiciones = signal(1);
  protected readonly paginaGoleadores = signal(1);
  protected readonly paginaAmonestados = signal(1);

  protected readonly posiciones = computed(() => {
    const tabla = this.estadisticaService.calcularTablaPosiciones(
      this.selectedCompetencia(),
      this.selectedDisciplina()
    );
    return tabla.posiciones;
  });

  protected readonly posicionesFiltradas = computed(() => {
    const term = this.busqueda().toLowerCase().trim();
    if (!term) return this.posiciones();
    return this.posiciones().filter(r => r.equipoNombre.toLowerCase().includes(term));
  });

  protected readonly goleadores = computed(() =>
    this.estadisticaService.calcularGoleadores(this.selectedCompetencia(), this.selectedDisciplina())
  );

  protected readonly goleadoresFiltrados = computed(() => {
    const term = this.busqueda().toLowerCase().trim();
    if (!term) return this.goleadores();
    return this.goleadores().filter(g =>
      `${g.apellido} ${g.nombre}`.toLowerCase().includes(term) ||
      g.equipoNombre.toLowerCase().includes(term)
    );
  });

  protected readonly amonestados = computed(() =>
    this.estadisticaService.calcularAmonestados(this.selectedCompetencia())
  );

  protected readonly amonestadosFiltrados = computed(() => {
    const term = this.busqueda().toLowerCase().trim();
    if (!term) return this.amonestados();
    return this.amonestados().filter(a =>
      `${a.apellido} ${a.nombre}`.toLowerCase().includes(term)
    );
  });

  // --- Paginado posiciones ---
  protected readonly totalPaginasPosiciones = computed(() =>
    Math.max(1, Math.ceil(this.posicionesFiltradas().length / this.PAGE_SIZE))
  );
  protected readonly posicionesPaginadas = computed(() => {
    const p = Math.min(this.paginaPosiciones(), this.totalPaginasPosiciones());
    return this.posicionesFiltradas().slice((p - 1) * this.PAGE_SIZE, p * this.PAGE_SIZE);
  });
  protected readonly offsetPosiciones = computed(() => (this.paginaPosiciones() - 1) * this.PAGE_SIZE);
  protected readonly rangoInicioPosiciones = computed(() =>
    this.posicionesFiltradas().length === 0 ? 0 : this.offsetPosiciones() + 1
  );
  protected readonly rangoFinPosiciones = computed(() =>
    Math.min(this.paginaPosiciones() * this.PAGE_SIZE, this.posicionesFiltradas().length)
  );

  // --- Paginado goleadores ---
  protected readonly totalPaginasGoleadores = computed(() =>
    Math.max(1, Math.ceil(this.goleadoresFiltrados().length / this.PAGE_SIZE))
  );
  protected readonly goleadoresPaginados = computed(() => {
    const p = Math.min(this.paginaGoleadores(), this.totalPaginasGoleadores());
    return this.goleadoresFiltrados().slice((p - 1) * this.PAGE_SIZE, p * this.PAGE_SIZE);
  });
  protected readonly offsetGoleadores = computed(() => (this.paginaGoleadores() - 1) * this.PAGE_SIZE);
  protected readonly rangoInicioGoleadores = computed(() =>
    this.goleadoresFiltrados().length === 0 ? 0 : this.offsetGoleadores() + 1
  );
  protected readonly rangoFinGoleadores = computed(() =>
    Math.min(this.paginaGoleadores() * this.PAGE_SIZE, this.goleadoresFiltrados().length)
  );

  // --- Paginado amonestados ---
  protected readonly totalPaginasAmonestados = computed(() =>
    Math.max(1, Math.ceil(this.amonestadosFiltrados().length / this.PAGE_SIZE))
  );
  protected readonly amonestadosPaginados = computed(() => {
    const p = Math.min(this.paginaAmonestados(), this.totalPaginasAmonestados());
    return this.amonestadosFiltrados().slice((p - 1) * this.PAGE_SIZE, p * this.PAGE_SIZE);
  });
  protected readonly offsetAmonestados = computed(() => (this.paginaAmonestados() - 1) * this.PAGE_SIZE);
  protected readonly rangoInicioAmonestados = computed(() =>
    this.amonestadosFiltrados().length === 0 ? 0 : this.offsetAmonestados() + 1
  );
  protected readonly rangoFinAmonestados = computed(() =>
    Math.min(this.paginaAmonestados() * this.PAGE_SIZE, this.amonestadosFiltrados().length)
  );

  // --- Métodos de filtro con reset de página ---
  protected setBusqueda(v: string): void {
    this.busqueda.set(v);
    this.paginaPosiciones.set(1);
    this.paginaGoleadores.set(1);
    this.paginaAmonestados.set(1);
  }
  protected setCompetencia(v: string): void {
    this.selectedCompetencia.set(v);
    this.paginaPosiciones.set(1);
    this.paginaGoleadores.set(1);
    this.paginaAmonestados.set(1);
  }
  protected setDisciplina(v: string): void {
    this.selectedDisciplina.set(v);
    this.paginaPosiciones.set(1);
    this.paginaGoleadores.set(1);
    this.paginaAmonestados.set(1);
  }
  protected irAPaginaPosiciones(n: number): void {
    this.paginaPosiciones.set(Math.max(1, Math.min(n, this.totalPaginasPosiciones())));
  }
  protected irAPaginaGoleadores(n: number): void {
    this.paginaGoleadores.set(Math.max(1, Math.min(n, this.totalPaginasGoleadores())));
  }
  protected irAPaginaAmonestados(n: number): void {
    this.paginaAmonestados.set(Math.max(1, Math.min(n, this.totalPaginasAmonestados())));
  }
}
